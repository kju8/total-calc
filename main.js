let totalGraph, recoveryGraph;

const mode = document.getElementById("mode");
const notes = document.getElementById("notes");
const ratioElm = document.getElementById("ratio");
const totalElm = document.getElementById("total");
const onenote = document.getElementById("onenote");
const recover = document.getElementById("recover");

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
  #totalGraphDrawFunc;
  #recovGraphDrawFunc;
  constructor(calculator, totalGraph, recovGraph) {
    this.#calculator = calculator;
    this.#totalGraphDrawFunc = totalGraph;
    this.#recovGraphDrawFunc = recovGraph;
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

  totalGraphDraw(board, note, ratio) {
    if (this.#totalGraphDrawFunc == undefined) return;
    this.#totalGraphDrawFunc(board, note, ratio);
  }

  recovGraphDraw(board, note, ratio) {
    if (this.#recovGraphDrawFunc == undefined) return;
    this.#recovGraphDrawFunc(board, note, ratio);
  }
}

class BmCalcMode extends CalcMode {
  constructor(mode) {
    super(
      (note) => (Math.floor(TOTAL_FIX[mode] / note) * note) / 55,
      (board, _, ratio) => {
        board.create(
          "line",
          [
            [0, (TOTAL_FIX[mode] * ratio) / 55],
            [1, (TOTAL_FIX[mode] * ratio) / 55],
          ],
          {
            straightFirst: false,
            strokeWidth: 1,
            strokeColor: "red",
            strokeOpacity: 0.5,
            dash: 2,
          }
        );
        board.create(
          "line",
          [
            [0, (TOTAL_FIX[mode] * ratio) / 55],
            [TOTAL_FIX[mode], 0],
          ],
          {
            straightFirst: false,
            strokeWidth: 1,
            strokeColor: "blue",
            strokeOpacity: 0.5,
            dash: 2,
          }
        );
      },
      (board, _, ratio) => {
        board.create(
          "functiongraph",
          [(x) => (TOTAL_FIX[mode] * ratio) / 55 / x, 0],
          {
            strokeColor: "red",
            strokeOpacity: 0.5,
            dash: 2,
          }
        );
        board.create(
          "functiongraph",
          [(x) => ((TOTAL_FIX[mode] - x) * ratio) / 55 / x, 0],
          {
            strokeColor: "blue",
            strokeOpacity: 0.5,
            dash: 2,
          }
        );
      }
    );
  }
}

const CalcModes = {
  iidx: new CalcMode(
    (note) => Math.max(260, (7.605 * note) / (0.01 * note + 6.5)),
    (board, note, ratio) => {
      board.create(
        "line",
        [
          [0, 760.5 * ratio],
          [1, 760.5 * ratio],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "green",
          strokeOpacity: 0.5,
          dash: 5,
        }
      );
      board.create(
        "line",
        [
          [(260 * 6.5) / 5.005, 260 * ratio],
          [1000, 260 * ratio],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => (7.605 * x * ratio) / (0.01 * x + 6.5), 0, (260 * 6.5) / 5.005],
        {
          strokeColor: "red",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      if (note < (260 * 6.5) / 5.005) {
        const p = board.create(
          "point",
          [note, (7.605 * note * ratio) / (0.01 * note + 6.5)],
          {
            size: 2,
            color: "red",
            strokeOpacity: 0.5,
            fillOpacity: 0.2,
            withLabel: false,
          }
        );
        board.create(
          "text",
          [
            0,
            0,
            `(${note}, ${(
              Math.floor((760.5 * note * ratio) / (0.01 * note + 6.5)) / 100
            ).toFixed(2)})`,
          ],
          {
            anchor: p,
            anchorX: "left",
            anchorY: "top",
            strokeOpacity: 0.5,
          }
        );
      }
    },
    (board, _, ratio) => {
      board.create(
        "functiongraph",
        [(x) => (7.605 * ratio) / (0.01 * x + 6.5), 0, (260 * 6.5) / 5.005],
        {
          strokeColor: "red",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => (260 * ratio) / x, (260 * 6.5) / 5.005],
        {
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
    }
  ),
  iidx_old: new CalcMode(
    (note) =>
      note < 400
        ? 200 + note / 5
        : note < 600
        ? 280 + (note - 400) / 2.5
        : 360 + (note - 600) / 5,
    (board, _, ratio) => {
      board.create("functiongraph", [(x) => (200 + x / 5) * ratio, 400], {
        strokeColor: "red",
        strokeOpacity: 0.5,
        dash: 2,
      });
      board.create(
        "functiongraph",
        [(x) => (280 + (x - 400) / 2.5) * ratio, 0, 400],
        {
          strokeColor: "purple",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => (280 + (x - 400) / 2.5) * ratio, 600],
        {
          strokeColor: "purple",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => (360 + (x - 600) / 5) * ratio, 0, 600],
        {
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
    },
    (board, _, ratio) => {
      board.create("functiongraph", [(x) => ((200 + x / 5) * ratio) / x, 400], {
        strokeColor: "red",
        strokeOpacity: 0.5,
        dash: 2,
      });
      board.create(
        "functiongraph",
        [(x) => ((280 + (x - 400) / 2.5) * ratio) / x, 0, 400],
        {
          strokeColor: "purple",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => ((280 + (x - 400) / 2.5) * ratio) / x, 600],
        {
          strokeColor: "purple",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => ((360 + (x - 600) / 5) * ratio) / x, 0, 600],
        {
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "line",
        [
          [0, 0.2 * ratio],
          [1, 0.2 * ratio],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "green",
          strokeOpacity: 0.5,
          dash: 5,
        }
      );
    }
  ),
  popn: new CalcMode(
    (note) => (note * Math.floor(3072 / note)) / 10.24,
    (board, _, ratio) => {
      board.create(
        "line",
        [
          [0, 300 * ratio],
          [1, 300 * ratio],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "red",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "line",
        [
          [0, 300 * ratio],
          [3072, 0],
        ],
        {
          straightFirst: false,
          straightLast: false,
          strokeWidth: 1,
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
    },
    (board, _, ratio) => {
      board.create("functiongraph", [(x) => (300 * ratio) / x, 0], {
        strokeColor: "red",
        strokeOpacity: 0.5,
        dash: 2,
      });
      board.create(
        "functiongraph",
        [(x) => (300 * (1 - (1 / 3072) * x) * ratio) / x, 0, 3072],
        {
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
    }
  ),
  lr2: new CalcMode(
    (note) => 160.0 + (note + Math.min(Math.max(note - 400, 0), 200)) * 0.16,
    (board, _, ratio) => {
      board.create("functiongraph", [(x) => (160 + x * 0.16) * ratio, 400], {
        strokeColor: "red",
        strokeOpacity: 0.5,
        dash: 2,
      });
      board.create(
        "functiongraph",
        [(x) => (160 + (2 * x - 400) * 0.16) * ratio, 0, 400],
        {
          strokeColor: "purple",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => (160 + (2 * x - 400) * 0.16) * ratio, 600],
        {
          strokeColor: "purple",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => (160 + (x + 200) * 0.16) * ratio, 0, 600],
        {
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
    },
    (board, _, ratio) => {
      board.create(
        "functiongraph",
        [(x) => ((160 + x * 0.16) / x) * ratio, 400],
        {
          strokeColor: "red",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => ((160 + (2 * x - 400) * 0.16) / x) * ratio, 0, 400],
        {
          strokeColor: "purple",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => ((160 + (2 * x - 400) * 0.16) / x) * ratio, 600],
        {
          strokeColor: "purple",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "functiongraph",
        [(x) => ((160 + (x + 200) * 0.16) / x) * ratio, 0, 600],
        {
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "line",
        [
          [0, 0.16 * ratio],
          [1, 0.16 * ratio],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "green",
          strokeOpacity: 0.5,
          dash: 5,
        }
      );
    }
  ),
  nazo: new CalcMode(
    (note) => Math.max(130, 100 + note),
    (board, _, ratio) => {
      board.create(
        "line",
        [
          [30, 130 * ratio],
          [31, 130 * ratio],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "red",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
      board.create(
        "line",
        [
          [0, 100 * ratio],
          [30, 130 * ratio],
        ],
        {
          straightFirst: false,
          straightLast: false,
          strokeWidth: 1,
          strokeColor: "blue",
          strokeOpacity: 0.5,
          dash: 2,
        }
      );
    },
    (board, _, ratio) => {
      board.create("functiongraph", [(x) => (130 * ratio) / x, 30], {
        strokeColor: "red",
        strokeOpacity: 0.5,
        dash: 2,
      });
      board.create("functiongraph", [(x) => ((100 + x) * ratio) / x, 0, 30], {
        strokeColor: "blue",
        strokeOpacity: 0.5,
        dash: 2,
      });
      board.create(
        "line",
        [
          [0, ratio],
          [1, ratio],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "green",
          strokeOpacity: 0.5,
          dash: 5,
        }
      );
    }
  ),
  nanasi: new CalcMode((_) => 350),
  fgt: new CalcMode(
    (note) => 100 + note / 8,
    undefined,
    (board, _, ratio) => {
      board.create(
        "line",
        [
          [0, ratio / 8],
          [1, ratio / 8],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "green",
          strokeOpacity: 0.5,
          dash: 5,
        }
      );
    }
  ),
  bm98: new CalcMode(
    (note) => 200 + note,
    undefined,
    (board, _, ratio) => {
      board.create(
        "line",
        [
          [0, ratio],
          [1, ratio],
        ],
        {
          straightFirst: false,
          strokeWidth: 1,
          strokeColor: "green",
          strokeOpacity: 0.5,
          dash: 5,
        }
      );
    }
  ),
  final: new BmCalcMode("final"),
  "7th": new BmCalcMode("7th"),
  core: new BmCalcMode("core"),
  comp2: new BmCalcMode("comp2"),
  "5th": new BmCalcMode("5th"),
  "4th": new BmCalcMode("4th"),
};

function totalGraphDraw() {
  if (totalGraph !== undefined) JXG.JSXGraph.freeBoard(totalGraph);

  const note = notes.value - 0;
  const ratio = (ratioElm.value - 0) / 100;
  const nowCalcMode = CalcModes[mode.value];
  const total = nowCalcMode.total(note) * ratio;

  totalGraph = JXG.JSXGraph.initBoard("total_graph", {
    axis: true,
    boundingbox: [
      (-20 * Math.max(note * 1.2, 320)) / 400,
      Math.max(320, total * 1.2),
      Math.max(note * 1.2, 320),
      (-20 * Math.max(320, total * 1.2)) / 310,
    ],
    showCopyright: false,
    showNavigation: false,
    zoom: false,
    pan: false,
    drag: false,
    registerEvents: false,
  });

  nowCalcMode.totalGraphDraw(totalGraph, note, ratio);

  totalGraph.create("functiongraph", [(x) => nowCalcMode.total(x) * ratio, 0], {
    strokeColor: "black",
  });
  const p = totalGraph.create("point", [note, total], {
    size: 2,
    color: "red",
    withLabel: false,
  });
  totalGraph.create(
    "text",
    [0, 0, `(${note}, ${nowCalcMode.fixTotal(note, ratio).toFixed(2)})`],
    {
      anchor: p,
      anchorX: "right",
      anchorY: "bottom",
    }
  );
}

function recoveryGraphDraw() {
  if (recoveryGraph !== undefined) JXG.JSXGraph.freeBoard(recoveryGraph);

  const note = notes.value - 0;
  const ratio = (ratioElm.value - 0) / 100;
  const nowCalcMode = CalcModes[mode.value];
  const recov = nowCalcMode.recoveryRate(note) * ratio;

  const maxY = Math.max(1.1, recov) + 0.1 * 10 ** Math.ceil(Math.log10(recov));
  recoveryGraph = JXG.JSXGraph.initBoard("recovery_graph", {
    axis: true,
    boundingbox: [
      (-20 * Math.max(note * 1.2, 320)) / 400,
      maxY,
      Math.max(note * 1.2, 320),
      (-20 * maxY) / 310,
    ],
    showCopyright: false,
    showNavigation: false,
    zoom: false,
    pan: false,
    drag: false,
    registerEvents: false,
  });

  nowCalcMode.recovGraphDraw(recoveryGraph, note, ratio);

  recoveryGraph.create(
    "functiongraph",
    [(x) => nowCalcMode.recoveryRate(x) * ratio, 0],
    { strokeColor: "black" }
  );
  const p = recoveryGraph.create("point", [note, recov], {
    size: 2,
    color: "red",
    withLabel: false,
  });
  recoveryGraph.create(
    "text",
    [0, 0, `(${note}, ${nowCalcMode.fixRecoveryRate(note, ratio).toFixed(6)})`],
    {
      anchor: p,
      anchorX: "right",
      anchorY: "top",
    }
  );
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
    totalGraphDraw();
    recoveryGraphDraw();
  })
);

window.addEventListener("load", (event) => {
  window.addEventListener("resize", (event) => {
    totalGraphDraw();
    recoveryGraphDraw();
  });
  totalGraphDraw();
  recoveryGraphDraw();
});
