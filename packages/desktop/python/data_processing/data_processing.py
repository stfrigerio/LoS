import json

## STRUCURE OF DATA
example_data = {
    'dayData': {
        'YYYY-MM-DD': {
            'quantifiableHabits': {
                'habit_name': 'value',
                # ... other quantifiable habits
            },
            'booleanHabits': {
                'habit_name': 'value',
                # ... other boolean habits
            },
            'moodData': [
                {
                    'rating': 'value',
                    'comment': 'text',
                    'tag': 'tag_value'
                },
                # ... other mood entries for the day
            ],
            'noteData': {
                'morningComment': 'text',
                'wakeHour': 'value',
                'energy': 'value',
                'success': 'text',
                'beBetter': 'text',
                'dayRating': 'value',
                'sleepTime': 'value'
            }
        },
    },
    'timeData': {
        # Structure unchanged from input data
    },
    'moneyData': {
        # Structure unchanged from input data
    }
}


def aggregate_data(data):
    day_data = {}
    mood_data = {}
    journal_data = {}

    # Process quantifiable habits
    quantifiable_dates = data['quantifiableHabits']['dates']
    for key in data['quantifiableHabits']:
        if key != 'dates':
            for index, value in enumerate(data['quantifiableHabits'][key]):
                date = quantifiable_dates[index]
                if date not in day_data:
                    day_data[date] = {'quantifiableHabits': {}, 'booleanHabits': {}, 'moodData': [], 'noteData': {}}
                day_data[date]['quantifiableHabits'][key.lower()] = value

    # Process boolean habits
    boolean_dates = data['booleanHabits']['dates']
    for key in data['booleanHabits']:
        if key != 'dates':
            for index, value in enumerate(data['booleanHabits'][key]):
                date = boolean_dates[index]
                if date not in day_data:
                    day_data[date] = {'quantifiableHabits': {}, 'booleanHabits': {}, 'moodData': [], 'noteData': {}}
                day_data[date]['booleanHabits'][key.lower()] = value

    # Process note data
    for note in data['noteData']['data']:  # Adjusted to access 'data' inside 'noteData'
        date = note['date']
        if date not in day_data:
            day_data[date] = {'quantifiableHabits': {}, 'booleanHabits': {}, 'moodData': [], 'noteData': {}}
        day_data[date]['noteData'] = {
            'morningComment': note['morningComment'],
            'wakeHour': note['wakeHour'],
            'energy': note['energy'],
            'success': note['success'],
            'beBetter': note['beBetter'],
            'dayRating': note['dayRating'],
            'sleepTime': note['sleepTime']
        }

    # Process mood data
    for mood in data['moodData']:
        date = mood['date'][:10]  # Extract just the date part (assuming it's in ISO format)
        mood_entry = {
            'rating': mood['rating'],
            'comment': mood['comment'],
            'tag': mood['tag'],
            'description': mood['description']
        }
        mood_data[date]['moodData'].append(mood_entry)

    # Process journal data
    for journal in data['journalData']['data']:
        date = journal['date']
        journal_data[date] = journal['journal']

    # The timeData and moneyData remain unchanged since they are already aggregated
    aggregated_data = {
        'dayData': day_data,
        'timeData': data['timeData'],
        'moneyData': data['moneyData']
    }

    return aggregated_data

def read_json_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:  # Ensure the file is opened with UTF-8 encoding
            data = json.load(file)
        return data
    except FileNotFoundError:
        print(f"The file {filepath} was not found.")
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON from the file {filepath}.")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def read_and_aggregate_data():
    filepath = 'savedData.json'
    data = read_json_file(filepath)

    if data is not None:
        aggregated_data = aggregate_data(data)

        return aggregated_data
    else:
        print("No data available to process.")

        return None