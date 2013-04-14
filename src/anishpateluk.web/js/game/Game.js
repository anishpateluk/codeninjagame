
(function (window, $, undefined) {
    //globals
    var FramesPerSecond = 30;
    var Game, ContentManager, Canvas, World, Stage, Player, Level;
    // game
    Game = {
    	width: 300,
    	height: 300
    };
    Game.utils = {};

	Game.utils.updateDrawVisibility = function() {
		var game = Game;
		var world = World;

		var horizontal_threshold = 300;
		var vertical_threshold = 300;

		var minX = -world.x - horizontal_threshold;
		var minY = -world.y - vertical_threshold;
		var maxX = -world.x + game.width + horizontal_threshold;
		var maxY = -world.y + game.height + vertical_threshold;

		var drawables = world.children;
		var len = drawables.length;
		
		for (var i = 0; i < len; i++) {
			var drawable = drawables[i];
			
			if (drawable.x < minX || drawable.x > maxX) {
				drawable.visible = false;
			} else if (drawable.y < minY || drawable.y > maxY) {
				drawable.visible = false;
			} else {
				drawable.visible = true;
			}
		}
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
        canvas.height = Game.height;
    };
	
    // game initialization
    Game.init = function () {
        var contentManager = ContentManager = new GameContentManager(function() {
            var canvas = Canvas = window.canvas = document.getElementById("game-canvas");
            Game.start(canvas);
        });
        contentManager.loadAssets();
    };
    
    Game.start = function (canvas) {
	    var game = Game;
	    var contentManager = ContentManager;
	    
	    game.resizeCanvas(canvas);
	    game.height = canvas.height;
	    game.width = canvas.width;

    	// set up stage
	    var stage = Stage = window.stage = new createjs.Stage(canvas);
        stage.snapToPixel = true;
        
        // set up world
        var world = World = window.world = new createjs.Container();
        stage.addChild(world);

    	// set up level
        var level = Level = window.level = new GameLevel(game, world, contentManager);
	    level.build();

		// set up player
        var player = window.player = Player = new CodeNinja(contentManager.CodeNinjaImage, { x: 450, y: game.height - 400 }, world, game, level, contentManager);

        // add player to world
        world.addChild(player);

        // easeljs boilerplate
        createjs.Ticker.addListener(window);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(FramesPerSecond);
    };

    Game.update = function () {
    	var game = Game;
    	var player = Player;
	    var world = World;

        // move world with player
        if (player.x > game.width * .3) {
            world.x = -player.x + game.width * .3;
        }
        if (player.y > game.height * .6) {
            world.y = -player.y + game.height * .6;
        } else if (player.y < game.height * .6) {
            world.y = -player.y + game.height * .6;
        }

	    game.utils.updateDrawVisibility();
        
        // reset player if fallen off edge
        if (player.y > game.height * 3) {
        	player.reset({ x: 450, y: game.height - 400 });
        }
    };
	
	function displayFPS() {
		var fps = document.getElementById("fps");
		fps.innerHTML = createjs.Ticker.getMeasuredFPS();
	}
    
    window.tick = function () {
    	var player = Player;
    	var game = Game;
	    var stage = Stage;

    	if (!keydown.left && !keydown.right) player.idle(); 
        else if (keydown.right) player.moveRight();
        else if (keydown.left) player.moveLeft();

    	game.update();
		
    	player.update();

    	stage.update();

	    displayFPS();
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