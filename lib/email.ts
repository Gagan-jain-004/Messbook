import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://messbook.vercel.app";

export async function sendDailyReminders() {
  // 1. Fetch all registered users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (users.length === 0) return { success: true, sentCount: 0 };

  // 2. Fetch today's attendance logs (normalized to UTC midnight)
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  const markedAttendance = await prisma.attendance.findMany({
    where: {
      date: todayUtc,
      status: {
        in: [AttendanceStatus.Taken, AttendanceStatus.Skipped],
      },
    },
    select: {
      userId: true,
    },
  });

  const markedUserIds = new Set(markedAttendance.map((a) => a.userId));

  // 3. Filter users who haven't marked attendance
  const pendingUsers = users.filter((u) => !markedUserIds.has(u.id));

  if (pendingUsers.length === 0) return { success: true, sentCount: 0 };

  // 4. Map pending users into a batch structure for Resend
  const emailBatch = pendingUsers.map((user) => {
    // Sandbox check: Redirect outgoing mails if a test recipient is specified in .env
    const recipient = process.env.RESEND_TEST_RECIPIENT || user.email;
    const studentName = user.name || "Student";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>DietTrack Attendance Reminder</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0a0a0a;
            color: #e5e2e1;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #131313;
            border: 1px solid #262626;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          }
          h1 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 24px;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #a3a3a3;
            margin-bottom: 24px;
          }
          .btn {
            display: inline-block;
            background-color: #10b981;
            color: #000000 !important;
            font-weight: 700;
            font-size: 14px;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            text-align: center;
            transition: opacity 0.2s ease;
          }
          .btn:hover {
            opacity: 0.9;
          }
          .footer {
            margin-top: 32px;
            border-top: 1px solid #262626;
            padding-top: 16px;
            font-size: 11px;
            color: #737373;
            text-align: center;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 style="color: #ffffff;">Meal Attendance Reminder 🥗</h1>
          <p>Hey <strong>${studentName}</strong>,</p>
          <p>You haven't logged your mess attendance for today yet. Make sure to log whether you took or skipped your meal to prevent errors in your monthly bill.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard" class="btn" style="color: #000000;">Log Attendance Now</a>
          </p>
          <p>If you already ate or plan to skip, logging takes less than 2 seconds.</p>
          <div class="footer">
            Sent by DietTrack Systems • Keep tracking, stay in control.
          </div>
        </div>
      </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || "DietTrack Reminders <onboarding@resend.dev>";

    return {
      from: fromEmail,
      to: recipient,
      subject: "DietTrack: Pending Mess Attendance Alert 🥗",
      html: htmlContent,
    };
  });

  // 5. Send in batches of 100 to meet Resend batch limit constraints
  let sentCount = 0;
  for (let i = 0; i < emailBatch.length; i += 100) {
    const chunk = emailBatch.slice(i, i + 100);
    try {
      const response = await resend.batch.send(chunk);
      if (response.error) {
        console.error("Resend batch sending error:", response.error);
      } else {
        sentCount += chunk.length;
      }
    } catch (err) {
      console.error("Resend batch dispatch failed:", err);
    }
  }

  return { success: true, sentCount };
}
