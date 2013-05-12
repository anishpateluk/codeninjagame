

function GameContentManager(callback) {
    var self = this;

    self.CodeNinjaImage = new Image();
    self.PlatformImage = new Image();
    self.CoffeeImage = new Image();
    self.EnemyImage = new Image();
    
    var requestedAssets = 0;
    var totalAssets = 4;

    function assetLoaded() {
        ++requestedAssets;
        if (requestedAssets == totalAssets) {
            callback();
        }
    }

    function assetFailed(e) {
        console.log(e);
        throw new Error("Failed to Load asset");
    }

    self.loadAssets = function() {
        self.CodeNinjaImage.onload = assetLoaded;
        self.CodeNinjaImage.onerror = assetFailed;
        self.CodeNinjaImage.src = "/GameAssets/images/cn_master.png";

        self.PlatformImage.onload = assetLoaded;
        self.PlatformImage.onerror = assetFailed;
        self.PlatformImage.src = "/GameAssets/images/platform.png";
        
        self.CoffeeImage.onload = assetLoaded;
        self.CoffeeImage.onerror = assetFailed;
        self.CoffeeImage.src = "/GameAssets/images/coffee.png";
        
        self.EnemyImage.onload = assetLoaded;
        self.EnemyImage.onerror = assetFailed;
        self.EnemyImage.src = "/GameAssets/images/enemy_ninja_master.png";
    };
}
