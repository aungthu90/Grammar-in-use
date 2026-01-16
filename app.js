// Sample unit (fallback)
const sampleUnit = {
  title: "Present Simple vs Present Continuous",
  summary: "Present simple for habits/facts; present continuous for actions happening now.",
  examples: [
    { text: "I work in Clementi.", note: "Habit/fact" },
    { text: "I am working now.", note: "Action happening now" }
  ],
  rules: [
    "Present simple: subject + base verb (he/she/it adds -s).",
    "Present continuous: am/is/are + verb-ing."
  ],
  quiz: [
    { type: "mcq", q: "She ___ to work every day.", options: ["is going", "goes", "going"], answer: 1 },
    { type: "fill", q: "I ___ (study) English right now.", answer: "am studying" },
    { type: "error", q: "He go to office now.", explain: "Use present continuous: He is going to the office now." }
  ],
  flashcards: [
    { front: "Present simple form", back: "Subject + base verb (he/she/it adds -s): She works." },
    { front: "Present continuous form", back: "am/is/are + verb-ing: They are studying." }
  ]
};

const lessonArea = document.getElementById('lessonArea');
const flashcardArea = document.getElementById('flashcardArea');
const unitSelect = document.getElementById('unitSelect');

document.getElementById('generateLesson').addEventListener('click', () => {
  const text = document.getElementById('topicText').value.trim();
  const unit = text ? generateFromText(text) : sampleUnit;
  renderLesson(unit);
  renderFlashcards(unit.flashcards);
});

document.getElementById('loadData').addEventListener('click', async () => {
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    unitSelect.innerHTML = '';
    data.units.forEach((u, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${u.id} — ${u.title}`;
      unitSelect.appendChild(opt);
    });
    alert('Units loaded. Choose one and click "Load selected unit".');
  } catch (e) {
    alert('Could not load data.json. Make sure it exists.');
  }
});

document.getElementById('loadUnit').addEventListener('click', async () => {
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    const idx = Number(unitSelect.value);
    const unit = data.units[idx] || sampleUnit;
    renderLesson(unit);
    renderFlashcards(unit.flashcards || []);
  } catch (e) {
    alert('Failed to load unit.');
  }
});

// Naive parser for manual text
function generateFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const rules = lines.filter(l => l.toLowerCase().startsWith('rule:')).map(l => l.replace(/^rule:\s*/i, ''));
  const examples = lines.filter(l => l.toLowerCase().startsWith('ex:')).map(l => ({ text: l.replace(/^ex:\s*/i, ''), note: "" }));
  const summary = lines.find(l => l.toLowerCase().startsWith('summary:'))?.replace(/^summary:\s*/i, '') || "Custom lesson";
  return {
    title: "Custom Lesson",
    summary,
    examples: examples.length ? examples : sampleUnit.examples,
    rules: rules.length ? rules : sampleUnit.rules,
    quiz: sampleUnit.quiz,
    flashcards: [
      ...rules.map(r => ({ front: "Rule", back: r })),
      ...examples.map(e => ({ front: "Example", back: e.text }))
    ]
  };
}

function renderLesson(unit) {
  document.getElementById('lessonTitle').textContent = unit.title;
  document.getElementById('lessonSummary').textContent = unit.summary;
  const exList = document.getElementById('examples');
  const ruleList = document.getElementById('rules');
  exList.innerHTML = '';
  ruleList.innerHTML = '';
  (unit.examples || []).forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.text}${e.note ? ' — ' + e.note : ''}`;
    exList.appendChild(li);
  });
  (unit.rules || []).forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    ruleList.appendChild(li);
  });
  renderQuiz(unit.quiz || []);
  lessonArea.classList.remove('hidden');
}

function renderQuiz(quiz) {
  const container = document.getElementById('quiz');
  container.innerHTML = '';
  quiz.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'card';
    if (item.type === 'mcq') {
      div.innerHTML = `<p>${idx + 1}. ${item.q}</p>` +
        item.options.map((opt, i) => `<label><input type="radio" name="q${idx}" value="${i}"> ${opt}</label>`).join('<br>') +
        `<button class="btn" onclick="checkMcq(${idx}, ${item.answer})">Check</button>` +
        `<div id="res${idx}"></div>`;
    } else if (item.type === 'fill') {
      div.innerHTML = `<p>${idx + 1}. ${item.q}</p>` +
        `<input type="text" id="fill${idx}" />` +
        `<button class="btn" onclick="checkFill(${idx}, '${item.answer}')">Check</button>` +
        `<div id="res${idx}"></div>`;
    } else if (item.type === 'error') {
      div.innerHTML = `<p>${idx + 1}. ${item.q}</p>` +
        `<button class="btn" onclick="showExplain(${idx}, '${item.explain.replace(/'/g, "\\'")}')">Explain</button>` +
        `<div id="res${idx}"></div>`;
    }
    container.appendChild(div);
  });
}

window.checkMcq = (idx, answer) => {
  const selected = document.querySelector(`input[name="q${idx}"]:checked`);
  const res = document.getElementById(`res${idx}`);
  if (!selected) return res.textContent = "Choose an option.";
  res.textContent = Number(selected.value) === Number(answer) ? "Correct!" : "Try again.";
};

window.checkFill = (idx, answer) => {
  const val = document.getElementById(`fill${idx}`).value.trim().toLowerCase();
  const res = document.getElementById(`res${idx}`);
  res.textContent = val === answer.toLowerCase() ? "Correct!" : `Expected: ${answer}`;
};

window.showExplain = (idx, explain) => {
  document.getElementById(`res${idx}`).textContent = explain;
};

// Flashcards
let cards = [], cardIdx = 0;
function renderFlashcards(flashcards) {
  cards = flashcards || []; cardIdx = 0;
  flashcardArea.classList.remove('hidden');
  showCard();
}
function showCard() {
  const el = document.getElementById('flashcard');
  if (!cards.length) return el.textContent = "No flashcards.";
  const c = cards[cardIdx];
  el.innerHTML = `<strong>${c.front}</strong><br>${c.back}`;
}
document.getElementById('nextCard').addEventListener('click', () => {
  cardIdx = (cardIdx + 1) % cards.length;
  showCard();
});

// PDF input placeholder
document.getElementById('pdfInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  alert("PDF selected. If it's large, paste key topics into the manual input or use data.json.");
});
