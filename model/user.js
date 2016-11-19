
// function (){
  
// }


// Public
module.exports = User;

/**
 * Model User
 *
 * status = {true => "ready", false => "cancel"}
 * position = "room name"
 *
 */
function User(name, socket, id) {
    this.id = id;
    this.name = name;
    this.status = false;
    this.position = null;
    this.socket = socket;
}

User.prototype.ready = function() {
  if(this.status)
    this.status = false;
  else
    this.status = true;
};

User.prototype.cancel = function() {
  this.status = false;
};

User.prototype.join = function(roomId) {
  this.position = roomId;
};

User.prototype.leave = function(roomId) {
  this.position = null;
};

