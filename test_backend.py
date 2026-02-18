import urllib.request
import json
import datetime

BASE_URL = "http://127.0.0.1:8000"

def test_root():
    try:
        with urllib.request.urlopen(f"{BASE_URL}/") as response:
            print(f"Root endpoint: {response.status}")
            print(response.read().decode())
    except Exception as e:
        print(f"Root endpoint failed: {e}")

def test_create_record():
    today = datetime.date.today().isoformat()
    payload = {
        "date": today,
        "fajr": True,
        "dhuhr": True,
        "asr": True,
        "maghrib": True,
        "isha": True
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/records/", data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            print("Create record: Success")
            print(response.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 400:
            print("Record already exists, fetching it...")
            try:
                with urllib.request.urlopen(f"{BASE_URL}/records/{today}") as response:
                    print(response.read().decode())
            except Exception as ex:
                print(f"Fetch failed: {ex}")
        else:
            print(f"Create record failed: {e.code}")
            print(e.read().decode())
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_root()
    test_create_record()
