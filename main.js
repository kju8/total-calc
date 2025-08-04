let totalGraph, recoveryGraph;

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
function totalCalc(note, ratio) {
  let total = 0;
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
  return total * ratio;
}

function totalGraphDraw() {
  if (totalGraph !== undefined) JXG.JSXGraph.freeBoard(totalGraph);
  let note = notes.value - 0;
  let total = totalCalc(note, (ratioElm.value - 0) / 100);
  totalGraph = JXG.JSXGraph.initBoard("total_graph", {
    axis: true,
    boundingbox: [
      (-20 * Math.max(note * 1.2 + 50, 320)) / 400,
      total * 1.1 + 50,
      Math.max(note * 1.2 + 50, 320),
      (-20 * (total * 1.1 + 50)) / 310,
    ],
    showCopyright: false,
    showNavigation: false,
    zoom: false,
    pan: false,
    drag: false,
    registerEvents: false,
  });
  totalGraph.create(
    "functiongraph",
    [(x) => totalCalc(x, (ratioElm.value - 0) / 100), 0],
    { strokeColor: "black" }
  );
  const p = totalGraph.create("point", [note, total], {
    size: 2,
    color: "red",
    withLabel: false,
  });
  totalGraph.create(
    "text",
    [0, 0, `(${note},${Math.floor(total * 100) / 100})`],
    {
      anchor: p,
      anchorX: "right",
      anchorY: "bottom",
    }
  );
}

function recoveryGraphDraw() {
  if (recoveryGraph !== undefined) JXG.JSXGraph.freeBoard(recoveryGraph);
  let note = notes.value - 0;
  let total = totalCalc(note, (ratioElm.value - 0) / 100);
  const recov = total / note;

  const maxY = Math.max(1.5, recov) + 0.1 * 10 ** Math.ceil(Math.log10(recov));
  recoveryGraph = JXG.JSXGraph.initBoard("recovery_graph", {
    axis: true,
    boundingbox: [
      (-20 * Math.max(note * 1.2 + 50, 320)) / 400,
      maxY,
      Math.max(note * 1.2 + 50, 320),
      (-20 * maxY) / 310,
    ],
    showCopyright: false,
    showNavigation: false,
    zoom: false,
    pan: false,
    drag: false,
    registerEvents: false,
  });
  recoveryGraph.create(
    "functiongraph",
    [(x) => totalCalc(x, (ratioElm.value - 0) / 100) / x, 0],
    { strokeColor: "black" }
  );
  const p = recoveryGraph.create("point", [note, recov], {
    size: 2,
    color: "red",
    withLabel: false,
  });
  recoveryGraph.create(
    "text",
    [
      0,
      0,
      `(${note},${(
        Math.floor(((Math.floor(total * 100) / 100) * 1000000) / note) / 1000000
      ).toFixed(6)})`,
    ],
    {
      anchor: p,
      anchorX: "right",
      anchorY: "top",
    }
  );
}

[mode, notes, ratioElm].forEach((e) =>
  e.addEventListener("change", (event) => {
    let note = notes.value - 0;
    let total = totalCalc(note, (ratioElm.value - 0) / 100);
    total = Math.floor(total * 100) / 100;
    totalElm.value = total.toFixed(2);
    onenote.value = (Math.floor((total * 1000000) / note) / 1000000).toFixed(6);
    recover.value = Math.ceil((100 * note) / total);
    totalGraphDraw();
    recoveryGraphDraw();
  })
);

window.addEventListener("load", (event) => {
  totalGraphDraw();
  recoveryGraphDraw();
});
