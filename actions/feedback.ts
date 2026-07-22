"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { FeedbackStatus } from "@prisma/client";

export async function submitFeedback(message: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) throw new Error("User not found");

  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId: dbUser.id,
        message,
        status: FeedbackStatus.Pending,
      },
    });

    return { success: true, feedback };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw new Error("Failed to submit feedback");
  }
}

export async function getUserFeedback() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (!dbUser) throw new Error("User not found");

  try {
    const feedbackList = await prisma.feedback.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return feedbackList;
  } catch (error) {
    console.error("Error fetching user feedback:", error);
    throw new Error("Failed to fetch feedback history");
  }
}
