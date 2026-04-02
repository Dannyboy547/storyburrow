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

    // ✅ CLEAN PROMPT
    const prompt = `
Write a magical bedtime story.

RULES:
- Child's name is ${name}
- ALWAYS use their name
- Calm, magical tone
- Clear beginning, middle, end
- Gentle emotional moment

LENGTH:
${selectedLength}

DETAILS:
Character: ${selections?.character || "a magical friend"}
World: ${selections?.world || "a dreamy land"}
Mood: ${selections?.mood || "calm"}

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
