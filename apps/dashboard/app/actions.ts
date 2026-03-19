"use server";

import { ObjectId } from "mongodb";
import client, { COLLECTION_NAME, DB_NAME } from "@/lib/mongo";
import { requireAuth } from "@/lib/auth";

export async function toggleJobSaved(jobId: string, saved: boolean) {
  try {
    await requireAuth();

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(jobId) },
      { $set: { saved } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error marking job as saved:", error);
    const message =
      error instanceof Error ? error.message : "Failed to mark job as saved";
    return { success: false, error: message };
  }
}

export async function toggleJobArchived(jobId: string, archived: boolean) {
  try {
    await requireAuth();

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(jobId) },
      { $set: { archived } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error toggling job archived status:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update job";
    return { success: false, error: message };
  }
}

export async function toggleJobApplied(jobId: string, applied: boolean) {
  try {
    await requireAuth();

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(jobId) },
      { $set: { appliedAt: applied ? new Date() : null } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error toggling job applied status:", error);
    const message =
      error instanceof Error ? error.message : "Failed to mark job as applied";
    return { success: false, error: message };
  }
}

export async function archiveAllUnsavedJobs() {
  try {
    await requireAuth();

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateMany(
      { saved: { $ne: true }, archived: { $ne: true } },
      { $set: { archived: true } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error archiving all unsaved jobs:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to archive all unsaved jobs";
    return { success: false, error: message };
  }
}
