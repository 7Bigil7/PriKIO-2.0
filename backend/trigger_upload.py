import requests

url = "http://localhost:8000/api/upload"
try:
    with open('../dummy.pdf', 'rb') as f:
        files = {'file': ('dummy.pdf', f, 'application/pdf')}
        response = requests.post(url, files=files)
        print("Upload Response:", response.json())
except Exception as e:
    print("Error:", e)
