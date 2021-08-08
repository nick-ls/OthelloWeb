export enum Color {
	WHITE = 1, BLACK = -1, NONE = 0

}
const BOARD_SIZE: number = 8;

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

export class GameBoard	 {

	private board: number[][];

	constructor() {
		// creates an 8 by 8 two dimensional array to store the state of the board
		this.board = ((): number[][] => {
			let arr = [];
			for (let i = 0; i < BOARD_SIZE; i++) {
				arr[i] = (new Array(8)).fill(0);
			}
			return arr;
		})();

		this.board[3][3] = Color.WHITE; // creates centered:
		this.board[4][4] = Color.WHITE; // W B
    	this.board[3][4] = Color.BLACK; // B W
    	this.board[4][3] = Color.BLACK; // to create the inital state of the game board
	}

	public makeMove(color: Color, row: number, col: number): boolean {
		if (this.isLegalMove(color, row, col) && this.isValidPosition(row, col) && this.getColor(row, col) === Color.NONE) {
			this.board[row][col] = color;
			for (let dir of directions) {
				let nextrow = row + dir[0];
				let nextcol = col + dir[1];
				if (this.getColor(nextrow, nextcol) === -color) {
					this.makeMoveStep(color, nextrow, nextcol, dir);
				}
			}
			return true;
		}
		return false;
	}

	public getLegalMoves(color: Color): number[][] {
		let validMoves: number[][] = [];
		for (let row = 0; row < this.board.length; row++) {
			for (let col = 0; col < this.board[0].length; col++) {
				if (this.isLegalMove(color, row, col)) {
					validMoves.push([row, col]);
				}
			}
		}
		return validMoves;
	}

	public isLegalMove(color: Color, row: number, col: number): boolean {
		if (!this.isValidPosition(row, col) || this.getColor(row, col) !== Color.NONE) return false;
		for (let dir of directions) {
			if (this.stepFromDirection(color, row, col, dir, 0)) return true;
		}
		return false;
	}

	private stepFromDirection(targetColor: Color, row: number, col: number, direction: number[], depth: number): boolean {
		let nextrow = row + direction[0];
		let nextcol = col + direction[1];
		if (!this.isValidPosition(nextrow, nextcol)) return false;
		let color = this.getColor(nextrow, nextcol);
		if (color === Color.NONE) return false;
		if (depth === 0 && color !== -targetColor) return false;
		if (depth > 0 && color === targetColor) {
			return true;
		}
		return this.stepFromDirection(targetColor, nextrow, nextcol, direction, depth + 1);
	}

	private makeMoveStep(targetColor: Color, row: number, col: number, dir: number[]): boolean {
		if (this.isValidPosition(row, col)) {
			if (this.getColor(row, col) === -targetColor) {
				let isValid = this.makeMoveStep(targetColor, row + dir[0], col + dir[1], dir);
				if (isValid) {
					this.setColor(row, col, targetColor);
				}
				return isValid;
			} else if (this.getColor(row, col) === targetColor) {
				return true;
			}
			return false;
		}
		return false;
	}

	public getColor(row: number, col: number): Color {
		if (!this.isValidPosition(row, col) || this.board[row][col] === Color.NONE) return Color.NONE;
		return this.board[row][col];
	}

	public setColor(row: number, col: number, color: Color) {
		if (!this.isValidPosition(row, col)) return;
		this.board[row][col] = color;
	}

	public getCurrentScore(): number[] {
		// contains the scores in the order [BLACK, WHITE]
		let scores: number[] = [0, 0];
		for (let row: number = 0; row < this.board.length; row++) {
			for (let col: number = 0; col < this.board[0].length; col++) {
				switch (this.board[row][col]) {
					case Color.BLACK:
						scores[0]++;
					break;
					case Color.WHITE:
						scores[1]++;
					break;
				}
			}
		}
		return scores;
	}

	private isValidPosition(row: number, col: number): boolean {
		return (row >= 0 && row < 8 && col >= 0 && col < 8);
	}

	public getBoard(): number[][] {
		return this.board;
	}

	public toString(): string {
		let str: string = "   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |\n———————————————————————————————————┤\n";
		for (let i = 0; i < this.board.length; i++) {
			str += ` ${i} |`;
			this.board[i].forEach((color: Color) => {
				str += color === Color.WHITE ? " W |" :
						color === Color.BLACK ? " B |" :
						 "   |";
			});
			str += (i === this.board.length - 1) ? "\n———————————————————————————————————┘\n" : "\n———————————————————————————————————┤\n";
		}
		return str;

	}
}