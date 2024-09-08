declare var SocketClient: any;
const socket = new SocketClient("ws://localhost:8080");
console.log(window.location);
var color: Color; // the client's color
var whoseTurn: Color;
var cachedState: number[][] = ((): number[][] => {
	let arr = [];
	for (let i = 0; i < BOARD_SIZE; i++) {
		arr[i] = (new Array(8)).fill(0);
	}
	return arr;
})();

(function(){
	let match = (/(?<=\?(.*)=)[a-zA-Z0-9]*(?=$|&)/).exec(window.location.href);
	if (match) {
		if (match[1] === "game") {
			history.pushState({}, "", window.origin);
		}
		setTimeout(function() {
			socket.send("joinGame", match[0]);
		}, 1000);
	}
})();


document.addEventListener("click", (e: MouseEvent) => {
	if ((<HTMLElement>e.target).id === "board") {
		makeMove(e.x, e.y);
	}
});
document.addEventListener("click", (e: MouseEvent) => {
	let target: HTMLElement = <HTMLElement>e.target;
	if (target.classList.contains("modal") && target.id !== "start") {
		target.style.display = "none";
	}
});
document.getElementById("createGame").addEventListener("click", (e: MouseEvent) => {
	socket.send("createGame", "");
});
document.getElementById("joinCode").addEventListener("click", (e: MouseEvent) => {
	navigator.clipboard.writeText(`${window.location.origin}/join/${(<HTMLElement>e.target).textContent}`);
});
document.addEventListener("input", (e: InputEvent) => {
	let target = <HTMLInputElement>e.target;
	if (target.id === "gameID") {
		if (target.value.length === 6) {
			console.log("trying to join game", target.value);
			socket.send("joinGame", target.value);
		}
	}
});

socket.on("joinGame", (msg: Color) => {
	/*let elems = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName("modal");
	for (var i = 0; i < elems.length; i++) {
		elems[i].style.display = "none";
	}*/
	(<HTMLElement>document.getElementById("start")).style.display = "none";
	color = Number(msg);
	whoseTurn = Color.BLACK;
});

socket.on("receiveState", (boardState: number[][]) => {
	console.log("receiving board state", boardState);
	cachedState = boardState;
	drawBoard(boardState);
});
socket.on("whoseTurn", (turn: Color) => {
	//document.getElementById("turnkeeper").innerText = (whoseTurn === color) ? "Your turn" : `${turn === Color.BLACK ? "Black's" : "White's"} turn`;
	whoseTurn = turn;
});
socket.on("gameCode", (code: string) => {
	document.getElementById("joinCode").innerText = code;
});
socket.on("invalidMove", () =>  {
	alert("You can't move there!");
});
socket.on("score", (scoreArr: string[]) => {
	document.getElementById("bscore").innerText = scoreArr[0];
	document.getElementById("wscore").innerText = scoreArr[1];
});
function makeMove(x: number, y: number) {
	let coords = mousePosToCoord(x, y);
	console.log("trying to make move at:", coords)
	if (whoseTurn === color && isLegalMove(color, coords[0], coords[1], cachedState)) {
		socket.send("makeMove", coords);
	}
}

function mousePosToCoord(x: number, y: number): number[] {
	let rect = board.getBoundingClientRect();
	let realXY = [Math.floor((y - rect.y) / squareSize), Math.floor((x - rect.x) / squareSize)];
	return realXY;
}
window.onresize = ()=>{drawBoard(cachedState)};