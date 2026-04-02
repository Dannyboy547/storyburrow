const lengthGuide = {
  "Short": "300-400 words (2-3 minute read)",
  "Medium": "600-800 words (5-6 minute read)",
  "Long": "900-1200 words (8-10 minute read)"
};

// ✅ SAFE fallback
const selectedLength = lengthGuide[selections?.length] || "500-700 words";

const prompt = `
You are a premium children's bedtime story author.

Write a HIGH-QUALITY, emotionally engaging bedtime story.

CRITICAL RULES:
- The child's name is ${name} and MUST be used throughout
- NEVER say "a child"
- The story must feel magical, calming, and immersive
- Include a clear beginning, middle, and end
- Include a gentle emotional moment
- End with a peaceful tone for sleep

STORY LENGTH:
${selectedLength}

DETAILS:
Name: ${name}
Companion: ${companion || "a friendly companion"}
Character: ${selections?.character || "a magical friend"}
World: ${selections?.world || "a dreamy land"}
Mood: ${selections?.mood || "calm"}

IMPORTANT:
- Stick CLOSELY to the target length
- Do NOT make it too long or too short

End EXACTLY with: The End.
`;
