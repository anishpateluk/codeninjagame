
// player character class

function CodeNinja(playerImage, position, world, contentManager) {
    this.initialize(playerImage, position, world, contentManager);
}
CodeNinja.prototype = new createjs.BitmapAnimation();
CodeNinja.prototype.BitmapAnimation_initialize = CodeNinja.prototype.initialize;
CodeNinja.prototype.initialize = function (playerImage, position, world, contentManager) {
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
                frequency: 5
            },
            run: {
                frames: [21, 22, 23, 24, 25, 26, 27, 28],
                frequency: 4,
                next: "run"
            },
            jumpLaunching: {
                frames: [29],
                frequency: 5
            },
            jumpRising: {
                frames: [30],
                frequency: 1
            },
            jumpPeak: {
                frames: [31, 31],
                frequency: 3
            },
            jumpFalling: {
                frames: [32],
                frequency: 1
            },
            jumpLanding: {
                frames: [33, 34],
                frequency: 5,
                next: "idle"
            },
            doubleJump: {
                frames: [31, 31],
                frequency: 3
            },
            hit: {
                frames: [36, 35, 36],
                frequency: 3,
                next: "idle"
            },
            meleeAttack: {
                frames: [37, 38, 39, 40, 41, 42, 43, 44],
                frequency: 4,
                next: "idle"
            },
            rangeAttack: {
                frames: [45, 46, 47, 48, 49, 50],
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
    this.contentManager = contentManager;
    this.coffeeThrown = [];
    this.coffeeDestroyed = [];
    this.direction = 1; // -1 left, 1 right 
    this.velocity = { x: 0, y: 25 };
    this.canPlayAnimation = true;
    this.canMove = true;
    this.doubleJump = false;
    this.onGround = true;
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
            self.velocity.y = -16;
            self.onGround = false;
            self.doubleJump = true;
        };
        self.direction == 1 ? self.playAnimation("jumpLaunching", jump) : self.playAnimation("jumpLaunching_h", jump);
    } 
    else if (self.doubleJump) {
        var dJump = function() {
            self.velocity.y = -16;
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

CodeNinja.prototype.rangeAttack = function () {
    this.direction == 1 ? this.playAnimation("rangeAttack") : this.playAnimation("rangeAttack_h");
};

CodeNinja.prototype.tick = function(game) {
    var self = this;

    // gravity
    self.velocity.y += 1;

    var bounds = ndgmr.getBounds(self);
    var velocity = self.velocity;
    var platforms = game.platforms;
    var collision = null, i = 0;
    
    while (!collision && i < platforms.length) {
        var cbounds = ndgmr.getBounds(platforms[i]);

        collision = game.calculateIntersection(bounds, cbounds, 0, velocity.y);
        i++;
    }

    if (!collision) {
        self.y += velocity.y;

        if (velocity.y < 0) self.jumpRising(); // rising
        else if (velocity.y > 0) self.jumpFalling(); // falling
        else self.jumpPeak(); // peak
        
        if (self.onGround) self.onGround = false;
        
    } else {
        self.y += velocity.y - collision.height;
        if (velocity.y > 0) {
            
            // if not on ground yet then land
            if (!self.onGround) self.jumpLanding();
            
            self.onGround = true;
        }
        velocity.y = 0;
    }

    if(self.x != self.velocity.x > 0) self.x += self.velocity.x;
}