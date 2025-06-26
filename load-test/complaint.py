import requests
import random
import time

LOGIN_URL = 'https://devcms.8bit.co.in/api/login'
COMPLAINT_URL = 'https://devcms.8bit.co.in/api/complaint'

# List of 10 users
users = [
    {"email": f"neeraj{i}@example.com", "password": "Test@1234"}
    for i in range(1, 101)
]

# Reasons to pick randomly
reasons = [
    "not clean drinking water",
    "dumps on roads",
    "garbage on road"
]

for user in users:
    try:
        # 1. Log in user and get token
        login_response = requests.post(LOGIN_URL, json=user)
        if login_response.status_code != 200:
            print(f"[!] Login failed for {user['email']}: {login_response.text}")
            continue

        token = login_response.json().get("token")
        if not token:
            print(f"[!] No token found for {user['email']}")
            continue

        print(f"[+] Logged in: {user['email']}")

        # 2. Submit 2 complaints for the user
        for i in range(2):
            reason = random.choice(reasons)

            form_data = {
                'location': (None, '{"name":"Jaipur,Rajasthan","lat":26.2209536,"lng":73.0333184}'),
                'reason': (None, reason),
                'additionalInfo': (None, f"Auto-complaint for: {reason}"),
                'reportedBy': (None, ''),
                'timestamp': (None, ''),
                'status': (None, 'In-Progress'),
                'mediaType': (None, 'image'),
                'media': (None, '')  # No image provided
            }

            response = requests.post(
                COMPLAINT_URL,
                headers={"Authorization": f"Bearer {token}"},
                files=form_data
            )

            if response.status_code == 200:
                print(f"    [+] Complaint {i+1} submitted.")
            else:
                print(f"    [!] Failed to submit complaint {i+1}: {response.status_code} - {response.text}")

            # time.sleep(1)  # optional: avoid rate-limiting

    except Exception as e:
        print(f"[!] Error for {user['email']}: {str(e)}")
