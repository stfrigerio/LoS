const express = require('express');
const api = require('./api');
const sync = require('./syncApi')
const music = require('./music/musicApi')
const images = require('./images/imagesApi')

//^ this is copied in deleteStaleEntries.js
const apiTableNames = [
	'dailyNotes', 
	'time', 
	'library', 
	'tasks', 
	'money', 
	'text', 
	'mood', 
	'gpt', 
	'journal', 
	'userSettings', 
	'tags', 
	'people',
	'contact',
	'objectives',
	'pillars',
	'music'
];

const router = express.Router();

//* standardised
function createStandardRoutes(tableName) {
	// console.log(`Setting up routes for ${tableName}`);
	if (api[tableName]) {
			if (api[tableName].upsert) router.post(`/${tableName}/upsert`, api[tableName].upsert);
			if (api[tableName].read) router.get(`/${tableName}/read`, api[tableName].read);
			if (api[tableName].remove) router.delete(`/${tableName}/remove/:uuid`, api[tableName].remove);
			if (api[tableName].list) router.get(`/${tableName}/list`, api[tableName].list);
			if (api[tableName].listByRange) router.get(`/${tableName}/listByRange`, api[tableName].listByRange);
	} else {
			console.warn(`API methods for ${tableName} are not defined !!`);
	}
}

// Create standard routes for each table
const tables = apiTableNames;
tables.forEach(createStandardRoutes);

//* special routes
if (api.tasks && api.tasks.toggleTask) {
	router.post('/tasks/toggleTask', api.tasks.toggleTask);
}

if (api.money) {
	if (api.money.listByType) {
			router.get('/money/listByType/:type', api.money.listByType);
	}
	if (api.money.listByTypeAndRange) {
			router.get('/money/listsByTypeAndRange/:type', api.money.listByTypeAndRange);
	}
}

if (api.userSettings) {
	if (api.userSettings.getByKey) {
		router.get('/userSettings/getByKey/:settingKey', api.userSettings.getByKey);
	}
	if (api.userSettings.getByType) {
		router.get('/userSettings/getByType/:type', api.userSettings.getByType);
	}
}

if (api.tags) {
	if (api.tags.getTagsByType) {
		router.get('/tags/getTagsByType/:type', api.tags.getTagsByType);
	}
	if (api.tags.getDescriptionsByTag) {
		router.get('/tags/getDescriptionsByTag/:tag', api.tags.getDescriptionsByTag);
	}
}

if (api.gpt) {
	if (api.gpt.getByDate) {
		router.get('/gpt/getByDate', api.gpt.getByDate);
	}
}

if (api.library) {
	if (api.library.listByType) {
		router.get('/library/listByType/:type', api.library.listByType);
	}
}

if (api.tasks) {
	if (api.tasks.getTasksDueToday) {
		router.get('/tasks/getTasksDueToday', api.tasks.getTasksDueToday);
	}
}

if (api.contact) {
	if (api.contact.listOrderedByCreatedAt) {
		router.get('/contact/listOrderedByCreatedAt', api.contact.listOrderedByCreatedAt);
	}
}

if (api.objectives) {
	if (api.objectives.getObjectives) {
		router.get('/objectives/getObjectives', api.objectives.getObjectives);
	}
}

//* desktop <-> mobile sync
if (sync) {
	if (sync.getDesktopData) {
		router.get('/sync/getDesktopData', sync.getDesktopData);
	}

	if (sync.updateCurrentMonthData) {
		router.post('/sync/updateCurrentMonthData', sync.updateCurrentMonthData);
	}

	if (sync.syncData) {
		router.post('/sync/syncData', sync.syncData);
	}

	if (sync.createBackupEnpoint) {
		router.get('/sync/createBackup', sync.createBackupEnpoint);
	}

	if (sync.saveSummaryEndpoint) {
		router.post('/sync/saveSummary', sync.saveSummaryEndpoint);
	}

	if (sync.deleteStaleEntriesEndpoint) {
		router.post('/sync/deleteStaleEntries', sync.deleteStaleEntriesEndpoint);
	}
}

//* music
router.get('/music/albums', music.getAlbumList);
router.get('/music/albums/:albumName', music.getAlbumFiles);
router.post('/music/sync/:albumName', music.prepareAlbumForSync);
router.delete('/music/sync/:albumName', music.removeAlbumFromSync);
router.get('/music/file/:albumName/:fileName', music.getFile);

//* images
router.use('/images', images); // Mount the imagesApi under /images ?????

console.log('All routes:', router.stack.map(r => r.route).filter(r => r).map(r => `${Object.keys(r.methods)} ${r.path}`));

module.exports = router;
