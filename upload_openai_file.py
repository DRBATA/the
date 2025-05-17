import requests

headers = {
    "Authorization": f"Bearer {os.environ["OPENAI_API_KEY"]}
}
files = {
    "file": open("c:/Users/azamb/OneDrive/Desktop/HLH/tmpae - Copy/agentic-workflow-knowledge-base.md", "rb")
}
data = {
    "purpose": "user_data"
}
response = requests.post("https://api.openai.com/v1/files", headers=headers, files=files, data=data)
print(response.json())
