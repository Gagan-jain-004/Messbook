"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signAdminToken } from "@/lib/admin-auth";
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

export async function getUsersList(searchQuery: string = "") {
  try {
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

    return users.map((user) => {
      const taken = user.attendance.filter((a) => a.status === AttendanceStatus.Taken).length;
      const skipped = user.attendance.filter((a) => a.status === AttendanceStatus.Skipped).length;
      const total = taken + skipped;
      const attendanceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        attendanceRate,
      };
    });
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
