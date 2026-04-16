import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId" });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://www.storyburrow.com",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
}
