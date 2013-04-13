

function Platform(platformImage) {
	this.initialize(platformImage);
}

Platform.prototype = new createjs.Bitmap();
Platform.prototype.Bitmap_initialize = Platform.prototype.initialize;
Platform.prototype.initialize = function(platformImage) {
	var self = this;
	self.height = platformImage.height;
	self.width = platformImage.width;
	
	self.Bitmap_initialize(platformImage);
	self.bounds = function() {
		return {
			height: self.height,
			width: self.width,
			regX: self.regX,
			regY: self.regY,
			x: self.x,
			y: self.y
		};
	};
}