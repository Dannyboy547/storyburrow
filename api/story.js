const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const { name, companion, selections } = body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ✅ SAFE LENGTH SYSTEM
    const lengthGuide = {
      "Short": "300-400 words (2-3 minute read)",
      "Medium": "600-800 words (5-6 minute read)",
      "Long": "900-1200 words (8-10 minute read)"
    };

    const selectedLength =
      lengthGuide[selections?.length] || "500-700 words";

    // ✅ UPDATED PREMIUM PROMPT (WITH TITLE FIX)
    const prompt = `
You are a premium children's bedtime story author.

Write a magical, calming bedtime story.

CRITICAL RULES:
- The child's name is ${name} and MUST be used throughout
- NEVER say "a child"
- Gentle, magical bedtime tone
- Clear beginning, middle, and end
- Include a soft emotional moment

FORMAT (VERY IMPORTANT):
- FIRST LINE must be the story title ONLY
- Then leave a blank line
- Then write the full story

EXAMPLE:
The Moonlit Dragon

Once upon a time...

STORY LENGTH:
${selectedLength}

DETAILS:
Name: ${name}
Companion: ${companion || "a friendly companion"}
Character: ${selections?.character || "a magical friend"}
World: ${selections?.world || "a dreamy land"}
Mood: ${selections?.mood || "calm"}

IMPORTANT:
- Stick CLOSELY to the requested length
- Do NOT make it too long or too short

End EXACTLY with: The End.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
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
};
