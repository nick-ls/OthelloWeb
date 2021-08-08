const board = <HTMLCanvasElement>document.getElementById("board");
const c = board.getContext("2d");
const BOARD_SIZE = 8;

let colors = ["#259a35", "#2ebf41"];//"#26ba3a"];//"#31c445"];//"rgba(0,0,0,0.4)"];

var squareSize: number = (Math.min(window.innerHeight, window.innerWidth) * 0.8) / 8;
function drawBoard(boardState: number[][]) {
	squareSize = (Math.min(window.innerHeight, window.innerWidth) * 0.8) / BOARD_SIZE;

	let sideLength: number = squareSize * BOARD_SIZE;
	board.width = sideLength + 1;
	board.height = sideLength + 1;
	
	c.fillStyle = colors[0];
	c.fillRect(0, 0, sideLength, sideLength);
	// draw grid lines
	for (let i = 0; i < BOARD_SIZE; i++) {
		for (let j = 0; j < BOARD_SIZE; j++) {
			let baseXY = [i * squareSize, j * squareSize];
			c.strokeStyle = colors[1];
			c.lineWidth = 3;
			c.beginPath();
			c.moveTo(baseXY[0], baseXY[1]);
			c.lineTo(baseXY[0] + squareSize, baseXY[1]);
			c.lineTo(baseXY[0] + squareSize, baseXY[1] + squareSize);
			c.lineTo(baseXY[0], baseXY[1] + squareSize);
			c.lineTo(baseXY[0], baseXY[1]);
			c.stroke();
		}
	}
	// fill in spaces with circles
	let halfSquare = squareSize / 2;
	for (let row = 0; row < boardState.length; row++) {
		for (let col = 0; col < boardState[0].length; col++) {
			switch (boardState[row][col]) {
				case Color.WHITE:
					c.fillStyle = "white";
				break;
				case Color.BLACK:
					c.fillStyle = "black";
				break;
				case Color.NONE:
					continue;
			}
			c.beginPath();
			c.arc((col * squareSize) + halfSquare, (row * squareSize) + halfSquare, halfSquare - 1.5, 0, Math.PI * 2);
			c.fill();
		}
	}
	// show the current player available moves
	if (color === whoseTurn) {
		let moves: number[][] = getLegalMoves(color, cachedState);
		moves.forEach(move=>{
			c.fillStyle = "#00000020";
			c.beginPath();
			c.arc((move[1] * squareSize) + halfSquare, (move[0] * squareSize) + halfSquare, halfSquare -1, 0, Math.PI * 2);
			c.fill();
		});
	}
}