import requests

def upsert_gpt_record(data):
    try:
        response = requests.post("http://localhost:3001/gpt/upsert", json=data)
        if response.status_code == 200 or response.status_code == 201:
            print("Record upserted successfully.")
            return response.json()  # Ensure response is JSON
        else:
            print(f"Failed to upsert record. Status code: {response.status_code}")
            return {"error": f"Failed with status {response.status_code}", "details": response.text}
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return {"error": "RequestException", "details": str(e)}
    except ValueError as e:
        print(f"JSON decoding failed: {e}")
        return {"error": "JSONDecodeError", "details": str(e)}