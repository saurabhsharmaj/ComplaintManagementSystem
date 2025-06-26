import requests
import random
import string

API_URL = "https://cms.8bit.co.in/api/register"

def generate_random_user(index):
    name = f"Amar {index}"
    email = f"amar{index}@example.com"
    mobile = f"9{random.randint(100000000, 999999999)}"
    password = "Test@1234"

    return {
        "name": name,
        "email": email,
        "mobile": mobile,
        "password": password,
        "confirmPassword": password
    }

def register_users(count=50):
    for i in range(1, count + 1):
        user_data = generate_random_user(i)
        response = requests.post(API_URL, json=user_data)

        if response.status_code == 201:
            print(f"[{i}] Registered: {user_data['email']}")
        else:
            print(f"[{i}] Failed: {user_data['email']} | Status: {response.status_code} | Response: {response.text}")

if __name__ == "__main__":
    register_users(50)


