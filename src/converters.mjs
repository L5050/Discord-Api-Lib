import fetch from "node-fetch";
import { Webhook, MessageBuilder } from "discord-webhook-node";
import EventEmitter from "events";
let token = global.token;
export async function convertMember(member){
member.ban = async function(guildId, reason) {
  if (!reason) reason = null;
  member = this;
  let response = await fetch(`https://discord.com/api/v9/guilds/${guildId}/bans/${member.id}`, {
    "method": "PUT",
    "headers": {
      "Authorization": token,
      "X-Audit-Log-Reason": reason
    }
}).then(async (response) => {
  return await response.json();
})
}
member.kick = async function(guildId, reason) {
  if (!reason) reason = null;
  member = this;
  let response = await fetch(`https://discord.com/api/v9/guilds/${guildId}/members/${member.id}`, {
    "method": "DELETE",
    "headers": {
      "Authorization": token,
      "X-Audit-Log-Reason": reason
    }
}).then(async (response) => {
  return await response.json();
})
}
member.timeout = async function(guildId, time, reason) {
  if (!reason) reason = null;
  let muteTime = (Date.now()+time)
  member = this;
  let timeout = new Date(muteTime).toISOString()
  let response = await fetch(`https://discord.com/api/v9/guilds/${guildId}/members/${member.id}`, {
    "method": "DELETE",
    "headers": {
      "Authorization": token,
      "X-Audit-Log-Reason": reason
    },
    "communication_disabled_until": timeout
}).then(async (response) => {
  return await response.json();
})
}
}
export async function convertMessage(message) {
  message.ban = async function(reason) {
    if (!reason) reason = null;
    message = this;
    let response = await fetch(`https://discord.com/api/v9/guilds/${message.guild_id}/bans/${message.member.id}`, {
      "method": "PUT",
      "headers": {
        "Authorization": token,
        "X-Audit-Log-Reason": reason
      }
  }).then(async (response) => {
    return await response.json();
  })
  }
	message.delete = async function() {
		let message = this;
		await fetch(`https://discord.com/api/v9/channels/${message.channel.id}/messages/${message.id}`, {
			"method": "DELETE",
			"headers": {
				"Authorization": token
			}
		})
	}
	message.edit = async function(newMessage) {
		let message = this;
		await fetch(`https://discord.com/api/v9/channels/${message.channel.id}/messages/${message.id}`, {
			"method": "PATCH",
			"headers": {
				"Authorization": token
			},
			"content": newMessage.content,
			"embeds": newMessage.embeds
		})
	}
}
export async function convertChannel(channel) {
	channel.delete = async function() {
		await fetch(`https://discord.com/api/v9/channels/${channel.id}`, {
			"method": "DELETE",
			"headers": {
				"Authorization": token
			}
		})
	}
	channel.send = async function(message) {
		let channel = this;
		let response = await fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`, {
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
	channel.edit = async function(newChannel) {
		let channel = this;
		let response = await fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`, {
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
  channel.BulkDelete = async function(numOfMessages, around, before, after) {
  	let channel = this;
  	let messages = await fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`, {
  		"method": "GET",
  		"headers": {
  			"Authorization": token
  		},
  		"limit": numOfMessages,
  		"around": around,
  		"before": before,
  		"after": after
  	}).then(async (response) => {
  		return await response.json();
  	})
  	messages.forEach(async (element) => {
  			element = element.id
  		})
  		await fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`, {
  			"method": "GET",
  			"headers": {
  				"Authorization": token
  			},
  			"messages": messages
  		})
  	}
  }

export async function convertGuild(guild) {
	guild.fetchChannel = async function(channelId) {
		let response = await fetch(`https://discord.com/api/v9/channels/${channelId}`, {
			"headers": {
				"Authorization": token
			}
		})
		let data = await response.json()
		let channel = convertChannel(data)
		return channel;
	}
}
export const GuildManager = {
	create: async function(name) {
		//can't function rn
	}
}
