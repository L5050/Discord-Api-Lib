import fetch from "node-fetch";
import { Webhook, MessageBuilder } from "discord-webhook-node";
import EventEmitter from "events";
import pkg from "websocket";
const { client: WebSocketClient } = pkg;
let token = global.token;

export async function convertMessage(message){
message.delete = async function (){
let message = this;
  await fetch(`https://discord.com/api/v9/channels/${message.channel.id}/messages/${message.id}`{
    "method": "DELETE",
      "headers": {
          "Authorization": token
        }})
}
message.edit = async function (newMessage){
  let message = this;
  await fetch(`https://discord.com/api/v9/channels/${message.channel.id}/messages/${message.id}`{
    "method": "PATCH",
      "headers": {
          "Authorization": token
        },
        "content": newMessage.content,
        "embeds": newMessage.embeds
      })
}
}
export async function convertChannel(channel){
  channel.delete = async function (){
    await fetch(`https://discord.com/api/v9/channels/${channel.id}`{
      "method": "DELETE",
        "headers": {
            "Authorization": token
          }})
  }
  channel.send = async function (message){
  let channel = this;
  let response = await fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`{
      "method": "POST",
        "headers": {
            "Authorization": token
          },
          "content": message.content,
          "embeds": message.embeds
        })
      let data = await response.json()
      message = convertMessage(data)
      return message;
  }
  channel.edit = async function (newChannel){
    let channel = this;
    let response = await fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`{
        "method": "POST",
          "headers": {
              "Authorization": token
            },
            "name": newChannel.name,
            "position": newChannel.position,
            "topic": newChannel.topic,
            "nsfw": newChannel.nsfw,
            "rate_limit_per_user": newChannel.rate_limit_per_user,
            "parent_id": newChannel.parent_id
          })
        let data = await response.json()
        channel = convertChannel(data)
  }
}

export async function convertGuild(guild){
guild.fetchChannel = async function (channelId){
let response = await fetch(`https://discord.com/api/v9/channels/${channelId}`{
    "headers": {
        "Authorization": token
      }})
let data = await response.json()
let channel = convertChannel(data)
return channel;
}
}
export const GuildManager = {
create: async function (name){
//can't function rn
}
}
