const BOXSIZE = 40;
const ROWS = 6;
const COLS = 7;
let board,
    RED = true,
    YELLOW = false,
    turn = RED,
    NORTHWEST = false,
    NORTHEAST = true; 

clearBoard();

function setup(){
  createCanvas(640, 480, WEBGL);
  angleMode(DEGREES);
}

function draw(){
  background(0,0,255);
  rectMode(CENTER);
  noStroke();
  for(var col = 0; col < COLS; col++){
    for(var row = 0; row < board[col].length; row++){
      push();
      if (board[col][row] == RED) {
        fill(255,0,0);
      } else {
        fill(250, 250, 0);
      }
      translate((BOXSIZE * COLS / -2) + BOXSIZE * col, (BOXSIZE * ROWS / 2) + BOXSIZE * -row);
      rotateX(90);
      cylinder(BOXSIZE/2);
      pop();
    }
  }
  
}

function playDisc(e){
  var col,
      tries = 0,
      choices = _.shuffle(_.range(0,COLS));
  if(check()){
    clearBoard();
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
}


// todo: return cell coords so we can use them to flash!
// add cells to an array instead of returning true
// deal with them at the end of the function 
function check(){
  // this is hardcoded - needs edit if we change number of rows/columns/connects
  var limit = ROWS > COLS ? ROWS : COLS,
    r, c, nw, ne, found = [];
  // instead of three loops, just have one big one
  for(var n = 0; n < limit; n++){
    // check nth row
    r = checkArray(getRow(n));
    if (r != -1) {
      console.log('row ' + n + ' pos ' + r + ' to ' + (r + 3));
      return true;
    }
    
    // check nth col
    c = checkArray(getCol(n));
    // iterate through possible subsets of column
    if (c != -1) {
      console.log('col ' + n + ' pos ' + c + ' to ' + (c + 3));
      return true;
    }
    // check nth diagonals
    if (n < 6) {
      nw = checkArray(getDiag(n, NORTHWEST));
      if (nw != -1) {
        console.log('diag!')
        return true;   
      }
      ne = checkArray(getDiag(n, NORTHEAST));
      if (ne != -1) {
        console.log('diag!')
        return true;   
      }
    } 
  }
}

function checkArray(arr){
  for(var i = 0; i <= arr.length - 4; i++){
    if (arr[i+0] != -1 && arr[i+0] == arr[i+1] && arr[i+1] == arr[i+2] && arr[i+2] == arr[i+3]) {
      return i;
    }
  }
  return -1;
}

function getCol(index){
  var output = [];
  var result;
  for(var row = 0; row < ROWS; row++){
    if (typeof board[index] == 'undefined') {
      result = -1;
    } else {
      result = typeof board[index][row] != 'undefined' ? board[index][row] : -1;
    }
    output.push(result);
  }
  return output;
}

function getRow(index){
  var output = [];
  for(var col = 0; col < COLS; col++){
    var result = typeof board[col][index] != 'undefined' ? board[col][index] : -1;
    output.push(result);
  }
  return output;
}

function getDiag(idx, dir){
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
    var cell = typeof board[col][row] != 'undefined' ? board[col][row] : -1;
    output.push(cell);
    debug += "[" + row + "," + col + "]";
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

window.addEventListener('keydown', playDisc);
