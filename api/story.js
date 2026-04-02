import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const { name, companion, selections, length } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a world-class children's bedtime story author.

Write a PREMIUM, storybook-quality bedtime story.

CRITICAL RULES:
- The child's name is ${name || "the child"} and MUST be used throughout
- NEVER say "a child"
- Magical, calming, bedtime tone

DETAILS:
Name: ${name || "the child"}
Companion: ${companion || "a friendly companion"}
Character: ${selections?.character || "a magical friend"}
World: ${selections?.world || "a dreamy land"}
Mood: ${selections?.mood || "calm"}
Length: ${length || "medium"}

Write the full story now. End with: The End.
`;

    const response = await openai.responses.create({
      model: "gpt-5",
      input: prompt,
    });

    // ✅ SAFE RESPONSE HANDLING (prevents crashes)
    const story =
      response.output?.[0]?.content?.[0]?.text ||
      "Sorry, something went wrong generating the story.";

    return res.status(200).json({ story });

  } catch (error) {
    console.error("STORY API ERROR:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate story",
    });
  }
}
