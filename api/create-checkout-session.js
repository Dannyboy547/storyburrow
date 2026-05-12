import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { email } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1TIdaERyfZlRz8Oy0ZRriejl", // 🔴 replace with your real price ID
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: "https://www.storyburrow.com/success.html",
      cancel_url: "https://www.storyburrow.com",
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
