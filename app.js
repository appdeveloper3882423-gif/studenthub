"use strict";

/* =========================================================
   STUDENTHUB APP
========================================================= */

const STORAGE_KEY = "studenthub_v1";

const defaultData = {
  tasks: [],
  notes: [],
  habits: {},
  focusMinutes: 0,
  theme: "light"
};

let data = loadData();

let currentFilter = "All";
let focusSeconds = 25 * 60;
let focusRunning = false;
let focusInterval = null;


/* =========================================================
   HELPERS
========================================================= */

function $(id){
  return document.getElementById(id);
}

function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData(){

  try{

    const saved =
      JSON.parse(localStorage.getItem(STORAGE_KEY));

    return {
      ...defaultData,
      ...(saved || {})
    };

  }catch{

    return {
      ...defaultData
    };

  }

}

function escapeHTML(value){

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================================================
   THEME
========================================================= */

function applyTheme(){

  if(data.theme === "dark"){

    document.body.classList.add("dark");

    if($("theme")){
      $("theme").textContent = "☀";
    }

  }else{

    document.body.classList.remove("dark");

    if($("theme")){
      $("theme").textContent = "☾";
    }

  }

}

$("theme")?.addEventListener("click",()=>{

  data.theme =
    document.body.classList.contains("dark")
      ? "light"
      : "dark";

  saveData();
  applyTheme();

});

applyTheme();


/* =========================================================
   TOOL DATABASE
========================================================= */

const tools = [

{
  id:"gpa",
  title:"GPA Calculator",
  category:"Academic",
  icon:"🎓",
  description:"Calculate GPA from course grades and credit hours."
},

{
  id:"cgpa",
  title:"CGPA Calculator",
  category:"Academic",
  icon:"📊",
  description:"Calculate cumulative GPA across semesters."
},

{
  id:"grade",
  title:"Grade Calculator",
  category:"Academic",
  icon:"🏆",
  description:"Find your percentage and estimated grade."
},

{
  id:"attendance",
  title:"Attendance Calculator",
  category:"Academic",
  icon:"📅",
  description:"Calculate attendance percentage."
},

{
  id:"percentage",
  title:"Percentage Calculator",
  category:"Academic",
  icon:"％",
  description:"Calculate percentage quickly."
},

{
  id:"average",
  title:"Average Calculator",
  category:"Academic",
  icon:"➗",
  description:"Find the average of multiple numbers."
},

{
  id:"age",
  title:"Age Calculator",
  category:"Utilities",
  icon:"🎂",
  description:"Calculate age from date of birth."
},

{
  id:"unit",
  title:"Unit Converter",
  category:"Utilities",
  icon:"📐",
  description:"Convert common units."
},

{
  id:"qr",
  title:"QR Generator",
  category:"Utilities",
  icon:"▦",
  description:"Generate a QR code from any text or link."
},

{
  id:"password",
  title:"Password Generator",
  category:"Utilities",
  icon:"🔐",
  description:"Generate a strong random password."
},

{
  id:"word",
  title:"Word Counter",
  category:"Writing",
  icon:"✍️",
  description:"Count words, characters and sentences."
},

{
  id:"case",
  title:"Case Converter",
  category:"Writing",
  icon:"Aa",
  description:"Convert text to upper, lower or title case."
},

{
  id:"citation",
  title:"Citation Helper",
  category:"Writing",
  icon:"📚",
  description:"Create simple APA-style references."
},

{
  id:"pomodoro",
  title:"Pomodoro Timer",
  category:"Study",
  icon:"🍅",
  description:"Study in focused intervals."
},

{
  id:"exam",
  title:"Exam Countdown",
  category:"Study",
  icon:"⏳",
  description:"See how many days remain until an exam."
},

{
  id:"budget",
  title:"Student Budget",
  category:"Career",
  icon:"💰",
  description:"Estimate income, expenses and savings."
},

{
  id:"interview",
  title:"Interview Practice",
  category:"Career",
  icon:"🎤",
  description:"Practice common interview questions."
},

{
  id:"timezone",
  title:"Time Zone",
  category:"International",
  icon:"🌍",
  description:"Compare international study destinations."
},

{
  id:"currency",
  title:"Currency Converter",
  category:"International",
  icon:"💱",
  description:"Convert currencies using public exchange rates."
},

{
  id:"date",
  title:"Date Difference",
  category:"International",
  icon:"📅",
  description:"Calculate the days between two dates."
}

];


/* =========================================================
   TOOL FILTERS
========================================================= */

const categories = [
  "All",
  ...new Set(tools.map(tool => tool.category))
];

function renderFilters(){

  const container = $("filters");

  if(!container) return;

  container.innerHTML = categories.map(category => `
    <button
      class="filter ${category === currentFilter ? "active" : ""}"
      onclick="setFilter('${category}')">
      ${category}
    </button>
  `).join("");

}

window.setFilter = function(category){

  currentFilter = category;

  renderFilters();
  renderTools();

};

function renderTools(){

  const grid = $("toolGrid");

  if(!grid) return;

  const query =
    ($("search")?.value || "")
      .trim()
      .toLowerCase();

  const filtered = tools.filter(tool => {

    const matchesCategory =
      currentFilter === "All" ||
      tool.category === currentFilter;

    const text =
      `${tool.title} ${tool.category} ${tool.description}`
        .toLowerCase();

    const matchesSearch =
      !query || text.includes(query);

    return matchesCategory && matchesSearch;

  });

  if(!filtered.length){

    grid.innerHTML = `
      <div class="card" style="padding:25px;grid-column:1/-1">
        <h3>No tools found</h3>
        <p style="margin-top:6px;color:var(--muted)">
          Try another search or category.
        </p>
      </div>
    `;

    return;
  }

  grid.innerHTML = filtered.map(tool => `

    <div class="tool-card">

      <div class="tool-icon">
        ${tool.icon}
      </div>

      <h3>
        ${escapeHTML(tool.title)}
      </h3>

      <p>
        ${escapeHTML(tool.description)}
      </p>

      <button
        class="tool-btn"
        onclick="openTool('${tool.id}')">
        Open Tool
      </button>

    </div>

  `).join("");

}

$("search")?.addEventListener(
  "input",
  renderTools
);

renderFilters();
renderTools();


/* =========================================================
   TASKS
========================================================= */

function renderTasks(){

  const box = $("tasks");

  if(!box) return;

  if(!data.tasks.length){

    box.innerHTML = `
      <p style="color:var(--muted);padding:18px 0">
        No tasks yet. Add your first study task.
      </p>
    `;

  }else{

    box.innerHTML = data.tasks.map(task => `

      <div class="task ${task.done ? "done" : ""}">

        <input
          class="task-check"
          type="checkbox"
          ${task.done ? "checked" : ""}
          onchange="toggleTask('${task.id}')">

        <span>
          ${escapeHTML(task.text)}
        </span>

        <button
          class="task-delete"
          onclick="deleteTask('${task.id}')">
          ✕
        </button>

      </div>

    `).join("");

  }

  updateStats();

}

function addTask(){

  const input = $("taskInput");

  if(!input) return;

  const text = input.value.trim();

  if(!text){

    input.focus();
    return;

  }

  data.tasks.unshift({

    id:
      Date.now().toString() +
      Math.random().toString(16).slice(2),

    text,
    done:false,
    created:Date.now()

  });

  input.value = "";

  saveData();
  renderTasks();

}

window.toggleTask = function(id){

  const task =
    data.tasks.find(item => item.id === id);

  if(!task) return;

  task.done = !task.done;

  saveData();
  renderTasks();

};

window.deleteTask = function(id){

  data.tasks =
    data.tasks.filter(item => item.id !== id);

  saveData();
  renderTasks();

};

$("addTask")?.addEventListener(
  "click",
  addTask
);

$("taskInput")?.addEventListener(
  "keydown",
  e => {

    if(e.key === "Enter"){
      addTask();
    }

  }
);


/* =========================================================
   STATS
========================================================= */

function updateStats(){

  const completed =
    data.tasks.filter(task => task.done).length;

  const habits =
    Object.values(data.habits)
      .filter(Boolean)
      .length;

  if($("taskStat"))
    $("taskStat").textContent = completed;

  if($("studyStat"))
    $("studyStat").textContent =
      `${data.focusMinutes || 0}m`;

  if($("noteStat"))
    $("noteStat").textContent =
      data.notes.length;

  if($("habitStat"))
    $("habitStat").textContent =
      habits;

  if($("focusText"))
    $("focusText").textContent =
      `${data.focusMinutes || 0} minutes focused today`;

  if($("focusBar")){

    const percent =
      Math.min(
        ((data.focusMinutes || 0) / 120) * 100,
        100
      );

    $("focusBar").style.width =
      `${percent}%`;

  }

}

renderTasks();


/* =========================================================
   FOCUS TIMER
========================================================= */

function updateFocusTimer(){

  const min =
    Math.floor(focusSeconds / 60)
      .toString()
      .padStart(2,"0");

  const sec =
    (focusSeconds % 60)
      .toString()
      .padStart(2,"0");

  if($("focusTimer")){
    $("focusTimer").textContent =
      `${min}:${sec}`;
  }

}

function startFocus(){

  if(focusRunning){

    stopFocus();

    return;

  }

  focusRunning = true;

  if($("focusStart")){
    $("focusStart").textContent =
      "Pause Focus";
  }

  focusInterval = setInterval(()=>{

    focusSeconds--;

    updateFocusTimer();

    if(focusSeconds <= 0){

      stopFocus();

      data.focusMinutes += 25;

      saveData();

      focusSeconds = 25 * 60;

      updateFocusTimer();
      updateStats();

      alert(
        "Focus session complete! Great work."
      );

    }

  },1000);

}

function stopFocus(){

  focusRunning = false;

  clearInterval(focusInterval);

  focusInterval = null;

  if($("focusStart")){
    $("focusStart").textContent =
      "Start 25-min Focus";
  }

}

$("focusStart")?.addEventListener(
  "click",
  startFocus
);

updateFocusTimer();


/* =========================================================
   NOTES
========================================================= */

function renderNotes(){

  const list = $("noteList");

  if(!list) return;

  if(!data.notes.length){

    list.innerHTML = `
      <p style="color:var(--muted);margin-top:15px">
        No saved notes yet.
      </p>
    `;

    updateStats();

    return;
  }

  list.innerHTML =
    data.notes.map(note => `

      <div class="note-item">

        ${escapeHTML(note.text)}

        <small>
          ${new Date(note.created).toLocaleString()}
        </small>

      </div>

    `).join("");

  updateStats();

}

$("saveNote")?.addEventListener(
  "click",
  ()=>{

    const input = $("notes");

    const text =
      input.value.trim();

    if(!text){

      input.focus();
      return;

    }

    data.notes.unshift({

      text,
      created:Date.now()

    });

    input.value = "";

    saveData();
    renderNotes();

  }
);

renderNotes();


/* =========================================================
   HABITS
========================================================= */

const habitList = [

  "Study for 30 minutes",
  "Review today's notes",
  "Complete an assignment",
  "Read something educational",
  "Plan tomorrow"

];

function habitKey(index){

  const d =
    new Date()
      .toISOString()
      .slice(0,10);

  return `${d}_${index}`;

}

function renderHabits(){

  const box = $("habits");

  if(!box) return;

  box.innerHTML =
    habitList.map((habit,index)=>{

      const key = habitKey(index);

      return `

        <label class="habit">

          <input
            type="checkbox"
            ${data.habits[key] ? "checked" : ""}
            onchange="toggleHabit('${key}')">

          <span>
            ${escapeHTML(habit)}
          </span>

        </label>

      `;

    }).join("");

  updateStats();

}

window.toggleHabit = function(key){

  data.habits[key] =
    !data.habits[key];

  saveData();
  renderHabits();

};

renderHabits();


/* =========================================================
   MODAL
========================================================= */

function showModal(title,html){

  $("modalTitle").textContent =
    title;

  $("modalBody").innerHTML =
    html;

  $("modal").classList.add("show");

  document.body.style.overflow =
    "hidden";

}

window.closeTool = function(){

  $("modal").classList.remove("show");

  document.body.style.overflow =
    "";

};

$("modal")?.addEventListener(
  "click",
  e => {

    if(e.target === $("modal")){
      closeTool();
    }

  }
);


/* =========================================================
   TOOL OPENING
========================================================= */

window.openTool = function(id){

  const tool =
    tools.find(item => item.id === id);

  if(!tool) return;

  const renderers = {

    gpa:gpaTool,

    cgpa:cgpaTool,

    grade:gradeTool,

    attendance:attendanceTool,

    percentage:percentageTool,

    average:averageTool,

    age:ageTool,

    unit:unitTool,

    qr:qrTool,

    password:passwordTool,

    word:wordTool,

    case:caseTool,

    citation:citationTool,

    pomodoro:pomodoroTool,

    exam:examTool,

    budget:budgetTool,

    interview:interviewTool,

    timezone:timezoneTool,

    currency:currencyTool,

    date:dateTool

  };

  const renderer =
    renderers[id];

  if(renderer){
    showModal(
      tool.title,
      renderer()
    );
  }

};


/* =========================================================
   GPA
========================================================= */

function gpaTool(){

  return `

    <div class="tool-form">

      <label>Grade points</label>

      <input
        id="gpaGrades"
        placeholder="4, 3.5, 3, 4">

      <label>Credit hours</label>

      <input
        id="gpaCredits"
        placeholder="3, 3, 4, 3">

      <button
        class="btn primary"
        onclick="calculateGPA()">
        Calculate GPA
      </button>

      <div
        class="result"
        id="gpaResult">
        Enter grade points and credits.
      </div>

    </div>

  `;

}

window.calculateGPA = function(){

  const grades =
    $("gpaGrades").value
      .split(",")
      .map(Number)
      .filter(Number.isFinite);

  const credits =
    $("gpaCredits").value
      .split(",")
      .map(Number)
      .filter(Number.isFinite);

  if(
    !grades.length ||
    grades.length !== credits.length
  ){

    $("gpaResult").textContent =
      "Please enter matching values.";

    return;

  }

  let points = 0;
  let totalCredits = 0;

  grades.forEach((grade,i)=>{

    points += grade * credits[i];
    totalCredits += credits[i];

  });

  const gpa =
    totalCredits
      ? points / totalCredits
      : 0;

  $("gpaResult").innerHTML =
    `<strong>GPA: ${gpa.toFixed(2)}</strong>`;

};


/* =========================================================
   CGPA
========================================================= */

function cgpaTool(){

  return `

    <div class="tool-form">

      <label>Semester GPAs</label>

      <input
        id="cgpaValues"
        placeholder="3.2, 3.5, 3.7">

      <button
        class="btn primary"
        onclick="calculateCGPA()">
        Calculate CGPA
      </button>

      <div
        class="result"
        id="cgpaResult">
      </div>

    </div>

  `;

}

window.calculateCGPA = function(){

  const values =
    $("cgpaValues").value
      .split(",")
      .map(Number)
      .filter(Number.isFinite);

  if(!values.length){

    $("cgpaResult").textContent =
      "Enter your semester GPAs.";

    return;

  }

  const avg =
    values.reduce(
      (a,b)=>a+b,
      0
    ) / values.length;

  $("cgpaResult").innerHTML =
    `<strong>CGPA: ${avg.toFixed(2)}</strong>`;

};


/* =========================================================
   GRADE
========================================================= */

function gradeTool(){

  return `

    <div class="tool-form">

      <label>Obtained marks</label>

      <input
        id="obtained"
        type="number">

      <label>Total marks</label>

      <input
        id="total"
        type="number">

      <button
        class="btn primary"
        onclick="calculateGrade()">
        Calculate Grade
      </button>

      <div
        class="result"
        id="gradeResult">
      </div>

    </div>

  `;

}

window.calculateGrade = function(){

  const obtained =
    Number($("obtained").value);

  const total =
    Number($("total").value);

  if(
    !total ||
    total <= 0 ||
    obtained < 0
  ){

    $("gradeResult").textContent =
      "Enter valid marks.";

    return;

  }

  const percentage =
    obtained / total * 100;

  let grade;

  if(percentage >= 90) grade = "A+";
  else if(percentage >= 80) grade = "A";
  else if(percentage >= 70) grade = "B";
  else if(percentage >= 60) grade = "C";
  else if(percentage >= 50) grade = "D";
  else grade = "F";

  $("gradeResult").innerHTML =
    `<strong>${percentage.toFixed(2)}% — Grade ${grade}</strong>`;

};


/* =========================================================
   ATTENDANCE
========================================================= */

function attendanceTool(){

  return `

    <div class="tool-form">

      <label>Classes attended</label>

      <input
        id="attended"
        type="number">

      <label>Total classes</label>

      <input
        id="classes"
        type="number">

      <button
        class="btn primary"
        onclick="calculateAttendance()">
        Calculate
      </button>

      <div
        class="result"
        id="attendanceResult">
      </div>

    </div>

  `;

}

window.calculateAttendance = function(){

  const attended =
    Number($("attended").value);

  const total =
    Number($("classes").value);

  if(total <= 0 || attended < 0){

    $("attendanceResult").textContent =
      "Enter valid values.";

    return;

  }

  const percentage =
    attended / total * 100;

  $("attendanceResult").innerHTML =
    `<strong>Attendance: ${percentage.toFixed(2)}%</strong>`;

};


/* =========================================================
   PERCENTAGE
========================================================= */

function percentageTool(){

  return `

    <div class="tool-form">

      <label>Value</label>

      <input
        id="percentValue"
        type="number">

      <label>Total</label>

      <input
        id="percentTotal"
        type="number">

      <button
        class="btn primary"
        onclick="calculatePercentage()">
        Calculate
      </button>

      <div
        class="result"
        id="percentageResult">
      </div>

    </div>

  `;

}

window.calculatePercentage = function(){

  const value =
    Number($("percentValue").value);

  const total =
    Number($("percentTotal").value);

  if(total === 0){

    $("percentageResult").textContent =
      "Total cannot be zero.";

    return;

  }

  const result =
    value / total * 100;

  $("percentageResult").innerHTML =
    `<strong>${result.toFixed(2)}%</strong>`;

};


/* =========================================================
   AVERAGE
========================================================= */

function averageTool(){

  return `

    <div class="tool-form">

      <label>Numbers</label>

      <input
        id="averageValues"
        placeholder="10, 20, 30, 40">

      <button
        class="btn primary"
        onclick="calculateAverage()">
        Calculate Average
      </button>

      <div
        class="result"
        id="averageResult">
      </div>

    </div>

  `;

}

window.calculateAverage = function(){

  const values =
    $("averageValues").value
      .split(",")
      .map(Number)
      .filter(Number.isFinite);

  if(!values.length){

    $("averageResult").textContent =
      "Enter numbers separated by commas.";

    return;

  }

  const avg =
    values.reduce(
      (a,b)=>a+b,
      0
    ) / values.length;

  $("averageResult").innerHTML =
    `<strong>Average: ${avg.toFixed(2)}</strong>`;

};


/* =========================================================
   AGE
========================================================= */

function ageTool(){

  return `

    <div class="tool-form">

      <label>Date of birth</label>

      <input
        id="dob"
        type="date">

      <button
        class="btn primary"
        onclick="calculateAge()">
        Calculate Age
      </button>

      <div
        class="result"
        id="ageResult">
      </div>

    </div>

  `;

}

window.calculateAge = function(){

  const value =
    $("dob").value;

  if(!value){

    $("ageResult").textContent =
      "Select your date of birth.";

    return;

  }

  const dob =
    new Date(value + "T00:00:00");

  const today =
    new Date();

  if(dob > today){

    $("ageResult").textContent =
      "Date of birth cannot be in the future.";

    return;

  }

  let years =
    today.getFullYear() -
    dob.getFullYear();

  let months =
    today.getMonth() -
    dob.getMonth();

  if(
    months < 0 ||
    (
      months === 0 &&
      today.getDate() < dob.getDate()
    )
  ){

    years--;

  }

  $("ageResult").innerHTML =
    `<strong>Age: ${years} years</strong>`;

};


/* =========================================================
   UNIT CONVERTER
========================================================= */

function unitTool(){

  return `

    <div class="tool-form">

      <label>Value</label>

      <input
        id="unitValue"
        type="number">

      <label>Conversion</label>

      <select id="unitType">

        <option value="km-mi">
          Kilometers → Miles
        </option>

        <option value="mi-km">
          Miles → Kilometers
        </option>

        <option value="kg-lb">
          Kilograms → Pounds
        </option>

        <option value="lb-kg">
          Pounds → Kilograms
        </option>

        <option value="c-f">
          Celsius → Fahrenheit
        </option>

        <option value="f-c">
          Fahrenheit → Celsius
        </option>

      </select>

      <button
        class="btn primary"
        onclick="convertUnit()">
        Convert
      </button>

      <div
        class="result"
        id="unitResult">
      </div>

    </div>

  `;

}

window.convertUnit = function(){

  const value =
    Number($("unitValue").value);

  const type =
    $("unitType").value;

  let result;

  switch(type){

    case "km-mi":
      result = value * .621371;
      break;

    case "mi-km":
      result = value * 1.609344;
      break;

    case "kg-lb":
      result = value * 2.2046226218;
      break;

    case "lb-kg":
      result = value / 2.2046226218;
      break;

    case "c-f":
      result = value * 9 / 5 + 32;
      break;

    case "f-c":
      result = (value - 32) * 5 / 9;
      break;

  }

  $("unitResult").innerHTML =
    `<strong>${result.toFixed(4)}</strong>`;

};


/* =========================================================
   QR
========================================================= */

function qrTool(){

  return `

    <div class="tool-form">

      <label>Text or URL</label>

      <input
        id="qrText"
        placeholder="https://example.com">

      <button
        class="btn primary"
        onclick="generateQR()">
        Generate QR
      </button>

      <div
        class="result"
        id="qrResult"
        style="text-align:center">
      </div>

    </div>

  `;

}

window.generateQR = function(){

  const text =
    $("qrText").value.trim();

  if(!text){

    $("qrResult").textContent =
      "Enter text or URL.";

    return;

  }

  const url =
    "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" +
    encodeURIComponent(text);

  $("qrResult").innerHTML = `

    <img
      src="${url}"
      alt="Generated QR Code"
      style="
        width:260px;
        max-width:100%;
        border-radius:12px;
      ">

    <br><br>

    <a
      class="btn primary"
      href="${url}"
      target="_blank"
      rel="noopener">
      Open QR
    </a>

  `;

};


/* =========================================================
   PASSWORD
========================================================= */

function passwordTool(){

  return `

    <div class="tool-form">

      <label>Password length</label>

      <input
        id="passwordLength"
        type="number"
        min="8"
        max="64"
        value="16">

      <button
        class="btn primary"
        onclick="generatePassword()">
        Generate Password
      </button>

      <div
        class="result"
        id="passwordResult">
      </div>

    </div>

  `;

}

window.generatePassword = function(){

  let length =
    Number($("passwordLength").value);

  length =
    Math.max(8,Math.min(64,length));

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  let result = "";

  for(let i=0;i<length;i++){

    result +=
      chars[Math.floor(Math.random()*chars.length)];

  }

  $("passwordResult").innerHTML = `

    <strong style="word-break:break-all">
      ${escapeHTML(result)}
    </strong>

    <br><br>

    <button
      class="btn"
      onclick="navigator.clipboard.writeText('${result.replaceAll("'","\\'")}')">
      Copy
    </button>

  `;

};


/* =========================================================
   WORD COUNTER
========================================================= */

function wordTool(){

  return `

    <div class="tool-form">

      <textarea
        id="wordText"
        rows="9"
        placeholder="Paste or write your text here..."></textarea>

      <button
        class="btn primary"
        onclick="countWords()">
        Count
      </button>

      <div
        class="result"
        id="wordResult">
      </div>

    </div>

  `;

}

window.countWords = function(){

  const text =
    $("wordText").value.trim();

  const words =
    text
      ? text.split(/\s+/).length
      : 0;

  const chars =
    text.length;

  const sentences =
    text
      ? text.split(/[.!?]+/)
          .filter(x=>x.trim()).length
      : 0;

  $("wordResult").innerHTML = `

    <strong>
      ${words} words
    </strong>

    <br>

    ${chars} characters

    <br>

    ${sentences} sentences

  `;

};


/* =========================================================
   CASE CONVERTER
========================================================= */

function caseTool(){

  return `

    <div class="tool-form">

      <textarea
        id="caseText"
        rows="8"
        placeholder="Write your text..."></textarea>

      <button
        class="btn"
        onclick="convertCase('upper')">
        UPPERCASE
      </button>

      <button
        class="btn"
        onclick="convertCase('lower')">
        lowercase
      </button>

      <button
        class="btn primary"
        onclick="convertCase('title')">
        Title Case
      </button>

    </div>

  `;

}

window.convertCase = function(type){

  const input =
    $("caseText");

  const text =
    input.value;

  if(type === "upper"){

    input.value =
      text.toUpperCase();

  }

  if(type === "lower"){

    input.value =
      text.toLowerCase();

  }

  if(type === "title"){

    input.value =
      text.toLowerCase()
        .replace(
          /\b\w/g,
          c => c.toUpperCase()
        );

  }

};


/* =========================================================
   CITATION
========================================================= */

function citationTool(){

  return `

    <div class="tool-form">

      <label>Author</label>

      <input id="citeAuthor">

      <label>Year</label>

      <input id="citeYear" type="number">

      <label>Title</label>

      <input id="citeTitle">

      <label>Website / Publisher</label>

      <input id="citePublisher">

      <button
        class="btn primary"
        onclick="makeCitation()">
        Create Citation
      </button>

      <div
        class="result"
        id="citationResult">
      </div>

    </div>

  `;

}

window.makeCitation = function(){

  const author =
    $("citeAuthor").value.trim();

  const year =
    $("citeYear").value.trim();

  const title =
    $("citeTitle").value.trim();

  const publisher =
    $("citePublisher").value.trim();

  $("citationResult").innerHTML =
    `<strong>${escapeHTML(author)}</strong> (${escapeHTML(year)}). ${escapeHTML(title)}. ${escapeHTML(publisher)}.`;

};


/* =========================================================
   POMODORO
========================================================= */

let pomoSeconds = 25 * 60;
let pomoInterval = null;

function pomodoroTool(){

  setTimeout(updatePomo,50);

  return `

    <div style="text-align:center">

      <div
        id="pomoTimer"
        style="
          font-size:48px;
          font-weight:900;
          margin:20px 0;
        ">
        25:00
      </div>

      <button
        class="btn primary"
        onclick="togglePomo()">
        Start / Pause
      </button>

      <button
        class="btn"
        onclick="resetPomo()">
        Reset
      </button>

      <p style="
        color:var(--muted);
        margin-top:15px">
        25 minutes focus • 5 minutes break
      </p>

    </div>

  `;

}

function updatePomo(){

  const el =
    $("pomoTimer");

  if(!el) return;

  const m =
    Math.floor(pomoSeconds/60)
      .toString()
      .padStart(2,"0");

  const s =
    (pomoSeconds%60)
      .toString()
      .padStart(2,"0");

  el.textContent =
    `${m}:${s}`;

}

window.togglePomo = function(){

  if(pomoInterval){

    clearInterval(pomoInterval);
    pomoInterval = null;

    return;

  }

  pomoInterval =
    setInterval(()=>{

      pomoSeconds--;

      updatePomo();

      if(pomoSeconds <= 0){

        clearInterval(pomoInterval);
        pomoInterval = null;

        alert(
          "Pomodoro complete!"
        );

        pomoSeconds =
          25 * 60;

        updatePomo();

      }

    },1000);

};

window.resetPomo = function(){

  clearInterval(pomoInterval);

  pomoInterval = null;

  pomoSeconds =
    25 * 60;

  updatePomo();

};


/* =========================================================
   EXAM COUNTDOWN
========================================================= */

function examTool(){

  return `

    <div class="tool-form">

      <label>Exam date</label>

      <input
        id="examDate"
        type="date">

      <button
        class="btn primary"
        onclick="calculateExam()">
        Calculate Countdown
      </button>

      <div
        class="result"
        id="examResult">
      </div>

    </div>

  `;

}

window.calculateExam = function(){

  const value =
    $("examDate").value;

  if(!value){

    $("examResult").textContent =
      "Select your exam date.";

    return;

  }

  const exam =
    new Date(value + "T00:00:00");

  const now =
    new Date();

  const diff =
    Math.ceil(
      (exam-now) /
      (1000*60*60*24)
    );

  if(diff < 0){

    $("examResult").innerHTML =
      `<strong>This exam date has passed.</strong>`;

    return;

  }

  $("examResult").innerHTML =
    `<strong>${diff} days remaining.</strong>`;

};


/* =========================================================
   BUDGET
========================================================= */

function budgetTool(){

  return `

    <div class="tool-form">

      <label>Monthly income</label>

      <input
        id="income"
        type="number"
        placeholder="50000">

      <label>Food</label>

      <input
        id="food"
        type="number"
        placeholder="10000">

      <label>Transport</label>

      <input
        id="transport"
        type="number"
        placeholder="5000">

      <label>Study / Education</label>

      <input
        id="education"
        type="number"
        placeholder="5000">

      <label>Other expenses</label>

      <input
        id="other"
        type="number"
        placeholder="3000">

      <button
        class="btn primary"
        onclick="calculateBudget()">
        Calculate Budget
      </button>

      <div
        class="result"
        id="budgetResult">
      </div>

    </div>

  `;

}

window.calculateBudget = function(){

  const income =
    Number($("income").value) || 0;

  const expenses =
    (Number($("food").value) || 0) +
    (Number($("transport").value) || 0) +
    (Number($("education").value) || 0) +
    (Number($("other").value) || 0);

  const saving =
    income - expenses;

  $("budgetResult").innerHTML = `

    <strong>
      Total expenses: ${expenses.toLocaleString()}
    </strong>

    <br>

    Remaining:
    ${saving.toLocaleString()}

  `;

};


/* =========================================================
   INTERVIEW
========================================================= */

function interviewTool(){

  const questions = [

    "Tell me about yourself.",
    "Why should we hire you?",
    "What are your strengths?",
    "What is one weakness you are working on?",
    "Where do you see yourself in five years?",
    "Why do you want this position?",
    "Tell me about a challenge you solved.",
    "Why should we choose you over other candidates?"

  ];

  const question =
    questions[
      Math.floor(
        Math.random()*questions.length
      )
    ];

  return `

    <div class="tool-form">

      <div class="result">

        <strong>
          Interview Question
        </strong>

        <br><br>

        ${question}

      </div>

      <textarea
        id="interviewAnswer"
        rows="7"
        placeholder="Write your answer here..."></textarea>

      <button
        class="btn primary"
        onclick="showInterviewTips()">
        Check My Answer
      </button>

      <div
        class="result"
        id="interviewResult"
        style="display:none">
      </div>

    </div>

  `;

}

window.showInterviewTips = function(){

  const answer =
    $("interviewAnswer").value.trim();

  if(!answer){

    alert("Write your answer first.");
    return;

  }

  $("interviewResult").style.display =
    "block";

  $("interviewResult").innerHTML = `

    <strong>Quick feedback</strong>

    <br><br>

    Good answer structure:

    <br>
    1. Give a direct answer.
    <br>
    2. Add a specific example.
    <br>
    3. Explain the result.
    <br>
    4. Keep it concise and professional.

  `;

};


/* =========================================================
   TIME ZONE
========================================================= */

function timezoneTool(){

  return `

    <div class="tool-form">

      <label>Choose destination</label>

      <select id="timezoneSelect">

        <option value="America/New_York">
          New York
        </option>

        <option value="Europe/London">
          London
        </option>

        <option value="Europe/Paris">
          Paris
        </option>

        <option value="Asia/Dubai">
          Dubai
        </option>

        <option value="Asia/Karachi">
          Pakistan
        </option>

        <option value="Asia/Kolkata">
          India
        </option>

        <option value="Asia/Tokyo">
          Tokyo
        </option>

        <option value="Australia/Sydney">
          Sydney
        </option>

      </select>

      <button
        class="btn primary"
        onclick="showTimezone()">
        Show Time
      </button>

      <div
        class="result"
        id="timezoneResult">
      </div>

    </div>

  `;

}

window.showTimezone = function(){

  const zone =
    $("timezoneSelect").value;

  const now =
    new Date();

  const formatted =
    new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle:"full",
        timeStyle:"long",
        timeZone:zone
      }
    ).format(now);

  $("timezoneResult").innerHTML =
    `<strong>${formatted}</strong>`;

};


/* =========================================================
   CURRENCY
========================================================= */

function currencyTool(){

  return `

    <div class="tool-form">

      <label>Amount</label>

      <input
        id="currencyAmount"
        type="number"
        value="1">

      <label>From</label>

      <select id="currencyFrom">

        <option>USD</option>
        <option>EUR</option>
        <option>GBP</option>
        <option>PKR</option>
        <option>AED</option>
        <option>CAD</option>
        <option>AUD</option>
        <option>INR</option>
        <option>SAR</option>

      </select>

      <label>To</label>

      <select id="currencyTo">

        <option>PKR</option>
        <option>USD</option>
        <option>EUR</option>
        <option>GBP</option>
        <option>AED</option>
        <option>CAD</option>
        <option>AUD</option>
        <option>INR</option>
        <option>SAR</option>

      </select>

      <button
        class="btn primary"
        onclick="convertCurrency()">
        Convert
      </button>

      <div
        class="result"
        id="currencyResult">
      </div>

    </div>

  `;

}

window.convertCurrency = async function(){

  const amount =
    Number($("currencyAmount").value);

  const from =
    $("currencyFrom").value;

  const to =
    $("currencyTo").value;

  if(!amount){

    $("currencyResult").textContent =
      "Enter an amount.";

    return;

  }

  $("currencyResult").textContent =
    "Loading exchange rate...";

  try{

    const response =
      await fetch(
        `https://open.er-api.com/v6/latest/${from}`
      );

    const json =
      await response.json();

    const rate =
      json.rates?.[to];

    if(!rate){

      throw new Error(
        "Rate unavailable"
      );

    }

    const result =
      amount * rate;

    $("currencyResult").innerHTML = `

      <strong>
        ${amount} ${from}
        =
        ${result.toFixed(2)} ${to}
      </strong>

      <br><br>

      Rate:
      1 ${from} =
      ${rate.toFixed(4)} ${to}

      <br><br>

      <small>
        Exchange rates can change.
      </small>

    `;

  }catch{

    $("currencyResult").textContent =
      "Could not load the exchange rate. Check your internet connection.";

  }

};


/* =========================================================
   DATE DIFFERENCE
========================================================= */

function dateTool(){

  return `

    <div class="tool-form">

      <label>Start date</label>

      <input
        id="dateStart"
        type="date">

      <label>End date</label>

      <input
        id="dateEnd"
        type="date">

      <button
        class="btn primary"
        onclick="calculateDateDifference()">
        Calculate
      </button>

      <div
        class="result"
        id="dateResult">
      </div>

    </div>

  `;

}

window.calculateDateDifference = function(){

  const start =
    $("dateStart").value;

  const end =
    $("dateEnd").value;

  if(!start || !end){

    $("dateResult").textContent =
      "Select both dates.";

    return;

  }

  const a =
    new Date(start + "T00:00:00");

  const b =
    new Date(end + "T00:00:00");

  const days =
    Math.abs(
      Math.round(
        (b-a) /
        (1000*60*60*24)
      )
    );

  $("dateResult").innerHTML =
    `<strong>${days} days</strong>`;

};


/* =========================================================
   KEYBOARD / ESC
========================================================= */

document.addEventListener(
  "keydown",
  e => {

    if(e.key === "Escape"){
      closeTool();
    }

  }
);


/* =========================================================
   INITIAL UPDATE
========================================================= */

updateStats();
renderTasks();
renderNotes();
renderHabits();
