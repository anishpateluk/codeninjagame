
(function(window, $, undefined) {
    //globals
    var FramesPerSecond = 30;
    var Game, Canvas, World, Stage, Player, GameWidth;
    var GameHeight = 300;
    var RequestedAssets = 0;
    var TotalAssets = 2;
    

    // sprite sheet image
    var CodeNinjaImg = new Image();
    CodeNinjaImg.height = 100;
    CodeNinjaImg.width = 5100;

    // block image
    var PlatformImg = new Image();
    PlatformImg.height = 50;
    PlatformImg.width = 300;

    // game
    Game = {};
    Game.utils = {};
    
    // game utils
    Game.utils.resizeCanvas = function(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = GameHeight;
    };

    // game initialization
    Game.init = function () {
        Game.loadAssets();
    };
    
    Game.loadAssets = function() {
        CodeNinjaImg.onload = Game.assetLoaded;
        CodeNinjaImg.onerror = console.log;
        CodeNinjaImg.src = "/GameAssets/images/cn_master.png";

        PlatformImg.onload = Game.assetLoaded;
        PlatformImg.onerror = console.log;
        PlatformImg.src = "/GameAssets/images/mario_platform.png";
    };
    
    Game.assetLoaded = function (e) {
        ++RequestedAssets;
        if (RequestedAssets == TotalAssets) {
            var canvas = Canvas = document.getElementById("game-canvas");
            Game.start(canvas);
        }
    };

    Game.start = function(canvas) {
        Game.utils.resizeCanvas(canvas);
        GameHeight = canvas.height;
        GameWidth = canvas.width;

        // set up stage
        var stage = Stage = new createjs.Stage(canvas);
        stage.snapToPixel = true;

        // set up world
        var world = World = new createjs.Container();
        stage.addChild(world);


        // set up player
        var player = Player = new CodeNinja(CodeNinjaImg, { x: GameWidth / 2, y: GameHeight / 2 });

        // add player to world
        world.addChild(player);

        // easeljs boilerplate
        createjs.Ticker.addListener(window);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(FramesPerSecond);
    };
    
    // player character class

    function CodeNinja(playerImage, position) {
        this.initialize(playerImage, position);
    }
    CodeNinja.prototype = new createjs.BitmapAnimation();
    CodeNinja.prototype.BitmapAnimation_initialize = CodeNinja.prototype.initialize;
    CodeNinja.prototype.initialize = function(playerImage, position) {
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
                    frequency: 4
                },
                jump: {
                    frames: [30, 30, 31, 31, 32, 32],
                    frequency: 6
                },
                hit: {
                    frames: [36, 35, 36],
                    frequency: 3
                },
                attack: {
                    frames: [37, 38, 39, 40, 41, 42, 43, 44],
                    frequency: 4
                },
                chuck: {
                    frames: [45, 46, 47, 48, 49, 50],
                    frequency: 5
                }
            }
        });
        createjs.SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);
        this.BitmapAnimation_initialize(spriteSheet);
        
        // properties
        this.direction = "right";
        
        this.reset(position);
    };

    CodeNinja.prototype.reset = function(position) {
        this.x = position.x;
        this.y = position.y;
        this.direction == "right" ? this.gotoAndPlay("idle") : this.gotoAndPlay("idle_h");
    };

    window.tick = function() {
        Stage.update();
    };

    $(function() {
        Game.init();
    });

})(window, $);