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
const ratioElm = document.getElementById("ratio");
const totalElm = document.getElementById("total");
const onenote = document.getElementById("onenote");
const recover = document.getElementById("recover");
function totalCalc(event) {
  let total = 0;
  let note = notes.value - 0;
  let ratio = (ratioElm.value - 0) / 100;
  if (mode.value === "iidx") {
    total = Math.max(260, (7.605 * note) / (0.01 * note + 6.5));
  } else if (mode.value === "iidx_old") {
    total =
      note < 400
        ? 200 + note / 5
        : note < 600
        ? 280 + (note - 400) / 2.5
        : 360 + (note - 600) / 5;
  } else if (mode.value === "popn") {
    total = (note * Math.floor(3072 / note)) / 10.24;
  } else if (mode.value === "lr2") {
    total = 160.0 + (note + Math.min(Math.max(note - 400, 0), 200)) * 0.16;
  } else if (mode.value === "nazo") {
    total = Math.max(130, 100 + note);
  } else if (mode.value === "nanasi") {
    total = 350;
  } else if (mode.value === "fgt") {
    total = 100 + note / 8;
  } else if (mode.value === "bm98") {
    total = 200 + note;
  } else {
    const fix = TOTAL_FIX[mode.value];
    total = (Math.floor(fix / note) * note) / 55;
  }
  total = Math.floor(total * ratio * 100) / 100;
  totalElm.value = total.toFixed(2);
  onenote.value = (Math.floor((total * 1000000) / note) / 1000000).toFixed(6);
  recover.value = Math.ceil((100 * note) / total);
}

[mode, notes, ratioElm].forEach((e) => e.addEventListener("change", totalCalc));
