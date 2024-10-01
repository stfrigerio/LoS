import os
from dotenv import load_dotenv
import anthropic
from datetime import datetime

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the .env file
env_path = os.path.join(os.path.dirname(current_dir), '.env')
# Load the .env file
load_dotenv(env_path)

# Define the variables
PERSON_NAME = "Stefano"
language = "English"
interests = "philosophy, technology and neuroscience"

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

client = anthropic.Anthropic(
    api_key=ANTHROPIC_API_KEY,
)

def generate_mood_recap(mood_data):    
    original_prompt = f"""
Here is the summary of the habits and time data for the week:
<data>
{mood_data}
</data>

Please carefully analyze this data. Based on your analysis, write a thoughtful <reflection> with the following sections:

- 'Nice' (A nice verbose summary of what went well in all areas)
- 'Not so nice' (A nice verbose summary of what didn't go so well in all areas)

After the reflection, please add a <questions_to_ponder> section with 4 insightful questions the person could ask themselves to further reflect on their habits progress and challenges, based solely on the provided data. Single questions and please smart questions that a behavioural psychologist would ask.
    
Please begin your response with the <reflection> and end with the <questions_to_ponder>.
"""

    mood_user_message = original_prompt

    message = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=1000,
        temperature=0.5,
        system=f"You are an assistant tasked with analyzing and reflecting on {PERSON_NAME}'s data. He likes {interests} so keep that in mind when reflecting.",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": mood_user_message
                    }
                ]
            }
        ]
    )

    return message

def generate_journal_entry(journal_entries):
    try:
        current_date = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        # Combine all journal entries into a single string
        all_entries = "\n\n".join([f"Date: {entry['date']}\nEntry: {entry['text']}" for entry in journal_entries])
        
        prompt = f"""As an AI assistant, your task is to analyze and reflect on {PERSON_NAME}'s journal entries from a specific period. Here are all the entries:

{'-' * 40}
{all_entries}
{'-' * 40}

Based on these entries, please provide an AI-generated recap and reflection. Your response should include:

1. A comprehensive summary of the main themes, events, and emotions expressed across all of {PERSON_NAME}'s journal entries.
2. Your perspective on {PERSON_NAME}'s reflections over this period, including potential insights, patterns, or developments that {PERSON_NAME} might not have noticed.
3. Thoughtful questions or suggestions that might help {PERSON_NAME} gain deeper insights into their experiences and thoughts during this time.
4. If relevant, incorporate {PERSON_NAME}'s interests in {interests} into your analysis, but only if it naturally fits the context of the journal entries.
5. Any observations on how {PERSON_NAME}'s thoughts or feelings might have evolved over the period covered by these entries.

Remember, this is an YOUR reflection, not {PERSON_NAME}'s direct words.

Write your response in {language}."""

        # Make the API call to Claude
        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=2000,
            temperature=0.7,
            system="You are an AI assistant tasked with analyzing and reflecting on a series of personal journal entries.",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        # Extract and return the generated entry
        return message.content[0].text

    except Exception as e:
        print(f"Error in generate_journal_entry: {str(e)}")
        return f"An error occurred while generating the AI reflection: {str(e)}"