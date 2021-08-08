import {GameBoard, Color} from "./GameBoard";
import Player from "./Player";

const {Entropy} = require("entropy-string");
const entropy = new Entropy();

export default class Game {
	static runningGames: Map<string, Game> = new Map();

	players: Player[];
	colors: Color[];
	id: string;
	board: GameBoard;
	turn: Color;
	
	private constructor() {
		this.board = new GameBoard();
		this.id = entropy.smallID();
		this.turn = Color.BLACK;
		this.players = [];
		Game.runningGames.set(this.id, this);
	}
	public joinGame(socket: any): boolean {
		console.log(this.players);
		if (this.players.length < 2) {
			if (this.players[0]) {
				if (this.players[0].getId() === socket._id) return false;
			}
			let color = this.players[0] ? 
				-this.players[0].getColor() :
				(Math.random() > 0.5 ? Color.WHITE : Color.BLACK);
			this.players.push(new Player(socket, color, this));
			return true;
		}
		return false;
	}
	public static createGame(): string {
		let game = new Game();
		return game.getId();
	}
	public makeMove(color: any, row: number, col: number): boolean {
		if (this.turn === color) {
			if (this.board.makeMove(color, row, col)) {
				if (this.board.getLegalMoves(-color).length > 0) {
					this.turn = -color;
				}
				return true
			}
		}
		return false;
	}
	public getScore(): number[] {
		return this.board.getCurrentScore();
	}
	public getId(): string {
		return this.id;
	}
	public getWhoseTurn(): Color {
		return this.turn;
	}
	public getBoard(): number[][] {
		return this.board.getBoard();
	}
	public getLegalMoves(color: Color): number[][] {
		return this.board.getLegalMoves(color);
	}
	public getPlayer(id: string): Player {
		let p: Player = null;
		this.players.forEach((player: Player) => {
			if (player.getId() === id)  {
				p = player;
				return;
			};
		});
		return p;
	}
	public removePlayer(id: string): boolean {
		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i].getId() === id) {
				this.players.splice(i, 1);
				if (this.players.length === 0) {
					Game.runningGames.delete(this.getId());
				}
				return true;
			}
		}
		return false;
	}
	public getWinner() {
		let scores = this.getScore();
		// difference will be positive if white wins, negative if black wins, and 0 for a tie
		return Math.sign(scores[1] -scores[0]);
	}
	public toString(): string {
		return this.board.toString();
	}
}