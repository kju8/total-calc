let totalGraph, recoveryGraph, requiredGraph;

const mode = document.getElementById("mode");
const notes = document.getElementById("notes");
const ratioElm = document.getElementById("ratio");
const totalElm = document.getElementById("total");
const onenote = document.getElementById("onenote");
const recover = document.getElementById("recover");

class Curve {
  #_func;
  #_color;
  #_opacity;
  #_dash;
  #_minX;
  #_maxX;
  constructor(func, attr) {
    this.#_func = func;
    this.#_color = attr.color ?? "black";
    this.#_opacity = attr.opacity ?? 1;
    this.#_dash = attr.dash ?? 0;
    this.#_minX = attr.pos?.[0] ?? 0;
    this.#_maxX = attr.pos?.[1];
  }

  draw(board, mode, ratio) {
    const fixX = (x) => (mode == "log" ? Math.pow(10, x) : x);
    const fixY = (y) => (mode != "normal" ? Math.log10(y) : y);

    board.create(
      "functiongraph",
      [
        (x) => fixY(this.#_func(fixX(x), ratio)),
        this.#_minX != 0 && mode == "log"
          ? Math.log10(this.#_minX)
          : this.#_minX,
        this.#_maxX != undefined && mode == "log"
          ? Math.log10(this.#_maxX)
          : this.#_maxX,
      ],
      {
        strokeColor: this.#_color,
        strokeOpacity: this.#_opacity,
        dash: this.#_dash,
      }
    );
  }
}

const fixPosition = (pos, mode) => {
  return [
    mode == "log" ? Math.log10(pos[0]) : pos[0],
    mode != "normal" ? Math.log10(pos[1]) : pos[1],
  ];
};

class Point {
  #pos;
  #attr;
  #label;
  #labelPos;

  constructor(pos, attr, label, labelPos) {
    this.#pos = pos;
    this.#attr = attr;
    this.#label = label;
    this.#labelPos = labelPos;
  }

  draw(board, mode) {
    const p = board.create("point", fixPosition(this.#pos, mode), this.#attr);
    board.create("text", [0, 0, this.#label], {
      anchor: p,
      anchorX: this.#labelPos[0],
      anchorY: this.#labelPos[1],
      strokeOpacity: this.#attr.strokeOpacity ?? 1,
    });
  }
}

class Graph {
  #_id;
  #graphObj;
  #graphMode;
  #maxPos;
  constructor(id, pos, maxPos) {
    this.#_id = id;
    this.#graphMode = "normal";
    this.#maxPos = maxPos;
    this.init(pos);
  }

  fix(x, y) {
    return fixPosition([x, y], this.#graphMode);
  }

  fixMaxPos() {
    return this.fix(this.#maxPos[0], this.#maxPos[1]);
  }

  changeMode(mode) {
    this.#graphMode = mode;
  }

  init(pos) {
    if (this.#graphObj !== undefined) JXG.JSXGraph.freeBoard(this.#graphObj);

    const [fixX, fixY] = this.fix(pos[0], pos[1]);
    const maxX = Math.max(fixX * 1.2, this.fixMaxPos()[0]);
    const y1 =
      Math.max(Math.abs(fixY) * 1.2, this.fixMaxPos()[1], 1) *
      (fixY >= 0 ? 1 : -1);
    const minX = -maxX * 0.07;
    const y2 = -y1 * 0.05;

    this.#graphObj = JXG.JSXGraph.initBoard(this.#_id, {
      axis: true,
      defaultAxes: {
        x: {
          ticks: {
            minorTicks: this.#graphMode == "log" ? 0 : 4,
            generateLabelText:
              this.#graphMode == "log"
                ? function (tick, zero) {
                    var value = Math.pow(
                      10,
                      Math.round(tick.usrCoords[1] - zero.usrCoords[1])
                    );
                    return this.formatLabelText(value);
                  }
                : undefined,
            insertTicks: this.#graphMode == "log" ? false : true,
          },
        },
        y: {
          ticks: {
            minorTicks: this.#graphMode != "normal" ? 0 : 4,
            generateLabelText:
              this.#graphMode != "normal"
                ? function (tick, zero) {
                    var value = Math.pow(
                      10,
                      Math.round(tick.usrCoords[2] - zero.usrCoords[2])
                    );
                    return this.formatLabelText(value);
                  }
                : undefined,
            insertTicks: this.#graphMode != "normal" ? false : true,
          },
        },
      },
      boundingbox: [
        minX,
        Math.max(y1, y2, 1.2),
        maxX,
        Math.min(y1, y2, this.#graphMode != "normal" ? -1.2 : 0),
      ],
      showCopyright: false,
      showNavigation: false,
      zoom: false,
      pan: false,
      drag: false,
      registerEvents: false,
    });
  }

  drawCurve(curve, ratio) {
    curve.draw(this.#graphObj, this.#graphMode, ratio);
  }

  drawPoint(point) {
    point.draw(this.#graphObj, this.#graphMode);
  }
}

const TOTAL_FIX = {
  final: 14933,
  "7th": 14000,
  core: 16800,
  comp2: 12133,
  "5th": 13066,
  "4th": 20533,
};

class CalcMode {
  #calculator;
  #curves;
  #recovCurves;
  #reqCurves;
  constructor(calculator) {
    this.#calculator = calculator;
    this.#curves = [];
    this.#recovCurves = [];
    this.#reqCurves = [];
    this.addCurve((x, ratio) => calculator(x) * ratio, {
      color: "black",
      pos: [0],
      totalOnly: true,
    });
    this.addRecoverCurve(
      (x, ratio) => Math.floor(calculator(x) * ratio * 100) / 100 / x,
      {
        color: "black",
        pos: [0],
        recoverOnly: true,
      }
    );
    this.#reqCurves.push(
      new Curve(
        (x, ratio) =>
          Math.ceil((10000 * x) / Math.floor(calculator(x) * ratio * 100)),
        {
          color: "black",
          pos: [0],
          totalOnly: true,
        }
      )
    );
  }

  total(note) {
    return this.#calculator(note);
  }

  fixTotal(note, ratio) {
    return Math.floor(this.total(note) * ratio * 100) / 100;
  }

  recoveryRate(note, ratio) {
    return this.fixTotal(note, ratio) / note;
  }

  fixRecoveryRate(note, ratio) {
    return Math.floor(this.recoveryRate(note, ratio) * 1000000) / 1000000;
  }

  requiredNotes(note, ratio) {
    return 100 / this.recoveryRate(note, ratio);
  }

  addCurve(calc, attr) {
    this.#curves.push(new Curve(calc, attr));
    if (!attr.totalOnly) {
      this.#recovCurves.push(new Curve((x, ratio) => calc(x, ratio) / x, attr));
      this.#reqCurves.push(
        new Curve((x, ratio) => (100 * x) / calc(x, ratio), attr)
      );
    }
  }

  addRecoverCurve(calc, attr) {
    this.#recovCurves.push(new Curve(calc, attr));
    if (!attr.recoverOnly)
      this.#curves.push(new Curve((x, ratio) => calc(x, ratio) * x, attr));
  }

  drawTotal(graph, note, ratio) {
    this.#curves.forEach((v) => graph.drawCurve(v, ratio));
    graph.drawPoint(
      new Point(
        [note, this.total(note) * ratio],
        {
          size: 2,
          color: "red",
          withLabel: false,
        },
        `(${note}, ${this.fixTotal(note, ratio).toFixed(2)})`,
        ["right", "bottom"]
      )
    );
  }

  drawRecover(graph, note, ratio) {
    this.#recovCurves.forEach((v) => graph.drawCurve(v, ratio));
    graph.drawPoint(
      new Point(
        [note, this.recoveryRate(note, ratio)],
        {
          size: 2,
          color: "red",
          withLabel: false,
        },
        `(${note}, ${this.fixRecoveryRate(note, ratio).toFixed(6)})`,
        ["right", "top"]
      )
    );
  }

  drawRequired(graph, note, ratio) {
    this.#reqCurves.forEach((v) => graph.drawCurve(v, ratio));
    graph.drawPoint(
      new Point(
        [note, Math.ceil(100 / this.recoveryRate(note, ratio))],
        {
          size: 2,
          color: "red",
          withLabel: false,
        },
        `(${note}, ${Math.ceil(100 / this.recoveryRate(note, ratio))})`,
        ["right", "bottom"]
      )
    );
  }
}

function BmCalcMode(fixmode) {
  const mode = new CalcMode(
    (note) => (Math.floor(TOTAL_FIX[fixmode] / note) * note) / 55
  );
  mode.addCurve((_, ratio) => (TOTAL_FIX[fixmode] * ratio) / 55, {
    color: "red",
    opacity: 0.5,
    dash: 2,
  });
  mode.addCurve((x, ratio) => ((TOTAL_FIX[fixmode] - x) * ratio) / 55, {
    color: "blue",
    opacity: 0.5,
    dash: 2,
    pos: [0, TOTAL_FIX[fixmode]],
  });
  return mode;
}

const CalcModes = {
  iidx: (() => {
    const mode = new CalcMode((note) =>
      Math.max(260, (7.605 * note) / (0.01 * note + 6.5))
    );
    mode.addCurve((x, ratio) => (7.605 * x * ratio) / (0.01 * x + 6.5), {
      color: "red",
      opacity: 0.5,
      dash: 2,
      pos: [0, (260 * 6.5) / 5.005],
    });
    mode.addCurve((_, ratio) => 260 * ratio, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [(260 * 6.5) / 5.005],
    });
    mode.addCurve((_, ratio) => 760.5 * ratio, {
      color: "black",
      opacity: 0.5,
      dash: 5,
    });
    return mode;
  })(),

  iidx_old: (() => {
    const mode = new CalcMode((note) =>
      note < 400
        ? 200 + note / 5
        : note < 600
        ? 280 + (note - 400) / 2.5
        : 360 + (note - 600) / 5
    );
    mode.addCurve((x, ratio) => (200 + x / 5) * ratio, {
      color: "red",
      opacity: 0.5,
      dash: 2,
      pos: [400],
    });
    mode.addCurve((x, ratio) => (280 + (x - 400) / 2.5) * ratio, {
      color: "purple",
      opacity: 0.5,
      dash: 2,
      pos: [0, 400],
    });
    mode.addCurve((x, ratio) => (280 + (x - 400) / 2.5) * ratio, {
      color: "purple",
      opacity: 0.5,
      dash: 2,
      pos: [600],
    });
    mode.addCurve((x, ratio) => (360 + (x - 600) / 5) * ratio, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [0, 600],
    });
    mode.addRecoverCurve((_, ratio) => 0.2 * ratio, {
      color: "black",
      opacity: 0.5,
      dash: 5,
      recoverOnly: true,
    });
    mode.addRecoverCurve((_, ratio) => 0.4 * ratio, {
      color: "purple",
      opacity: 0.2,
      dash: 5,
      recoverOnly: true,
    });
    return mode;
  })(),

  popn: (() => {
    const mode = new CalcMode(
      (note) => (note * Math.floor(3072 / note)) / 10.24
    );
    mode.addCurve((_, ratio) => 300 * ratio, {
      color: "red",
      opacity: 0.5,
      dash: 2,
    });
    mode.addCurve((x, ratio) => (300 - (300 * x) / 3072) * ratio, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [0, 3072],
    });
    return mode;
  })(),

  lr2: (() => {
    const mode = new CalcMode(
      (note) => 160.0 + (note + Math.min(Math.max(note - 400, 0), 200)) * 0.16
    );
    mode.addCurve((x, ratio) => (160 + x * 0.16) * ratio, {
      color: "red",
      opacity: 0.5,
      dash: 2,
      pos: [400],
    });
    mode.addCurve((x, ratio) => (160 + (2 * x - 400) * 0.16) * ratio, {
      color: "purple",
      opacity: 0.5,
      dash: 2,
      pos: [0, 400],
    });
    mode.addCurve((x, ratio) => (160 + (2 * x - 400) * 0.16) * ratio, {
      color: "purple",
      opacity: 0.5,
      dash: 2,
      pos: [600],
    });
    mode.addCurve((x, ratio) => (160 + (x + 200) * 0.16) * ratio, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [0, 600],
    });
    mode.addRecoverCurve((_, ratio) => 0.16 * ratio, {
      color: "black",
      opacity: 0.5,
      dash: 5,
      recoverOnly: true,
    });
    mode.addRecoverCurve((_, ratio) => 0.16 * 2 * ratio, {
      color: "purple",
      opacity: 0.2,
      dash: 5,
      recoverOnly: true,
    });
    return mode;
  })(),

  nazo: (() => {
    const mode = new CalcMode((note) => Math.max(130, 100 + note));
    mode.addCurve((_, ratio) => 130 * ratio, {
      color: "red",
      opacity: 0.5,
      dash: 2,
      pos: [30],
    });
    mode.addCurve((x, ratio) => (100 + x) * ratio, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [0, 30],
    });
    mode.addRecoverCurve((_, ratio) => ratio, {
      color: "black",
      opacity: 0.5,
      dash: 5,
      recoverOnly: true,
    });
    return mode;
  })(),

  nanasi: new CalcMode((_) => 350),
  fgt: (() => {
    const mode = new CalcMode((note) => 100 + note / 8);
    mode.addRecoverCurve((_, ratio) => 0.125 * ratio, {
      color: "black",
      opacity: 0.5,
      dash: 5,
      recoverOnly: true,
    });
    return mode;
  })(),

  bm98: (() => {
    const mode = new CalcMode((note) => 200 + note);
    mode.addRecoverCurve((_, ratio) => ratio, {
      color: "black",
      opacity: 0.5,
      dash: 5,
      recoverOnly: true,
    });
    return mode;
  })(),

  final: BmCalcMode("final"),
  "7th": BmCalcMode("7th"),
  core: BmCalcMode("core"),
  comp2: BmCalcMode("comp2"),
  "5th": BmCalcMode("5th"),
  "4th": BmCalcMode("4th"),

  divide: (() => {
    const mode = new CalcMode(
      (note) =>
        (Math.max(260, (7.605 * note) / (0.01 * note + 6.5)) *
          (note * Math.floor(3072 / note))) /
        10.24 /
        300
    );
    mode.addCurve((_, ratio) => 260 * ratio, {
      color: "red",
      opacity: 0.2,
      dash: 2,
      pos: [0, (260 * 6.5) / 5.005],
    });
    mode.addCurve(
      (x, ratio) => (260 * (300 - (300 * x) / 3072) * ratio) / 300,
      {
        color: "blue",
        opacity: 0.2,
        dash: 2,
        pos: [0, (260 * 6.5) / 5.005],
      }
    );
    mode.addCurve((x, ratio) => (7.605 * x * ratio) / (0.01 * x + 6.5), {
      color: "red",
      opacity: 0.5,
      dash: 2,
    });
    mode.addCurve(
      (x, ratio) =>
        (((7.605 * x) / (0.01 * x + 6.5)) * (300 - (300 * x) / 3072) * ratio) /
        300,
      {
        color: "blue",
        opacity: 0.5,
        dash: 2,
        pos: [0, 3072],
      }
    );
    return mode;
  })(),

  divide_old: (() => {
    const mode = new CalcMode(
      (note) =>
        (((note * Math.floor(3072 / note)) / 10.24) *
          (note < 400
            ? 200 + note / 5
            : note < 600
            ? 280 + (note - 400) / 2.5
            : 360 + (note - 600) / 5)) /
        300
    );
    return mode;
  })(),
};

function redrawTotalGraph() {
  const note = notes.value - 0;
  const ratio = (ratioElm.value - 0) / 100;
  const nowCalcMode = CalcModes[mode.value];
  const total = nowCalcMode.fixTotal(note, ratio);

  totalGraph.init([note, total]);
  CalcModes[mode.value].drawTotal(totalGraph, note, ratio);
}

function redrawRecoverGraph() {
  const note = notes.value - 0;
  const ratio = (ratioElm.value - 0) / 100;
  const nowCalcMode = CalcModes[mode.value];
  const total = nowCalcMode.fixTotal(note, ratio);

  recoveryGraph.init([note, total / note]);
  CalcModes[mode.value].drawRecover(recoveryGraph, note, ratio);
}

function redrawRequiredGraph() {
  const note = notes.value - 0;
  const ratio = (ratioElm.value - 0) / 100;
  const nowCalcMode = CalcModes[mode.value];
  const total = nowCalcMode.fixTotal(note, ratio);

  requiredGraph.init([note, Math.ceil((100 * note) / total)]);
  CalcModes[mode.value].drawRequired(requiredGraph, note, ratio);
}

[mode, notes, ratioElm].forEach((e) =>
  e.addEventListener("change", (event) => {
    const note = notes.value - 0;
    const ratio = (ratioElm.value - 0) / 100;
    const nowCalcMode = CalcModes[mode.value];
    const total = nowCalcMode.fixTotal(note, ratio);
    totalElm.value = total.toFixed(2);
    onenote.value = nowCalcMode.fixRecoveryRate(note, ratio).toFixed(6);
    recover.value = Math.ceil((100 * note) / total);

    redrawTotalGraph();
    redrawRecoverGraph();
    redrawRequiredGraph();
  })
);

const totalModes = document.getElementsByName("totalGraphMode");
for (let index = 0; index < totalModes.length; index++) {
  const element = totalModes[index];
  element.addEventListener("change", (e) => {
    totalGraph.changeMode(e.target.value);
    redrawTotalGraph();
  });
}

const recoverModes = document.getElementsByName("recoverGraphMode");
for (let index = 0; index < recoverModes.length; index++) {
  const element = recoverModes[index];
  element.addEventListener("change", (e) => {
    recoveryGraph.changeMode(e.target.value);
    redrawRecoverGraph();
  });
}

const requiredModes = document.getElementsByName("requiredGraphMode");
for (let index = 0; index < requiredModes.length; index++) {
  const element = requiredModes[index];
  element.addEventListener("change", (e) => {
    requiredGraph.changeMode(e.target.value);
    redrawRequiredGraph();
  });
}

window.addEventListener("load", (event) => {
  window.addEventListener("resize", (event) => {
    redrawTotalGraph();
    redrawRecoverGraph();
    redrawRequiredGraph();
  });
  totalGraph = new Graph("total_graph", [300, 260], [400, 310]);
  CalcModes.iidx.drawTotal(totalGraph, 300, 1);

  recoveryGraph = new Graph("recovery_graph", [300, 0.866666], [400, 0.6]);
  CalcModes.iidx.drawRecover(recoveryGraph, 300, 1);

  requiredGraph = new Graph("required_graph", [300, 116], [400, 130]);
  CalcModes.iidx.drawRequired(requiredGraph, 300, 1);
});
