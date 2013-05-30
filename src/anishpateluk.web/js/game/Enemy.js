
function Enemy(enemyImage, position, world, game, level) {
	this.initialize(enemyImage, position, world, game, level);
}

Enemy.prototype = new createjs.BitmapAnimation();
Enemy.prototype.BitmapAnimation_initialize = Enemy.prototype.initialize;
Enemy.prototype.initialize = function(enemyImage, position, world, game, level) {

    var spriteSheet = new createjs.SpriteSheet({
        images: [enemyImage],

        frames: {
            width: 100,
            height: 100,
            count: 17,
            regX: 50,
            regY: 50
        },

        animations: {
            idle: {
                frames: [0, 1, 2, 3],
                frequency: 12
            },
            walk: {
                frames: [4, 5, 6, 7, 8, 9, 10],
                frequency: 6,
                next: "walk"
            },
            die: {
                frames: [11, 12, 13, 14, 15, 16],
                frequency: 8
            }
        }
    });
    createjs.SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);
    this.BitmapAnimation_initialize(spriteSheet);
    this.snapToPixel = true;

    // properties
    this.world = world;
    this.game = game;
    this.level = level;
    this.direction = 1; // -1 left, 1 right 
    this.velocity = { x: 0, y: 0 };
    this.onGround = false;
    this.currentAnimation = "";
    this.dying = false;
    this.reset(position);
};


Enemy.prototype.playAnimation = function(animation, callback) {
    var self = this;

    self.addEventListener("animationend", function() {
        self.removeAllEventListeners("animationend");
        self.canPlayAnimation = true;
        self.canMove = true;
        if (callback && typeof callback == "function") callback();
    });

    this.gotoAndPlay(animation);
};

Enemy.prototype.reset = function (position) {
    this.x = position.x;
    this.y = position.y;
    this.direction = 1;
    this.playAnimation("idle");
};

Enemy.prototype.idle = function () {
    this.direction == 1 ? this.playAnimation("idle") : this.playAnimation("idle_h");
    this.velocity.x = 0;
};

Enemy.prototype.move = function() {
    if (this.canMove) {
        this.velocity.x = 2 * this.direction;
        this.direction == 1 ? this.playAnimation("walk") : this.playAnimation("walk_h");
    }
};

Enemy.prototype.die = function () {
    if (this.direction == 1) {
        this.playAnimation("die");
    } else {
        this.playAnimation("die_h");
    } 
};

Enemy.prototype.bdims = {
    centreToFront: 35,
    centreToBack: 35,
    centreToTop: 40,
    centreToBottom: 55
};

Enemy.prototype.bounds = function () {
    var self = this;
    return {
        regX: self.regX,
        regY: self.regY,
        height: self.bdims.centreToTop + self.bdims.centreToTop,
        width: self.bdims.centreToBack + self.bdims.centreToFront,
        y: self.y - self.bdims.centreToTop + 5,
        x: self.x - (self.direction == 1 ? self.bdims.centreToBack : self.bdims.centreToFront)
    };
};

Enemy.prototype.calculateCollision = function (direction, platforms) {
    if (!direction || !platforms) throw new Error("must supply direction and platforms");

    var self = this;
    var velocity = self.velocity;
    var bounds = self.bounds();
    var game = self.game;
    var collision = null;
    var len = platforms.length;
    var i = 0;

    if (direction == "y") {
        while (!collision && i < len) {
            var cbounds = platforms[i].bounds();
            collision = game.calculateIntersection(bounds, cbounds, 0, velocity.y);
            i++;
        }
        return collision;
    } else {
        while (!collision && i < len) {
            var cbounds = platforms[i].bounds();
            collision = game.calculateIntersection(bounds, cbounds, velocity.x, 0);
            i++;
        }
        return collision;
    }
};

Enemy.prototype.getPlatformsInCloseProximity = function () {
    var self = this;
    var level = self.level;
    var platforms = level.platforms;
    var bounds = { left: self.x - 300, right: self.x + 300, up: self.y - 300, down: self.y + 300 };
    var platformsInProximity = [];
    
    for (var i = 0, len = platforms.length; i < len; i++) {
        var platformCenter = { x: platforms[i].x + platforms[i].width / 2, y: platforms[i].y + platforms[i].height / 2 };
        
        if ((platformCenter.x > bounds.left && platformCenter.x < bounds.right)
            || (platformCenter.y > bounds.up && platformCenter.y < bounds.down)) {
            platformsInProximity.push(platforms[i]);
        }
    }

    return platformsInProximity;
};


Enemy.prototype.update = function () {
    var self = this;

    var world = self.world;
    var velocity = self.velocity;
    var collision = null;
    var platforms = self.getPlatformsInCloseProximity();

    // gravity
    self.velocity.y += 1;

    // vertical movement and collision
    collision = self.calculateCollision("y", platforms);

    if (!collision) {
        self.y += velocity.y;

        if (self.onGround) self.onGround = false;

    } else {
        (collision.rect2.y + collision.rect2.height / 2) < collision.rect1.y
    		? self.y += velocity.y + collision.height
    		: self.y += velocity.y - collision.height;

        if (velocity.y >= 0) {

            // if not on ground yet then land
            if (!self.onGround) {
                self.onGround = true;
            }
        }
        velocity.y = 0;
    }

    // horizontal movement and collision
    collision = self.calculateCollision("x", platforms);

    if (!collision) {
        if (self.x + velocity.x > 25) self.x += velocity.x;
    } else {
        (collision.rect2.x + collision.rect2.width / 2) < collision.rect1.x
			? self.x += velocity.x + collision.width
			: self.x += velocity.x - collision.width;
    }
}