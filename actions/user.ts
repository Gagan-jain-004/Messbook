"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (dbUser) return dbUser;

    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student";

    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return null;
  }
}

export async function updateProfile(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { name },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }
}

import { createClerkClient } from "@clerk/nextjs/server";

export async function deleteUserAccount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  try {
    // 1. Delete student records from PostgreSQL (cascading removes attendance & feedback logs)
    await prisma.user.delete({
      where: { clerkId: userId },
    });

    // 2. Delete student account from Clerk Auth
    await clerkClient.users.deleteUser(userId);

    return { success: true };
  } catch (error) {
    console.error("Account deletion failed:", error);
    throw new Error("Failed to delete account");
  }
}
