var roomCount = 0;

// Public
module.exports = Room;

/**
 *
 * Model Room
 *
 * usersId = {list of users who are in room}
 * state  = {true => "playing", false => "waiting"}
 *
 */
function Room(userId, name, password, users) {
    this.id = roomCount;
    this.name = name;
    this.masterId = userId;
    this.password = password || "";
    this.usersId = [userId];
    this.state = false;
    roomCount++;
}

Room.prototype.start = function() {
	this.state = true;
};

Room.prototype.finish = function() {
	this.state = false;
};