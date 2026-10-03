"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

async function requireAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) throw new Error("Unauthorized: Admin session required");

  const isValid = await verifyAdminToken(session);
  if (!isValid) throw new Error("Unauthorized: Invalid admin token");
}

/**
 * Fetch active notifications for users (live notifications where expiresAt is null or in the future)
 */
export async function getActiveNotifications() {
  try {
    const now = new Date();
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching active notifications:", error);
    return [];
  }
}

/**
 * Fetch all notifications for admin (both active and expired)
 */
export async function getAdminNotifications() {
  await requireAdminAuth();

  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();
    return notifications.map((n) => ({
      ...n,
      isExpired: n.expiresAt ? new Date(n.expiresAt) <= now : false,
    }));
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

/**
 * Create a new website notification
 */
export async function createNotification(data: {
  title: string;
  message: string;
  type?: string;
  expiresAt?: string | null;
}) {
  await requireAdminAuth();

  if (!data.title?.trim() || !data.message?.trim()) {
    return { success: false, error: "Title and message are required" };
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type || "info",
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    revalidatePath("/admin/notifications");
    revalidatePath("/dashboard");
    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

/**
 * Update an existing notification
 */
export async function updateNotification(
  id: string,
  data: {
    title: string;
    message: string;
    type?: string;
    expiresAt?: string | null;
  }
) {
  await requireAdminAuth();

  if (!id || !data.title?.trim() || !data.message?.trim()) {
    return { success: false, error: "Notification ID, title and message are required" };
  }

  try {
    const updated = await prisma.notification.update({
      where: { id },
      data: {
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type || "info",
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    revalidatePath("/admin/notifications");
    revalidatePath("/dashboard");
    return { success: true, notification: updated };
  } catch (error) {
    console.error("Error updating notification:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string) {
  await requireAdminAuth();

  try {
    await prisma.notification.delete({
      where: { id },
    });

    revalidatePath("/admin/notifications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}
