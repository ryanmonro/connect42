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
  background(0,0,255);
  noStroke();
  for(var col = 0; col < COLS; col++){
    for(var row = 0; row < board[col].length; row++){
      push();
      var cell = board[col][row];
      if (cell == RED) {
        fill(255,0,0);
      } else if (cell == YELLOW){
        fill(250, 250, 0);
      } else if (cell == CONNECTED) {
        fill(250, 250, 250);
      }
      translate((BOXSIZE * COLS / -2) + BOXSIZE * col, (BOXSIZE * ROWS / 2) + BOXSIZE * -row);
      rotateX(90);
      cylinder(BOXSIZE/2);
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
  if(check()){
    winner = true;
    return;
  }
  do {
    var col = choices[tries];
    tries++;
  } while(board[col].length == ROWS && tries < COLS)
  if (tries >= COLS) {
    clearBoard(); 
    return;
  } 
  board[col].push(turn);
  turn = !turn;
  return col;
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
    console.log(found, found.length);
    for(var i = 0; i < found.length; i++){
      var coords = found[i];
      console.log(coords);
      board[coords[0]][coords[1]] = CONNECTED;
    }
    return true;
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
    // board[col].push(0);
  }
}

var synth = new Tone.PolySynth({
}).toMaster();
synth.set("oscillator", {"type": "sine"});
synth.set("volume", -12);
synth.set("envelope", {decay: 0.2, sustain: 0.3, release: 0.1})


var loop = new Tone.Loop(time => {
  // var scale = [0, 3, 7, 11, 14, 18, 21]
  var scale = [0, 2, 4, 6, 7, 9, 11]
  // col needs to return an array of coords that need to be played
  var col = playDisc() || 0;
  synth.triggerAttackRelease(Tone.Midi("C4").transpose(scale[col]), "16n", time);
}, "16n").start("8n");

// the loops start when the Transport is started
// Tone.Transport.start()

// window.addEventListener('keydown', playDisc);