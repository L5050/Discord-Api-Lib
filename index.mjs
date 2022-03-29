import fs from "fs";
import fetch from "node-fetch";
import { Webhook, MessageBuilder } from "discord-webhook-node";
import { convertGuild, convertMember, convertChannel, convertMessage} from "./src/converters.mjs"
import EventEmitter from "events";
import WebSocket from 'ws';
let recon = false;
let session_id;
let seq;
let allowed = true;
let BotEvents = new EventEmitter();
let sleep = function(milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
    return (new Date().getTime())-start;
}
let token;
let Authorization;
fs.readFile('token.txt', 'utf8', function(err, data){
token = `Bot ${data}`;
//Authorization = data;
});
export const client = {
  Logger: {
  log: async function(logs){
  if (allowed == true) console.log(logs);
},
false: async function(){
allowed = false;
},
true: async function(){
allowed = true;
}
},
	create: async function(Authorization, intents = 98303) {
		//let token = `Bot ${Authorization}`;
    global.token = token;
    this.token = token;
    this.intents = intents;
		let socketRestart = new EventEmitter();
		let payload = {
			op: 2,
			d: {
				token: Authorization,
				intents: intents,
        properties: {
            $os: "linux",
            $browser: "chrome",
            $device: "chrome"
        }
			},
		};
    let ws;
		socketRestart.on('start', () => {
    ws = new WebSocket('wss://gateway.discord.gg/?encoding=json&v=9');
			ws.on('open', function open() {
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

				ws.on('error', function(error) {
					console.log("Connection Error: " + error.toString());
				});

				ws.on('close', async (event) => {
          if (event.reasonCode != 1000){
					console.log('Discord ws closed, reconnecting now...');
					ws = new WebSocket('wss://gateway.discord.gg/?encoding=json&v=9');
					recon = true;
					socketRestart.emit(`start`)}
				});

				ws.on('message', function message(data) {
					var x = data;
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
							BotEvents.emit(t, d)
							break;
						default:
							if (t != 'null') {
								seq = s;
								BotEvents.emit(t, d)
              console.log(t)
              console.log(d)
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
    token = undefined;
    ws.close(1000)
  },
  fetchGuildMember: async function(guildId, memberId) {
	let response = await fetch(`https://discord.com/api/v9/guilds/${guildId}/members/${memberId}`, {
		"method": "GET",
		"headers": {
			"Authorization": token
		}
	}).then(async (response) => {
		return await response.json();
	})
   const member = await convertMember(response)
   member.guildId = guildId
	return member;
},
  fetchWebhook: async function(URL) {
    let response = await fetch(URL)
    let webhook = await response.json();
    webhook.executable = new Webhook(URL)
    webhook.send = async function(message) {
      hook = this.executable
      hook.send(message)
    }
    webhook.MessageBuilder = MessageBuilder;
    return webhook;
  }
}
