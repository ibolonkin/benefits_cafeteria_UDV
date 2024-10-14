import requests

user = {
  "email": "user@example.com",
  "password": "<password>"
}


res = requests.post('http://127.0.0.1:8000/v1/login', json=user)

token = res.json()['accessToken']

response = requests.get('http://127.0.0.1:8000/u/users?start=0?', headers={'Authorization': f'Bearer {token}'})
print(response.json())
