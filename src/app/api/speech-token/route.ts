import { NextResponse } from "next/server";

export async function GET() {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    return NextResponse.json(
      { error: "Speech service not configured" },
      { status: 500 },
    );
  }

  try {
    const tokenResponse = await fetch(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get speech token" },
        { status: 502 },
      );
    }

    const token = await tokenResponse.text();

    return NextResponse.json({
      token,
      region: speechRegion,
    });
  } catch {
    return NextResponse.json(
      { error: "Speech service unavailable" },
      { status: 503 },
    );
  }
}
