const boardElement = document.getElementById('board');
const handElement = document.getElementById('hand');
const scoreElement = document.getElementById('score');
const bestElement = document.getElementById('best');
const gameOverModal = document.getElementById('game-over-modal');
const restartButton = document.getElementById('restart-button');

const BOARD_SIZE = 10;
const TILE_COUNT = BOARD_SIZE * BOARD_SIZE;
const boardTiles = [];
const boardState = new Array(TILE_COUNT).fill(null);
const handBlocks = [];
let currentScore = 0;
let bestScore = Number(localStorage.getItem('bestScore')) || 0;

const RAW_BLOCK_TEMPLATES = [
  { name: 'I', cells: [[0, 1], [1, 1], [2, 1], [3, 1]] },
  { name: 'O', cells: [[1, 1], [1, 2], [2, 1], [2, 2]] },
  { name: 'T', cells: [[0, 1], [1, 0], [1, 1], [1, 2]] },
  { name: 'L', cells: [[0, 1], [1, 1], [2, 1], [2, 2]] },
  { name: 'J', cells: [[0, 1], [1, 1], [2, 1], [2, 0]] },
  { name: 'S', cells: [[0, 1], [0, 2], [1, 0], [1, 1]] },
  { name: 'Z', cells: [[0, 0], [0, 1], [1, 1], [1, 2]] },
];

function normalizeBlockTemplate(template) {
  const minRow = Math.min(...template.cells.map(([row]) => row));
  const minCol = Math.min(...template.cells.map(([, col]) => col));
  const normalizedCells = template.cells.map(([row, col]) => [row - minRow, col - minCol]);
  const width = Math.max(...normalizedCells.map(([, col]) => col)) + 1;
  const height = Math.max(...normalizedCells.map(([row]) => row)) + 1;
  return {
    ...template,
    cells: normalizedCells,
    width,
    height,
  };
}

const BLOCK_TEMPLATES = RAW_BLOCK_TEMPLATES.map(normalizeBlockTemplate);

const BLOCK_COLORS = [
  '#5fbfff',
  '#f59e0b',
  '#34d399',
  '#f97316',
  '#a855f7',
  '#ec4899',
];

function createBoard() {
  for (let i = 0; i < TILE_COUNT; i += 1) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = i;
    tile.addEventListener('dragenter', handleBoardDragEnter);
    tile.addEventListener('dragover', handleBoardDragOver);
    tile.addEventListener('dragleave', handleBoardDragLeave);
    tile.addEventListener('drop', handleBoardDrop);
    boardElement.appendChild(tile);
    boardTiles.push(tile);
  }
}

function getBoardPosition(index) {
  return {
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE,
  };
}

function getTileIndex(row, col) {
  return row * BOARD_SIZE + col;
}

function canPlaceBlock(block, anchorIndex) {
  const anchor = getBoardPosition(anchorIndex);
  return block.cells.every(([rowOffset, colOffset]) => {
    const row = anchor.row + rowOffset;
    const col = anchor.col + colOffset;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return false;
    }
    const index = getTileIndex(row, col);
    return boardState[index] === null;
  });
}

function placeBlock(block, anchorIndex) {
  const anchor = getBoardPosition(anchorIndex);
  block.cells.forEach(([rowOffset, colOffset]) => {
    const row = anchor.row + rowOffset;
    const col = anchor.col + colOffset;
    const index = getTileIndex(row, col);
    boardState[index] = block.color;
    boardTiles[index].style.background = block.color;
    boardTiles[index].style.borderColor = block.color;
  });
}

function resetTileVisual(tile) {
  tile.style.background = '';
  tile.style.borderColor = '';
}

function clearPreviewClasses() {
  boardTiles.forEach((tile) => {
    tile.classList.remove('preview-valid', 'preview-invalid');
  });
}

function getDropAnchorIndex(dropIndex, offsetRow, offsetCol) {
  const dropPos = getBoardPosition(dropIndex);
  const anchorRow = dropPos.row - offsetRow;
  const anchorCol = dropPos.col - offsetCol;
  return getTileIndex(anchorRow, anchorCol);
}

function highlightPotentialPlacement(block, dropIndex, offsetRow, offsetCol) {
  const anchorIndex = getDropAnchorIndex(dropIndex, offsetRow, offsetCol);
  const anchor = getBoardPosition(anchorIndex);
  const valid = canPlaceBlock(block, anchorIndex);
  block.cells.forEach(([rowOffset, colOffset]) => {
    const row = anchor.row + rowOffset;
    const col = anchor.col + colOffset;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return;
    }
    const index = getTileIndex(row, col);
    boardTiles[index].classList.add(valid ? 'preview-valid' : 'preview-invalid');
  });
}

function getFullRows() {
  const rows = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const rowStart = row * BOARD_SIZE;
    const isFull = Array.from({ length: BOARD_SIZE }, (_, col) => boardState[rowStart + col]).every((cell) => cell !== null);
    if (isFull) {
      rows.push(row);
    }
  }
  return rows;
}

function getFullCols() {
  const cols = [];
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    const isFull = Array.from({ length: BOARD_SIZE }, (_, row) => boardState[row * BOARD_SIZE + col]).every((cell) => cell !== null);
    if (isFull) {
      cols.push(col);
    }
  }
  return cols;
}

function clearFilledLines() {
  const rows = getFullRows();
  const cols = getFullCols();
  const clearedIndices = new Set();

  rows.forEach((row) => {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      clearedIndices.add(getTileIndex(row, col));
    }
  });

  cols.forEach((col) => {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      clearedIndices.add(getTileIndex(row, col));
    }
  });

  if (clearedIndices.size === 0) {
    return 0;
  }

  clearedIndices.forEach((index) => {
    boardState[index] = null;
    boardTiles[index].classList.add('clearing');
  });

  window.setTimeout(() => {
    clearedIndices.forEach((index) => {
      resetTileVisual(boardTiles[index]);
      boardTiles[index].classList.remove('clearing');
    });
  }, 220);

  return rows.length + cols.length;
}

function updateScore(amount) {
  if (amount === 0) {
    return;
  }
  currentScore += amount;
  scoreElement.textContent = currentScore;
  if (currentScore > bestScore) {
    bestScore = currentScore;
    bestElement.textContent = bestScore;
    localStorage.setItem('bestScore', bestScore.toString());
  }
}

function removeHandBlock(index) {
  handBlocks.splice(index, 1);
  if (handBlocks.length === 0) {
    fillNextHand();
  } else {
    renderHand();
  }
}

function hasValidPlacementForAnyHandBlock() {
  return handBlocks.some((block) => {
    for (let i = 0; i < TILE_COUNT; i += 1) {
      if (canPlaceBlock(block, i)) {
        return true;
      }
    }
    return false;
  });
}

function showGameOver() {
  gameOverModal.classList.remove('hidden');
}

function hideGameOver() {
  gameOverModal.classList.add('hidden');
}

function restartGame() {
  currentScore = 0;
  scoreElement.textContent = currentScore;
  boardState.fill(null);
  boardTiles.forEach((tile) => {
    tile.className = 'tile';
    resetTileVisual(tile);
  });
  hideGameOver();
  fillNextHand();
}

function handleBoardDragEnter(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function handleBoardDragOver(event) {
  event.preventDefault();
  const tile = event.currentTarget;
  tile.classList.add('drag-over');
  clearPreviewClasses();
  try {
    const dragData = JSON.parse(event.dataTransfer.getData('text/plain'));
    const block = handBlocks[dragData.blockIndex];
    if (block) {
      highlightPotentialPlacement(block, Number(tile.dataset.index), dragData.offsetRow, dragData.offsetCol);
    }
  } catch (error) {
    const blockIndex = Number(event.dataTransfer.getData('text/plain'));
    const block = handBlocks[blockIndex];
    if (block) {
      highlightPotentialPlacement(block, Number(tile.dataset.index), 0, 0);
    }
  }
}

function handleBoardDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
  clearPreviewClasses();
}

function handleBoardDrop(event) {
  event.preventDefault();
  const tile = event.currentTarget;
  tile.classList.remove('drag-over');
  clearPreviewClasses();
  const tileIndex = Number(tile.dataset.index);
  let blockIndex = null;
  let offsetRow = 0;
  let offsetCol = 0;

  try {
    const dragData = JSON.parse(event.dataTransfer.getData('text/plain'));
    blockIndex = dragData.blockIndex;
    offsetRow = dragData.offsetRow;
    offsetCol = dragData.offsetCol;
  } catch (error) {
    blockIndex = Number(event.dataTransfer.getData('text/plain'));
  }

  const block = handBlocks[blockIndex];
  if (!block) {
    return;
  }

  const anchorIndex = getDropAnchorIndex(tileIndex, offsetRow, offsetCol);
  if (canPlaceBlock(block, anchorIndex)) {
    placeBlock(block, anchorIndex);
    updateScore(block.cells.length * 10);
    const clearedLineCount = clearFilledLines();
    if (clearedLineCount > 0) {
      const bonus = clearedLineCount * 100 + (clearedLineCount - 1) * 50;
      updateScore(bonus);
    }
    removeHandBlock(blockIndex);
    if (!hasValidPlacementForAnyHandBlock()) {
      showGameOver();
    }
    console.log(`Placed block ${blockIndex} at ${tileIndex}`);
    return;
  }

  console.log(`Cannot place block ${blockIndex} at ${tileIndex}`);
}

function getRandomBlock() {
  const template = BLOCK_TEMPLATES[Math.floor(Math.random() * BLOCK_TEMPLATES.length)];
  const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
  return {
    name: template.name,
    cells: template.cells,
    width: template.width,
    height: template.height,
    color,
  };
}

function createBlockPreview(block, index) {
  const container = document.createElement('div');
  container.className = 'block-preview';
  container.dataset.blockIndex = index;
  container.draggable = true;

  container.addEventListener('dragstart', (event) => {
    const gridRect = grid.getBoundingClientRect();
    const x = event.clientX - gridRect.left;
    const y = event.clientY - gridRect.top;
    const cellWidth = gridRect.width / block.width;
    const cellHeight = gridRect.height / block.height;
    let offsetCol = Math.max(0, Math.min(block.width - 1, Math.floor(x / cellWidth)));
    let offsetRow = Math.max(0, Math.min(block.height - 1, Math.floor(y / cellHeight)));

    const isFilledCell = block.cells.some(([row, col]) => row === offsetRow && col === offsetCol);
    if (!isFilledCell) {
      let closest = block.cells[0];
      let bestDistance = Infinity;
      block.cells.forEach(([row, col]) => {
        const distance = (row - offsetRow) ** 2 + (col - offsetCol) ** 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          closest = [row, col];
        }
      });
      [offsetRow, offsetCol] = closest;
    }

    event.dataTransfer.setData('text/plain', JSON.stringify({
      blockIndex: index,
      offsetRow,
      offsetCol,
    }));
    event.dataTransfer.effectAllowed = 'move';
  });

  const title = document.createElement('div');
  title.className = 'block-title';
  title.textContent = block.name;

  const grid = document.createElement('div');
  grid.className = 'block-grid';
  grid.style.gridTemplateColumns = `repeat(${block.width}, minmax(0, 1fr))`;
  grid.style.gridTemplateRows = `repeat(${block.height}, minmax(0, 1fr))`;

  for (let row = 0; row < block.height; row += 1) {
    for (let col = 0; col < block.width; col += 1) {
      const cell = document.createElement('div');
      cell.className = 'block-cell';
      const encoded = `${row},${col}`;
      const match = block.cells.some(([r, c]) => `${r},${c}` === encoded);
      if (match) {
        cell.classList.add('filled');
        cell.style.background = block.color;
      }
      grid.appendChild(cell);
    }
  }

  container.appendChild(title);
  container.appendChild(grid);

  return container;
}

function renderHand() {
  handElement.innerHTML = '';
  handBlocks.forEach((block, index) => {
    const preview = createBlockPreview(block, index);
    handElement.appendChild(preview);
  });
}

function fillNextHand() {
  handBlocks.length = 0;
  for (let i = 0; i < 3; i += 1) {
    handBlocks.push(getRandomBlock());
  }
  renderHand();
  if (!hasValidPlacementForAnyHandBlock()) {
    showGameOver();
  }
}

function initGame() {
  createBoard();
  currentScore = 0;
  scoreElement.textContent = currentScore;
  bestElement.textContent = bestScore;
  boardState.fill(null);
  boardTiles.forEach((tile) => {
    tile.className = 'tile';
    resetTileVisual(tile);
  });
  hideGameOver();
  fillNextHand();
}

restartButton.addEventListener('click', restartGame);

initGame();
