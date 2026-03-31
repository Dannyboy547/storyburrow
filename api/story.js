export default async function handler(req, res) {
  try {
    const { name, companion, selections, length } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const prompt = `
Write a high-quality personalised children's bedtime story.

The child’s name is: ${name}
Companion: ${companion}
Favourite character: ${selections.character}
World: ${selections.world}
Mood: ${selections.mood}
Time: ${selections.type}

Length: ${length}

Requirements:
- Start with a clear title on its own line
- Clear beginning, middle, and end
- Calm, comforting tone
- Include dialogue
- Strong emotional ending
- ALWAYS end with: "The End."
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", errorText);
      return res.status(500).json({ error: "OpenAI request failed" });
    }

    const data = await response.json();

    let story = "";

    // 🔥 More reliable parsing
    if (data.output && data.output.length > 0) {
      for (const item of data.output[0].content) {
        if (item.type === "output_text") {
          story += item.text;
        }
      }
    }

    if (!story) {
      story = "Sorry, the story couldn't be created. Please try again.";
    }

    res.status(200).json({ story });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
