import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY not found in environment variables");
}

if (!webhookSecret) {
  console.warn("STRIPE_WEBHOOK_SECRET not found in environment variables");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: "2025-04-30.basil" as any,
}) : null;

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured. Please check environment variables." }, 
      { status: 500 }
    );
  }

  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let _event: Stripe.Event;

  try {
    _event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
  
  return NextResponse.json({ received: true });
} 