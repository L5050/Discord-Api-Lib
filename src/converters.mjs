import fetch from "node-fetch";
import { Webhook, MessageBuilder } from "discord-webhook-node";
import EventEmitter from "events";
import pkg from "websocket";
const { client: WebSocketClient } = pkg;
let token = global.token;
export async function convertChannel(){

}
export async function convertGuild(guild){
guild.fetchChannel = async function (channelId){
let response = await fetch(`https://discord.com/api/v9/channels/${channelId}`{
    "headers": {
        "Authorization": token
      }})
let channel = await response.json()

}
}
export const GuildManager = {
create: async function (name){
//can't function rn
}
}
