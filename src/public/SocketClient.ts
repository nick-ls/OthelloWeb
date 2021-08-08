import Listeners from "./sockets/Listeners";

export default class SocketClient {
	url: string;
	listeners: Listeners;
	socket: WebSocket;
	ready: boolean;
	reconnectLoop: NodeJS.Timeout;

	constructor(url: string, listeners?: Listeners) {
		this.url = url;
		this.connect(url, listeners ? listeners : {});
	}
	public on(listener: string, callback: Function) {
		this.listeners[listener] = callback;
	}
	public async send(name: string, msg: any) {
		var message = this.buildMessage(name, msg);
		if (this.isConnected()) {
			this.socket.send(message);
		} else {
			await // wait for reconnect b4 sending msg
			this.reconnect(message);
		}
	}
	private connect(url: string, listeners = {}, message?: string) {
		this.socket = new WebSocket(url);
		this.listeners = listeners;
		this.ready = false;
		this.socket.onopen = () => {
			let previousUser = this.getCookie("socket_id");
			this.send("_join", previousUser);
			if (message) this.socket.send(message);
		}
		this.socket.onmessage = (msg: MessageEvent) => {
			console.log(msg.data);
			if (msg.data === "ping") {
				this.socket.send("pong");
			} else {
				this.handle(msg.data);
			}
		}
		if (this.reconnectLoop) clearInterval(this.reconnectLoop);
		this.reconnectLoop = setInterval(() => {
			if (!this.isConnected()) {
				this.reconnect();
			}
		}, 5000);
	}
	private reconnect(message?: string) {
		if (this.isConnected()) {
			this.socket.send(message)
			return;
		}
		this.connect(this.url, this.listeners, message);
	}
	private isConnected() {
		return this.socket.readyState === this.socket.OPEN;
	}
	private handle(msg: string) {
		console.log(msg);
		let message = this.parse(msg);
		if (message.name === "socket_id") {
			document.cookie = "socket_id=" + message.content + "; SameSite=Strict";
		} else if (message.name) {
			if (typeof this.listeners[message.name] === "function") {	
				this.listeners[message.name](message.content);
			} else {
				console.warn("Missing server message:", message);
			}
		}
	}	
	private parse(msg: string) {
		try {
			let message = JSON.parse(msg);
			if (typeof message.name === "string") {
				if (!message.content && message.content !== "") return msg;	
				return message;
			}
			return msg;
		} catch (e) {
			console.error(e);
			return msg;
		}
	}
	private buildMessage(name: string, message: string) {
		let msg = {
			name: name,
			content: (message ? message : "")
		};
		return JSON.stringify(msg);
	}
	private getCookie(name: string) {
		let match = document.cookie.match(new RegExp(`${name}=(.*?(?=;|$))`));
		if (match) {
			return match[1];
		} else {
			return null;
		}
	}
}