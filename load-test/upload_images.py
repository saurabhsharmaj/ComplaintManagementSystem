import requests
import random
import os
import mimetypes

# Configuration
LOGIN_URL = "https://devcms.8bit.co.in/api/login"
UPLOAD_URL_TEMPLATE = "https://devcms.8bit.co.in/api/user/{user_id}"
IMAGE_FOLDER = "user_images"
COMMON_PASSWORD = "Test@1234"
TOTAL_USERS = 100

# Generate fake mobile numbers
def generate_mobile(i):
    return f"90000000{i:03d}"

# Step 1: Load img1.jpg to img5.jpg only
image_files = [f"img{i}.jpg" for i in range(1, 6)]
missing = [f for f in image_files if not os.path.exists(os.path.join(IMAGE_FOLDER, f))]
if missing:
    print("❌ Missing images:", missing)
    exit(1)

print(f"✅ Found {len(image_files)} image(s):", image_files)

for i in range(1, TOTAL_USERS + 1):
    email = f"amar{i}@example.com"
    password = COMMON_PASSWORD
    name = f"Amar{i}"
    mobile = generate_mobile(i)
    user_type = "citizen"

    login_payload = {
        "email": email,
        "password": password
    }

    try:
        login_response = requests.post(LOGIN_URL, json=login_payload)
        if login_response.status_code != 200:
            print(f"[{email}] ❌ Login failed: {login_response.text}")
            continue

        login_data = login_response.json()
        token = login_data.get("token")
        user_id = login_data.get("user", {}).get("_id")
        mobile1 = login_data.get("user", {}).get("mobile")

        if not token or not user_id:
            print(f"[{email}] ❌ Missing token or user ID in login response.")
            continue

    except Exception as e:
        print(f"[{email}] ❌ Exception during login: {e}")
        continue

    # Step 3: Randomly select img1.jpg to img5.jpg
    selected_image = random.choice(image_files)
    image_path = os.path.join(IMAGE_FOLDER, selected_image)

    mime_type, _ = mimetypes.guess_type(image_path)
    mime_type = mime_type or "application/octet-stream"

    custom_filename = selected_image  # use actual filename

    upload_url = UPLOAD_URL_TEMPLATE.format(user_id=user_id)
    headers = {
        "Authorization": f"bearer {token}"
    }

    data = {
        "name": name,
        "email": email,
        "mobile": mobile1,
        "type": user_type
    }

    try:
        with open(image_path, "rb") as img_file:
            files = {
                "media": (custom_filename, img_file, mime_type)
            }

            # print(f"[{email}] 🔼 Uploading '{selected_image}' to {upload_url}")
            # print(f"[{email}] 📂 File path: {image_path}, MIME type: {mime_type}")
            print(f"[{email}] 🧾 Data: {data}")

            response = requests.post(upload_url, headers=headers, data=data, files=files)

            if response.status_code == 200:
                print(f"[{email}] ✅ Image '{selected_image}' uploaded successfully.")
            else:
                print(f"[{email}] ❌ Upload failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"[{email}] ❌ Exception during upload: {e}")
