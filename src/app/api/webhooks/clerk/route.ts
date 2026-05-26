import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  let event: WebhookEvent;
  try {
    event = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  switch (event.type) {
    case "user.created": {
      const { id, first_name, last_name } = event.data;
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;
      await db.insert(adminUsers).values({ id, fullName }).onConflictDoNothing();
      break;
    }
    case "user.updated": {
      const { id, first_name, last_name } = event.data;
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;
      await db
        .update(adminUsers)
        .set({ fullName, updatedAt: new Date() })
        .where(eq(adminUsers.id, id));
      break;
    }
    case "user.deleted": {
      const id = event.data.id;
      if (id) {
        await db.delete(adminUsers).where(eq(adminUsers.id, id));
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
