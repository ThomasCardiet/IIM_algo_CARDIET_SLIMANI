let sudoku = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 3, 0, 8, 5],
  [0, 0, 1, 0, 2, 0, 0, 0, 0],
  [0, 0, 0, 5, 0, 7, 0, 0, 0],
  [0, 0, 4, 0, 0, 0, 1, 0, 0],
  [0, 9, 0, 0, 0, 0, 0, 0, 0],
  [5, 0, 0, 0, 0, 0, 0, 7, 3],
  [0, 0, 2, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 4, 0, 0, 0, 9],
];

function getRow(grid, row) {
  return grid[row];
}

function getColumn(grid, col) {
  let column = [];
  for (let row = 0; row < 9; row++) {
    column.push(grid[row][col]);
  }

  return column;
}

function getCell(grid, row, col) {
  let cell = [];
  let rowStart = Math.floor(row / 3) * 3;
  let colStart = Math.floor(col / 3) * 3;
  for (let i = rowStart; i < rowStart + 3; i++) {
    for (let j = colStart; j < colStart + 3; j++) {
      cell.push(grid[i][j]);
    }
  }
  return cell;
}

function getAvailableNumbers(grid, row, col) {
  let availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let rowNumbers = getRow(grid, row);
  let colNumbers = getColumn(grid, col);
  let cellNumbers = getCell(grid, row, col);
  let usedNumbers = rowNumbers.concat(colNumbers, cellNumbers);
  return availableNumbers.filter((number) => !usedNumbers.includes(number));
}

function solve(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        let availableNumbers = getAvailableNumbers(grid, row, col);
        for (let number of availableNumbers) {
          grid[row][col] = number;
          if (solve(grid)) {
            return true;
          }
        }
        grid[row][col] = 0;
        return false;
      }
    }
  }
  console.log(grid);

  return true;
}

console.log(solve(sudoku));
