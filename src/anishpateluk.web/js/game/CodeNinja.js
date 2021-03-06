﻿
// player character class

function CodeNinja(playerImage, position, world, game, level, contentManager) {
    this.initialize(playerImage, position, world, game, level, contentManager);
}
CodeNinja.prototype = new createjs.BitmapAnimation();
CodeNinja.prototype.BitmapAnimation_initialize = CodeNinja.prototype.initialize;
CodeNinja.prototype.initialize = function (playerImage, position, world, game, level, contentManager) {
    var spriteSheet = new createjs.SpriteSheet({
        images: [playerImage],

        frames: {
            width: 100,
            height: 100,
            count: 51,
            regX: 50,
            regY: 50
        },

        animations: {
            idle: {
                frames: [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 15, 16, 17, 18, 19, 20, 15, 16, 17, 18, 19, 20],
                frequency: 12
            },
            run: {
                frames: [21, 22, 23, 24, 25, 26, 27, 28],
                frequency: 6,
                next: "run"
            },
            jumpLaunching: {
                frames: [29],
                frequency: 11
            },
            jumpRising: {
                frames: [30],
                frequency: 1
            },
            jumpPeak: {
                frames: [31],
                frequency: 8
            },
            jumpFalling: {
                frames: [32],
                frequency: 1
            },
            jumpLanding: {
                frames: [33, 34],
                frequency: 6,
                next: "idle"
            },
            doubleJump: {
                frames: [31, 31],
                frequency: 5
            },
            hit: {
                frames: [36, 35, 36, 35],
                frequency: 8,
                next: "idle"
            },
            meleeAttack: {
                frames: [37, 38, 39, 40, 41, 42, 43, 44],
                frequency: 6,
                next: "idle"
            },
            rangeAttack: {
                frames: [45, 45, 46, 47, 48],
                frequency: 5
            },
            rangeAttackEnd: {
                frames: [49, 49, 50],
                frequency: 5,
                next: "idle"
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
    this.contentManager = contentManager;
    this.coffeeThrown = [];
    this.direction = 1; // -1 left, 1 right 
    this.velocity = { x: 0, y: 0 };
    this.canPlayAnimation = true;
    this.canMove = true;
    this.doubleJump = true;
    this.onGround = false;
    this.currentAnimation = "";
    this.reset(position);
};

CodeNinja.prototype.playAnimation = function (animation, callback) {
    var self = this;
    
    if (self.canPlayAnimation && animation != self.currentAnimation) {
        self.gotoAndStop(self.currentAnimation);
        self.currentAnimation = animation;
        
        // can current animation be interupted?
        var interuptable = animation.indexOf("idle") != -1 ? true : animation.indexOf("run") != -1 ? true : false;
        
        if (!interuptable) {
            self.canPlayAnimation = false;
            self.canMove = !(animation.indexOf("melee") != -1 || animation.indexOf("range") != -1);
            self.addEventListener("animationend", function () {
                self.removeAllEventListeners("animationend");
                self.canPlayAnimation = true;
                self.canMove = true;
                if (callback && typeof callback == "function") callback();
            });
        }
        
        this.gotoAndPlay(animation);
    }
};

CodeNinja.prototype.reset = function (position) {
    this.x = position.x;
    this.y = position.y;
    this.direction = 1;
    this.playAnimation("idle");
};

CodeNinja.prototype.idle = function () {
    this.direction == 1 ? this.playAnimation("idle") : this.playAnimation("idle_h");
    this.velocity.x = 0;
};

CodeNinja.prototype.moveLeft = function () {
    this.direction = -1;
    if (this.canMove) this.velocity.x = 5 * this.direction;
    this.playAnimation("run_h");
};

CodeNinja.prototype.moveRight = function () {
    this.direction = 1;
    if (this.canMove) this.velocity.x = 5 * this.direction;
    this.playAnimation("run");
};

CodeNinja.prototype.jump = function () {
    var self = this;
    if (self.onGround) {
        var jump = function () {
            self.velocity.y = -18;
            self.onGround = false;
            self.doubleJump = true;
        };
        self.direction == 1 ? self.playAnimation("jumpLaunching", jump) : self.playAnimation("jumpLaunching_h", jump);
    } 
    else if (self.doubleJump) {
        var dJump = function() {
            self.velocity.y = -18;
            self.doubleJump = false;
        };
        self.direction == 1 ? self.playAnimation("doubleJump", dJump) : self.playAnimation("doubleJump_h", dJump);
    }
};

CodeNinja.prototype.jumpRising = function() {
    this.direction == 1 ? this.playAnimation("jumpRising") : this.playAnimation("jumpRising_h");
};

CodeNinja.prototype.jumpPeak = function () {
    this.direction == 1 ? this.playAnimation("jumpPeak") : this.playAnimation("jumpPeak_h");
};

CodeNinja.prototype.jumpFalling = function () {
    this.direction == 1 ? this.playAnimation("jumpFalling") : this.playAnimation("jumpFalling_h");
};

CodeNinja.prototype.jumpLanding = function () {
    this.direction == 1 ? this.playAnimation("jumpLanding") : this.playAnimation("jumpLanding_h");
};

CodeNinja.prototype.meleeAttack = function () {
    this.direction == 1 ? this.playAnimation("meleeAttack") : this.playAnimation("meleeAttack_h");
};

CodeNinja.prototype.createCoffee = function () {
    var self = this;
    var coffee = new Projectile(self.contentManager.CoffeeImage, { x: self.x + (60 * self.direction), y: self.y - 20 }, self, self.world, self.game, self.level);
    coffee.direction = self.direction;
    coffee.velocity.y = -10;
    coffee.velocity.x = 15 * self.direction;
    return coffee;
};

CodeNinja.prototype.rangeAttack = function () {
    var self = this;
    var coffee = self.createCoffee();
    var throwCoffee = function() {
        self.coffeeThrown.push(coffee);
        coffee.spin();
        self.world.addChild(coffee);
        self.direction == 1 ? self.playAnimation("rangeAttackEnd") : self.playAnimation("rangeAttackEnd_h");
    };
    self.direction == 1 ? self.playAnimation("rangeAttack", throwCoffee) : self.playAnimation("rangeAttack_h", throwCoffee);
};

CodeNinja.prototype.bdims = {
	centreToFront: 25,
	centreToBack: 25,
	centreToTop: 40,
	centreToBottom: 55
};

CodeNinja.prototype.bounds = function () {
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

CodeNinja.prototype.calculateCollision = function(direction) {
	if (!direction) throw new Error("must supply direction");

	var self = this;
	var velocity = self.velocity;
	var bounds = self.bounds();
	var game = self.game;
	var level = self.level;
	var platforms = level.platforms;
	var collision = null;
	var len = platforms.length;
	var i = 0;
	
	if (direction == "y") {
		while (!collision && i < len) {
			if (platforms[i].isVisible()) {
				var cbounds = platforms[i].bounds();
				collision = game.calculateIntersection(bounds, cbounds, 0, velocity.y);
			}
			i++;
		}
		return collision;
	} else {
		while (!collision && i < len) {
			if (platforms[i].isVisible()) {
				var cbounds = platforms[i].bounds();
				collision = game.calculateIntersection(bounds, cbounds, velocity.x, 0);
			}
			i++;
		}
		return collision;
	}
};

CodeNinja.prototype.update = function() {
	var self = this;
	
    var world = self.world;
    var velocity = self.velocity;
	var collision = null;

    // gravity
    self.velocity.y += 1;

	// vertical movement and collision
	collision = self.calculateCollision("y");

    if (!collision) {
        self.y += velocity.y;

        if (velocity.y < 0) self.jumpRising(); // rising
        else if (velocity.y > 0) self.jumpFalling(); // falling
        else self.jumpPeak(); // peak
        
        if (self.onGround) self.onGround = false;
        
    } else {
	    (collision.rect2.y + collision.rect2.height / 2) < collision.rect1.y
    		? self.y += velocity.y + collision.height
    		: self.y += velocity.y - collision.height;

	    if (velocity.y >= 0) {
            
            // if not on ground yet then land
            if (!self.onGround) {
            	self.onGround = true;
            	self.jumpLanding();
			}
        }
        velocity.y = 0;
    }

	// horizontal movement and collision
    collision = self.calculateCollision("x");
	
	if (!collision) {
		if(self.x + velocity.x > 25) self.x += velocity.x;
	} else {
		(collision.rect2.x + collision.rect2.width / 2) < collision.rect1.x
			? self.x += velocity.x + collision.width
			: self.x += velocity.x - collision.width;
	}
	

    // projectiles
	var len = self.coffeeThrown.length;
	for (var n = 0; n < len; n++) {
		var coffee = self.coffeeThrown[n];
		if (!coffee.active) {
			self.coffeeThrown.splice(n, 1);
			world.removeChild(coffee);
			delete coffee;
			continue;
		}
		coffee.update();
	}
}