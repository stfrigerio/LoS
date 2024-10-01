from flask import Flask, jsonify, request  # Add 'request' here
import json
from datetime import datetime

from data_processing.data_cleaning import clean_data
from ai_helpers.claude import generate_mood_recap, generate_journal_entry
from logger import logger

app = Flask(__name__)

def get_week_number(date_str):
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    week_number = date_obj.isocalendar()[1]
    year = date_obj.isocalendar()[0]

    week_date = f"{year}-W{week_number}"

    return week_date

@app.route('/weekly_summary', methods=['POST'])
def process_data():
    try:
        # Load data from request instead of file
        data = request.json
        logger.info('Data recieved')

        cleaned_data = clean_data(data)
        logger.info('Data cleaned')

        # Unpack cleaned_data
        boolean_habits = cleaned_data["booleanHabits"]
        quantifiable_habits = cleaned_data["quantifiableHabits"]
        note_data = cleaned_data["dailyNoteData"]
        time_data = cleaned_data["timeData"]
        mood_data = cleaned_data["moodData"]
        journal_data = cleaned_data["journalData"]

        del cleaned_data["booleanHabits"]
        del cleaned_data["quantifiableHabits"]

        most_recent_date = max(mood_entry['date'].split('T')[0] for mood_entry in mood_data)
        week_date = get_week_number(most_recent_date)
        logger.info(f'Week date: {week_date}')

        data_to_send = {
            "note_data": note_data,
            "mood_data": mood_data,
        }
        

        claude_response = generate_mood_recap(data_to_send)
        mood_summary = claude_response.content[0].text

        data = {
            "id": None,
            "date": week_date,
            "type": "Mood Summary",
            "summary": mood_summary
        }

        return jsonify({"message": "Data processed successfully", "mood_summary": data}), 200
    except Exception as e:
        logger.error(f"Error in process_data: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/generate_journal', methods=['POST'])
def generate_journal():
    try:
        logger.info('generate_journal called')
        data = request.json
        journal_entries = data['journalEntries']
        start_date = data['startDate']
        end_date = data['endDate']

        logger.info(f'len journal entries: {len(journal_entries)}, start date: {start_date}, end date: {end_date}')

        if not journal_entries:
            return jsonify({"error": "No journal entries found in the specified date range"}), 400

        # Generate AI entry using Claude
        generated_entry = generate_journal_entry(journal_entries)
        logger.info(f'generated_entry: {generated_entry}')

        return jsonify({"message": "Journal entry generated successfully", "generated_entry": generated_entry}), 200
    except Exception as e:
        logger.error(f"Error in generate_journal: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)