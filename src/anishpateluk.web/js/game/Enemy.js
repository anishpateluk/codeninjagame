
function Enemy(enemyImage, position, world, game, level, contentManager, player) {
	this.initialize(enemyImage, position, world, game, level, contentManager, player);
}

Enemy.prototype = new createjs.BitmapAnimation();
Enemy.prototype.BitmapAnimation_initialize = Enemy.prototype.initialize;
Enemy.prototype.initialize = function(enemyImage, position, world, game, level, contentManager, player) {
	
	var spriteSheet = new createjs.SpriteSheet({
		images: [enemyImage],

		frames: {
			width: 100,
			height: 100,
			count: 17,
			regX: 50,
			regY: 50
		},

		animations: {
			idle: {
				frames: [0, 1, 2, 3],
				frequency: 12
			},
			walk: {
				frames: [4, 5, 6, 7, 8, 9, 10],
				frequency: 6,
				next: "walk"
			},
			hit: {
				frames: [11, 12, 13, 14, 15, 16],
				frequency: 8
			}
		}
	});
	createjs.SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);
	this.BitmapAnimation_initialize(spriteSheet);
	this.snapToPixel = true;
	
	// properties
	this.player = player;
	this.world = world;
	this.game = game;
	this.level = level;
	this.contentManager = contentManager;
	this.direction = 1; // -1 left, 1 right 
	this.velocity = { x: 0, y: 0 };
	this.onGround = false;
	this.currentAnimation = "";
	this.reset(position);
}