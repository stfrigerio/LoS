const db = require('../models');
const { Op } = require('sequelize');
const { createBackup, saveSummary } = require('./syncApi/backupUtils');
const { fetchStrategies, syncStrategies } = require('./syncApi/tableStrategies');
const { deleteStaleEntries } = require('./syncApi/deleteStaleEntries');

const { logger } = require('../src/electron/main/logger');
const moment = require('moment-timezone');

const capitalizedTableNames = [
	'DailyNotes', 
	'Time', 
	'Library', 
	'Tasks', 
	'Money', 
	'Text', 
	'Mood', 
	'GPT', 
	'Journal', 
	'UserSettings', 
	'Tags', 
	'People',
	'Contact',
	'Pillars',
	'Objectives'
]

const filename = 'syncApi.js';

const sync = {
	getDesktopData: async (req, res) => {
		try {
			const tables = capitalizedTableNames;
			const allData = {};

			const timezone = moment.tz.guess(); // Guess the local timezone
			const now = moment().tz(timezone);

			//& Use previous month if needed
			const nowOneMonthAgo = moment().tz(timezone).subtract(1, 'month'); 
			// const startOfMonth = nowOneMonthAgo.clone().startOf('month');

			const startOfYear = now.clone().startOf('year');
			const endOfYear = now.clone().endOf('year');

			const startOfMonth = now.clone().startOf('month');
			const endOfMonth = now.clone().endOf('month');

			logger.log('Database', filename, `Date range: ${startOfYear.toISOString()} - ${endOfYear.toISOString()}`);

			for (const table of tables) {
				try {
					const fetchStrategy = fetchStrategies[table];
					if (!fetchStrategy) {
						throw new Error(`Unknown table: ${table}`);
					}
					
					const data = await fetchStrategy(db, startOfYear, endOfYear);

					// Remove id and convert to plain object
					allData[table] = data.map(item => {
						const plainItem = item.toJSON();
						const { id, ...rest } = plainItem;
						return rest;
					});

					logger.log('Database', filename, `${table} data fetched, count: ${allData[table].length}`);
				} catch (error) {
					logger.error('Database', filename, `Error fetching data for ${table}:`, error);
					allData[table] = []; // Provide an empty array if fetch fails
				}
			}

			logger.log('Database', filename, `Returned table names: ${Object.keys(allData).join(', ')}`);
			res.json(allData);
		} catch (error) {
			console.error('Error getting desktop data:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	},

	updateCurrentMonthData: async (req, res) => {
		try {
			const { currentMonthData } = req.body;
	
			if (!currentMonthData || typeof currentMonthData !== 'object') {
				return res.status(400).json({ error: 'Invalid currentMonthData', details: 'currentMonthData must be a non-null object' });
			}
	
			const summary = {
				tables: {},
				totals: {
					processed: 0,
					deleted: 0,
					created: 0,
					failed: 0
				},
				errors: []
			};
	
			const timezone = moment.tz.guess();
			const now = moment().tz(timezone);
			const startOfMonth = now.clone().startOf('month');
			const endOfMonth = now.clone().endOf('month');
	
			for (const [tableName, entries] of Object.entries(currentMonthData)) {
				if (!capitalizedTableNames.includes(tableName)) {
					throw new Error(`Unknown table: ${tableName}`);
				}
	
				summary.tables[tableName] = {
					processed: 0,
					deleted: 0,
					created: 0,
					failed: 0
				};
	
				// Delete all entries for the current month
				const deletedCount = await db[tableName].destroy({
					where: {
						createdAt: {
							[Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()]
						}
					}
				});
	
				summary.tables[tableName].deleted = deletedCount;
				summary.totals.deleted += deletedCount;
	
				// Sync new entries
				for (const entry of entries) {
					summary.tables[tableName].processed++;
					summary.totals.processed++;
	
					try {
						const syncStrategy = syncStrategies[tableName];
						if (!syncStrategy) {
							throw new Error(`Unknown table: ${tableName}`);
						}
	
						const result = await syncStrategy(db, entry);
	
						if (result.created) {
							summary.tables[tableName].created++;
							summary.totals.created++;
						} else {
							// This shouldn't happen, but just in case
							summary.tables[tableName].failed++;
							summary.totals.failed++;
							summary.errors.push({
								table: tableName,
								uuid: entry.uuid,
								message: 'Entry not created'
							});
						}
	
					} catch (error) {
						logger.error('Sync', 'syncApi.js', `Error syncing ${tableName} entry:`, error.message);
						summary.tables[tableName].failed++;
						summary.totals.failed++;
						summary.errors.push({
							table: tableName,
							uuid: entry.uuid,
							message: error.message
						});
					}
				}
			}
	
			res.json({ success: true, summary });
		} catch (error) {
			logger.error('Sync', 'syncApi.js', 'Error updating current month data:', error.message);
			res.status(500).json({ error: 'Internal server error', details: error.message });
		}
	},

	syncData: async (req, res) => {
		const summary = {
			tables: {},
			totals: {
				processed: 0,
				successful: 0,
				failed: 0,
				created: 0,
				updated: 0,
				skipped: 0
			},
			errors: []
		};

		try {
			const { data } = req.body;
			const results = {};

			for (const [tableName, entries] of Object.entries(data)) {
				results[tableName] = [];
				if (!summary.tables[tableName]) {
					summary.tables[tableName] = {
						processed: 0,
						successful: { number: 0, notes: {} },
						failed: { number: 0, notes: {} },
						created: { number: 0, notes: {} },
						updated: { number: 0, notes: {} },
						skipped: { number: 0, notes: {} }
					};
				}

				for (const entry of entries) {
					summary.tables[tableName].processed++;
					summary.totals.processed++;

					try {
						const syncStrategy = syncStrategies[tableName];
						if (!syncStrategy) {
							throw new Error(`Unknown table: ${tableName}`);
						}

						const previousNote = await db[tableName].findOne({ where: { uuid: entry.uuid } });
						const result = await syncStrategy(db, entry);
						results[tableName].push(result);

						// Update summary statistics
						if (result.created) {
							summary.tables[tableName].created.number++;
							summary.totals.created++;
							summary.tables[tableName].created.notes[entry.uuid] = {
								previousNote: null,
								newNote: result.entry,
								message: 'Successfully created'
							};
						} else if (result.updated) {
							summary.tables[tableName].updated.number++;
							summary.totals.updated++;
							summary.tables[tableName].updated.notes[entry.uuid] = {
								previousNote: previousNote,
								newNote: result.entry,
								message: 'Successfully updated'
							};
						} else {
							summary.tables[tableName].skipped.number++;
							summary.totals.skipped++;
							summary.tables[tableName].skipped.notes[entry.uuid] = {
								previousNote: previousNote,
								newNote: entry,
								message: 'Skipped due to no changes'
							};
						}

						summary.tables[tableName].successful.number++;
						summary.totals.successful++;

					} catch (error) {
						logger.error('Database', 'syncApi.js', `Error syncing ${tableName} entry:`, error.message);
						summary.tables[tableName].failed.number++;
						summary.totals.failed++;
						summary.tables[tableName].failed.notes[entry.uuid] = {
							previousNote: await db[tableName].findOne({ where: { uuid: entry.uuid } }),
							newNote: entry,
							message: error.message
						};
						summary.errors.push({
							table: tableName,
							uuid: entry.uuid,
							message: error.message
						});
					}
				}
			}

			res.json({ results, summary });
		} catch (error) {
			logger.error('Database', 'syncApi.js', 'Error syncing data:', error.message);
			summary.errors.push({
				table: 'General',
				message: error.message,
				entry: 'N/A'
			});
			res.status(500).json({ error: 'Internal server error', details: error.message, summary });
		}
	},

	createBackupEnpoint: async (req, res) => {
		try {
			const backupPath = await createBackup();
			res.json({ success: true, backupPath });
		} catch (error) {
			logger.error('Database', 'syncApi.js', 'Error creating backup:', error.message);
			res.status(500).json({ error: 'Internal server error', details: error.message });
		}
	},

	saveSummaryEndpoint: async (req, res) => {
		try {
			const { summary } = req.body;
			const cleanedSummary = cleanupSummary(summary);
			const summaryPath = saveSummary(cleanedSummary);
	
			res.json({ success: true, summaryPath });
		} catch (error) {
			logger.error('Database', 'syncApi.js', 'Error saving summary:', error.message);
			res.status(500).json({ error: 'Internal server error', details: error.message });
		}
	},

	deleteStaleEntriesEndpoint: async (req, res) => {
		try {
			const deletionLog = req.body;
			await deleteStaleEntries(deletionLog);
			res.status(200).json({ message: 'Stale entries deleted successfully' });
		} catch (error) {
			logger.error('Database', 'syncApi.js', 'Error deleting stale entries:', error);
			res.status(500).json({ error: 'Failed to delete stale entries' });
		}
	}
};

const cleanupSummary = (summary) => {
	const cleanedSummary = JSON.parse(JSON.stringify(summary)); // Deep clone

	// Clean up tables
	for (const tableName in cleanedSummary.tables) {
		const table = cleanedSummary.tables[tableName];
		
		// Remove empty categories within each table
		for (const category of ['successful', 'failed', 'created', 'updated', 'skipped']) {
			if (table[category] && table[category].number === 0) {
				delete table[category];
			} else if (table[category] && Object.keys(table[category].notes).length === 0) {
				delete table[category].notes;
			}
		}
		
		// Remove table if it has no entries or only has 'processed' count
		if (Object.keys(table).length === 0 || (Object.keys(table).length === 1 && table.processed === 0)) {
			delete cleanedSummary.tables[tableName];
		}
	}

	// Remove totals that are 0
	for (const [key, value] of Object.entries(cleanedSummary.totals)) {
		if (value === 0) {
			delete cleanedSummary.totals[key];
		}
	}

	// Remove errors array if empty
	if (cleanedSummary.errors && cleanedSummary.errors.length === 0) {
		delete cleanedSummary.errors;
	}

	// Remove clientErrors array if empty
	if (cleanedSummary.clientErrors && cleanedSummary.clientErrors.length === 0) {
		delete cleanedSummary.clientErrors;
	}

	return cleanedSummary;
};

module.exports = sync;