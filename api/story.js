export default async function handler(req, res) {

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, companion, selections } = req.body;

  // Safety fallback (prevents crashes if something missing)
  const safeName = name || "A child";
  const safeCompanion = companion || "a friend";

  const prompt = `
Write a high-quality personalised children's story.

The child’s name is: ${safeName}
Companion: ${safeCompanion}
Favourite character: ${selections?.character}
World: ${selections?.world}
Mood: ${selections?.mood}
Time: ${selections?.type}
Length: ${selections?.length}

Requirements:
- Include a creative story title at the top
- Write like a real children’s author (not AI)
- Use natural storytelling flow
- Include dialogue between characters
- Include a clear beginning, middle, and end
- Include a small problem and resolution
- Make the child feel like the hero
- Use simple but beautiful language
- Make it engaging to read aloud
`;

  try {

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 1500
      })
    });

    const data = await response.json();

    // Handle API errors properly
    if (!data.choices || !data.choices[0]) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "Story generation failed" });
    }

    const story = data.choices[0].message.content;

    return res.status(200).json({ story });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
