import json
from datetime import datetime

from data_processing.data_cleaning import clean_data
from ai_helpers.claude import generate_mood_recap
from database.database_functions import upsert_gpt_record

print('Starting Python script')

def get_week_number(date_str):
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    week_number = date_obj.isocalendar()[1]
    year = date_obj.isocalendar()[0]

    week_date = f"{year}-W{week_number}"

    return week_date

with open('savedData.json', 'r') as file:
    data = json.load(file)

cleaned_data = clean_data(data)

with open('cleaned_data.json', 'w') as file:
    json.dump(cleaned_data, file, indent=4)

# unpack cleaned_data in the respective lists
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

cluade_response = generate_mood_recap(mood_data)
mood_summary = cluade_response[0].text

data = {
    "id": None,  # Set None for new record, or specify an existing ID for update
    "date": week_date,
    "type": "Mood Summary",
    "summary": mood_summary
}

print(data)

upsert_gpt_record(data)






