'use strict';

const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

const TOKEN = fs.readFileSync('./token', 'utf8').trim(); // Trim because linux

const TICK_TIME = 1000;

class Shoutbot {
	constructor(token) {
		this.client = new Discord.Client();
		this.commandCharacter = '/';

		this._boundTick = this._tick.bind(this);

		this._shouts = {};

		this.client.on('ready', this._onReady.bind(this));

		this.client.on('message', this._onMessage.bind(this));

		this.client.login(token).catch(console.error);
	}

	_onReady() {
		console.log('Ready!');
		this._tick();
	}

	_onMessage(message) {
		if (message.content.charAt(0) === this.commandCharacter) {
			if (!message.guild) {
				message.reply('This bot is only configured to work in a guild channel.');
				return;
			}
			if (!Shoutbot._checkAuthorisation(message.member)) {
				message.reply('You do not have authorisation.');
				return;
			}
			if (message.content.slice(1, 4) === 'set') {
				let command = message.content.slice(5);
				let splitIndex = command.indexOf(';');
				if (splitIndex === -1) {
					message.reply('Please give a valid command.');
					return;
				}
				let time = Shoutbot._parseTime(command.slice(0, splitIndex));
				let shoutMessage = command.slice(splitIndex + 1);
				if (isNaN(time)) {
					message.reply('Please specify a valid time interval.');
					return;
				}
				this._shouts[message.channel.id] = this._shouts[message.channel.id] || {};
				this._shouts[message.channel.id][shoutMessage] = { time: time, nextShoutTimestamp: Date.now() + time };
				message.reply('Shout has been set.');
			} else if (message.content.slice(1, 6) === 'unset') {
				let shoutMessage = message.content.slice(7);
				if (this._shouts[message.channel.id] && this._shouts[message.channel.id][shoutMessage]) {
					delete this._shouts[message.channel.id][shoutMessage];
					message.reply('Shout has been unset.');
				} else {
					message.reply('Could not find that shout to unset.');
				}
			}
		}
	}

	static _checkAuthorisation(member) {
		return member.hasPermission('ADMINISTRATOR');
	}

	static _parseTime(timeString) {
		let time = 0;
		let matches = timeString.match(/([0-9\.]+)[A-z]/g);
		if (matches) {

			for (let match of matches) {
				let unit = /[A-z]/.exec(match)[0];
				let value = parseFloat(/[0-9\.]+/.exec(match)[0]);
				switch (unit) {
					case 'd':
						time += value * 24 * 60 * 60 * 1000;
						break;
					case 'h':
						time += value * 60 * 60 * 1000;
						break;
					case 'm':
						time += value * 60 * 1000;
						break;
					case 's':
						time += value * 1000;
						break;
					default:
						return NaN;
				}
			}
		}
		return time || NaN;
	}

	_tick() {
		this._checkShouts();
		setTimeout(this._boundTick, TICK_TIME);
	}

	_checkShouts() {
		let currentTime = Date.now();
		for (let channelId in this._shouts) {
			if (this._shouts.hasOwnProperty(channelId)) {
				for (let shoutMessage in this._shouts[channelId]) {
					if (this._shouts[channelId].hasOwnProperty(shoutMessage)) {
						let shout = this._shouts[channelId][shoutMessage];
						if (currentTime > shout.nextShoutTimestamp) {
							shout.nextShoutTimestamp += shout.time;
							this._shout(channelId, shoutMessage);
						}
					}
				}
			}
		}
	}

	_shout(channelId, shoutMessage) {
		this.client.channels.get(channelId).sendMessage(shoutMessage);
	}
}

const shoutbot = new Shoutbot(TOKEN);
