"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

// Normalize a date to UTC midnight to avoid timezone offsets
function normalizeDate(date: Date | string) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

export async function markAttendance(dateString: string, status: AttendanceStatus) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) throw new Error("User not found");

  const targetDate = normalizeDate(dateString);

  try {
    if (status === AttendanceStatus.NotMarked) {
      await prisma.attendance.deleteMany({
        where: {
          userId: dbUser.id,
          date: targetDate,
        },
      });
      return { success: true, status: AttendanceStatus.NotMarked };
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: dbUser.id,
          date: targetDate,
        },
      },
      update: {
        status,
      },
      create: {
        userId: dbUser.id,
        date: targetDate,
        status,
      },
    });

    return { success: true, attendance };
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw new Error("Failed to mark attendance");
  }
}

export async function getAttendanceForMonth(year: number, month: number) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) throw new Error("User not found");

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  try {
    const records = await prisma.attendance.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    return records;
  } catch (error) {
    console.error("Error fetching attendance for month:", error);
    throw new Error("Failed to fetch attendance records");
  }
}

export async function getAttendanceSummary(year: number, month: number) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) throw new Error("User not found");

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  try {
    const records = await prisma.attendance.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const taken = records.filter((r) => r.status === AttendanceStatus.Taken).length;
    const skipped = records.filter((r) => r.status === AttendanceStatus.Skipped).length;
    const totalMarked = taken + skipped;
    const rate = totalMarked > 0 ? Math.round((taken / totalMarked) * 100) : 0;

    return {
      taken,
      skipped,
      rate,
    };
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw new Error("Failed to fetch summary");
  }
}

export async function getTodayAttendance() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) return null;

  const today = normalizeDate(new Date());

  try {
    const record = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: dbUser.id,
          date: today,
        },
      },
    });

    return record;
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    return null;
  }
}

export async function getAttendanceForRange(fromDateString: string, toDateString: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) throw new Error("User not found");

  const startDate = normalizeDate(fromDateString);
  const endDate = normalizeDate(toDateString);
  const inclusiveEndDate = new Date(endDate);
  inclusiveEndDate.setUTCDate(inclusiveEndDate.getUTCDate() + 1);

  try {
    const records = await prisma.attendance.findMany({
      where: {
        userId: dbUser.id,
        date: {
          gte: startDate,
          lt: inclusiveEndDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return records;
  } catch (error) {
    console.error("Error fetching attendance for range:", error);
    throw new Error("Failed to fetch attendance records");
  }
}
