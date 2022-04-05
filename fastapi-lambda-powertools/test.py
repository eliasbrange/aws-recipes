import requests
import boto3


def _get_api_url():
    cfn = boto3.resource("cloudformation")
    outputs = cfn.Stack("FastAPIPowerToolsExample").outputs
    for output in outputs:
        if output["OutputKey"] == "ApiUrl":
            return output["OutputValue"]


URL = _get_api_url()
CORR_ID = str(uuid4())
headers = {"X-Correlation-Id": CORR_ID}

print(f"Correlation Id: {CORR_ID}")
print("---")
print("Listing pets")
res = requests.get(f"{URL}/pets", headers=headers)
print(res.status_code, res.json())
print("---")

print("Creating pet")
data = {
    "name": "winston",
    "kind": "cat",
}
res = requests.post(f"{URL}/pets", json=data, headers=headers)
print(res.status_code, res.json())
pet_id = res.json()["id"]
print("---")

print("Fetching pet")
res = requests.get(f"{URL}/pets/{pet_id}", headers=headers)
print(res.status_code, res.json())
print("---")

print("Updating pet")
data = {"name": "donna"}
res = requests.patch(f"{URL}/pets/{pet_id}", json=data, headers=headers)
print(res.status_code)
print("---")

print("Fetching pet")
res = requests.get(f"{URL}/pets/{pet_id}", headers=headers)
print(res.status_code, res.json())
print("---")

print("Listing pets")
res = requests.get(f"{URL}/pets", headers=headers)
print(res.status_code, res.json())
print("---")

print("Deleting pet")
res = requests.delete(f"{URL}/pets/{pet_id}", headers=headers)
print(res.status_code)
print("---")

print("Listing pets")
res = requests.get(f"{URL}/pets", headers=headers)
print(res.status_code, res.json())
