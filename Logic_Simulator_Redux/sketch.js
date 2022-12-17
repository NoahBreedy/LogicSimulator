/*   
    Completely redone computer logic simulatior 
    the create block function now works (mostly) but the code has become a hell of a lot 
    cleaner and easier to read and manage when compared to that old and bloated system I was 
    using before 
    Max block name length is 7;
*/
let res = {};
let blockStorage = [
  {
    name: "NOT",
    inpNum: 1,
    outNum: 1,
    seq: [
      [0, 1],
      [1, 0],
    ],
    col: { r: 255, g: 56, b: 102 },
  },
  {
    name: "AND",
    inpNum: 2,
    outNum: 1,
    seq: [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [1, 1, 1],
    ],
    col: { r: 6, g: 209, b: 206 },
  },
];
let Nodes = [],
  startNodes = [],
  endNodes = [],
  Wires = [],
  Blocks = [],
  SelectionButtons = [];
let drawingWire = { on: false, from: null, bent: false, bends: [] };
let selectedBox = -1;
let data;

function preload() {
  fetch("data.txt")
    .then((response) => response.text())
    .then((text) => {
      if (text) {
        data = JSON.parse(text);
      }
    });
}

function setup() {
  if (data) {
    blockStorage = data;
  }
  createCanvas(window.innerWidth - 50, window.innerHeight-50);
  startNodes.push(new Node(40, 40, "start", null, 0));
  startNodes.push(new Node(40, 80, "start", null, 0));
  endNodes.push(new Node(width - 30, 40, "end"));
  setDefault();
  SelectionButtons[0] = new selectionBox(0, "Create Block", -2);
  for (var i = 0; i < blockStorage.length; i++) {
    if (i == 0) {
      SelectionButtons[i + 1] = new selectionBox(
        45 * (i + 2),
        blockStorage[i].name,
        i
      );
    } else {
      SelectionButtons[i + 1] = new selectionBox(
        55 * (i + 1.6),
        blockStorage[i].name,
        i
      );
    }
  }
}

function draw() {
  background(220);
  for (var block of Blocks) {
    block.render();
    block.calculateOutputs();
  }
  drawWires();
  for (var node of Nodes) {
    node.render();
  }
  
  // Kinda makes me mad but like whatever idc at this point
  for (var start of startNodes) {
    start.render();
  }
  for (var end of endNodes) {
    end.render();
  }

  for (var box of SelectionButtons) {
    box.render();
  }
}

function setDefault() {
  Nodes = [];
  Wires = [];
  Blocks = [];
  drawingWire = { on: false, from: null, bent: false, bends: [] };
  selectedBox = -1;
  for (var n of endNodes) {
    n.value = false;
    n.wn.a = null;
  }
}

function selectionBox(x, txt, index) {
  this.x = x;
  this.y = height - 20;
  this.txt = txt;
  this.index = index;
  this.w = index == -2 ? 80 : 50;

  this.mouseOver = () => {
    let d = dist(this.x + this.w / 2, this.y + 15, mouseX, mouseY);
    if (!drawingWire.on && d < this.w) {
      selectedBox = this.index;
    }
  };

  this.render = () => {
    push();
    fill(180);
    noStroke();
    if (this.index == selectedBox) {
      stroke(0);
      strokeWeight(5);
    }
    rect(this.x, this.y, this.w, 30);
    fill(0);
    noStroke();
    text(this.txt, this.x + 2, this.y + 15);
    pop();
  };
}

function drawWires() {
  //Handles current wire drawing
  if (drawingWire.on) {
    var col = drawingWire.from.parent.value ? color(255, 230, 0) : color(255);
    index = drawingWire.bends.length - 1;
    if (drawingWire.bent) {
      for (var i = 0; i < drawingWire.bends.length - 1; i++) {
        push();
        stroke(col);
        strokeWeight(3);
        line(
          drawingWire.bends[i].x,
          drawingWire.bends[i].y,
          drawingWire.bends[i + 1].x,
          drawingWire.bends[i + 1].y
        );
        pop();
      }
    }
    push();
    stroke(col);
    strokeWeight(3);
    line(
      drawingWire.bends[index].x,
      drawingWire.bends[index].y,
      mouseX,
      mouseY
    );
    pop();
  }
  for (var wire of Wires) {
    wire.render();
  }
}

/*I wonder if i could simply recreate the whole scene like generate all the blocks that are present in the new scene
TODO: implement "follow the stream" wire concept {[CANCELED]}
TODO: implement truth tables {DONE} [8/16/2022]
TODO: fix truth table generation bugs
*/

function updateScene() {
  /*update each object (i should really refactor how wire nodes are affected in blocks
  but idc anymore lololo)*/
  let tempNodes = Nodes.concat(startNodes);
  tempNodes = tempNodes.concat(endNodes);
  for (var w of tempNodes) {
    w.wn.update();
  }
  for (var b of Blocks) {
    b.render();
    b.calculateOutputs();
  }
  for (var w of tempNodes) {
    w.wn.update();
  }
}

/*   
    This function basiaclly calculates the entire scene multiple times to generate a 
    proper truth table for the block you are about to create (disclaimer doesen't always work)
    im fixing the bugs with it right now
*/
function calculateScene() {
  let _name = window.prompt("Name of Block: (length 7)");
  if (_name == null) {
    return;
  }
  _name = _name.substring(0, 7);
  let sequence = genTable(startNodes.length, endNodes.length);
  let cache = sequence[0].length;
  for (var i = 0; i < sequence.length; i++) {
    for (var j = 0; j < startNodes.length; j++) {
      startNodes[j].value = sequence[i][j];
    }
    //console.log(startNodes[0].value,startNodes[1].value);
    updateScene();
    //console.log(endNodes[0].value);
    for (var k = j; k < cache; k++) {
      sequence[i][k] = endNodes[k - startNodes.length].value;
    }
  }
  for (var n of startNodes) {
    n.value = false;
  }
  let block = {
    name: _name,
    inpNum: startNodes.length,
    outNum: endNodes.length,
    seq: sequence,
    col: { r: int(random(255)), g: int(random(255)), b: int(random(255)) },
  };
  blockStorage.push(block);
  let ind = SelectionButtons.length;
  let lastX = SelectionButtons[ind - 1].x;
  SelectionButtons[ind] = new selectionBox(
    lastX + 55,
    blockStorage[ind - 1].name,
    ind - 1
  );
}

function dec2bin(dec) {
  if (dec == 1) return "01";
  return (dec >>> 0).toString(2);
}

function genTable(inpNum, outNum) {
  let table = [];
  let length = Math.pow(2, inpNum);
  for (var i = 0; i < length; i++) {
    table[i] = new Array(inpNum + outNum).fill(0);
    for (var j = 0; j < inpNum; j++) {
      let n = dec2bin(i);
      table[i][j] = parseInt(n[j]);
      if (!table[i][j]) {
        table[i][j] = 0;
      }
    }
  }
  return table;
}

function keyPressed() {
  switch (keyCode) {
    case 27: { // cancle action:  esc
      drawingWire = { on: false, from: null, to: null, bent: false, bends: [] };
      selectedBox = -1;
      break;
    }
    case 192: { // reset scene:  ~
      setDefault();
      break;
    }
    case 32: { // calculate the scene: space key
      calculateScene();
      break;
    }
    case 38: {
      var l = startNodes.length;
      if (l < 9) { // add node: arrow keys
        startNodes.push(
          new Node(40, startNodes[l - 1].y + 40, "start", null, 0)
        );
      }
      break;
    }
    case 40: { // remove node: arrow keys
      var l = startNodes.length;
      if (l > 1) {
        startNodes.splice(l - 1, 1);
      }
      break;
    }
    case 39: { // add node: arrow keys
      var o = endNodes.length;
      if (o < 9) {
        endNodes.push(new Node(width - 30, endNodes[o - 1].y + 40, "end"));
      }
      break;
    }
    case 37: { // remove node: arrow keys
      var o = endNodes.length;
      if (o > 1) {
        endNodes.splice(o - 1, 1);
      }
      break;
    }
    case 49: {
      //Save blocks: key - #1
      createStringDict(blockStorage).saveJSON("blockData");
      break;
    }
    case 50: {
      // load blocks: key - #2
      const data = window.prompt("Paste the block JSON");
      if (data == null) {
        break;
      }
      setDefault();
      SelectionButtons[0] = new selectionBox(0, "Create Block", -2);
      blockStorage = JSON.parse(data);
      for (var i = 0; i < blockStorage.length; i++) {
        if (i == 0) {
          SelectionButtons[i + 1] = new selectionBox(
            45 * (i + 2),
            blockStorage[i].name,
            i
          );
        } else {
          SelectionButtons[i + 1] = new selectionBox(
            55 * (i + 1.6),
            blockStorage[i].name,
            i
          );
        }
      }
      break;
    }
  }
}

function mousePressed() {
  //handles the bending of wires
  if (drawingWire.on) {
    let tempNodes = Nodes.concat(endNodes);
    for (var node of tempNodes) {
      if (
        touchingMouse(node.wn) &&
        node.id != drawingWire.from.parent.id &&
        node.type != "start"
      ) {
        Wires.push(
          new Wire(
            drawingWire.from.parent,
            node,
            drawingWire.bent,
            drawingWire.bends
          )
        );
        node.wn.a = Wires[Wires.length - 1];
        drawingWire = {
          on: false,
          from: null,
          to: null,
          bent: false,
          bends: [],
        };
        return;
      }
    }
    drawingWire.bent = true;
    drawingWire.bends.push({ x: mouseX, y: mouseY });
    return;
  }

  //Start Nodes
  for (var node of startNodes) {
    //handles initial wire node drawing
    if (node.type != "inp" && touchingMouse(node.wn)) {
      drawingWire.on = true;
      drawingWire.from = node.wn;
      drawingWire.bends.push({ x: node.wn.x, y: node.wn.y });
      break;
    }
    if (touchingMouse(node)) {
      node.value = !node.value;
    }
  }
  for (var node of Nodes) {
    if (node.type == "out" && touchingMouse(node.wn)) {
      drawingWire.on = true;
      drawingWire.from = node.wn;
      drawingWire.bends.push({ x: node.wn.x, y: node.wn.y });
      break;
    }
  }

  if (selectedBox != -1 && selectedBox != -2 && mouseY < height - 75) {
    Blocks.push(
      new Block(
        mouseX,
        mouseY,
        blockStorage[selectedBox].inpNum,
        blockStorage[selectedBox].outNum,
        blockStorage[selectedBox].seq,
        blockStorage[selectedBox].col,
        blockStorage[selectedBox].name
      )
    );
  } else if (selectedBox == -2) {
    calculateScene();
  }

  //UI Buttons
  for (var box of SelectionButtons) {
    box.mouseOver();
  }
}
