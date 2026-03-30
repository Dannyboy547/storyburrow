export default async function handler(req, res) {
  try {
    const { name, companion, selections, length } = req.body;

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

    const data = await response.json();

    // 🔥 MUCH SAFER extraction
    let story = "Story failed to generate.";

    if (data.output && data.output.length > 0) {
      const content = data.output[0].content;
      if (content && content.length > 0) {
        story = content[0].text;
      }
    }

    res.status(200).json({ story });

  } catch (error) {
    console.error(error); // 👈 IMPORTANT for debugging
    res.status(500).json({ error: "Failed to generate story" });
  }
}
