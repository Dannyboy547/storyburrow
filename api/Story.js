<script>

// ==========================
// STATE
// ==========================
let selections = {
  character: "Dragon",
  world: "Enchanted Forest",
  mood: "Calm bedtime",
  type: "Night",
  length: "Short"
};

const wordCount = {
  "Short": "300 words",
  "Medium": "700 words",
  "Long": "1200 words"
};

// ==========================
// UI SELECTION HANDLER
// ==========================
function select(el, type) {
  const parent = el.parentElement;
  Array.from(parent.children).forEach(c => c.classList.remove("active"));
  el.classList.add("active");

  // Handles labels like "Short (2–3 mins)"
  selections[type] = el.innerText.split(" (")[0];
}

// ==========================
// STORAGE HELPERS
// ==========================
function getSavedStories() {
  try {
    return JSON.parse(localStorage.getItem("stories")) || [];
  } catch {
    return [];
  }
}

function setSavedStories(stories) {
  localStorage.setItem("stories", JSON.stringify(stories));
}

// ==========================
// SAVE STORY
// ==========================
function saveStory() {
  const title = document.getElementById("storyTitle").innerText;
  const text = document.getElementById("storyText").innerText;

  if (!title || !text) {
    alert("No story to save yet!");
    return;
  }

  const story = {
    id: Date.now(),
    title,
    text
  };

  const saved = getSavedStories();

  saved.unshift(story); // newest first
  setSavedStories(saved);

  alert("Story saved!");
}

// ==========================
// VIEW STORIES (TEMP UI)
// ==========================
function viewStories() {
  const saved = getSavedStories();

  if (saved.length === 0) {
    alert("No saved stories yet!");
    return;
  }

  const list = saved.map((s, i) =>
    `${i + 1}. ${s.title}`
  ).join("\n");

  alert("Saved Stories:\n\n" + list);
}

// ==========================
// TEXT TO SPEECH
// ==========================
function readStory() {
  const text = document.getElementById("storyText").innerText;

  if (!text) return;

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 0.75;
  speech.pitch = 1.1;
  speech.volume = 1;

  const voices = speechSynthesis.getVoices();

  const preferred = voices.find(v =>
    v.name.includes("Google UK English Female") ||
    v.name.includes("Female") ||
    v.name.includes("Samantha")
  );

  if (preferred) speech.voice = preferred;

  speechSynthesis.cancel(); // stop overlapping audio
  speechSynthesis.speak(speech);
}

// ==========================
// GENERATE STORY
// ==========================
async function generateStory() {

  const btn = document.getElementById("generateBtn");
  const loadingText = document.getElementById("loadingText");

  if (btn.disabled) return;

  btn.disabled = true;
  btn.innerText = "🌙 Creating your story...";

  const messages = [
    "✨ Creating your magical story...",
    "🌙 Sprinkling a little bedtime magic...",
    "📖 Writing something special..."
  ];

  let i = 0;
  const interval = setInterval(() => {
    loadingText.innerText = messages[i % messages.length];
    i++;
  }, 1500);

  try {

    const name = document.getElementById("name").value || "A child";
    const companion = document.getElementById("companion").value || "a friend";

    const response = await fetch("/api/story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        companion,
        selections,
        length: wordCount[selections.length]
      })
    });

    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    const story = data.story;

    if (!story) throw new Error("No story returned");

    const parts = story.split("\n\n");

    const title = parts[0].replace(/[#*]/g, "");
    const body = parts.slice(1).join("\n\n");

    document.getElementById("storyTitle").innerText = title;
    document.getElementById("storyText").innerText = body;

    const storyCard = document.getElementById("storyCard");
    storyCard.classList.remove("hidden");

    setTimeout(() => {
      document.getElementById("storyTitle").scrollIntoView({
        behavior: "smooth"
      });
    }, 300);

  } catch (err) {
    alert("Something went wrong. Try again.");
    console.error(err);
  }

  clearInterval(interval);

  btn.disabled = false;
  btn.innerText = "Create Story";
  loadingText.innerText = "";
}

</script>
