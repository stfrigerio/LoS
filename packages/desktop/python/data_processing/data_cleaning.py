import json
from datetime import datetime

def clean_data(data):
    cleaned = {
        "quantifiableHabits": {},
        "booleanHabits": {},
        "dailyNoteData": [],
        "timeData": [],
        "moneyData": [],
        "moodData": [],
        "journalData": []
    }

    # Process quantifiable habits
    for note in data['dailyNoteData']:
        date = note.get("date")
        if date:
            # Process quantifiable habits
            cleaned["quantifiableHabits"][date] = note["quantifiableHabits"]

            # Process boolean habits
            cleaned["booleanHabits"][date] = note["booleanHabits"]

        cleaned["dailyNoteData"].append({
            "date": date,
            "morningComment": note["morningComment"],
            "energy": note["energy"],
            "wakeHour": note["wakeHour"],
            "success": note["success"],
            "beBetter": note["beBetter"],
            "dayRating": note["dayRating"],
            "sleepTime": note["sleepTime"]
        })

    for time_entry in data["timeData"]:
        cleaned["timeData"].append({
            "date": time_entry["date"],
            "tag": time_entry["tag"],
            "description": time_entry["description"],
            "duration": time_entry["duration"],
            "startTime": time_entry["startTime"],
            "endTime": time_entry["endTime"]
        })

    for money_entry in data["moneyData"]:
        cleaned["moneyData"].append({
            "date": money_entry["date"],
            "amount": money_entry["amount"],
            "type": money_entry["type"],
            "tag": money_entry["tag"],
            "description": money_entry["description"]
        })

    for mood_entry in data["moodData"]:
        cleaned["moodData"].append({
            "date": mood_entry["date"],
            "rating": mood_entry["rating"],
            "comment": mood_entry["comment"],
            "tag": mood_entry["tag"],
            "description": mood_entry["description"]
        })

    for journal_entry in data["journalData"]:
        cleaned["journalData"].append({
            "date": journal_entry["date"],
            "text": journal_entry["text"]
        })

    return cleaned
