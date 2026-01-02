const form = document.getElementById("intake-form");
const insights = document.getElementById("insights");
const nextSteps = document.getElementById("next-steps");
const schedule = document.getElementById("schedule");
const calendarBody = document.getElementById("calendar-body");
const resetButton = document.getElementById("reset");

const timeBlocks = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const prompts = {
  high: "You have strong energy today. Reserve uninterrupted blocks for your most demanding work.",
  medium: "Balance deep work with short recovery windows to maintain momentum.",
  low: "Keep tasks lightweight and build in extra breaks to protect your energy.",
};

const breakTemplates = {
  high: ["Stretch break", "Walk + hydration", "Inbox sweep"],
  medium: ["Mindful reset", "Short walk", "Refill and reset"],
  low: ["Gentle break", "Breathing exercise", "Low-effort admin"],
};

const priorityMap = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function parseTasks(rawTasks) {
  return rawTasks
    .split("\n")
    .map((task) => task.trim())
    .filter(Boolean)
    .map((task, index) => ({
      title: task,
      id: index + 1,
    }));
}

function buildInsights(goal, hours, energy, constraints) {
  const constraintText = constraints
    ? `Key constraints noted: ${constraints}.`
    : "No major constraints listed—your calendar is flexible.";

  return `
    <p><strong>Primary goal:</strong> ${goal}</p>
    <p><strong>Focus hours available:</strong> ${hours}</p>
    <p>${prompts[energy]}</p>
    <p>${constraintText}</p>
  `;
}

function recommendSteps(tasks, energy) {
  const recommendations = [];
  if (tasks.length === 0) {
    recommendations.push("Add at least two tasks so the assistant can prioritize your work.");
    recommendations.push("Identify one task that will unlock progress for the rest of the day.");
    recommendations.push("Block a 30-minute focus sprint to get momentum.");
    return recommendations;
  }

  const sortedTasks = [...tasks];
  const splitPoint = Math.ceil(sortedTasks.length / 2);
  const firstFocus = sortedTasks.slice(0, splitPoint);
  const secondFocus = sortedTasks.slice(splitPoint);

  recommendations.push(`Start with “${firstFocus[0].title}” while your energy is ${energy}.`);
  if (secondFocus.length > 0) {
    recommendations.push(`Queue “${secondFocus[0].title}” for your next deep work block.`);
  }
  recommendations.push("Close the loop with a 15-minute review and handoff notes.");

  return recommendations;
}

function buildSchedule(tasks, hours, energy) {
  const focusBlocks = Math.max(1, Math.round(hours / 2));
  const breakSet = breakTemplates[energy];
  const scheduleItems = [];

  for (let i = 0; i < focusBlocks; i += 1) {
    const task = tasks[i % tasks.length] || { title: "Clarify priorities" };
    scheduleItems.push({
      title: task.title,
      focus: `Deep focus block (${priorityMap[energy]} priority)`,
      duration: "90 minutes",
    });
    scheduleItems.push({
      title: breakSet[i % breakSet.length],
      focus: "Recovery",
      duration: "20 minutes",
    });
  }

  return scheduleItems;
}

function renderSchedule(items) {
  schedule.innerHTML = items
    .map(
      (item) => `
      <div class="schedule-item">
        <h3>${item.title}</h3>
        <p>${item.focus}</p>
        <p><strong>${item.duration}</strong></p>
      </div>
    `,
    )
    .join("");
}

function renderCalendar(items) {
  calendarBody.innerHTML = "";
  const blocks = items.slice(0, timeBlocks.length);

  blocks.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "calendar-row";
    row.innerHTML = `
      <div>${timeBlocks[index]}</div>
      <div class="calendar-block">
        <span>${item.duration}</span>
        <strong>${item.title}</strong>
      </div>
    `;
    calendarBody.appendChild(row);
  });
}

function renderNextSteps(steps) {
  nextSteps.innerHTML = steps.map((step) => `<li>${step}</li>`).join("");
}

function handleSubmit(event) {
  event.preventDefault();

  const goal = document.getElementById("goal").value.trim();
  const hours = Number(document.getElementById("hours").value);
  const energy = document.getElementById("energy").value;
  const constraints = document.getElementById("constraints").value.trim();
  const tasks = parseTasks(document.getElementById("tasks").value);

  insights.innerHTML = buildInsights(goal, hours, energy, constraints);
  renderNextSteps(recommendSteps(tasks, energy));

  const scheduleItems = buildSchedule(tasks, hours, energy);
  renderSchedule(scheduleItems);
  renderCalendar(scheduleItems);
}

function handleReset() {
  form.reset();
  insights.innerHTML = "<p>Complete the form to receive AI insights.</p>";
  nextSteps.innerHTML = "";
  schedule.innerHTML = "";
  calendarBody.innerHTML = "";
}

form.addEventListener("submit", handleSubmit);
resetButton.addEventListener("click", handleReset);

handleReset();
