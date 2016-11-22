var moUser = require('../model-mongo/mUser.js');
const User = require('../model/user.js');
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
			var u = this.findUser(room.usersId[i]);
			temp_user.name = u.name;
			temp_user.id = u.id;
			temp_user.ready = u.status;
			temp_user.alien = this.findCharacter(u.id).alien;
			temp_users.push(temp_user);
		}
		console.log(temp_users);
		return temp_users;
	},
	userListOnRoomExceptMaster: function(room, id){
		var temp_users = [];
		for(var i = 0; i < room.usersId.length; i++){
			if(room.masterId != id){
				var temp_user  = {};
				var u = this.findUser(room.usersId[i]);
				temp_user.name = u.name;
				temp_user.id = u.id;
				var char = this.findCharacter(u.id);
				temp_user.alien = char.alien;
				temp_user.x = char.x;
				temp_user.y = char.y;
				temp_user.state = char.state;
				temp_users.push(temp_user);
			}
			
		}
		console.log(temp_users);
		return temp_users;
	},
	addUser: function(user){
		var temp = new moUser({username: user.name});
		user.id = temp._id;
		users.push(user);
		temp.save((err, res) => {
			if(err) {
				console.log(err.red);
			}
			console.log(res);
		});
		return user.id;
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
					else{
						rooms[i].masterId = rooms[i].usersId[0];
						this.findUser(rooms[i].usersId[0]).status = true;
						
					}
				}
				return;
			}
		}
	}
};

var users = [];
moUser.find((err, u) => {
	u.forEach(function(t_user) {
      var temp = new User(t_user.username, null, t_user._id);
      users.push(temp);
    });
});
var rooms = [];
var characters = [];