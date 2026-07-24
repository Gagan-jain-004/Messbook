"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signAdminToken, verifyAdminToken } from "@/lib/admin-auth";
import { sendDailyReminders } from "@/lib/email";
import { FeedbackStatus, AttendanceStatus } from "@prisma/client";

// Helper to normalize dates to UTC midnight
function normalizeDate(date: Date | string) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

export async function loginAdmin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const expectedEmail = process.env.ADMIN_EMAIL || "admin@diettrack.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email !== expectedEmail || password !== expectedPassword) {
    return { success: false, error: "Invalid admin credentials" };
  }

  try {
    const token = await signAdminToken();
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function getAdminStats() {
  try {
    const totalUsers = await prisma.user.count();

    const today = normalizeDate(new Date());
    const todayActiveUsers = await prisma.attendance.count({
      where: {
        date: today,
        status: {
          in: [AttendanceStatus.Taken, AttendanceStatus.Skipped],
        },
      },
    });

    const pendingFeedback = await prisma.feedback.count({
      where: { status: FeedbackStatus.Pending },
    });

    const resolvedFeedback = await prisma.feedback.count({
      where: { status: FeedbackStatus.Resolved },
    });

    return {
      totalUsers,
      todayActiveUsers,
      pendingFeedback,
      resolvedFeedback,
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    throw new Error("Failed to fetch admin statistics");
  }
}

export async function getUsersList(searchQuery: string = "", statusFilter: string = "All") {
  try {
    const today = normalizeDate(new Date());

    const users = await prisma.user.findMany({
      where: searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" } },
              { email: { contains: searchQuery, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        attendance: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedUsers = users.map((user) => {
      const taken = user.attendance.filter((a) => a.status === AttendanceStatus.Taken).length;
      const skipped = user.attendance.filter((a) => a.status === AttendanceStatus.Skipped).length;
      const total = taken + skipped;
      const attendanceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

      const todayRecord = user.attendance.find(
        (a) => normalizeDate(a.date).getTime() === today.getTime()
      );
      const todayStatus = todayRecord ? todayRecord.status : "NotMarked";

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        attendanceRate,
        todayStatus,
      };
    });

    if (statusFilter === "All") {
      return mappedUsers;
    } else {
      return mappedUsers.filter((u) => u.todayStatus === statusFilter);
    }
  } catch (error) {
    console.error("Error getting users list:", error);
    throw new Error("Failed to fetch users list");
  }
}

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attendance: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!user) throw new Error("User not found");

    const taken = user.attendance.filter((a) => a.status === AttendanceStatus.Taken).length;
    const skipped = user.attendance.filter((a) => a.status === AttendanceStatus.Skipped).length;
    const total = taken + skipped;
    const attendanceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        attendanceRate,
        taken,
        skipped,
      },
      attendance: user.attendance,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

export async function getAllFeedback() {
  try {
    const feedbackList = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return feedbackList;
  } catch (error) {
    console.error("Error getting feedback list:", error);
    throw new Error("Failed to fetch feedback list");
  }
}

export async function updateFeedbackStatus(feedbackId: string, status: FeedbackStatus) {
  try {
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status },
    });

    return { success: true, feedback: updatedFeedback };
  } catch (error) {
    console.error("Error updating feedback status:", error);
    throw new Error("Failed to update feedback status");
  }
}

export async function triggerManualAlerts() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) throw new Error("Unauthorized");

  const isValid = await verifyAdminToken(session);
  if (!isValid) throw new Error("Unauthorized");

  try {
    const result = await sendDailyReminders();
    return result;
  } catch (error) {
    console.error("Manual trigger alerts error:", error);
    throw new Error("Failed to send manual alerts");
  }
}

export async function getWeeklyTrendData() {
  try {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result: { name: string; Users: number }[] = [];

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateMidnight = normalizeDate(d);

      const activeCount = await prisma.attendance.count({
        where: {
          date: dateMidnight,
          status: {
            in: [AttendanceStatus.Taken, AttendanceStatus.Skipped],
          },
        },
      });

      result.push({
        name: daysOfWeek[dateMidnight.getUTCDay()],
        Users: activeCount,
      });
    }

    return result;
  } catch (error) {
    console.error("Error getting weekly trend data:", error);
    throw new Error("Failed to fetch weekly trend data");
  }
}

