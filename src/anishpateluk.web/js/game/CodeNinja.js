
// player character class

function CodeNinja(playerImage, position) {
    this.initialize(playerImage, position);
}
CodeNinja.prototype = new createjs.BitmapAnimation();
CodeNinja.prototype.BitmapAnimation_initialize = CodeNinja.prototype.initialize;
CodeNinja.prototype.initialize = function (playerImage, position) {
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
            jump: {
                frames: [30, 30, 31, 31, 32, 32],
                frequency: 6
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

    // properties
    this.direction = 1; // 0 left, 1 right 
    this.velocity = { x: 0, y: 25 };
    this.canPlayAnimation = true;
    this.canMove = true;
    this.canJump = true;
    this.currentAnimation = "";
    this.reset(position);
};

CodeNinja.prototype.playAnimation = function (animation) {
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
    this.direction ? this.playAnimation("idle") : this.playAnimation("idle_h");
    this.velocity.x = 0;
};

CodeNinja.prototype.moveLeft = function () {
    this.direction = 0;
    if (this.canMove) this.velocity.x = 5;
    this.playAnimation("run_h");
};

CodeNinja.prototype.moveRight = function () {
    this.direction = 1;
    if (this.canMove) this.velocity.x = 5;
    this.playAnimation("run");
};

CodeNinja.prototype.jump = function () {
    if (!this.canJump) return;
    this.velocity.y = -15;
    this.direction ? this.playAnimation("jump") : this.playAnimation("jump_h");
};

CodeNinja.prototype.meleeAttack = function () {
    this.direction ? this.playAnimation("meleeAttack") : this.playAnimation("meleeAttack_h");
};

CodeNinja.prototype.rangeAttack = function () {
    this.direction ? this.playAnimation("rangeAttack") : this.playAnimation("rangeAttack_h");
};

CodeNinja.prototype.tick = function() {
    var self = this;

    // gravity
    self.velocity.y += 1;
}