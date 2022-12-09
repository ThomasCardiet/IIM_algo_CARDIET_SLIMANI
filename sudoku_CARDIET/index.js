let sudoku = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 8, 5, 0, 0, 1, 0, 2, 0, 0, 0,
  0, 0, 0, 0, 5, 0, 7, 0, 0, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 9, 0, 0, 0, 0, 0,
  0, 0, 5, 0, 0, 0, 0, 0, 0, 7, 3, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0,
  0, 0, 9,
];

/* let sudoku = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 3, 4, 5, 6, 7, 0, 3, 4, 5, 0, 6, 1, 8,
  2, 0, 0, 1, 0, 5, 8, 2, 0, 6, 0, 0, 8, 6, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 7, 0,
  5, 0, 0, 0, 3, 7, 0, 5, 0, 2, 8, 0, 8, 0, 0, 6, 0, 7, 0, 0, 2, 0, 7, 0, 8, 3,
  6, 1, 5,
]; */

// ALGORITHM PART

const MaxBoardValue = 9;
const MaxCellValue = 3;

function getCasePosition(index) {
  return {
    x: index % MaxBoardValue,
    y: Math.floor(index / MaxBoardValue),
  };
}

function getIndex(position) {
  return position.x + position.y * 9 - 1;
}

function getRow(index, board) {
  const y = getCasePosition(index).y;
  const row = [];
  for (let i = 0; i < MaxBoardValue; i++) {
    row.push(board[i + y * MaxBoardValue]);
  }

  return row;
}

function getColumn(index, board) {
  const x = getCasePosition(index).x;
  const column = [];
  for (let i = 0; i < MaxBoardValue; i++) {
    column.push(board[x + i * MaxBoardValue]);
  }

  return column;
}

function getCell(index, board) {
  const position = getCasePosition(index);
  const startCaseIndex = {
    x: Math.floor(position.x / 3) * 3,
    y: Math.floor(position.y / 3) * 3,
  };
  const cell = [];

  let y = 0;
  for (let x = 1; y < MaxCellValue; x++) {
    cell.push(
      board[startCaseIndex.x + x - 1 + (startCaseIndex.y + y) * MaxBoardValue]
    );
    if (x === MaxCellValue) {
      x = 0;
      y++;
    }
  }

  return cell;
}

function getSolutions(index, board) {
  let values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let usedValues = getRow(index, board).concat(
    getColumn(index, board),
    getCell(index, board)
  );
  return values.filter((value) => !usedValues.includes(value));
}

function solve(board) {
  let y = 0;
  for (let x = 1; y < MaxBoardValue; x++) {
    const index = getIndex({
      x,
      y,
    });

    if (board[index] === 0) {
      let solutions = getSolutions(index, board);
      for (let value of solutions) {
        board[index] = value;
        if (solve(board)) {
          return true;
        }
      }
      board[index] = 0;
      return false;
    }

    if (x === MaxBoardValue) {
      x = 0;
      y++;
    }
  }

  printBoard(board);
  statusProgress.style.display = 'none';
  statusSuccess.style.display = 'block';

  return true;
}

// HTML DISPLAY PART

const htmlTable = document.querySelector('#grid');
const button = document.querySelector('#solve');
const statusProgress = document.querySelector('#solve-progress');
const statusSuccess = document.querySelector('#solve-success');
function printBoard(board) {
  let finalHtml = '';
  let html = '<tr>';
  board.forEach((value, index) => {
    html += `<td><input id="cell-${index}" type="text" ${
      value !== 0 ? `value="${value}"` : ''
    } /></td>`;
    if ((index + 1) % MaxBoardValue === 0 && index !== 0) {
      html += '</tr>';
      finalHtml += html;

      html = '<tr>';
    }
  });

  htmlTable.innerHTML = finalHtml;
}

printBoard(sudoku);

button?.addEventListener('click', () => {
  statusProgress.style.display = 'block';
  button.style.display = 'none';
  setTimeout(() => {
    solve(sudoku);
  }, 20);
});
