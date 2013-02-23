﻿
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
    codeNinjaImg.width = 4500;
    
    // block image
    var blockImg = new Image();
    blockImg.height = 50;
    blockImg.width = 50;

    // game functions
    var game = window.game = {
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
        calculateIntersection: function(rect1, rect2, x, y) {
            x = x || 0;
            y = y || 0;

            var dx, dy, r1 = {}, r2 = {};

            r1.cx = rect1.x + x + (r1.halfWidth = (rect1.width / 2));
            r1.cy = rect1.y + y + (r1.halfHeight = (rect1.height / 2));
            r2.cx = rect2.x + x + (r2.halfWidth = (rect2.width / 2));
            r2.cy = rect2.y + y + (r2.halfHeight = (rect2.height / 2));

            dx = Math.abs(r1.cx - r2.cx) - (r1.halfWidth + r2.halfWidth);
            dy = Math.abs(r1.cy - r2.cy) - (r1.halfHeight + r2.halfHeight);

            if (dx < 0 && dy < 0) {
                return { width: -dx, height: -dy };
            } else {
                return null;
            }
        },
        addPlatform: function(x, y) {
            x = Math.round(x);
            y = Math.round(y);

            var platform = new createjs.Bitmap(blockImg);
            platform.x = x;
            platform.y = y;
            platform.snapToPixel = true;

            game.collideables.push(platform);
            world.addChild(platform);
        },
        collideables: [],
        getBounds: function(obj) {
            var bounds = { x: Infinity, y: Infinity, width: 0, height: 0 };

            if (obj instanceof createjs.Container) {
                var children = object.children, l = children.length, cbounds, c;
                for (c = 0; c < l; c++) {
                    cbounds = getBounds(children[c]);
                    if (cbounds.x < bounds.x) bounds.x = cbounds.x;
                    if (cbounds.y < bounds.y) bounds.y = cbounds.y;
                    if (cbounds.width > bounds.width) bounds.width = cbounds.width;
                    if (cbounds.height > bounds.height) bounds.height = cbounds.height;
                }
            } else {
                var gp, imgr;
                if (obj instanceof createjs.Bitmap) {
                    gp = obj.localToGlobal(0, 0);
                    imgr = { width: obj.image.width, height: obj.image.height };
                } else if (obj instanceof createjs.BitmapAnimation) {
                    gp = obj.localToGlobal(0, 0);
                    imgr = obj.spriteSheet._frames[obj.currentFrame];
                } else {
                    return bounds;
                }

                bounds.width = imgr.width * Math.abs(obj.scaleX);
                if (obj.scaleX >= 0) {
                    bounds.x = gp.x;
                } else {
                    bounds.x = gp.x - bounds.width;
                }

                bounds.height = imgr.height * Math.abs(obj.scaleY);
                if (obj.scaleX >= 0) {
                    bounds.y = gp.y;
                } else {
                    bounds.y = gp.y - bounds.height;
                }
            }

            return bounds;
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

            blockImg.onload = game.handleImageLoad;
            blockImg.onerror = game.handleImageError;
            blockImg.src = "/GameAssets/images/mario_dirt_tile.png";

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
        self.velocity = { x: 5, y: 25 };
        var offset = 50;
        var direction = 90;
        var spriteSheet;
        var currentAnimation;
        var canPlayAnimation = window.canPlayAnimation = true;
        self.onGround = true;
        
        // public properties
        self.animation = self.animation || {};

        // public methods
        self.attack = function() {
            if (direction == 90) playAnimation("attack");
            else playAnimation("attack_h");
        };

        self.moveLeft = function () {
            if (direction != -90) direction = -90;
            playAnimation("run_h");
            if (self.animation.x >= offset) self.animation.x -= self.velocity.x;
        };
        
        self.moveRight = function () {
            if (direction != 90) direction = 90;
            playAnimation("run");
            if (self.animation.x <= gameWidth - offset) self.animation.x += self.velocity.x;
        };

        self.jump = function () {
            if (direction == 90) playAnimation("jump");
            else playAnimation("jump_h");
            
            if (self.onGround) {
                self.velocity.y = -100;
                self.onGround = false;
            }
        };
        
        self.idle = function () {
            if (direction == 90) playAnimation("idle");
            else playAnimation("idle_h");
        };

        self.tick = function() {
            self.velocity.y += 1;

            var c = 0,
                cc = 0,
                addY =  self.velocity.y,
                bounds = game.getBounds(self.animation),
                cbounds,
                collision = null,
                collideables = game.collideables;

            bounds.height = 50;
            bounds.width = 10;
            cc = 0;
            
            // for each collideable object we will calculate the
            // bounding-rectangle and then check for an intersection
            // of the hero's future position's bounding-rectangle
            while (!collision && cc < collideables.length) {
                cbounds = game.getBounds(collideables[cc]);
                if (collideables[cc].isVisible()) {
                    collision = game.calculateIntersection(bounds, cbounds, 0, addY);
                }

                if (!collision && collideables[cc].isVisible()) {
                    // if there was NO collision detected, but somehow
                    // the hero got onto the "other side" of an object (high velocity e.g.),
                    // then we will detect this here, and adjust the velocity according to
                    // it to prevent the Hero from "ghosting" through objects
                    // try messing with the 'this.velocity = {x:0,y:25};'
                    // -> it should still collide even with very high values
                    if ((bounds.y < cbounds.y && bounds.y + addY > cbounds.y)
                      || (bounds.y > cbounds.y && bounds.y + addY < cbounds.y)) {
                        addY = cbounds.y - bounds.y;
                    } else {
                        cc++;
                    }
                }
            }
            
            // if no collision was to be found, just
            //  move the hero to it's new position
            if (!collision) {
                self.animation.y += addY;
                if (self.onGround) {
                    self.onGround = false;
                }
                // else move the hero as far as possible
                // and then make it stop and tell the
                // game, that the hero is now "an the ground"
            } else {
                self.animation.y += addY - collision.height;
                if (addY > 0) {
                    self.onGround = true;
                }
                self.velocity.y = 0;
            }
        };

        function playAnimation(animationName) {
            var isAttack = animationName.indexOf("attack") != -1;
            var isJump = animationName.indexOf("jump") != -1;
            if (isAttack || isJump) {
                canPlayAnimation = false;
                self.animation.addEventListener("animationend", function () {
                    self.animation.removeAllEventListeners("animationend");
                    canPlayAnimation = true;
                });
            }
            if ((isAttack && animationName != currentAnimation)
                || (isJump && animationName != currentAnimation)
                || (!isAttack && !isJump && canPlayAnimation && animationName != currentAnimation)) {
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
                    count: 45,
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
                        frequency: 4
                    },
                    jump: {
                        frames: [30, 31, 32],
                        frequency: 6
                    },
                    hit: {
                        frames: [36, 35, 36],
                        frequency: 3
                    },
                    attack: {
                        frames: [37, 38, 39, 40, 41, 42, 43, 44],
                        frequency: 4
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
    window.startGame = function startGame() {
        // set up stage
        stage = new createjs.Stage(canvas);
        stage.snapToPixel = true;

        // set up world
        world = new createjs.Container();
        stage.addChild(world);

        gameWidth = canvas.width;
        gameHeight = canvas.height;
        
        // add platforms
        var halfWidth = gameWidth / 2;
        for (var i = 0; i < gameWidth; i += 50) {
            game.addPlatform(i, gameHeight - 50);
            

            if (i >= halfWidth) {
                game.addPlatform(i, gameHeight - 100);
                if (i >= halfWidth + 100) {
                    game.addPlatform(i, gameHeight - 150);
                }
            }
        }
        
        // set up player
        player = window.player = new codeNinja({ x: 100, y: gameHeight - 99 });

        //add player to world
        world.addChild(player.animation);

        // easeljs boilerplate
        createjs.Ticker.addListener(window);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(framesPerSecond);
    };

    // game loop
    window.tick = function tick() {

        if (canPlayAnimation && keydown.left) player.moveLeft();

        if (canPlayAnimation && keydown.right) player.moveRight();
        
        if (canPlayAnimation && keydown.up) player.jump();
        
        if (canPlayAnimation && !keydown.up && !keydown.left && !keydown.right && !keydown.space) player.idle();

        if (keydown.space) player.attack();

        player.tick();

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



