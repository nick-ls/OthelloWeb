enum Color {
	WHITE = 1, BLACK = -1, NONE = 0
}
const directions = [
	[0, 1], // down
	[1, 0], // right
	[0, -1], // up
	[-1, 0], // left
	[1, 1],  // down right
	[1, -1], // up right
	[-1, 1], // down left
	[-1, -1]  // up left
];

function getLegalMoves(color: Color, boardState: number[][]): number[][] {
	let validMoves: number[][] = [];
	for (let row = 0; row < boardState.length; row++) {
		for (let col = 0; col < boardState[0].length; col++) {
			if (isLegalMove(color, row, col, boardState)) {
				validMoves.push([row, col]);
			}
		}
	}
	return validMoves;
}
function isLegalMove(color: Color, row: number, col: number, boardState: number[][]): boolean {
	if (!_isValidPosition(row, col) || boardState[row][col] !== Color.NONE) return false;
	for (let dir of directions) {
		if (_stepFromDirection(color, row, col, dir, 0, boardState)) return true;
	}
	return false;
}
function _stepFromDirection(targetColor: Color, row: number, col: number, direction: number[], depth: number, boardState: number[][]): boolean {
	let nextrow = row + direction[0];
	let nextcol = col + direction[1];
	if (!_isValidPosition(nextrow, nextcol)) return false;
	let color = boardState[nextrow][nextcol];
	if (color === Color.NONE) return false;
	if (depth === 0 && color !== -targetColor) return false;
	if (depth > 0 && color === targetColor) {
		return true;
	}
	return _stepFromDirection(targetColor, nextrow, nextcol, direction, depth + 1, boardState);
}
function _isValidPosition(row: number, col: number): boolean {
	return (row >= 0 && row < 8 && col >= 0 && col < 8);
}