
var FPS = 60;
var numberOfImagesLoaded = 0;
var canvas, stage, bmpAnimation, bmpIdleAnimation, game_width, game_height;

var playerWalkImg = new Image();
var playerIdleImg = new Image();
playerIdleImg.height = 100;
playerIdleImg.width = 100;
playerWalkImg.height = 100;
playerWalkImg.width = 800;

var player = {};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = 500;
}
function handleImageLoad(e) {
    numberOfImagesLoaded++;

    // We're not starting the game until all images are loaded
    // Otherwise, you may start to draw without the resource and raise
    // this DOM Exception: INVALID_STATE_ERR (11) on the drawImage method
    if (numberOfImagesLoaded == 2) {
        numberOfImagesLoaded = 0;
        resizeCanvas();
        startGame();
    }
}

function handleImageError(e) {
    console.log("Error Loading Image : " + e.target.src);
}

function init() {
    canvas = document.getElementById("game");

    playerWalkImg.onload = handleImageLoad;
    playerWalkImg.onerror = handleImageError;
    playerWalkImg.src = "img/game_assets/cn_run.png";

    playerIdleImg.onload = handleImageLoad;
    playerIdleImg.onerror = handleImageError;
    playerIdleImg.src = "img/game_assets/cn_idle.png";
}

function startGame() {
    stage = new createjs.Stage(canvas);
    stage.snapToPixel = true;

    game_width = canvas.width;
    game_height = canvas.height;

    var spriteSheetMoving = new createjs.SpriteSheet({
        images: [playerWalkImg],
        frames: { width: 100, height: 100, regX: 50, regY: 50 },
        animations: {
            run: [0, 7, "run", 7]
        }
    });

    var spriteSheetIdle = new createjs.SpriteSheet({
        images: [playerIdleImg],
        frames: { width: 100, height: 100, regX: 50, regY: 50 },
        animations: {
            idle: [0, 7, "idle", 11]
        }
    });

    // to save file size, the loaded sprite sheet only includes left facing animations
    // we could flip the display objects with scaleX=-1, but this is expensive in most browsers
    // instead, we generate a new sprite sheet which includes the flipped animations
    createjs.SpriteSheetUtils.addFlippedFrames(spriteSheetMoving, true, false, false);

    // create a BitmapSequence instance to display and play back the sprite sheet:
    bmpAnimation = new createjs.BitmapAnimation(spriteSheetMoving);

    bmpIdleAnimation = new createjs.BitmapAnimation(spriteSheetIdle);

    // set the registration point (the point it will be positioned and rotated around)
    // to the center of the frame dimensions:
    bmpAnimation.regX = bmpAnimation.spriteSheet.frameWidth / 2 | 0;
    bmpAnimation.regY = bmpAnimation.spriteSheet.frameHeight / 2 | 0;

    bmpIdleAnimation.gotoAndPlay("walk"); 	//walking from left to right

    bmpIdleAnimation.name = "playerMoving";
    bmpIdleAnimation.direction = 0;
    bmpIdleAnimation.velocity = 2;
    bmpIdleAnimation.x = game_width / 2;
    bmpIdleAnimation.y = ((game_height / 2) + 10);
    bmpIdleAnimation.scaleX = 1;
    bmpIdleAnimation.scaleY = 1;
    bmpIdleAnimation.snapToPixel = true;

    bmpAnimation.name = "playerIdle";
    bmpAnimation.direction = 0;
    bmpAnimation.velocity = 2;
    bmpAnimation.x = 100;
    bmpAnimation.y = 100;
    bmpAnimation.scaleX = 1;
    bmpAnimation.scaleY = 1;
    bmpAnimation.snapToPixel = true;
    bmpAnimation.height = 100;

    bmpAnimation.currentFrame = 10;
    stage.addChild(bmpIdleAnimation);

    // we want to do some work before we update the canvas,
    // otherwise we could use Ticker.addListener(stage);
    createjs.Ticker.addListener(window);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(FPS);

    player.idle = bmpIdleAnimation;
    player.moving = bmpAnimation;
    player.fromIdle = true;
}

function swapAnimation(idle, move) {
    if (move && stage.contains(bmpIdleAnimation)) {
        bmpAnimation.x = bmpIdleAnimation.x;
        bmpAnimation.y = bmpIdleAnimation.y;
        stage.removeAllChildren();
        stage.addChild(bmpAnimation);
    }

    if (idle && stage.contains(bmpAnimation)) {
        bmpIdleAnimation.x = bmpAnimation.x;
        bmpIdleAnimation.y = bmpAnimation.y;
        stage.removeAllChildren();
        stage.addChild(bmpIdleAnimation);
    }
}

function tick() {

    if (keydown.left) {
        swapAnimation(false, true);

        if (bmpAnimation.direction != -90) {
            bmpAnimation.direction = -90;
            bmpAnimation.gotoAndPlay("run_h");
        }

        if (bmpAnimation.x > 16) {
            bmpAnimation.x -= bmpAnimation.velocity;
        }
    }

    if (keydown.right) {
        swapAnimation(false, true);

        if (bmpAnimation.direction != 90) {
            bmpAnimation.direction = 90;
            bmpAnimation.gotoAndPlay("run");
        }

        if (bmpAnimation.x <= game_width - 16) {
            bmpAnimation.x += bmpAnimation.velocity;
        }
    }

    if (keydown.up) {
        swapAnimation(false, true);

        if (bmpAnimation.direction === 0) {
            bmpAnimation.direction = 90;
            bmpAnimation.gotoAndPlay("run");
        }

        if (bmpAnimation.y >= (game_height / 2) - 26) {
            bmpAnimation.y -= bmpAnimation.velocity;
        }
    }

    if (keydown.down) {
        swapAnimation(false, true);

        if (bmpAnimation.direction === 0) {
            bmpAnimation.direction = 90;
            bmpAnimation.gotoAndPlay("run");
        }

        if (bmpAnimation.y <= game_height - 60) {
            bmpAnimation.y += bmpAnimation.velocity;
        }
    }

    if (!keydown.up && !keydown.down && !keydown.left && !keydown.right) {
        swapAnimation(true, false);
    }

    // update the stage:
    stage.update();
}

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
});


$(function () {
    init();
});

