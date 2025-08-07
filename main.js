let totalGraph, recoveryGraph;

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
        (x) => fixY(this.#_func(fixX(x)) * ratio),
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
  constructor(calculator) {
    this.#calculator = calculator;
    this.#curves = [];
    this.#recovCurves = [];
    this.addCurve(calculator, {
      color: "black",
      pos: [0],
    });
  }

  total(note) {
    return this.#calculator(note);
  }

  fixTotal(note, ratio) {
    return Math.floor(this.total(note) * ratio * 100) / 100;
  }

  recoveryRate(note) {
    return this.total(note) / note;
  }

  fixRecoveryRate(note, ratio) {
    return Math.floor((this.fixTotal(note, ratio) * 1000000) / note) / 1000000;
  }

  addCurve(calc, attr) {
    this.#curves.push(new Curve(calc, attr));
    if (!attr.totalOnly)
      this.#recovCurves.push(new Curve((x) => calc(x) / x, attr));
  }

  addRecoverCurve(calc, attr) {
    this.#recovCurves.push(new Curve(calc, attr));
    if (!attr.recoverOnly)
      this.#curves.push(new Curve((x) => calc(x) * x, attr));
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
        [note, this.recoveryRate(note) * ratio],
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
}

function BmCalcMode(fixmode) {
  const mode = new CalcMode(
    (note) => (Math.floor(TOTAL_FIX[fixmode] / note) * note) / 55
  );
  mode.addCurve((x) => TOTAL_FIX[fixmode] / 55, {
    color: "red",
    opacity: 0.5,
    dash: 2,
  });
  mode.addCurve((x) => (TOTAL_FIX[fixmode] - x) / 55, {
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
    mode.addCurve((x) => (7.605 * x) / (0.01 * x + 6.5), {
      color: "red",
      opacity: 0.5,
      dash: 2,
      pos: [0, (260 * 6.5) / 5.005],
    });
    mode.addCurve((x) => 260, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [(260 * 6.5) / 5.005],
    });
    mode.addCurve((x) => 760.5, {
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
    mode.addCurve((x) => 200 + x / 5, {
      color: "red",
      opacity: 0.5,
      dash: 2,
      pos: [400],
    });
    mode.addCurve((x) => 280 + (x - 400) / 2.5, {
      color: "purple",
      opacity: 0.5,
      dash: 2,
      pos: [0, 400],
    });
    mode.addCurve((x) => 280 + (x - 400) / 2.5, {
      color: "purple",
      opacity: 0.5,
      dash: 2,
      pos: [600],
    });
    mode.addCurve((x) => 360 + (x - 600) / 5, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [0, 600],
    });
    mode.addRecoverCurve((x) => 0.2, {
      color: "black",
      opacity: 0.5,
      dash: 5,
      recoverOnly: true,
    });
    mode.addRecoverCurve((x) => 0.4, {
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
    mode.addCurve((x) => 300, {
      color: "red",
      opacity: 0.5,
      dash: 2,
    });
    mode.addCurve((x) => 300 - (300 * x) / 3072, {
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
    mode.addCurve((x) => 160 + x * 0.16, {
      color: "red",
      opacity: 0.5,
      dash: 2,
      pos: [400],
    });
    mode.addCurve((x) => 160 + (2 * x - 400) * 0.16, {
      color: "purple",
      opacity: 0.5,
      dash: 2,
      pos: [0, 400],
    });
    mode.addCurve((x) => 160 + (2 * x - 400) * 0.16, {
      color: "purple",
      opacity: 0.5,
      dash: 2,
      pos: [600],
    });
    mode.addCurve((x) => 160 + (x + 200) * 0.16, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [0, 600],
    });
    mode.addRecoverCurve((x) => 0.16, {
      color: "black",
      opacity: 0.5,
      dash: 5,
      recoverOnly: true,
    });
    return mode;
  })(),

  nazo: (() => {
    const mode = new CalcMode((note) => Math.max(130, 100 + note));
    mode.addCurve((x) => 130, {
      color: "red",
      opacity: 0.5,
      dash: 2,
      pos: [30],
    });
    mode.addCurve((x) => 100 + x, {
      color: "blue",
      opacity: 0.5,
      dash: 2,
      pos: [0, 30],
    });
    mode.addRecoverCurve((x) => 1, {
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
    mode.addRecoverCurve((x) => 1 / 8, {
      color: "black",
      opacity: 0.5,
      dash: 5,
      recoverOnly: true,
    });
    return mode;
  })(),

  bm98: (() => {
    const mode = new CalcMode((note) => 200 + note);
    mode.addRecoverCurve((x) => 1, {
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
    mode.addCurve((_) => 260, {
      color: "red",
      opacity: 0.2,
      dash: 2,
      pos: [0, (260 * 6.5) / 5.005],
    });
    mode.addCurve((x) => (260 * (300 - (300 * x) / 3072)) / 300, {
      color: "blue",
      opacity: 0.2,
      dash: 2,
      pos: [0, (260 * 6.5) / 5.005],
    });
    mode.addCurve((x) => (7.605 * x) / (0.01 * x + 6.5), {
      color: "red",
      opacity: 0.5,
      dash: 2,
    });
    mode.addCurve(
      (x) =>
        (((7.605 * x) / (0.01 * x + 6.5)) * (300 - (300 * x) / 3072)) / 300,
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

window.addEventListener("load", (event) => {
  window.addEventListener("resize", (event) => {
    redrawTotalGraph();
    redrawRecoverGraph();
  });
  totalGraph = new Graph("total_graph", [300, 260], [400, 310]);
  CalcModes.iidx.drawTotal(totalGraph, 300, 1);

  recoveryGraph = new Graph("recovery_graph", [300, 0.866666], [400, 0.6]);
  CalcModes.iidx.drawRecover(recoveryGraph, 300, 1);
});
