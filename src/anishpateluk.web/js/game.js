
(function(window, $, undefined) {
    
    //globals
    var framesPerSecond = 60;
    var canvas, stage, player, gameWidth, gameHeight;
    
    // sprite sheet image
    var codeNinjaImg = new Image();
    codeNinjaImg.height = 100;
    codeNinjaImg.width = 2900;

    // game functions
    var game = {
        handleImageError: function(e) {
            throw new Error("Error Loading Image : " + e.target.src);
        },
        handleImageLoad: function() {
            $(game).trigger("imagesLoaded");
        },
        resizeCanvas: function() {
            canvas.width = window.innerWidth;
            canvas.height = 500;
        },
        playBgMusic: function() {
            var bgMusic =  window.gameBgMusic = new Audio();
            bgMusic.src = "/sounds/vn.mp3";
            bgMusic.play();
            bgMusic.volume = 0.1;
        }
    };

    // game initialize function
    function init() {
        try {
            
            $(game).on("imagesLoaded", function () {
                game.resizeCanvas();
                startGame();
                game.playBgMusic();
            });
            
            canvas = document.getElementById("game");

            codeNinjaImg.onload = game.handleImageLoad;
            codeNinjaImg.onerror = game.handleImageError;
            codeNinjaImg.src = "/img/game_assets/CN_master.png";

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
            complexFrames: false
        };
        var settings = $.extend(defaultOptions, options);
        var velocity = 2;
        var horizontalOffset = 16;
        var verticalOffset = 26;
        var offset = 100;
        var direction = 90;
        var spriteSheet;
        var currentAnimation;
        
        // public properties
        self.animation = self.animation || {};

        // public methods
        self.moveLeft = function () {
            if (direction != -90) direction = -90;
            playAnimation("run_h");
            if (self.animation.x >= offset) self.animation.x -= velocity;
        };
        
        self.moveRight = function () {
            if (direction != 90) direction = 90;
            playAnimation("run");
            if (self.animation.x <= gameWidth - offset) self.animation.x += velocity;
        };

        self.moveUp = function () {
            if (direction == 90) playAnimation("run");
            else playAnimation("run_h");
            if (self.animation.y >= offset) self.animation.y -= velocity;
        };

        self.moveDown = function () {
            if (direction == 90) playAnimation("run");
            else playAnimation("run_h");
            if (self.animation.y <= gameHeight - offset) self.animation.y += velocity;
        };

        self.idle = function () {
            if (direction == 90) {
                playAnimation("idle");
                return;
            }
            playAnimation("idle_h");
        };

        function playAnimation(animationName) {
            if (animationName != currentAnimation) {
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
                    count: 29,
                    regX: 50,
                    regY: 50
                },

                animations: {
                    idle: {
                        frames: [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 15, 16, 17, 18, 19, 20, 15, 16, 17, 18, 19, 20],
                        frequency: 11
                    },
                    run: {
                        frames: [21, 22, 23, 24, 25, 26, 27, 28],
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
            self.animation.x = settings.x;
            self.animation.y = settings.y;
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
        player = new codeNinja({ x: gameWidth / 2, y: gameHeight / 2 });

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



