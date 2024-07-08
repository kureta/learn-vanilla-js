import asyncio

from websockets.server import serve

count = 0


async def echo(websocket):
    global count
    async for message in websocket:
        count += 1
        await websocket.send(f'{message} - {count=}')


async def main():
    async with serve(echo, "localhost", 8765):
        await asyncio.Future()


asyncio.run(main())
