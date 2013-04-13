
(function (window, $, undefined) {
    //globals
    var FramesPerSecond = 30;
    var Game, ContentManager, Background, Parallax, Canvas, World, Stage, Player, GameWidth;
    var GRID_H = 12, GRID_V = 3;
    var GameHeight = 300;
    
    // game
    Game = {};
    Game.utils = {};

    Game.platforms = [];

    Game.addPlatform = function(x, y) {
        var contentManager = ContentManager;
        x = Math.round(x);
        y = Math.round(y);

        var platform = new createjs.Bitmap(contentManager.PlatformImage);
        platform.x = x;
        platform.y = y;
        platform.snapToPixel = true;

        Game.platforms.push(platform);
        World.addChild(platform);
    };

    Game.calculateIntersection = function(rect1, rect2, x, y) {
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
            dx = Math.min(Math.min(rect1.width, rect2.width), -dx);
            dy = Math.min(Math.min(rect1.height, rect2.height), -dy);
            return {
                x: Math.max(rect1.x, rect2.x),
                y: Math.max(rect1.y, rect2.y),
                width: dx,
                height: dy,
                rect1: rect1,
                rect2: rect2
            };
        } else {
            return null;
        }
    };

    Game.resizeCanvas = function (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = GameHeight;
    };
	
    // game initialization
    Game.init = function () {
        var contentManager = ContentManager = new GameContentManager(function() {
            var canvas = Canvas = document.getElementById("game-canvas");
            Game.start(canvas);
        });
        contentManager.loadAssets();
    };
    
    Game.start = function (canvas) {
        Game.resizeCanvas(canvas);
        GameHeight = canvas.height;
        GameWidth = canvas.width;
        var contentManager = ContentManager;
        
        // set up stage
        var stage = Stage = new createjs.Stage(canvas);
        stage.snapToPixel = true;
        
        // set up world
        var world = World = new createjs.Container();
        stage.addChild(world);

        // add platforms
        for (var i = 0; i < GameWidth * 1.5; i += 300) {
            Game.addPlatform(i, GameHeight);
        }
        for (var i = 300; i < GameWidth * 1.5; i += 300) {
            Game.addPlatform(i * 2, GameHeight - 150);
        }
        for (var i = 450; i < GameWidth * 1.5; i += 300) {
            Game.addPlatform(i * 2, GameHeight - 300);
        }

        // set up player
        var player = Player = new CodeNinja(contentManager.CodeNinjaImage, { x: 450, y: GameHeight - 400 }, world, contentManager);

        // add player to world
        world.addChild(player);

        // easeljs boilerplate
        createjs.Ticker.addListener(window);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(FramesPerSecond);
    };

    Game.tick = function () {
        
        // move world with player
        if (Player.x > GameWidth * .3) {
            World.x = -Player.x + GameWidth * .3;
        }
        if (Player.y > GameHeight * .6) {
            World.y = -Player.y + GameHeight * .6;
        } else if (Player.y < GameHeight * .6) {
            World.y = -Player.y + GameHeight * .6;
        }
        
        // reset player if fallen off edge
        if (Player.y > GameHeight * 3) {
            Player.reset({ x: 450, y: GameHeight - 150 });
        }
    };
    
    window.tick = function () {

    	if (!keydown.left && !keydown.right) Player.idle(); 
        else if (keydown.right) Player.moveRight();
        else if (keydown.left) Player.moveLeft();

        Player.tick(Game);

        Game.tick();
        
        Stage.update();
    };
    
    function keyName(event) {
        return jQuery.hotkeys.specialKeys[event.which] ||
          String.fromCharCode(event.which).toLowerCase();
    }

    Game.handleKeydown = function (keydown) {
        if (keydown.up) Player.jump();
        if (keydown.q) Player.meleeAttack();
        if (keydown.w) Player.rangeAttack();
    };

    // set up keyboard input
    $(function () {
        window.keydown = {};
        
        $(document).on("keydown", function (event) {
            keydown[keyName(event)] = true;
            Game.handleKeydown(keydown);
        });

        $(document).on("keyup", function (event) {
            keydown[keyName(event)] = false;
        });

        Game.init();
    });

})(window, $);