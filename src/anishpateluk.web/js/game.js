
(function(window, $, undefined) {
    
    //globals
    var framesPerSecond = 60;
    var canvas, stage, player, gameWidth, gameHeight;
    
    // Sprite images
    var loadedImages = 0;
    var totalImages = 3;

    var codeNinjaIdleImg = new Image();
    codeNinjaIdleImg.height = 100;
    codeNinjaIdleImg.width = 700;

    var codeNinjaSmokeImg = new Image();
    codeNinjaSmokeImg.height = 200;
    codeNinjaSmokeImg.width = 800;

    var codeNinjaRunImg = new Image();
    codeNinjaRunImg.height = 100;
    codeNinjaRunImg.width = 800;

    // game functions
    var game = {
        handleImageError: function(e) {
            throw new Error("Error Loading Image : " + e.target.src);
        },
        handleImageLoad: function() {
            loadedImages++;

            if (loadedImages == totalImages) {
                $(game).trigger("imagesLoaded");
            }
        },
        resizeCanvas : function() {
            canvas.width = window.innerWidth;
            canvas.height = 500;
        }
    };

    // game initialize function
    function init() {
        try {
            
            $(game).on("imagesLoaded", function () {
                game.resizeCanvas();
                startGame();
            });
            
            canvas = document.getElementById("game");

            codeNinjaIdleImg.onload = game.handleImageLoad;
            codeNinjaIdleImg.onerror = game.handleImageError;
            codeNinjaIdleImg.src = "/img/game_assets/cn_idle.png";

            codeNinjaSmokeImg.onload = game.handleImageLoad;
            codeNinjaSmokeImg.onerror = game.handleImageError;
            codeNinjaSmokeImg.src = "/img/game_assets/cn_smoke.png";

            codeNinjaRunImg.onload = game.handleImageLoad;
            codeNinjaRunImg.onerror = game.handleImageError;
            codeNinjaRunImg.src = "/img/game_assets/cn_run.png";
        } catch(e) {
            console.log(e);
        } 
    }
    
    // code ninja class
    var codeNinja = function (startPos) {
        var self = this;
        var startPosition = startPos || { x: 0, y: 0 };

        // private fields
        var velocity = 2;
        var horizontalOffset = 16;
        var verticalOffset = 26;
        var direction = 90;
        var spriteSheet;
        
        // public properties
        self.animation = self.animation || {};

        // public methods
        self.moveLeft = function() {
            if (direction != -90) direction = -90;
            self.animation.gotoAndPlay("run_h");
            if (self.animation.x > horizontalOffset) self.animation.x -= velocity;
        };
        
        self.moveRight = function () {
            if (direction != 90) direction = 90;
            self.animation.gotoAndPlay("run");
            if (self.animation.x <= gameWidth - horizontalOffset) self.animation.x += velocity;
        };

        self.moveUp = function () {
            if (direction == 90) self.animation.gotoAndPlay("run");
            else self.animation.gotoAndPlay("run_h");
            if (self.animation.y >= (gameHeight / 2) - verticalOffset) self.animation.y -= velocity;
        };

        self.moveDown = function () {
            if (direction == 90) self.animation.gotoAndPlay("run");
            else self.animation.gotoAndPlay("run_h");
            if (self.animation.y <= gameHeight - verticalOffset) self.animation.y += velocity;
        };

        self.idle = function () {
            if (direction == 90) {
                self.animation.gotoAndPlay("idle");
                return;
            }
            self.animation.gotoAndPlay("idle_h");
        };
        
        // setup spritesheet
        function constructSpriteSheet() {
            spriteSheet = new createjs.SpriteSheet({
                images: [
                    codeNinjaIdleImg,
                    codeNinjaSmokeImg,
                    codeNinjaRunImg
                ],

                // x, y, width, height, imageIndex
                frames: [
                    // idle animation frames
                    [0, 0, 100, 100, 1], // 1
                    [100, 0, 100, 100, 1], // 2
                    [200, 0, 100, 100, 1], // 3
                    [300, 0, 100, 100, 1], // 4
                    [400, 0, 100, 100, 1], // 5
                    [500, 0, 100, 100, 1], // 6
                    [600, 0, 100, 100, 1], // 7

                    // smoke animation frames
                    [0, 0, 100, 100, 2], // 8 (1)
                    [100, 0, 100, 100, 2], // 9 (2)
                    [200, 0, 100, 100, 2], // 10 (3)
                    [300, 0, 100, 100, 2], // 11 (4)
                    [400, 0, 100, 100, 2], // 12 (5)
                    [500, 0, 100, 100, 2], // 13 (6)
                    [600, 0, 100, 100, 2], // 14 (7)
                    [700, 0, 100, 100, 2], // 15 (8)
                    [0, 100, 100, 100, 2], // 16 (9)
                    [100, 100, 100, 100, 2], // 17 (10)
                    [200, 100, 100, 100, 2], // 18 (11)
                    [300, 100, 100, 100, 2], // 19 (12)
                    [400, 100, 100, 100, 2], // 20 (13)
                    [500, 100, 100, 100, 2], // 21 (14)

                    // run animation frames
                    [0, 0, 100, 100, 3], // 22 (1)
                    [100, 0, 100, 100, 3], // 23 (2)
                    [200, 0, 100, 100, 3], // 24 (3)
                    [300, 0, 100, 100, 3], // 25 (4)
                    [400, 0, 100, 100, 3], // 26 (5)
                    [500, 0, 100, 100, 3], // 27 (6)
                    [600, 0, 100, 100, 3], // 28 (7)
                    [700, 0, 100, 100, 3] // 29 (8)
                ],

                animations: {
                    idle: {
                        frames: [1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 15, 16, 17, 18, 19, 20, 21, 15, 16, 17, 18, 19, 20, 21],
                        next: "idle",
                        frequency: 2
                    },
                    run: {
                        frames: [22, 23, 24, 25, 26, 27, 28, 29],
                        next: "run",
                        frequency: 7
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
            
            // set start position
            self.animation.x = startPosition.x;
            self.animation.y = startPosition.y;
        }

        constructSpriteSheet();
        constructAnimation();
        this.idle();
    };
    
    // game setup
    function startGame() {
        //set up stage
        stage = new createjs.Stage(canvas);
        stage.snapToPixel = true;

        gameWidth = canvas.width;
        gameHeight = canvas.height;
        
        // set up player
        player = new codeNinja({ x: gameWidth / 2, y: (gameHeight / 2) + 10 });

        //add player to stage
        stage.addChild(player.animation);

        // easeljs boilerplate
        createjs.Ticker.addListener(window);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(framesPerSecond);
    }

    // game loop
    window.tick = function tick() {

        if (keydown.left) player.moveLeft();

        if (keydown.right) player.moveRight();

        if (keydown.up) player.moveUp();

        if (keydown.down) player.moveDown();

        if (!keydown.up && !keydown.down && !keydown.left && !keydown.right) player.idle();

        // update stage
        stage.update();
    };

    // register key key presses
    $(function () {
        window.keydown = {};

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



