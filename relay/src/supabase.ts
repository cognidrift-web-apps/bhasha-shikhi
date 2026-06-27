import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws as unknown as typeof WebSocket } },
);

export async function insertTranscript(
  sessionId: string,
  role: "user" | "tutor",
  content: string,
  sequenceNumber: number,
): Promise<void> {
  await supabase.from("transcripts").insert({
    session_id: sessionId,
    role,
    content,
    sequence_number: sequenceNumber,
  });
}

export async function updateSessionUserName(
  sessionId: string,
  userName: string,
): Promise<void> {
  await supabase
    .from("sessions")
    .update({ user_name: userName })
    .eq("id", sessionId);
}
