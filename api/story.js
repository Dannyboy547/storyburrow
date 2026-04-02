import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const { name, companion, selections } = body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Write a magical bedtime story for a child.

RULES:
- The child's name is ${name}
- ALWAYS use their name (never say "a child")
- Calm, magical, bedtime tone
- Include a gentle ending
- End with: The End.

DETAILS:
Name: ${name}
Companion: ${companion || "a friendly companion"}
World: ${selections?.world || "a magical land"}
Mood: ${selections?.mood || "calm"}
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini", // ✅ SAFE MODEL
      input: prompt,
    });

    const story =
      response.output?.[0]?.content?.[0]?.text ||
      "Story failed to generate.";

    return res.status(200).json({ story });

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
