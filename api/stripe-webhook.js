import Stripe from "stripe";
import admin from "firebase-admin";

// Temporary debug logs
console.log("Stripe Secret Key:", !!process.env.STRIPE_SECRET_KEY);
console.log("Stripe Webhook Secret:", !!process.env.STRIPE_WEBHOOK_SECRET);
console.log("Firebase Project ID:", !!process.env.FIREBASE_PROJECT_ID);
console.log("Firebase Client Email:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("Firebase Private Key:", !!process.env.FIREBASE_PRIVATE_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

function initializeFirebase() {
  if (!admin.apps.length) {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error("Missing Firebase environment variables.");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  return admin.firestore();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  try {
    const db = initializeFirebase();

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).send("Missing Stripe signature.");
    }

    let event;

    try {
      const buf = await buffer(req);
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email =
          session.customer_details?.email || session.customer_email;

        if (!email) {
          throw new Error("No email found in session.");
        }

        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        await db.collection("users").doc(uid).set(
          {
            email,
            isPremium: true,
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log(`✅ Premium granted to ${email}`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        console.log("💰 Invoice paid:", invoice.id);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 Webhook processing error:", error);
    return res.status(500).send(error.message);
  }
}
