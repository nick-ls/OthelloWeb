import {Color} from "./GameBoard";
import Game from "./Game";
const {Entropy} = require("entropy-string");
const entropy = new Entropy();

export default class Player {
	static players: Map<string, Player> = new Map<string, Player>();
	color: Color;
	gameId: string;
	id: string;
	constructor(websocket: any, color: Color, game: Game) {
		websocket.props.player = this;
		websocket.props.gameId = game.getId();
		this.color = color;
		this.id = websocket._id;
		this.gameId = game.getId();
		Player.players.set(this.id, this);
	}
	public getColor(): Color {
		return this.color;
	}
	public getGameId(): string {
		return this.gameId;
	}
	public getId(): string {
		return this.id
	}
}