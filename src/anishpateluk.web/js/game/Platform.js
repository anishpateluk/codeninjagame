

function Platform(platformImage) {
	this.initialize(platformImage);
}

Platform.prototype = new createjs.Bitmap();
Platform.prototype.Bitmap_initialize = Platform.prototype.initialize;
Platform.prototype.initialize = function(platformImage) {
	var self = this;

	self.Bitmap_initialize(platformImage);
	self.regY = 25;
	self.regX = 150;

	self.bounds = function() {
		return {
			height: platformImage.height,
			width: platformImage.width,
			regX: self.regX,
			regY: self.regY,
			x: self.x,
			y: self.y
		};
	};
}