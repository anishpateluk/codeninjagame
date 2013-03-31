
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

    // game utils
    Game.utils.createBgGrid = function (numX, numY, thickness) {
        var thickFactor = thickness || 0.01;
        var grid = new createjs.Container();
        grid.snapToPixel = true;
        var gw = GameWidth / numX;
        var gh = GameHeight / numY;
        var verticalLine = new createjs.Graphics();
        verticalLine.beginFill(createjs.Graphics.getRGB(8, 250, 93));
        verticalLine.drawRect(0, 0, gw * thickFactor, gh * (numY + 2));
        var vs;
        for (var c = -1; c < numX + 1; c++) {
            vs = new createjs.Shape(verticalLine);
            vs.snapToPixel = true;
            vs.x = c * gw;
            vs.y = -gh;
            grid.addChild(vs);
        }
        var horizontalLine = new createjs.Graphics();
        horizontalLine.beginFill(createjs.Graphics.getRGB(8, 250, 93));
        horizontalLine.drawRect(0, 0, gw * (numX + 1), gh * thickFactor);
        var hs;
        for (c = -1; c < numY + 1; c++) {
            hs = new createjs.Shape(horizontalLine);
            hs.snapToPixel = true;
            hs.x = 0;
            hs.y = c * gh;
            grid.addChild(hs);
        }
        return grid;
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
        
        // add background
        var background = Background = Game.utils.createBgGrid(GRID_H, GRID_V);
        stage.addChild(background);
        var parallax = Parallax = Game.utils.createBgGrid(GRID_H, GRID_V);
        stage.addChild(parallax);

        // set up world
        var world = World = new createjs.Container();
        stage.addChild(world);

        // add platforms
        for (var i = 0; i < GameWidth * 1.5; i += 300) {
            Game.addPlatform(i, GameHeight);
        }
        for (var i = 0; i < GameWidth * 1.5; i += 300) {
            Game.addPlatform(i * 2, GameHeight - 150);
        }
        for (var i = 150; i < GameWidth * 1.5; i += 300) {
            Game.addPlatform(i * 2, GameHeight - 300);
        }

        // set up player
        var player = Player = new CodeNinja(contentManager.CodeNinjaImage, { x: 450, y: GameHeight - 150 });

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

        // move background
        Background.x = (World.x * .45) % (GameWidth / GRID_H);
        Background.y = (World.y * .45) % (GameHeight / GRID_V);
        Parallax.x = (World.x * .50) % (GameWidth / GRID_H);
        Parallax.y = (World.y * .50) % (GameHeight / GRID_V);
    };
    
    window.tick = function () {

        if (keydown.left) Player.moveLeft();
        if (keydown.right) Player.moveRight();
        if (keydown.up) Player.jump();
        if (keydown.q) Player.meleeAttack();
        if (keydown.w) Player.rangeAttack();
        if (!keydown.up && !keydown.left && !keydown.right && !keydown.w && !keydown.q) Player.idle();

        Player.tick(Game);

        Game.tick();
        
        Stage.update();
    };

    // set up keyboard input
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

        Game.init();
    });

})(window, $);