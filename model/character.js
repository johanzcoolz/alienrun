
// Public
module.exports = Character;

/**
 * Model Character
 *
 * status = {true => "ready", false => "cancel"}
 * position = "room name"
 *
 */
function Character(userId, alien, x, y) {
    this.alien = alien;
    this.user = userId;
    this.state = "idle";
    this.x = x;
    this.y = y;
}

Character.prototype.moveRight = function(value) {
  this.x+= value;
};

Character.prototype.moveLeft = function(value) {
  this.x-= value;
};

Character.prototype.jump = function(value) {
  this.y+= value;
};