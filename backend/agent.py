import logging
from dotenv import load_dotenv

load_dotenv()

from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
)
from livekit.plugins import google, silero

logger = logging.getLogger("voice-translator")

LANG_NAMES = {
    "english": "English",
    "bengali": "Bengali (Bangla)",
    "german": "German (Deutsch)",
    "hindi": "Hindi (हिन्दी)",
}


class Translator(Agent):
    def __init__(self, from_lang: str, to_lang: str) -> None:
        from_name = LANG_NAMES.get(from_lang, from_lang)
        to_name = LANG_NAMES.get(to_lang, to_lang)

        super().__init__(
            instructions=(
                f"You are a strict real-time voice translator.\n\n"
                f"SOURCE LANGUAGE: {from_name}\n"
                f"TARGET LANGUAGE: {to_name}\n\n"
                f"RULES:\n"
                f"1. The user will speak in {from_name}.\n"
                f"2. You MUST translate their speech into {to_name} ONLY.\n"
                f"3. You MUST speak in {to_name}. NEVER speak in {from_name} or any other language.\n"
                f"4. Output ONLY the translated text in {to_name}. Nothing else.\n"
                f"5. Do NOT add explanations, commentary, or original text.\n"
                f"6. Do NOT mix languages. Every word you say must be in {to_name}.\n"
                f"7. Keep the same meaning and tone as the original.\n"
                f"8. If you cannot translate something, still respond in {to_name}."
            ),
        )
        self._from_lang = from_lang
        self._to_lang = to_lang
        self._to_name = to_name
        self._from_name = from_name

    async def on_enter(self):
        self.session.generate_reply(
            instructions=(
                f"Say this greeting ONLY in {self._to_name}: "
                f"'Ready. Please speak in {self._from_name}.'"
            )
        )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="voice-agent")
async def entrypoint(ctx: JobContext):
    # Room name format: t-{from_lang}-{to_lang}-{uuid}
    parts = ctx.room.name.split("-")
    from_lang = parts[1] if len(parts) >= 4 else "english"
    to_lang = parts[2] if len(parts) >= 4 else "bengali"

    logger.info(f"Translation: {from_lang} -> {to_lang}")

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-3.1-flash-live-preview",
            voice="Kore",
        ),
        vad=ctx.proc.userdata["vad"],
    )

    await session.start(
        agent=Translator(from_lang, to_lang),
        room=ctx.room,
    )

    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
