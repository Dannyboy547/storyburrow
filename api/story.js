export default async function handler(req, res) {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const { name, companion, selections } = body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const lengthGuide = {
      Short: "300-400 words (2-3 minute read)",
      Medium: "600-800 words (5-6 minute read)",
      Long: "900-1200 words (8-10 minute read)",
    };

    const selectedLength =
      lengthGuide[(selections && selections.length) || "Medium"] ||
      "500-700 words";

    const prompt = `
You are a premium children's bedtime story author.

Write a high-quality, calming bedtime story.

The child ${name} is the MAIN CHARACTER and HERO.

Rules:
- Always use the name ${name}
- Never say "a child"
- Make ${name} feel special, brave, and important
- Use gentle, magical, bedtime-friendly language
- Include light dialogue
- Include a small, gentle problem and a calm resolution
- End with a peaceful, sleepy feeling

Story structure:
- First line: the story title only
- Then a blank line
- Then the full story

Length:
${selectedLength}

Details:
Name: ${name}
Companion: ${companion || "a gentle companion"}
Character: ${selections?.character || "a magical friend"}
World: ${selections?.world || "a dreamy land"}
Mood: ${selections?.mood || "calm"}

End EXACTLY with: The End.
`;

    // ✅ USE FETCH (100% WORKS ON VERCEL)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    const story =
      data.choices?.[0]?.message?.content ||
      "Story failed to generate.";

    return res.status(200).json({ story });

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
