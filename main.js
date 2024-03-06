const TOTAL_FIX = {
  final: 14933,
  "7th": 14000,
  core: 16800,
  comp2: 12133,
  "5th": 13066,
  "4th": 20533,
};
const mode = document.getElementById("mode");
const notes = document.getElementById("notes");
const totalElm = document.getElementById("total");
function totalCalc(event) {
  let total = 0;
  let note = notes.value - 0;
  if (mode.value === "iidx") {
    total = (7.605 * note) / (0.01 * note + 6.5);
  } else if (mode.value === "popn") {
    total = (note * Math.floor(3072 / note)) / 10.24;
  } else {
    const fix = TOTAL_FIX[mode.value];
    total = (Math.floor(fix / note) * note) / 55;
  }
  totalElm.value = Math.floor(total * 100) / 100;
}

[mode, notes].forEach((e) => e.addEventListener("change", totalCalc));
