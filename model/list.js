var moUser = require('../model-mongo/mUser.js');

module.exports = {
	roomList: function(){
		return rooms;
	},

	userList: function(){
		return users;
	},
	userListOnRoom: function(room){
		var temp_users = [];
		for(var i = 0; i < room.usersId.length; i++){
			var temp_user  = {};
			var u = list.findUser(room.usersId[i])
			temp_user.name = u.name;
			temp_user.id = u.id;
			temp_user.ready = u.status;
			temp_user.alien = list.findCharacter(u.id).alien;
			
			temp_users.push(temp_user);
		}
		console.log(temp_users);
		return temp_users;
	},

	addUser: function(user){
		users.push(user);
		var temp = new moUser({username: user.name});

		temp.save((err, res) => {
			if(err) {
				console.log(err.red);
			}
			console.log(res);
			console.log("ADDED YO");
		});
	},

	createRoom: function(room){
		rooms.push(room);
	},
	addCharacter: function(character){
		characters.push(character);
		console.log(characters);
	},

	removeUser: function(id){
		for(var i=0; i<users.length; i++){
			if(users[i].id == id) { users.splice(i,1); }
			return;
		}
	},

	deleteRoom: function(id){
		for(var i=0; i<rooms.length; i++){
			if(rooms[i].id == id) { rooms.splice(i,1); }
			return;
		}
	},

	findRoom: function(id){
		for(var i=0; i<rooms.length; i++){
			if(rooms[i].id == id)
				return rooms[i];
		}
	},

	findUser: function(id){
		for(var i=0; i<users.length; i++){
			if(users[i].id == id) 
			{
				return users[i];
			}
		}
	},
	findCharacter: function(id){
		for(var i = 0; i < characters.length; i++){
			if(characters[i].user == id){
				return characters[i];
			}
		}
	},
	quitRoom: function(userId, roomId){
		
		for(var i=0; i<rooms.length; i++){
			if(rooms[i].id == roomId)
			{
				var users = rooms[i].usersId;
				for(var j=0; j<users.length; j++) {
					if(users[j] == userId) { rooms[i].usersId.splice(j,1); }
					if(rooms[i].usersId.length==0) {
						rooms.splice(i,1);
					}
				}
				return;
			}
		}
	}
};

var users = [];
var rooms = [];
var characters = [];