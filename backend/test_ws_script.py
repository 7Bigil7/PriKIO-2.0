import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    headers = {"X-Pi-Secret": "super_secret_pi_key_12345"}
    
    try:
        print(f"Connecting to {uri}...")
        async with websockets.connect(uri, extra_headers=headers) as websocket:
            print("Connected successfully! Waiting for events...")
            while True:
                response = await websocket.recv()
                data = json.loads(response)
                print(f"Received event: {data['event']}")
                print(f"Data: {json.dumps(data['data'], indent=2)}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
