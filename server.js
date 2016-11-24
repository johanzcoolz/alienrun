// const path = require('path');
// const INDEX = path.join(__dirname, 'index.html');
// const PORT = process.env.PORT;
// const express = require('express');
// const socketIO =  require('socket.io');
// const server = express()
//   .use((req, res) => res.sendFile(INDEX) )
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`));

// const colors = require("colors");
var mongoose = require('mongoose');
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
io.set('transports', ['websocket']);
var PORT = process.env.PORT || 3000;
server.listen(PORT);
console.log("PORT : " + PORT);
var db = 'mongodb://root:root@ds139937.mlab.com:39937/aliendb';
mongoose.Promise = global.Promise
mongoose.connection.on('open', function (ref) {
  console.log('Connected to mongo server.');
  console.log("Mongodb Status : " + mongoose.connection.readyState);
});
mongoose.connection.on('error', function (err) {
  console.log('Could not connect to mongo server!');
  console.log(err);
});


mongoose.connect(db);
console.log("Mongodb Status : " + mongoose.connection.readyState);


// var io = require('socket.io')({
// 	transports: ['websocket'],
// });

var User = require('./model/user.js');
var list = require('./model/list.js');
var room = require('./model/room.js');
var character = require('./model/character.js');

// console.log(PORT);
// io.attach(PORT);
// const io = socketIO(server);
io.on('connection', function(socket){
	// User connected first time
	

	var current;

	socket.on('connect',function(data){
		var hs = socket.handshake;

		console.log("CONNECTED "  + data.sid);

		if(list.findUser(data.sid)) {
			current = list.findUser(data.sid);
			current.name = data.name;
			current.socket = socket;
			socket.emit("giveId", { data: current.id });
		}
		else {
			current = new User(data.name, socket);
			var id = list.addUser(current);
			socket.emit("giveId", { data: id });
		}

		// console.log("=== Database User ===");
		// console.log(list.userList());
	});

	socket.on('createRoom', function(data){
		var createdRoom = new room(data.id , data.name, data.password, data.usersId);
		list.createRoom(createdRoom);							// create room
		list.findUser(data.id).ready();						// toggle ready for room master
		list.findUser(data.id).position = createdRoom.id;	// set position
		// console.log(list.roomList());
		var c = new character(data.id, null, 0, 0);
		list.addCharacter(c);
		socket.emit("joined");
	});

	socket.on('ready', function(data){
		console.log("ready func");
		var user = list.findUser(data.id);		// toggle ready
		user.ready();
		var room = list.findRoom(user.position);
		var temp_users = list.userListOnRoom(room);
		console.log(temp_users);
		for(var i = 0; i < room.usersId.length; i++){
			var user = list.findUser(room.usersId[i]);
			user.socket.emit('userListOnRoom', {data: temp_users, vroom : room});
		}
	});
	
	socket.on('cancel', function(data){
		var id = data.id;
		var roomId = list.findUser(id).position;
		var room = list.findRoom(roomId);
		list.quitRoom(id, roomId);		// quit room
		list.findUser(id).cancel();		// set ready to false
		list.findUser(id).leave();		// set position to null
		var temp_users = list.userListOnRoom(room);
		socket.emit('userListOnRoom', {data: temp_users, vroom : room});
		for(var i = 0; i < room.usersId.length; i++){
			var user = list.findUser(room.usersId[i]);
			user.socket.emit('userListOnRoom', {data: temp_users, vroom : room});
		}

	});

	socket.on('join', function(data){
		list.findUser(data.id).join(data.roomId);				// set position

		var room = list.findRoom(data.roomId);

		var joined = false;

		for(var i=0; i<room.usersId.length; i++){
			if(room.usersId[i].id == data.id) 
			{
				joined = true;
			}
		}

		if(!joined) {
			room.usersId.push(data.id);		// put userId to room
			var c = new character(data.id, null, 0, 0);
			list.addCharacter(c);
			socket.emit("joined");
			
			var temp_users = list.userListOnRoom(room);
			for(var i = 0; i < room.usersId.length; i++){
				var user = list.findUser(room.usersId[i]);
				user.socket.emit('userListOnRoom', {data: temp_users, vroom : room});
			}
		}


	});

	socket.on('start', function(data){
		console.log("start func");
		console.log(data);
		var user = list.findUser(data.id);		// toggle ready
		// user.ready();
		var room = list.findRoom(user.position);
		room.start();			// set status to true
		var temp_users = list.userListOnRoom(room);
		console.log(temp_users);
		for(var i = 0; i < room.usersId.length; i++){
			var user = list.findUser(room.usersId[i]);
			if(user.id != room.masterId){
				user.status = false;
			}
			user.socket.emit('ToSelectCharacter', {data: temp_users});
		}
	});

	socket.on('finish', function(data){
		var roomId = list.findUser(data.id).position;
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
		console.log("=== Room List ===");
		socket.emit('roomList', {data: list.roomList()});
	});

	socket.on("getUserList", function(){
		socket.emit('userList', {data: list.userList()});
	});

	socket.on("getUserListOnRoom", function(data){
		var u = list.findUser(data.id);
		var room = list.findRoom(u.position);
		var temp_users = list.userListOnRoom(room);
		socket.emit('userListOnRoom', {data: temp_users, vroom : room});
	});

	socket.on('getSelectedChar', function(data){
		console.log("=== Selected Char ===");
		console.log(data);
		var char = list.findCharacter(data.id);
		char.alien = data.alien;

		var user = list.findUser(data.id);
		var room = list.findRoom(user.position);
		//room.start();			// set status to true
		var temp_users = list.userListOnRoom(room);
		for(var i = 0; i < room.usersId.length; i++){
			var user = list.findUser(room.usersId[i]);
			user.socket.emit('selectedChar', {data: temp_users, character: char});
		}
	});
	socket.on("SendGeneratedTiles", function(data){
		console.log("masuk generated");
		var user = list.findUser(data.id);
		var room = list.findRoom(user.position);
		var users = list.userList();
		for(var i = 0; i < users.length; i++){
			console.log(users.id);
		}
		for(var i = 0; i < room.usersId.length; i++){
			console.log(room.usersId[i]);
			var vuser = list.findUser(room.usersId[i]);
			
			vuser.socket.emit('GetGeneratedTiles', {datas : data.tiles});
		}
	});
	socket.on("RequestGenerate", function(data){
		var user = list.findUser(data.id);
		var room = list.findRoom(user.position);
		if(user.id == room.masterId){
			socket.emit("GenerateTiles", {data : "asd"});
		}
	});
	socket.on("RequestGetCharacter", function(data){
		console.log("req char");
		var user = list.findUser(data.id);
		var room = list.findRoom(user.position);
		var temp_users = list.userListOnRoomExceptMyself(room, data.id);
		socket.emit("GetInitAllCharacter", {data : temp_users});
	});
	socket.on("GetUpdateCharacterPosition", function(data){
		var user = list.findUser(data.id);
		var character = list.findCharacter(data.id);
		character.x = data.x;
		character.y = data.y;
		character.h = data.h;
		character.dead = data.dead;
		character.jump = data.jump;
		var room = list.findRoom(user.position);
		var userChar = list.userListOnRoom(room);
		var temp_users = list.userListOnRoomExceptMyself(room, data.id);
		socket.emit("UpdateCharacterPosition", {data: temp_users});
		var count = 0;
		var checker = userChar.length;
		for(var i = 0; i < checker; i++){
			debug.log(userChar[i]);
			if(userChar[i].dead) {
				count++;
			}
		}
		if(count == checker-1) {
			socket.emit("GameOver", {data: "baso_cupu"});
		}
	});

	socket.on("checkRoom", function(data) {
		var user = list.findUser(data.id);
		var room = list.findRoom(user.position);
		var userChar = list.userListOnRoom(room);

		var checker = userChar.length;
		var count = 0;

		for(var i = 0; i < checker; i++){
			if(userChar[i].dead) {
				count++;
			}
		}

		if(count == checker-1) {
			for(var i = 0; i < checker; i++){
				user.socket.emit("GameOver", {data: "baso_cupu"});
			}
		}
	});

	socket.on('disconnect', function () {
		

		// console.log("=== BEFORE ===");
		// console.log(current.position);
		// console.log(list.roomList());
		if(current && current.position != null) {
			current = list.findUser(current.id);
			var id = current.id;
			console.log('Disconnected ' + current.name);
			var roomId = current.position;
			var room = list.findRoom(roomId);
			list.quitRoom(id, roomId);		// quit room
			list.findUser(id).cancel();		// set ready to false
			list.findUser(id).leave();		// set position to null

			list.removeUser(current.id);

			var temp_users = list.userListOnRoom(room);
			socket.emit('userListOnRoom', {data: temp_users, vroom : room});
			for(var i = 0; i < room.usersId.length; i++){
				var user = list.findUser(room.usersId[i]);
				user.socket.emit('userListOnRoom', {data: temp_users, vroom : room});
			}
		}
		// console.log("\n");
		// console.log("=== AFTER ===");
		// console.log(current.position);

		// console.log("=== ROOM CONDITION ===");
		// console.log(list.roomList());

    });

});