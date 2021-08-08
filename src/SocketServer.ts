import Listeners from "./public/sockets/Listeners";

const websocket = require("ws");
const {Entropy} = require("entropy-string");
const entropy = new Entropy();

export default class SocketServer {
	listeners: Listeners;
	wss: any;
	// server is an http server instance
	constructor(server: any) {
		this.listeners = <Listeners>{};
		this.wss = new websocket.Server({server});
		this.wss.on("connection", (ws: any) => {
			ws._id = entropy.string();
			ws.props = {};
			ws.on("message", (msg: string) => {
				if (msg === "pong") {
					ws._isDead = false;
				} else {
					this.handle(msg, ws);
				}
			});
			ws.on("close", () => {
				this.handleClose(ws);
			});
			// 60 second heartbeat to keep connection alive
			setInterval(()=>{
				if (ws._isDead) {
					ws.terminate();
				}
				ws._isDead = true;
				ws.send("ping");
			}, 60000);
			ws.sendMsg = function(name: string, message: string) {
				this.send(SocketServer.buildMessage(name, message));
			}
		});
	}
	// adds a listener for incoming client communications with the key "listener"
	public on(listener: string, callback: Function) {
		this.listeners[listener] = callback;
	}
	private handle(msg: string, ws: any) {
		let message = this.parse(msg);
		if (!message) {
			console.log("err:", message);
		}
		if (msg === "close" && this.listeners["close"]) return this.listeners["close"](ws);
		if (message) {
			if (message.name === "_join") {
				/*if (this.clients.has(message.content)) {
					let oldClient: any = this.clients.get(message.content);
					ws.props = oldClient.props;
					ws._id = oldClient._id;							
					ws.sendMsg("socket_id", ws._id);
					if (this.listeners["rejoin"]) {
						return this.listeners["rejoin"](ws, oldClient);
					}
				} else {*/
					ws.sendMsg("socket_id", ws._id);								
				//}
			} else if (this.listeners[message.name]) {
				if (!message.content && message.content !== "") return;
				this.listeners[message.name](message.content, ws);
			} else {
				console.warn("Missing client message:", message);
			}
		}
	}
	private handleClose(ws: any) {
		if (!this.listeners["close"]) return;
		this.listeners["close"](ws);
	}
	private parse(msg: string): any {
		try {
			let message = JSON.parse(msg);
			if (typeof message.name === "string") {
				if (!message.content && message.content !== "") return msg;	
				return message;
			}
			return msg;
		} catch (e) {
			return msg;
		}
	}
	private static buildMessage(name: string, message: any): string {
		let msg = {
			name: name,
			content: (message ? message : "")
		};
		return JSON.stringify(msg);
	}
	public getSocket(id: string): any {
		let target: any = null;
		this.wss.clients.forEach((client: any) => {
			if (client._id === id) {
				target = client;
				return;
			}
		});
		return target;
	}
}