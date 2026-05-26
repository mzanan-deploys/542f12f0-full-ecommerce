import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY not found in environment variables");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: "2025-04-30.basil" as any,
}) : null;

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured. Please check environment variables." }, 
        { status: 500 }
      );
    }

    const { items, success_url, cancel_url } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }
    if (!success_url || !cancel_url) {
        return NextResponse.json({ error: "Missing success_url or cancel_url" }, { status: 400 });
    }

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description || undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating Stripe session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 