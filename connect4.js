/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
let nextPlayer = 2;
let gameOver = 0;
let board = []; // array of rows, each row is array of cells  (board[y][x])

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  for (let i = 0; i < 6; i++) {
    board.push([]);
    for (let j = 0; j < 7; j ++) {
      board[i].push(undefined);
    }
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  const htmlBoard = document.querySelector('#board');
  const player1Wins = document.querySelector('#wins1');
  const player2Wins = document.querySelector('#wins2');

  // Creating top spaces to recieve plays from users
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top-red");
  top.addEventListener("click", handleClick);

  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // Creating game board with each cell having an id "y - x"
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
  player1Wins.innerText = (JSON.parse(localStorage.getItem('wins1'))) ? JSON.parse(localStorage.getItem('wins1'))['wins1'] : 0;
  player2Wins.innerText = (JSON.parse(localStorage.getItem('wins2'))) ? JSON.parse(localStorage.getItem('wins2'))['wins2'] : 0;
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  for (let spotCand = 5; spotCand >= 0; spotCand--) {
    if (!board[spotCand][x]) {
      board[spotCand][x] = currPlayer;
      return spotCand;
    }
  }
  return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  const gamePiece = document.createElement('div');
  const gameSpot = document.getElementById(`${y}-${x}`)
  if (currPlayer === 1) {
  gamePiece.classList.add('one');
  } else {
    gamePiece.classList.add('two');
  }
  gamePiece.classList.add('piece');
  gameSpot.append(gamePiece);
}

/** endGame: announce game end */

function endGame(msg) {
  setTimeout(function() { alert(msg) }, 1100)
  
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  if (gameOver) return;
  // get x from ID of clicked cell
  let x = +evt.target.id;

  // get next spot in column (if none, ignore click)
  let y = findSpotForCol(x);
  if (y === null) {
    return;
  }
  if (currPlayer === 1) {
    document.getElementById("column-top-red").setAttribute("id", "column-top-blue");
  } else {
    document.getElementById("column-top-blue").setAttribute("id", "column-top-red");
  }
  // place piece in board and add to HTML table
  placeInTable(y, x);

  // check for win
  if (checkForWin()) {
    gameOver = 1;
    if (currPlayer === 1) {
      const wins1 = parseInt(document.querySelector('#wins1').innerText) + 1;
      localStorage.setItem('wins1', JSON.stringify({'wins1': wins1}));
      setTimeout(function() {document.querySelector('#wins1').innerText = wins1}, 1100);
    } else {
      const wins2 = parseInt(document.querySelector('#wins2').innerText) + 1;
      localStorage.setItem('wins2', JSON.stringify({'wins2': wins2}));
      setTimeout(function() {document.querySelector('#wins2').innerText = wins2}, 1100);
    }
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  let tieCheck = 0;
  for (let row of board) {
    for (let space of row) {
      if (!space) {
        tieCheck = 1;
      }
    }
  }
  if (!tieCheck) {
    gameOver = 1;
    endGame('Wow! This game ends in a tie!');
  }

  // switch players
  [ currPlayer, nextPlayer ] = [ nextPlayer, currPlayer];
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    // Checks that the cells given to it are all valid game board location
    // and are the currentPlayer's pieces to verify a win
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  
  // looping through every piece on game board to be a starting point to create arrays of 4 units
  // horizontally to the right, vertically up, and diagonal to the left and right regardless of 
  // whether those positions are valid on the board. Each of the four arrays are then fed through _win
  // and if any return true then checkForWin will return true.  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();

const newGameButton = document.querySelector('#newGame')
newGameButton.addEventListener("click", function(event) {
  const delTable = document.querySelector('#board');
  while (delTable.hasChildNodes()) {
    delTable.removeChild(delTable.firstChild);
  }
  board = [];
  gameOver = 0;
  makeBoard();
  makeHtmlBoard();
})