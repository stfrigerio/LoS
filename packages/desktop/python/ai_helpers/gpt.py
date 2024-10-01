import json
import os
import openai
from dotenv import load_dotenv

load_dotenv('./.env')

EMBED_MODEL = "text-embedding-ada-002"
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

client = openai.OpenAI(api_key=OPENAI_API_KEY)

def create_week_summary(data, model="gpt-4o"):    

    system_message = f'''
You will be provided with a data structure containing information about wines, as well as a user's natural language query searching for certain wines. Your task is to carefully analyze the query, extract any quantitative data that maps to fields in the wine data structure, and return a JSON object with the extracted data as well as the leftover verbose query.

Here is the data structure for the wine data that we want to map

Please follow these steps:

1. Carefully examine the user's query and extract all quantitative data that can be cleanly mapped to fields in the wine data structure above. For example, if the query mentions "sotto i 14 gradi", extract the "14" value and map it to the "max_alchol_content" field. If the user says "leggero" it would mean a wine with low alchol content, conversely, if the user says "forte" it would mean a wine with high alchol content.

2. Remove the parts of the original query that you were able to extract quantitative data from. The remaining text will form the "Remaining Query" that captures the leftover verbose parts of the user's original query.

3. Construct a JSON object with the data you are able to extract. Sometime the user will not directly say but will infer one thing (like the age of the wine, please do take educated guess about it, like the age or the alchol content when people say light, young etc)

Please pay close attention to the fields in the provided wine data structure, and only extract query data that cleanly maps to those existing fields. Do not make up additional fields and look at the date of today if people refer to having young wines or old wines etc
'''
    
    user_message = f'''Please create the summary of this week'''
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": user_message},
    ]

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0,
            response_format={'type': "json_object"}
        )

        answer = json.loads(response.choices[0].message.content.strip()) 

        return answer

    except Exception as e:
        print(f"An error occurred: {e}")



