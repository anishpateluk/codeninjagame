﻿
function Projectile(projectileImage, position, player) {
    this.initialize(projectileImage, position, player);
}

Projectile.prototype = new createjs.BitmapAnimation();
Projectile.prototype.BitmapAnimation_initialize = Projectile.prototype.initialize;

Projectile.prototype.initialize = function (projectileImage, position, player) {
    var spriteSheet = new createjs.SpriteSheet({
        images: [projectileImage],

        frames: {
            width: 50,
            height: 50,
            count: 3,
            regX: 25,
            regY: 25
        },

        animations: {
            spin: {
                frames: [0, 1, 2],
                frequency: 8,
                next: "spin"
            }
        }
    });
    createjs.SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);
    this.BitmapAnimation_initialize(spriteSheet);
    this.snapToPixel = true;
	
    // properties
    this.player = player;
    this.direction = 1; // -1 left, 1 right 
    this.velocity = { x: 0, y: 0 };
    this.reset(position);
};

Projectile.prototype.spin = function() {
    var self = this;
    var animation = self.direction == 1 ? "spin" : "spin_h";
    self.gotoAndPlay(animation);
};

Projectile.prototype.reset = function (position) {
    this.x = position.x;
    this.y = position.y;
};

Projectile.prototype.bounds = function () {
	var self = this;
	return {
		height: 50,
		width: 50,
		regX: 25,
		regY: 25,
		x: self.x -25,
		y: self.y - 25
	};
};

Projectile.prototype.tick = function (game) {
    var self = this;
    
    // gravity
    self.velocity.y += 1;
    
    var bounds = self.bounds();
    var velocity = self.velocity;
    var platforms = game.platforms;
    var collision = null, i = 0;

    while (!collision && i < platforms.length) {
        if (platforms[i].isVisible()) {
            var cbounds = platforms[i].bounds();
            collision = game.calculateIntersection(bounds, cbounds, 0, velocity.y);
        }
        i++;
    }

    if (!collision) {
        self.y += velocity.y;
    } else {
        self.y += velocity.y - collision.height;
        self.velocity.y = 0;
        self.player.coffeeDestroyed.push(self);
    }

    self.x += self.velocity.x;
};