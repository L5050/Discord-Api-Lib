import fetch from "node-fetch";
import { Webhook } from "discord-webhook-node";
import EventEmitter from "events";
import pkg from "websocket";
const { client: WebSocketClient } = pkg;
let recon = false;
let session_id;
let seq;
let BotEvents = new EventEmitter();
export const client = {
	create: async function(token, intents = 98303) {
		token = `Bot ${token}`;
    this.token = token;
    this.intents = intents;
		let socketRestart = new EventEmitter();
		let ws = new WebSocketClient();
		let payload = {
			op: 2,
			d: {
				token: token,
				intents: intents
			}
		};
		socketRestart.on('start', () => {
			ws.on('connect', function(connection) {
				console.log('WebSocket Connected');
				//if the recon is false then it sends a normal connection payload
				if (recon != true) {
					ws.send(JSON.stringify({
						op: 1,
						d: null
					}))
					ws.send(JSON.stringify(payload))
				} else {
					//if recon is true then it sends the reconnect payload
					ws.send(JSON.stringify({
						"op": 6,
						"d": {
							"token": token,
							"session_id": session_id,
							"seq": seq
						}
					}))
					recon = false;
				}

				connection.on('error', function(error) {
					console.log("Connection Error: " + error.toString());
				});

				connection.on('close', async (event) => {
          if (event.reasonCode != 4000){
					console.log('Discord connection closed, reconnecting now...');
					ws = new WebSocketClient();
					recon = true;
					socketRestart.emit(`start`)}
				});

				connection.on('message', function(message) {

					var x = message.data;
					var payload = JSON.parse(x);
					const {
						t,
						s,
						op,
						d
					} = payload;
					switch (op) {
						case 10:
							const {
								heartbeat_interval
							} = d;
							setInterval(() => {
								ws.send(JSON.stringify({
									op: 1,
									d: d
								}))
							}, heartbeat_interval);
							break;
						case 7:
							ws.close()
							break;
					}
					switch (t) {
						case "READY":
							session_id = d.session_id;
							this.EventManager.emit(t, d)
							break;
						default:
							if (t != 'HEARTBEAT') {
								seq = s;
								this.EventManager.emit(t, d)
							}
							break;
					}
				});

			})
		})
		socketRestart.emit(`start`)
	},
	EventManager: BotEvents,
  destroy: async function() {
    console.log(`Destroying client`)
    this.token = null;
    this.intents = null;
    ws.close(4000)
  }
}
