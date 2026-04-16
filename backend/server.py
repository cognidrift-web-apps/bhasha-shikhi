import os
import uuid
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from livekit import api

app = FastAPI(title="Voice Translator Token Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/token")
async def get_token(
    from_lang: str = "english",
    to_lang: str = "bengali",
    identity: str = "user",
):
    room = f"t-{from_lang}-{to_lang}-{uuid.uuid4().hex[:8]}"

    lk_api = api.LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET"),
    )

    await lk_api.room.create_room(api.CreateRoomRequest(name=room))
    await lk_api.agent_dispatch.create_dispatch(
        api.CreateAgentDispatchRequest(
            room=room,
            agent_name="voice-agent",
        )
    )
    await lk_api.aclose()

    token = (
        api.AccessToken(
            os.getenv("LIVEKIT_API_KEY"),
            os.getenv("LIVEKIT_API_SECRET"),
        )
        .with_identity(identity)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room,
            )
        )
    )

    return {"token": token.to_jwt()}
