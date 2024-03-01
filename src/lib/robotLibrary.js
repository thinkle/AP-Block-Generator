robotBackgroundColors = {
  0: "var(--white,white)",
  1: "var(--black,black)",
  2: "var(--target,gold)",
};

function RobotGrid(
  el,
  {
    width = 300,
    height = 300,
    rows = 10,
    cols = 10,
    startX = 1,
    startY = 1,
    speed = 5,
    grid = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    ],
  } = {}
) {
  if (typeof grid === "string") {
    grid = grid
      .replace(/^\s+/, "")
      .replace(/\s+$/, "")
      .split(/\s*\n\s*/g)
      .map((line) => Array.from(line).map((s) => Number(s)));
    console.log("Made grid", grid);
  }
  const RIGHT = 0;
  const UP = 1;
  const LEFT = 2;
  const DOWN = 3;
  let row = startY;
  let col = startX;
  let heading = RIGHT;
  let rowHeight = height / rows;
  let colWidth = width / cols;
  this.element = el;
  let interrupt = false;

  const setupRobotGrid = () => {
    const setupHtml = () => {
      this.element.innerHTML = `
    <style>
    
    .robot-grid .robot {
      transition: all 300ms;      
    }
    .robot svg {
      width: 100%;
    }
    </style>
      <div class="robot-container" style="display: flex; flex-direction: column; align-items: center;">
      <div class="robot-grid" style="position: relative; line-height: 0; width: ${width}px; height: ${height}px; border: 2px solid var(--black,black); ">
        <div class="robot" style="position: absolute; left: ${
          colWidth * startX
        }px; top: ${
          rowHeight * startY
        }px; z-index: 99; color: white; width: ${colWidth}px; height: ${rowHeight}px; display: grid; place-content: center;">
    
    
<svg width="100%" height="100%" viewbox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
<g id="Layer_1">
  <title>Layer 1</title>
  <rect stroke="#000" stroke-width="4" id="svg_1" height="13" width="197.99998" y="55" x="53.00001" fill="var(--robot-color,grey)"/>
  <rect stroke-width="4" stroke="#000" id="svg_2" height="167" width="227.00001" y="68" x="37.99999" fill="var(--robot-color,grey)"/>
  <ellipse rx="0.5" id="svg_4" cy="143" cx="142.5" stroke="#000" fill="none"/>
  <ellipse ry="24.5" rx="24.5" id="svg_6" cy="248.5" cx="41.5" stroke="#000" fill="#e5e5e5"/>
  <ellipse stroke="#000" ry="16" rx="15" id="svg_7" cy="249" cx="41" fill="#000000"/>
  <ellipse ry="24.5" rx="24.5" id="svg_9" cy="249.5" cx="93.5" stroke="#000" fill="#e5e5e5"/>
  <ellipse stroke="#000" ry="16" rx="15" id="svg_10" cy="250" cx="93" fill="#000000"/>
  <ellipse ry="24.5" rx="24.5" id="svg_11" cy="249.5" cx="250.5" stroke="#000" fill="#e5e5e5"/>
  <ellipse stroke="#000" ry="16" rx="15" id="svg_12" cy="250" cx="250" fill="#000000"/>
  <ellipse ry="24.5" rx="24.5" id="svg_13" cy="250.5" cx="197.5" stroke="#000" fill="#e5e5e5"/>
  <ellipse stroke="#000" ry="16" rx="15" id="svg_14" cy="251" cx="197" fill="#000000"/>
  <ellipse ry="24.5" rx="24.5" id="svg_15" cy="249.5" cx="145.5" stroke="#000" fill="#e5e5e5"/>
  <ellipse stroke="#000" ry="16" rx="15" id="svg_16" cy="250" cx="145" fill="#000000"/>
  <ellipse stroke="#000" ry="39" rx="41.5" id="svg_3" cy="110" cx="247.5" fill="#ffffff"/>
  <ellipse stroke="#000" ry="21.5" rx="18.5" id="svg_5" cy="110.5" cx="270.5" fill="#000000"/>
  <line id="svg_17" y2="117" x2="79" y1="91" x1="52" stroke-width="4" stroke="#000" fill="none"/>
  <line id="svg_18" y2="117" x2="79" y1="91" x1="52" stroke-width="4" stroke="#000" fill="none"/>
  <line id="svg_19" y2="117" x2="105" y1="91" x1="78" stroke-width="4" stroke="#000" fill="none"/>
  <line id="svg_20" y2="117" x2="91" y1="91" x1="64" stroke-width="4" stroke="#000" fill="none"/>
  <line id="svg_21" y2="117" x2="79" y1="91" x1="52" stroke-width="4" stroke="#000" fill="none"/>
  <line id="svg_22" y2="117" x2="79" y1="91" x1="52" stroke-width="4" stroke="#000" fill="none"/>
  <line id="svg_23" y2="117" x2="105" y1="91" x1="78" stroke-width="4" stroke="#000" fill="none"/>
  <line id="svg_24" y2="117" x2="91" y1="91" x1="64" stroke-width="4" stroke="#000" fill="none"/>
  <line stroke="#000" id="svg_32" y2="132.5" x2="107" y1="156.5" x1="86" stroke-width="4" fill="none"/>
  <line stroke="#000" id="svg_34" y2="132.5" x2="94" y1="156.5" x1="73" stroke-width="4" fill="none"/>
  <line stroke="#000" id="svg_35" y2="132.5" x2="83" y1="156.5" x1="62" stroke-width="4" fill="none"/>
  <ellipse stroke="#000" ry="39" rx="41.5" id="svg_36" cy="119" cx="224.5" fill="#ffffff"/>
  <ellipse stroke="#000" ry="23" rx="18.5" id="svg_37" cy="120" cx="236.5" fill="#000000"/>
</g>

</svg>
  </div>

      </div>
      <div class="controls">
        <label>Speed</label>
        <input class="speed-input" type="range" min="1" max="10" value="${speed}" />
        <button class="run">Run Program</button>
        <button class="stop" disabled>Stop</button>
      </div>
      </div>
    `;
    };
    setupHtml();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let cell = document.createElement("div");
        cell.style.width = `${rowHeight}px`;
        cell.style.height = `${colWidth}px`;
        cell.style.border = "1px solid var(--black,black)";
        cell.style.boxSizing = "border-box";
        cell.style.display = "inline-block";
        cell.style.position = "relative";
        cell.style.backgroundColor = robotBackgroundColors[grid[row][col]];
        cell.style.transition = "background-color 0.3s ease";
        this.element.querySelector(".robot-grid").appendChild(cell);
      }
    }
    this.element.querySelector(".run").addEventListener("click", () => {
      this.run();
    });
    this.element
      .querySelector(".speed-input")
      .addEventListener("input", (e) => {
        speed = e.target.value;
      });
    this.element.querySelector(".stop").addEventListener("click", () => {
      interrupt = true;
    });

    this.robotElement = this.element.querySelector(".robot");
  };

  setupRobotGrid();
  this.actionQueue = [];

  this.move = (x, y) => {
    this.actionQueue.push({
      type: "move",
      direction: heading,
      row: row,
      col: col,
      newRow: row + y,
      newCol: col + x,
    });
    row += y;
    col += x;
  };
  this.can_move = () => {
    if (heading == LEFT) {
      return col > 0 && grid[row][col - 1] != 1;
    } else if (heading == RIGHT) {
      return col < cols - 1 && grid[row][col + 1] != 1;
    } else if (heading == UP) {
      return row > 0 && grid[row - 1][col] != 1;
    } else if (heading == DOWN) {
      return row < rows - 1 && grid[row + 1][col] != 1;
    }
  };
  this.move_forward = () => {
    if (!this.can_move()) {
      this.actionQueue.push({
        type: "bump",
        direction: heading,
        row: row,
        col: col,
      });
      return;
    }
    if (heading == LEFT) {
      this.move(-1, 0);
    } else if (heading == RIGHT) {
      this.move(1, 0);
    } else if (heading == UP) {
      this.move(0, -1);
    } else if (heading == DOWN) {
      this.move(0, 1);
    }
  };
  this.turn_left = () => {
    if (heading == RIGHT) {
      heading = UP;
    } else if (heading == UP) {
      heading = LEFT;
    } else if (heading == LEFT) {
      heading = DOWN;
    } else if (heading == DOWN) {
      heading = RIGHT;
    }
    this.actionQueue.push({
      type: "turn",
      turn: "left",
      direction: heading,
      row: row,
      col: col,
    });
  };
  this.turn_right = () => {
    heading = heading - 1;
    if (heading < 0) {
      heading = 4 + heading;
    }
    this.actionQueue.push({
      type: "turn",
      turn: "right",
      direction: heading,
      row: row,
      col: col,
    });
  };
  this.run = async () => {
    interrupt = false;
    this.element.querySelector(".run").disabled = true;
    this.element.querySelector(".stop").disabled = false;
    for (let action of this.actionQueue) {
      if (action.type == "move") {
        this.robotElement.style.transform = `rotate(-${
          action.direction * 90
        }deg)`;
        this.robotElement.style.left = `${action.newCol * colWidth}px`;
        this.robotElement.style.top = `${action.newRow * rowHeight}px`;
      } else if (action.type == "turn") {
        this.robotElement.style.transform = `rotate(-${
          action.direction * 90
        }deg)`;
      } else if (action.type == "bump") {
        this.robotElement.style.setProperty("--robot-color", "red");
        await new Promise((resolve) => setTimeout(resolve, 500 / speed));
        this.robotElement.style.setProperty("--robot-color", null);
      }
      if (interrupt) {
        this.element.querySelector(".run").disabled = false;
        this.element.querySelector(".stop").disabled = true;
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 / speed));
    }
    this.element.querySelector(".stop").disabled = true;
    this.element.querySelector(".run").disabled = false;
  };
}
rg = null;
initRobots = () => {
  let robotsDiv = document.querySelector("#robots");
  rg = new RobotGrid(robotsDiv);
};
SETUP_ROBOTS = (settings = {}) => {
  let robotsDiv = document.querySelector("#robots");
  rg = new RobotGrid(robotsDiv, settings);
};
TURN_LEFT = () => {
  if (!rg) {
    initRobots();
  }
  rg.turn_left();
};
TURN_RIGHT = () => {
  if (!rg) {
    initRobots();
  }
  rg.turn_right();
};
MOVE_FORWARD = () => {
  if (!rg) {
    initRobots();
  }
  rg.move_forward();
};
CAN_MOVE = () => {
  if (!rg) {
    initRobots();
  }
  return rg.can_move();
};

right = TURN_RIGHT;
left = TURN_LEFT;
forward = MOVE_FORWARD;
canMove = CAN_MOVE;
setupRobots = SETUP_ROBOTS;
