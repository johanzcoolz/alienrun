// const path = require('path');
// const INDEX = path.join(__dirname, 'index.html');
// const PORT = process.env.PORT;
// const express = require('express');
// const socketIO =  require('socket.io');
// const server = express()
//   .use((req, res) => res.sendFile(INDEX) )
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`));

// const colors = require("colors");

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var PORT = process.env.PORT || 3000;
server.listen(PORT);


// var io = require('socket.io')({
// 	transports: ['websocket'],
// });

var user = require('./model/user.js');
var list = require('./model/list.js');
var room = require('./model/room.js');
var character = require('./model/character.js');

// console.log(PORT);
// io.attach(PORT);
// const io = socketIO(server);
io.on('connection', function(socket){
	console.log('Client connected a');
	// User connected first time
	var name = "Sleey";				// Get username
	
	socket.on('connect',function(data){
		// console.log('test '+data.id);
		if(data.id == ""){
			var current = new user(data.name, socket);
			list.addUser(current);
			socket.emit("giveId", { data: current.id });
			console.log(list.userList());
		}
	});
	socket.on('beep', function(){
		console.log("beep here");
		socket.emit('boop', {name: "Frans", data:1222});
	});

	socket.on('createRoom', function(data){
		console.log("masuk " + data.id);
		var createdRoom = new room(data.id , data.name, data.password, data.usersId);

		list.createRoom(createdRoom);							// create room
		list.findUser(data.id).ready();						// toggle ready for room master
		list.findUser(data.id).position = createdRoom.id;	// set position
		console.log(list.roomList());
		var c = new character(data.id, null, 0, 0);
		list.addCharacter(c);
		socket.emit("joined");
	});

	socket.on('ready', function(data){
		list.findUser(data.id).ready();		// toggle ready
	});

	socket.on('cancel', function(id){
		var roomId = list.findUser(id).position;
		var room = list.findRoom(roomId);
		list.quitRoom(id, roomId);		// quit room
		list.findUser(id).cancel();		// set ready to false
		list.findUser(id).leave();		// set position to null
		
		var temp_users = [];
		for(var i = 0; i < room.usersId.length; i++){
			var temp_user  = {};
			var u = list.findUser(room.usersId[i])
			temp_user.name = u.name;
			temp_user.id = u.id;
			temp_user.alien = list.findCharacter(u.id).alien;
			
			temp_users.push(temp_user);
		}
		socket.emit('userListOnRoom', {data: temp_users});
		for(var i = 0; i < room.usersId.length; i++){
			var user = list.findUser(room.usersId[i]);
			user.socket.emit('userListOnRoom', {data: temp_users});
		}

	});

	socket.on('join', function(data){
		list.findUser(data.id).join(data.roomId);				// set position
		list.findRoom(data.roomId).usersId.push(data.id);		// put userId to room
		var c = new character(data.id, null, 0, 0);
		list.addCharacter(c);
		socket.emit("joined");
	});

	socket.on('start', function(roomId){
		list.findRoom(roomId).start();			// set status to true
	});

	socket.on('finish', function(roomId){
		list.findRoom(roomId).finish();			// set status to false
	});

	socket.on('status', function(){
		console.log(list.roomList());
		console.log(list.userList());
	});

	// for function update in C#

	socket.on('getRoom', function(id){
		io.emit('room', {data: list.findRoom(id)});
	});

	socket.on("getUser", function(id){
		io.emit('user', {data: list.findUser(id)});
	});

	socket.on('getRoomList', function(){
		console.log("roomlist");
		socket.emit('roomList', {data: list.roomList()});
	});

	socket.on("getUserList", function(){
		socket.emit('userList', {data: list.userList()});
	});

	socket.on("getUserListOnRoom", function(id){
		console.log("masukmas");
		var u = list.findUser(id);
		console.log(u.position);
		var room = list.findRoom(u.position);
		console.log(room);
		var temp_users = [];
		for(var i = 0; i < room.usersId.length; i++){
			var temp_user  = {};
			var u = list.findUser(room.usersId[i])
			temp_user.name = u.name;
			temp_user.id = u.id;
			temp_user.alien = list.findCharacter(u.id).alien;
			
			temp_users.push(temp_user);
		}
		socket.emit('userListOnRoom', {data: temp_users, vroom : room});
	});
});



// var name = "Sleey";			// Get username
// var current = new user(name);
// var current2 = new user("test");
// list.addUser(current);
// list.addUser(current2);


// var createdRoom = new room(current.id,"a");

// list.createRoom(createdRoom);							// create room
// list.findUser(current.id).ready();						// toggle ready for room master
// list.findUser(current.id).position = createdRoom.id;	// set position


// list.findUser(current2.id).join(0);
// list.findRoom(0).usersId.push(current2.id);


// console.log(list.roomList());
// console.log(list.userList());

// console.log("\nAfter Master Room Quit");

// list.quitRoom(current.id, list.findUser(current.id).position);
// list.findUser(current.id).cancel();
// list.findUser(current.id).leave();

// console.log(list.roomList());
// console.log(list.userList());