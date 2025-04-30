from openai import OpenAI
import os

client = OpenAI()  # Assumes OPENAI_API_KEY is set in your environment

FILES_TO_UPLOAD = [
    "hc/system_prompt.md",
    "orchestrator/db_field_cheatsheet.md",
    "orchestrator/osmole_cheatsheet.md",
    "agents/drinks/deepdive.txt",
    "agents/hydration/hydrationTips.md",
    "agents/weather/weather_hydration_kb.md",
    "agents/nutrition/hydration_osmole_kb.md",
    # Add more files as needed
]

for file_path in FILES_TO_UPLOAD:
    try:
        with open(file_path, "rb") as f:
            resp = client.files.create(file=f, purpose="user_data")
            print(f"Uploaded: {file_path} | File ID: {resp.id}")
    except Exception as e:
        print(f"Failed to upload {file_path}: {e}")