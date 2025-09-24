import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session_id, accuracy } = body;

    const { error } = await supa
      .from("interview_sessions")
      .update({ miccheck_accuracy: accuracy })
      .eq("id", session_id);

    if (error) throw error;
    return NextResponse.json({ ok: true, session_id, accuracy });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
