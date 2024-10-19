import requests

# user = {
#   "email": "user@example.com",
#   "password": "<password>"
# }
#
#
# res = requests.post('http://127.0.0.1:8000/v1/login', json=user)
#
# token = res.json()['accessToken']
token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYWNjZXNzIiwic3ViIjoiMmRhM2I4NDAtNzgzMy00NGRiLTlmM2ItNjQ3OWJmYzJmNGEzIiwiYWN0aXZlIjp0cnVlLCJzdXBlcl91c2VyIjp0cnVlLCJleHAiOjE3MjkxNTc3NzcsImlhdCI6MTcyOTE1Njg3N30.NbvGA4B_09UKFQXH5WB20pxSz5uaX825BD41Ndr3QaThcX7p5ReHBoJrhDcUDvlBA45K6jAd1Wl0lUbx03iYzqk-4sgy-50ELtnZgH25A1rMQfXOuU1WVrfdZUGNWlK9frm0-ThwzHjg4kmseRXbdn6BHWQawIIQW9Bg4AG-eGxcjWR2Iyg-qZ5VP79q_hFnGgPDnnm6LGqHM4OJQYZq080pP8PI4M4xrmR1RpISXhsoD9ZVw7NzxXFqDSihy67nxKDYc-34jy_kna6yQ75vB59rXF-hbSZo2y7BinR7VEgs31jiLJfqbmQNR6d6OYTFiRyaz8AZAof2F0WWRwQeMw'
# print(token)
response = requests.patch('http://localhost:8000/b/e2454567-d83d-488c-a0cf-8924f3fa3bf6/?isMain=true', headers={'Authorization': f'Bearer {token}'})
print(response.json())
