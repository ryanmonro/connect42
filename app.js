const BOXSIZE = 40;
const ROWS = 6;
const COLS = 7;
let board,
    EMPTY = -1,
    RED = 0,
    YELLOW = 1,
    CONNECTED = 2,
    winner = false,
    turn = RED,
    NORTHWEST = false,
    NORTHEAST = true; 

clearBoard();

function setup(){
  createCanvas(640, 480, WEBGL);
  angleMode(DEGREES);
  rectMode(CENTER);
}

function draw(){
  background(0,0,0);
  directionalLight(255,255,255,0,0,-1);
  ambientLight(100);
  fill(0,0,255);
  push();
  translate(BOXSIZE/-2, BOXSIZE/2)
  plane(BOXSIZE * COLS + 20, BOXSIZE * ROWS + 20);
  pop();
  noStroke();
  for(var col = 0; col < COLS; col++){
    for(var row = 0; row < ROWS; row++){
      push();
      var cell = board[col][row];
      if (cell == RED) {
        fill(255,0,0);
      } else if (cell == YELLOW){
        fill(250, 250, 0);
      } else if (cell == CONNECTED) {
        fill(250, 250, 250);
      } else {
        fill(0, 0, 0);
      }
      translate((BOXSIZE * COLS / -2) + BOXSIZE * col, (BOXSIZE * ROWS / 2) + BOXSIZE * -row);
      rotateX(90);
      cylinder(BOXSIZE/2 - 3);
      pop();
    }
  }
}

function playDisc(){
  var col,
      tries = 0,
      choices = _.shuffle(_.range(0,COLS)),
      player = turn;
  if(winner){
    winner = false;
    clearBoard();
    return;
  }
  var result = check();
  if(result){
    winner = true;
    return result;
  }
  do {
    col = choices[tries];
    tries++;
  } while(board[col].length == ROWS && tries < COLS)
  if (tries >= COLS) {
    clearBoard(); 
    return;
  } 
  board[col].push(turn);
  turn = !turn;
  return [[col, board[col].length - 1]];
}


function check(){
  // this is hardcoded - needs edit if we change number of rows/columns/connects
  var limit = ROWS > COLS ? ROWS : COLS,
    nw, ne, found = [];
  // instead of three loops, just have one big one
  for(var n = 0; n < limit; n++){
    // check nth row
    checkArrayCells(getRowCells(n), found);
    // check nth col
    checkArrayCells(getColumnCells(n), found);
    // check nth diagonals
    if (n < 6) {
      checkArrayCells(getDiagCells(n, NORTHWEST), found);
      checkArrayCells(getDiagCells(n, NORTHEAST), found);
    }
  }
  if (found.length > 0) {
    for(var i = 0; i < found.length; i++){
      var coords = found[i];
      board[coords[0]][coords[1]] = CONNECTED;
    }
    return found;
  }
}

function checkArrayCells(arr, output){
  for(var i = 0; i <= arr.length - 4; i++){
    var a = getCell(arr[i]),
        b = getCell(arr[i+1]),
        c = getCell(arr[i+2]),
        d = getCell(arr[i+3]);
    if (a != -1 && a == b && b == c && c == d) {
      output.push(arr[i], arr[i+1], arr[i+2], arr[i+3]);
    }
  }
}

function getColumnCells(index){
  var output = [];
  for(var row = 0; row < ROWS; row++){
    var coord = [index, row];
    output.push(coord);
  }
  return output;
}

function getRowCells(index){
  var output = [];
  for(var col = 0; col < COLS; col++){
    var coord = [col, index];
    output.push(coord);
  }
  return output;
}

function getCell(coords){
  var col = coords[0], row = coords[1];
  if (typeof board[col] == 'undefined' || typeof board[col][row] == 'undefined') {
    return -1;
  }
  return board[col][row];
}

function getDiagCells(idx, dir){
  var nMax = idx < 3 ? 3 + idx : 8 - idx,
      col = idx < 2 ? 0 : idx - 2, 
      row = idx > 1 ? 5 : idx + 3, 
      colDir = dir ? -1 : 1,
      output = [],
      debug = "";
    if (dir === NORTHEAST) {
      col = 6 - col;
    }
  for(var n = 0; n <= nMax; n++){
    var coord = [col, row];
    output.push(coord);
    col += colDir;
    row--;
  }
  return output;
}

function clearBoard(){
  board = [];
  for(var col = 0; col < 7; col++){
    board.push([])
  }
}

function coordsToNotes(input){
  var output = [];
  var scale = [0, 2, 4, 6, 7, 9, 11]
  var notes = []
  for(coord of input){
    var col = coord[0], row = coord[1];
    var note = scale[col] + 12 * row;
    if (!notes.includes(note)) {
      notes.push(note)
    }
  }

  for(note of notes){
    output.push(Tone.Midi("C2").transpose(note));  
  }
  return output;
}

var lsynth = new Tone.PolySynth(16);
var rsynth = new Tone.PolySynth(16);
var reverb = new Tone.Reverb(15).toMaster();
var lpan = new Tone.Panner(-0.5).toMaster();
var rpan = new Tone.Panner(0.5).toMaster();
lsynth.connect(lpan);
rsynth.connect(rpan);
reverb.generate();
lsynth.set("oscillator", {"type": "sine"});
lsynth.set("volume", -18);
lsynth.set("envelope", {decay: 0.2, sustain: 0.3, release: 0.1})
rsynth.set("oscillator", {"type": "sine"});
rsynth.set("volume", -18);
rsynth.set("envelope", {decay: 0.2, sustain: 0.3, release: 0.1})

function playNotes(time, notes){
  var synth = turn ? lsynth : rsynth;
  if (notes.length > 1) {
    synth.connect(reverb);
  }
  if (notes.length > 0) {
    synth.triggerAttackRelease(notes, "16n", time);
  }
  if (notes.length > 1) {
    Tone.Draw.schedule(function(){
      synth.disconnect(reverb);
    }, time + Tone.Time("16n").toSeconds())
  }
}

var loop = new Tone.Loop(time => {
  var result = playDisc() || [];
  result = coordsToNotes(result);
  playNotes(time, result);
}, "8n").start("8n");

// the loops start when the Transport is started
Tone.Transport.start()  

window.addEventListener('keydown', playDisc);