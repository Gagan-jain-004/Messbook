import { NextResponse } from "next/server";
import { sendDailyReminders } from "@/lib/email";

export async function GET(req: Request) {
  // 1. Authorize the cron runner using Bearer tokens
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 2. Dispatch reminder emails
    const result = await sendDailyReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron send-alerts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch alerts" },
      { status: 500 }
    );
  }
}
