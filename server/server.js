"use strict"

var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

const PSEUDO = 0;
const MISE = 1;
const WIN = 2;
const YWIN = 3;
const RESTART = 0;
const TYPE_CLIENT = 0;
const TYPE_SCREEN = 1;
const TYPE_ADMIN = 2;

let screens = [];
let players = [];
let playersDatas = [];

let pot = 0;
let winner;
let nbWin = 0;
let file; 
let START_MONEY = 300;

var server = http.createServer(function(request, response) {
	switch(request.url) {
		case('/'):
			response.setHeader("Content-Type", "text/html;	charset=utf-8");
			response.write("Welcome to betSimulator2000Utlimate <br>vous êtes un joueur ? appuyez <a href='/joueur' target='_blank'>ici</a><br>vous n'êtes pas un joueur et vous voulez placer un écran ? appuyez <a href='/croupier' target='_blank'>ici</a>");
			response.end();
			break;
		case('/croupier'):
			response.setHeader("Content-Type", "text/html");
			file = fs.createReadStream("./../screen/screen.html");
			file.pipe(response);
			break;
		case('/screen.js'):
			response.setHeader("Content-Type", "application/javascript");
			file = fs.createReadStream("./../screen/screen.js");
			file.pipe(response);
			break;
		case('/joueur'):
			response.setHeader("Content-Type", "text/html");
			file = fs.createReadStream("./../client/client.html");
			file.pipe(response);
			break;
		case('/client.js'):
			response.setHeader("Content-Type", "application/javascript");
			file = fs.createReadStream("./../client/client.js");
			file.pipe(response);
			break;
		case('/style.css'):
			response.setHeader("Content-Type", "text/css");
			file = fs.createReadStream("../style.css");
			file.pipe(response);
			break;
		case('/admin'):
			response.setHeader("Content-Type", "text/html");
			file = fs.createReadStream("./../admin/admin.html");
			file.pipe(response);
			break;
		case('/admin.js'):
			response.setHeader("Content-Type", "application/javascript");
			file = fs.createReadStream("./../admin/admin.js");
			file.pipe(response);
			break;
	}
});

server.listen(80, function() {});

let wsServer = new WebSocketServer({
	httpServer: server
});

wsServer.on('request', function(request) {

	var connection = request.accept(null, request.origin);
	connection.data = {};

	connection.on('message', function(message) {
		let data = JSON.parse(message.utf8Data);
		if (data[0] == TYPE_SCREEN) {
			connection.data.type = TYPE_SCREEN;
			screens.push(connection);
			connection.send(JSON.stringify([pot, playersDatas]));
		}
		else if (data[0] == TYPE_CLIENT) {

			if (connection.data.money == null) {
				connection.data.money = START_MONEY;
				connection.data.type = TYPE_CLIENT;
				connection.data.name = data[2].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
				playersDatas.push(connection.data);
				players.push(connection);
			}
			switch(data[1]) {
				case PSEUDO:
					connection.send(JSON.stringify([0,connection.data.money]));
					break;
				case MISE:
					pot+= parseInt(data[2]);
					connection.send(JSON.stringify([0,(connection.data.money-=data[2])]));
					playersDatas[playersDatas.findIndex(e => e == connection.data)].money = connection.data.money;
					break;
				case WIN:
					players.forEach((e) => {
					if(e != connection) 
						e.send(JSON.stringify([1,connection.data]));
					});
					winner = connection;
					if (players.length == 1) {
						winner.send(JSON.stringify([2,pot]));
						winner.data.money += pot;
						pot = 0;
					}
					break;
				case YWIN:
					nbWin++;
					if (nbWin >= ((players.length-1)/2)) {
						winner.send(JSON.stringify([2,pot]));
						winner.data.money += pot;
						pot = 0;
					}
					break;
				default:
			}
			if (screens.length > 0) {
				screens.forEach((e) => {
					e.send(JSON.stringify([pot, playersDatas]));
				});
			}
		}
		else if (data[0] == TYPE_ADMIN) {
			if (data[1] == RESTART) {
				START_MONEY = parseInt(data[2]);
				pot = nbWin = 0;
				winner = null;
				playersDatas = [];
				players.forEach((e) => {
					e.data.money = parseInt(data[2]);
					playersDatas.push(e.data);
					e.send(JSON.stringify([0,e.data.money]));
				});
				screens.forEach((e) => {
					e.send(JSON.stringify([pot, playersDatas]));
				});
			}
		}
	});

	connection.on('close', function() {
		if (connection.data.type == TYPE_SCREEN) {
			let index = screens.indexOf(connection);
			if(index != -1) {
				screens.splice(index, 1);
			}
		}
		else if (connection.data.type == TYPE_CLIENT) {
			let indexData = playersDatas.findIndex(e => e == connection.data);
			let index = players.findIndex(e => e == connection);

			if(index != -1 && indexData != -1) {
				playersDatas.splice(indexData, 1);
				players.splice(index, 1);
				if (screens.length > 0) {
					screens.forEach((e) => {
					e.send(JSON.stringify([pot, playersDatas]));
					});
				}
			}
		}
	});
});