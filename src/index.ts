import SocketServer from "./SocketServer";
import Game from "./Game";
import Player from "./Player";

const express: any = require("express");
const app: any = express();
const server = require("http").createServer(app);
const path: any = require("path");
const wss: SocketServer = new SocketServer(server);

app.use(express.static(path.join(__dirname, "public")));

app.on("/", (req: any, res: any) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/join/:gameId", (req: any, res: any) => {
	res.redirect("/?game=" + req.params.gameId);
});

wss.on("createGame", (msg: any, ws: any) => {
	joinGame(Game.createGame(), ws);
});

wss.on("makeMove", (msg: number[], ws: any) => {
	if (ws.props.gameId && ws.props.player) {		
		let color: Color = ws.props.player.getColor();
		if (Game.runningGames.has(ws.props.gameId) && color) {
			if (Array.isArray(msg)) {
				if (typeof msg[0] === "number" && typeof msg[1] === "number") {
					let game: Game = Game.runningGames.get(ws.props.gameId);
					let success: boolean = game.makeMove(color, msg[0], msg[1]);
					if (success) {
						sendAllPlayersMessage(game, "whoseTurn", game.getWhoseTurn());
						sendAllPlayersMessage(game, "receiveState", game.getBoard());
						sendAllPlayersMessage(game, "score", game.getScore());
						if (game.getLegalMoves(game.getWhoseTurn()).length === 0) {
							if (game.getLegalMoves(-game.getWhoseTurn())) {
								endGame(game);
							}
						}
					} else {
						ws.sendMsg("invalidMove");
					}
				}
			}
		}
	}
});

wss.on("joinGame", (msg: string, ws: any) => {
	joinGame(msg, ws);
});

wss.on("close", (ws: any) => {
	if (Game.runningGames.has(ws.props.gameId)) {
		let game: Game = Game.runningGames.get(ws.props.gameId);
		if (game.removePlayer(ws._id)) {
			delete ws.props.gameId;
			delete ws.props.player;
			console.log(ws.props, Game.runningGames);
		} else {
			console.log("Something really went wrong");
		}
	}
});

function endGame(game: Game) {
	game.players.forEach(player => {
		let socket = wss.getSocket(player.getId());
		socket.sendMsg("score", game.getScore());
		socket.sendMsg("winner", game.getWinner());
		delete socket.props.player;
		delete socket.props.gameId;
	});
	Game.runningGames.delete(game.getId());
}

function sendAllPlayersMessage(game: Game, name: string, value: any) {
	for (let i = 0; i < game.players.length; i++) {
		let player: Player = game.players[i];
		let client: any = wss.getSocket(player.getId());
		if (client) {
			client.sendMsg(name, value);
		}
	}
}

function joinGame(gameId: string, ws: any) {
	if (Game.runningGames.has(gameId)) {
		let game: Game = Game.runningGames.get(gameId);
		if (game.joinGame(ws)) {
			ws.sendMsg("gameCode", game.getId());
			ws.sendMsg("joinGame", game.getPlayer(ws._id).getColor());
			ws.sendMsg("score", game.getScore());
			ws.sendMsg("whoseTurn", game.getWhoseTurn())
			ws.sendMsg("receiveState", game.getBoard());
		}
	}	
}

server.listen(8080);