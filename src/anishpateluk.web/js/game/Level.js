

function GameLevel(game, world, contentManager, width, height) {
	var self = this;
	
	self.game = game;
	self.world = world;
	self.contentManager = contentManager;
	self.width = width;
	self.height = height;
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

}