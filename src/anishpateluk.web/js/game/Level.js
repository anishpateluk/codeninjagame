

function GameLevel(game, world, contentManager, schematic) {
	var self = this;
	
	self.game = game;
	self.world = world;
	self.contentManager = contentManager;
	self.schematic = schematic;
	self.left = 0;
	self.right = 0;
	self.top = 0;
	self.bottom = 0;
	self.platforms = [];
	self.enemies = [];
}

GameLevel.prototype.addPlatform = function (x, y) {
	var self = this;
	var contentManager = self.contentManager;
	var world = self.world;
	var platforms = self.platforms;

	x = Math.round(x);
	y = Math.round(y);

	var platform = new Platform(contentManager.PlatformImage);
	platform.x = x;
	platform.y = y;
	platform.snapToPixel = true;

	platforms.push(platform);
	world.addChild(platform);
};

GameLevel.prototype.build = function() {
	var self = this;
	var level = self;
	var game = self.game;
	


	var width = game.width * 1.3;
	for (var i = 0; i < width; i += 300) {
		level.addPlatform(i, game.height);
	}
	
	for (var i = 600; i < width; i += 300) {
		level.addPlatform(i, game.height - 50);
	}

	for (var i = 600; i < width; i += 300) {
		level.addPlatform(i, game.height - 100);
	}

	level.addPlatform(0, game.height - 150);
	level.addPlatform(0, game.height - 200);
	level.addPlatform(0, game.height - 250);
	
	for (var i = 900; i < width; i += 300) {
		level.addPlatform(i, game.height - 150);
	}
	
	for (var i = 1200; i < width; i += 300) {
		level.addPlatform(i, game.height - 200);
	}
	
	for (var i = 1500; i < width; i += 300) {
		level.addPlatform(i, game.height - 250);
	}
	
	for (var i = 1800; i < width; i += 300) {
		level.addPlatform(i, game.height - 300);
	}
	
	for (var i = 2100; i < width; i += 300) {
		level.addPlatform(i, game.height - 350);
	}
	
	for (var i = 2400; i < width; i += 300) {
		level.addPlatform(i, game.height - 400);
	}

}