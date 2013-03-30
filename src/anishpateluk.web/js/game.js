
(function(window, $, undefined) {
    
    //globals
    var framesPerSecond = 30;
    var canvas, world, stage, player, gameWidth;
    var gameHeight = 300;
    var requestedAssets = 0;
    var totalAssets = 2;
    
    // sprite sheet image
    var codeNinjaImg = new Image();
    codeNinjaImg.height = 100;
    codeNinjaImg.width = 5100;
    
    // block image
    var platformImg = new Image();
    platformImg.height = 50;
    platformImg.width = 300;

    // game functions
    var game = {
        handleImageError: function(e) {
            throw new Error("Error Loading Image : " + e.target.src);
        },
        handleImageLoad: function(e) {
            ++requestedAssets;
            if (requestedAssets == totalAssets) {
                $(game).trigger("imagesLoaded");
            }
        },
        resizeCanvas: function() {
            canvas.width = window.innerWidth;
            canvas.height = gameHeight;
        },
        playBgMusic: function() {
            var audio = window.gameAudio = new Audio();
            audio.src = "/GameAssets/sounds/vn.mp3";
            audio.addEventListener("ended", function() {
                audio.play();
            });
            audio.play();
            audio.volume = 0.1;
        },
        calculateIntersection: function (rect1, rect2, x, y) {
            // prevent x|y from being null||undefined
            x = x || 0; y = y || 0;

            // first we have to calculate the
            // center of each rectangle and half of
            // width and height
            var dx, dy, r1 = {}, r2 = {};
            r1.cx = rect1.x + x + (r1.hw = (rect1.width / 2));
            r1.cy = rect1.y + y + (r1.hh = (rect1.height / 2));
            r2.cx = rect2.x + (r2.hw = (rect2.width / 2));
            r2.cy = rect2.y + (r2.hh = (rect2.height / 2));

            dx = Math.abs(r1.cx - r2.cx) - (r1.hw + r2.hw);
            dy = Math.abs(r1.cy - r2.cy) - (r1.hh + r2.hh);

            if (dx < 0 && dy < 0) {
                return { width: -dx, height: -dy };
            } else {
                return null;
            }
        },
        addPlatform: function(x, y) {
            x = Math.round(x);
            y = Math.round(y);

            var platform = new createjs.Bitmap(platformImg);
            platform.x = x;
            platform.y = y;
            platform.snapToPixel = true;

            game.collideables.push(platform);
            world.addChild(platform);
        },
        collideables: [],
        getBounds: ndgmr.getBounds,
        calculateCollision: function(obj, direction, collideables, moveBy) {
            moveBy = moveBy || { x: 0, y: 0 };
            if (direction != 'x' && direction != 'y') {
                direction = 'x';
            }
            var measure = direction == 'x' ? 'width' : 'height',
              oppositeDirection = direction == 'x' ? 'y' : 'x',
              oppositeMeasure = direction == 'x' ? 'height' : 'width',

              bounds = game.getBounds(obj),
              cbounds,
              collision = null,
              cc = 0;
            //if (direction == "x") {
            //    bounds.width = 10;
            //}

            // for each collideable object we will calculate the
            // bounding-rectangle and then check for an intersection
            // of the hero's future position's bounding-rectangle
            while (!collision && cc < collideables.length) {
                cbounds = game.getBounds(collideables[cc]);
                if (collideables[cc].isVisible) {
                    collision = game.calculateIntersection(bounds, cbounds, moveBy.x, moveBy.y);
                }

                if (!collision && collideables[cc].isVisible) {
                    // if there was NO collision detected, but somehow
                    // the hero got onto the "other side" of an object (high velocity e.g.),
                    // then we will detect this here, and adjust the velocity according to
                    // it to prevent the Hero from "ghosting" through objects
                    // try messing with the 'this.velocity = {x:0,y:125};'
                    // -> it should still collide even with very high values
                    var wentThroughForwards = (bounds[direction] < cbounds[direction] && bounds[direction] + moveBy[direction] > cbounds[direction]),
                      wentThroughBackwards = (bounds[direction] > cbounds[direction] && bounds[direction] + moveBy[direction] < cbounds[direction]),
                      withinOppositeBounds = !(bounds[oppositeDirection] + bounds[oppositeMeasure] < cbounds[oppositeDirection])
                                && !(bounds[oppositeDirection] > cbounds[oppositeDirection] + cbounds[oppositeMeasure]);

                    if ((wentThroughForwards || wentThroughBackwards) && withinOppositeBounds) {
                        moveBy[direction] = cbounds[direction] - bounds[direction];
                    } else {
                        cc++;
                    }
                }
            }

            if (collision) {
                var sign = Math.abs(moveBy[direction]) / moveBy[direction];
                moveBy[direction] -= collision[measure] * sign;
            }

            return collision;
        }
    };

    // game initialize function
    function init() {
        try {
            
            $(game).on("imagesLoaded", function () {
                game.resizeCanvas();
                startGame();
                //game.playBgMusic();
            });
            
            canvas = document.getElementById("game-canvas");

            codeNinjaImg.onload = game.handleImageLoad;
            codeNinjaImg.onerror = game.handleImageError;
            codeNinjaImg.src = "/GameAssets/images/cn_master.png";

            platformImg.onload = game.handleImageLoad;
            platformImg.onerror = game.handleImageError;
            platformImg.src = "/GameAssets/images/mario_platform.png";

        } catch(e) {
            console.log(e);
        } 
    }
    
    // code ninja class
    var codeNinja = function (options) {
        var self = this;

        // private fields
        var defaultOptions = {
            x: 0,
            y: 0,
            complexFrames: false,
            scaleX: 1,
            scaleY: 1
        };
        var settings = $.extend(defaultOptions, options);
        self.velocity = { x: 0, y: 25 };
        var offset = 50;
        var pdirection = 90;
        var spriteSheet;
        var currentAnimation;
        var canPlayAnimation = window.canPlayAnimation = true;
        self.onGround = true;
        
        // public properties
        self.animation = self.animation || {};

        // public methods
        self.attack = function() {
            if (pdirection == 90) playAnimation("attack");
            else playAnimation("attack_h");
        };
        
        self.chuck = function () {
            if (pdirection == 90) playAnimation("chuck");
            else playAnimation("chuck_h");
        };

        self.moveLeft = function () {
            if (pdirection != -90) pdirection = -90;
            playAnimation("run_h");
            //if (self.animation.x >= offset) self.animation.x -= self.velocity.x;
            self.velocity.x = -5;
        };
        
        self.moveRight = function () {
            if (pdirection != 90) pdirection = 90;
            playAnimation("run");
            //if (self.animation.x <= gameWidth - offset)
            //self.animation.x += self.velocity.x;
            self.velocity.x = 5;
        };

        self.jump = function () {
            if (pdirection == 90) playAnimation("jump");
            else playAnimation("jump_h");
            
            if (self.onGround) {
                self.velocity.y = -15;
                //self.onGround = false;
            }
        };
        
        self.idle = function () {
            if (pdirection == 90) playAnimation("idle");
            else playAnimation("idle_h");
        };

        self.tick = function () {
            this.velocity.y += 1;

            // preparing the variables
            var moveBy = { x: 0, y: self.velocity.y },
                collision = null,
                collideables = game.collideables;
            
            

            collision = game.calculateCollision(self.animation, 'y', collideables, moveBy);
            // moveBy is now handled by 'calculateCollision'
            // and can also be 0 - therefore we won't have to worry
            self.animation.y += moveBy.y;

            if (!collision) {
                if (self.onGround) {
                    self.onGround = false;
                    //self.doubleJump = true;
                }
            } else {
                // the hero can only be 'onGround'
                // when he's hitting floor and not
                // some ceiling
                if (moveBy.y > 0) {
                    self.onGround = true;
                    //self.doubleJump = false;
                }
                self.velocity.y = 0;
            }

            moveBy = { x: self.velocity.x, y: 0 };
            collision = game.calculateCollision(self.animation, 'x', game.collideables, moveBy);
            self.animation.x += moveBy.x;
        };

        function playAnimation(animationName) {
            var isAttack = animationName.indexOf("attack") != -1;
            var isJump = animationName.indexOf("jump") != -1;
            var isChuck = animationName.indexOf("chuck") != -1;
            if (isAttack || isJump || isChuck) {
                canPlayAnimation = false;
                self.animation.addEventListener("animationend", function () {
                    self.animation.removeAllEventListeners("animationend");
                    canPlayAnimation = true;
                });
            }
            if ((isAttack && animationName != currentAnimation)
                || (isJump && animationName != currentAnimation)
                || (isChuck && animationName != currentAnimation)
                || (!isAttack && !isJump && !isChuck && canPlayAnimation && animationName != currentAnimation)) {
                self.animation.gotoAndStop(currentAnimation);
                currentAnimation = animationName;
                self.animation.gotoAndPlay(animationName);
            }
        }

        // setup spritesheet
        function constructSpriteSheet() {
            spriteSheet = new createjs.SpriteSheet({
                images: [codeNinjaImg],

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
                        frequency: 5,
                        next: "idle"
                    },
                    run: {
                        frames: [21, 22, 23, 24, 25, 26, 27, 28],
                        frequency: 4,
                        next: "idle"
                    },
                    jump: {
                        frames: [30, 30, 31, 31, 32, 32],
                        frequency: 6,
                        next: "idle"
                    },
                    hit: {
                        frames: [36, 35, 36],
                        frequency: 3,
                        next: "idle"
                    },
                    attack: {
                        frames: [37, 38, 39, 40, 41, 42, 43, 44],
                        frequency: 4,
                        next: "idle"
                    },
                    chuck: {
                        frames: [45, 46, 47, 48, 49, 50],
                        frequency: 5,
                        next: "idle"
                    }
                }
            });
            
            // add flipped frames
            createjs.SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);
        }
        
        // setup animation
        function constructAnimation() {
            // instantiate a BitmapSequence instance to display and play back the sprite sheet
            self.animation = new createjs.BitmapAnimation(spriteSheet);
            self.animation.snapToPixel = true;
            
            // set the registration point (the point it will be positioned and rotated around)
            // to the center of the frame dimensions
            self.animation.regX = self.animation.spriteSheet.frameWidth / 2 | 0;
            self.animation.regY = self.animation.spriteSheet.frameHeight / 2 | 0;
            
            //set scale
            self.animation.scaleX = settings.scaleX;
            self.animation.scaleY = settings.scaleY;
            
            // set start position
            self.animation.x = settings.x;
            self.animation.y = settings.y;
        }

        constructSpriteSheet();
        constructAnimation();
        this.idle();
    };
    
    // game setup
    function startGame() {
        // set up stage
        stage = new createjs.Stage(canvas);
        stage.snapToPixel = true;

        // set up world
        world = new createjs.Container();
        stage.addChild(world);

        gameWidth = canvas.width;
        gameHeight = canvas.height;
        
        // add platforms
        for (var i = 0; i < gameWidth; i += 400) {
            game.addPlatform(i, gameHeight);
        }
        
        // set up player
        player = window.player = new codeNinja({ x: 200, y: gameHeight - 150 });

        //add player to world
        world.addChild(player.animation);

        // easeljs boilerplate
        createjs.Ticker.addListener(window);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(framesPerSecond);
    };

    // game loop
    window.tick = function tick() {

        player.tick();
        
        if (canPlayAnimation && keydown.left) player.moveLeft();

        if (canPlayAnimation && keydown.right) player.moveRight();
        
        if (canPlayAnimation && keydown.up) player.jump();
        
        if (canPlayAnimation && !keydown.up && !keydown.left && !keydown.right && !keydown.space) player.idle();

        if (keydown.space) player.attack();

        if (keydown.c) player.chuck();
        
        if (player.animation.y > gameHeight * 3) {
            startGame();
        }
        
        // if the hero "leaves" it's bounds of
        // screenWidth * 0.3 and screenHeight * 0.3(to both ends)
        // we will reposition the "world-container", so our hero
        // is allways visible
        if (player.animation.x > gameWidth * .3) {
            world.x = -player.animation.x + gameWidth * .3;
        }
        if (player.animation.y > gameHeight * .7) {
            world.y = -player.animation.y + gameHeight * .7;
        } else if (player.animation.y < gameHeight * .3) {
            world.y = -player.animation.y + gameHeight * .3;
        }

        // update stage
        stage.update();
    };

    // register key key presses
    $(function () {
        window.keydown = {};
        
        if (window.isMobile) {
            $("#left-key").on("touchstart", function (e) {
                e.preventDefault();
                keydown.left = true;
            });
            $("#left-key").on("touchend", function (e) {
                e.preventDefault();
                keydown.left = false;
            });

            $("#right-key").on("touchstart", function (e) {
                e.preventDefault();
                keydown.right = true;
            });
            $("#right-key").on("touchend", function (e) {
                e.preventDefault();
                keydown.right = false;
            });
            
            $("#up-key").on("touchstart", function (e) {
                e.preventDefault();
                keydown.up = true;
            });
            $("#up-key").on("touchend", function (e) {
                e.preventDefault();
                keydown.up = false;
            });

            $("#space-key").on("touchstart", function (e) {
                e.preventDefault();
                keydown.space = true;
            });
            $("#space-key").on("touchend", function (e) {
                e.preventDefault();
                keydown.space = false;
            });
            return;
        }

        function keyName(event) {
            return jQuery.hotkeys.specialKeys[event.which] ||
              String.fromCharCode(event.which).toLowerCase();
        }

        $(document).on("keydown", function (event) {
            keydown[keyName(event)] = true;
        });

        $(document).on("keyup", function (event) {
            keydown[keyName(event)] = false;
        });
    });

    // initialize game
    $(function () {
        init();
    });
    
})(window, $);



