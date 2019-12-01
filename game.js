var debugActive = true;

var city = new Image();


var GAMESTATES = ["Splash", "Game", "Pause", "GameOver", "Hiscore"];    // Store the available gamestates
var currentGameState = GAMESTATES[0];                                   // Store and assign the currently selected gamestate

var RequestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = RequestAnimationFrame;

var mobilePlatform = false;
// Set dimensions to fullscreen
var width = window.innerWidth;                          // Store the game window's maximised inner width
var height = window.innerHeight;                        // Store the game window's maximised inner height
var screenScale = screen.height / 1080;                 // Multiplier to scale drawn elements by
// Set layers z-index
var background = document.getElementById("layer1");     // Absolute background
var back1 = document.getElementById("layer2");          // Parallax background 1
var back2 = document.getElementById("layer3");          // Parallax background 2
//var back3 = document.getElementById("layer4");        // Parallax background 3
var canvas = document.getElementById("layer5");         // Foreground
var UI = document.getElementById("layer6");             // UI
// Set context by layers
var backgroundCtx = background.getContext("2d");        // Background layer
var foregroundCtx = canvas.getContext("2d");            // Gameplay layer
var UICtx = UI.getContext("2d");                        // UI layer

// Parallax background
var backgroundImg = new Image();
var backgroundImg2 = new Image();
var backgroundIndex = 0;
var midgroundImg = new Image();
var foregroundImg = new Image();
var scrollSpeed = 5;                                    // Screen scroll speed
var backgroundScroll = [];                              // Parallax background planes
var midgroundScroll = [];
var foregroundScroll = [];

// Splash screen values
var splashPos = [width / 2, height / 2];                // Set position for splash screen menu text
var counter = 0;                                        // Animation counter
var pulseSpeed = 1.5;                                   // Text pulse speed
var pulseExtent = 20;                                   // Set extent text pulses to
var increase = Math.PI * pulseSpeed / 100;              // Rate counter increases at
var menuOptions = [];                                   // Array to store the current number of menu options
var selected = 0;                                       // Iterator to indicate current selected menu option
var numOptions = [3, 0, 4, 2, 1];                       // Specify number of menu options available for each game state



// Set window dimensions for all layers
background.width = width;
background.height = height;
canvas.width = width;
canvas.height = height;
UI.width = width;
UI.height = height;

// Set background canvas dimensions
backgroundCtx.canvas.width = width;   
backgroundCtx.canvas.height = height;
foregroundCtx.canvas.width = width;
foregroundCtx.canvas.height = height;
UICtx.canvas.width = width;
UICtx.canvas.height = height;

// Store current and previous frame keystates
var keys = [];
var previousKeys = [];
var isAnimating = false;

var objects = [];                   // Array storing all game objects
// PLAYER VARIABLES
let playerInit = {                      // Player object
    x: width / 4,                   // Player position: X
    y: height / 2,                  //                : Y
    width: 200,                     // Player dimensions: width
    height: 200,                    //                  : height
    velX: 0,                        // Player velocity: X
    velY: 0,                        //                : Y
    health: 3,
    facing: "right",                // Indicates current facing
    isGrounded: false,
    isShooting: false,
    isAnimating: true,
    sprite: "",
    startTimeMS: 0,
    frameX: 0,
    frameXMax: 2,
    frameY: 0,
    frameYMax: 2,
    frame: 0,
    frameMax: 7,
    shotTimer: 0,
    shootTimerMax: 20,
    tag: "player",
    spriteWidth: 199,
    spriteHeight: 188,
    frameTimer: 0.05,
    frameTimeMax: 0.065
};
var maxShotTime = 50;
var bullet = {
    x: 0,
    y: 0,
    velX: 0,
    velY: 0,
    width: 42,
    height: 31,
    speed: 20,
    spriteWidth: 42,
    spriteHeight: 31,
    startTimeMS: 0,
    frameX: 0,
    frameXMax: 1,
    frameY: 0,
    frameYMax: 1,
    frame: 0,
    frameMax: 3,
    frameTimer: 0.05,
    frameTimeMax: 0.065
}
var bulletImg = new Image();
var enemies = [];
var playerBullets = [];
var enemyBullets = [];
let player = Object.assign({}, playerInit);
var friction = 0.8;                 // Rate at which velocity decreases
var score = 0;
// -Animation
//var startTimeMS = 0;
//var frameX = 0;
//var frameXMax = 2;
//var frameY = 0;
//var frameYMax = 2;
//var frame = 0;
//var frameMax = 7;
//var frameTimer = 0.05;
//var frameTimeMax = 0.065;
// -Sprite
var spriteWidth = 199;
var spriteHeight = 188;
var playerImg = new Image();
var speed = 4;

var globalX = 0;                // Player global position


var imgCrate = new Image();
var boxes = [];


// Run setup when loaded
window.addEventListener("load", function () {
    if (DetectMobile())
        mobilePlatform = true;
    Initialise();
    Update();
});



// Set keydown
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

// Set keyup
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

function DetectMobile() {
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    }
    else {
        return false;
    }
}

// Compares keyboard states and returns true only once on key down
function KeyDown(keycode) {
    if (keys[keycode] && keys[keycode] != previousKeys[keycode])
        return true;
    else
        return false;
}
// Compares keyboard states and returns true only once on key up
function KeyUp(keycode) {
    if (!keys[keycode] && keys[keycode] != previousKeys[keycode])
        return true;
    else
        return false;
}

function SetPlayerSprite(sprite) {
    playerImg.src = "assets/player/" + sprite + ".png";
    player.sprite = sprite;
    player.frameX = 0;
    player.frameY = 0;
    player.frame = 0;
    player.tag = "player";

    if (sprite == "runRight" || sprite == "runLeft") {
        player.frameMax = 7;
        player.frameXMax = 2;
        player.frameYMax = 2;
    }
    else if (sprite == "idleLeft" || sprite == "idleRight") {
        player.frameMax = 3;
        player.frameXMax = 1;
        player.frameYMax = 1;
    }
    else if (sprite == "runShootRight" || sprite == "runShootLeft") {
        player.frameMax = 7;
        player.frameXMax = 2;
        player.frameYMax = 2;
    }
    else if (sprite == "shootRight" || sprite == "shootLeft") {
        player.frameMax = 0;
        player.frameXMax = 0;
        player.frameYMax = 0;
    }
}


function Initialise() {

    // Load images from file
    backgroundImg.src = "skyline-a.png";
    backgroundImg2.src = "skyline-b.png";
    midgroundImg.src = "midground.png";
    foregroundImg.src = "foreground.png";

    bulletImg.src = "assets/player/bullet.png";

    imgCrate.src = "RTS_Crate_0.png";
    SetPlayerSprite("runRight");

    // Parallax: Background
    for (var i = 0; i < 7; i++) {
        backgroundScroll.push({
            x: i * (469 * screenScale),
            y: 0,
            image: backgroundImg
        });
    }
    // Parallax: Midground
    for (var i = 0; i < 7; i++) {
        midgroundScroll.push({
            x: i * (469 * screenScale),
            y: 0,
            image: midgroundImg
        });
    }
    // Parallax: Foreground
    for (var i = 0; i < 7; i++) {
        foregroundScroll.push({
            x: i * (986 * screenScale),
            y: 0,
            image: foregroundImg
        });
    }

    //for (var i = 0; i < backgroundScroll.length; i++) {
    //    objects.push(backgroundScroll[i]);
    //}

    console.log("window: " + window.innerHeight + " img: " + backgroundImg.height);

    // Initialise menu options length to number of splash screen options
    menuOptions.length = numOptions[0];

    globalX = player.x;
    console.log("player pos" + globalX);

    boxes.push({
        x: 120,
        y: 120,
        width: 200,
        height: 200,
        velX: 0,
        velY: 0,
        tag: "box"
    });
    boxes.push({
        x: 500,
        y: 300,
        width: 200,
        height: 200,
        velX: 0,
        velY: 0,
        tag: "box"
    });

    // Add all boxes to objects array
    for (var i = 0; i < boxes.length; i++) {
        objects.push(boxes[i]);
    }
    objects.push(player);


    DrawUI();
}

function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),     // Distance between objects on the X-axis
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),   // Distance between objects on the Y-axis
        // Add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),                          // Sum of the half widths of both shapes    (minimum distance before collision)
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),                       // Sum of the half heights of both shapes   (minimum distance before collision)
        colDir = null;

    // If the distance between the objects is less than the minimum distance before collision on either axis, then a collision has occurred
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // Figures out on which side we are colliding (top, bottom, left or right)
        var oX = hWidths - Math.abs(vX),     // How far the objects are colliding within each other on X-axis        (overlap on X-axis)
            oY = hHeights - Math.abs(vY);    // How far the objects are colliding within each other on the Y-axis    (overlap on Y-axis)

        if (oX >= oY) {             // Check if the object overlap is greater on the X-axis         (Collision more likely in direction with less overlap)
            if (vY > 0) {           // Check if object A is above object B
                colDir = "t";       // Set collision direction as Top
                shapeA.y += oY;     // Offset object A away from object B up by the Y-overlap
            } else {
                colDir = "b";       // Set collision direction as Bottom
                shapeA.y -= oY;     // Offset object A away from object B down by the Y-overlap
            }
        } else {                    // ELSE if the object overlap is greater on the Y-axis
            if (vX > 0) {           // Check if object A is to the right of object B
                colDir = "l";       // Set collision direction as Left
                shapeA.x += oX;     // Offset object A away from object B left by the X-overlap
            } else {
                colDir = "r";       // Set collision direction as Right
                shapeA.x -= oX;     // Offset object A away from object B right by the overlap
            }
        }
    }

    return colDir;                  // Return the collision direction
}

function AnimationFrame(object) {
    var elapsed = (Date.now() - object.startTimeMS) / 1000;
    object.startTimeMS = Date.now();

    //only update frames when timer is below 0
    object.frameTimer = object.frameTimer - elapsed;
    if (object.frameTimer <= 0) {
        object.frameTimer = object.frameTimeMax;
        object.frameX++;
        if (object.frameX > object.frameXMax) {
            object.frameX = 0;
            object.frameY++;
            //end of row, move down to next row in sheet
            if (object.frameY > object.frameYMax) {
                object.frameY = 0;
            }
        }
        object.frame++;
        // Reset frames to 0 if empty spaces on sprite sheet
        if (object.frame > object.frameMax) {
            object.frame = 0;
            object.frameX = 0;
            object.frameY = 0;
        }
    }

}

function CalculateCollisions() {
    // Screen edge collision
    if (player.x <= 0)                           // Left edge
    {
        player.x = 0;
    }
    if (player.x > (width - player.width))      // Right edge
        player.x = (width - player.width);
    if (player.y < 0) {                         // Top edge
        player.y = 0;
        player.velY = 0;
    }
    if (player.y > (height - player.height * screenScale)) {  // Bottom edge
        player.y = (height - player.height * screenScale);
        player.velY = 0;
        player.isGrounded = true;
    }

    // Box collision
    for (var i = 0; i < boxes.length; i++) {
        var dir = colCheck(player, boxes[i]);
        if (dir === "l" || dir === "r") {
            player.velX = 0;
        } else if (dir === "t") {
            player.velY = 0;
        } else if (dir === "b") {
            player.velY = 0;
            player.isGrounded = true;
        }
    }
    // Player bullet collision
    for (var i = 0; i < playerBullets.length; i++) {
        for (var j = 0; j < enemies.length; j++) {
            var dir = colCheck(enemies[j], playerBullets[i]);
            if (dir != null)
                DestroyEnemy(j, i);
        }
    }
}

function DestroyEnemy(enemyIndex, bulletIndex) {
    enemies.splice(enemyIndex, 1);
    playerBullets.splice(bulletIndex, 1);
}

// Apply gravity to all objects stored in objects array
function ApplyGravity() {
    for (var i = 0; i < objects.length; i++) {
        objects[i].velY += 1;
        objects[i].y += objects[i].velY;
        objects[i].x -= scrollSpeed;
    }
}

function PlayerControl() {
    if (mobilePlatform) {                                       // Mobile Input Handler
        // TODO: Mobile input
    }
    else {                                                      // PC Input Handler
        if (keys[13]) {
            player.isShooting = true;
        }
        else
            player.isShooting = false;
        if (keys[83] && player.isGrounded) {                    // S: Down
            if (player.y < (canvas.height - player.height))
                player.velY += speed;
        }
        if (keys[87]) {                                         // W: Up

        }
        if (keys[68]) {                                         // D: Right
            if (player.isGrounded) {
                player.facing = "right";
                if (player.isShooting) {
                    if (player.sprite != "runShootRight")
                        SetPlayerSprite("runShootRight");
                }
                else if (player.sprite != "runRight")
                    SetPlayerSprite("runRight");
                if (player.x < (width) - player.width)
                    player.velX += speed;
                else
                    player.velX = 0;
            }
        }
        if (keys[65]) {                                         // A: Left
            if (player.isGrounded) {
                player.facing = "left";
                if (player.isShooting) {
                    if (player.sprite != "runShootLeft")
                        SetPlayerSprite("runShootLeft");
                }
                else if (player.sprite != "runLeft")
                    SetPlayerSprite("runLeft");
                if (player.x > 0)
                    player.velX -= speed;
                else
                    player.velX = 0;
            }
        }
        if (!keys[68] && !keys[65]) {
            if (player.isShooting) {
                if (player.isGrounded) {
                    if (player.x > 0) {
                        if (player.facing == "right") {
                            var sprite = "shootRight";
                            if (player.sprite != sprite) {
                                SetPlayerSprite(sprite);
                            }
                        }
                        else {
                            var sprite = "shootLeft"
                            if (player.sprite != sprite)
                                SetPlayerSprite(sprite);
                        }
                    }
                    else if (player.sprite != "runShootRight")
                        SetPlayerSprite("runShootRight");
                }
            }
            else {
                if (player.isGrounded)
                    if (player.x > 0) {
                        if (player.sprite != "idleRight") {
                            SetPlayerSprite("idleRight");
                            player.facing = "right";
                        }
                    }
                    else if (player.sprite != "runRight") {
                        SetPlayerSprite("runRight");
                        player.facing = "right";
                    }
            }
        }

        if (keys[32] && !previousKeys[32] && player.isGrounded) { // Space: Jump
            if (player.y > 0) {
                player.velY -= 30;
                player.isGrounded = false;
            }
        }
    }

    // Update player's x-position
    if (player.isGrounded)
        player.velX *= friction;

    player.x += player.velX;

    // TODO: Update the player's global X-position
    globalX += player.velX;
}

function Generate(object) {
    switch (object) {
        case "bullet":
            playerBullets.push(bullet);
            var bulletData = {
                y: player.y + (player.height / 3) * screenScale - (7 * screenScale),
                x: player.x + player.width - (65 * screenScale),
                frameX: bullet.frameX,
                frameY: bullet.frameY,
                frame: bullet.frame,
                velX: bullet.speed,
                width: bullet.width,
                height: bullet.height,
                spriteWidth: bullet.spriteWidth,
                spriteHeight: bullet.spriteHeight,
                startTimeMS: bullet.startTimeMS,
                frameXMax: bullet.frameXMax,
                frameYMax: bullet.frameYMax,
                frameMax: bullet.frameMax,
                frameTimer: bullet.frameTimer,
                frameTimeMax: bullet.frameTimeMax
            }
            playerBullets[playerBullets.length - 1] = Object.assign({}, bulletData);
            player.shootTimer = 0;
            player.shootTimer -= player.shootTimer;
            break;
        case "enemy":
            break;
        default:
            break;
    }
}

function GameInput() {
    if (KeyDown(27))
        ChangeState(2);
    if (KeyDown(13)) {
        Generate("bullet");
    }
    if (keys[13]) {
        if (player.shootTimer > player.shootTimerMax) {
            Generate("bullet");
        }

    }
        //playerBullets[playerBullets.length - 1].frameX = 0;
        //playerBullets[playerBullets.length - 1].frameY = 0;
        //playerBullets[playerBullets.length - 1].frame = 0;
        //playerBullets[playerBullets.length - 1].velX = 20;

        //playerBullets[playerBullets.length - 1].width = 42;
        //playerBullets[playerBullets.length - 1].height = 31;
        //playerBullets[playerBullets.length - 1].spriteWidth = 42;
        //playerBullets[playerBullets.length - 1].spriteHeight = 31;
        //playerBullets[playerBullets.length - 1].startTimeMS = 0;

        //playerBullets[playerBullets.length - 1].frameXMax = 1;

        //playerBullets[playerBullets.length - 1].frameYMax = 1;

        //playerBullets[playerBullets.length - 1].frameMax = 3;
        //playerBullets[playerBullets.length - 1].frameTimer = 0.05;
        //playerBullets[playerBullets.length - 1].frameTimeMax = 0.065;

        //console.log(playerBullets.length);
        //console.log("x: " + playerBullets[playerBullets.length - 1].x + " y: " + playerBullets[playerBullets.length - 1].y);

        console.log(playerBullets[playerBullets.length - 1]);
        console.log(playerBullets.length);

        //playerBullets[playerBullets.length - 1].velX= 0;
        //playerBullets[playerBullets.length - 1].velY = 0;
        //playerBullets[playerBullets.length - 1].width= 42;
        //playerBullets[playerBullets.length - 1].height = 31;
        //playerBullets[playerBullets.length - 1].spriteWidth = 42;
        //playerBullets[playerBullets.length - 1].spriteHeight = 31;
        //playerBullets[playerBullets.length - 1].startTimeMS = 0;
        //playerBullets[playerBullets.length - 1].frameYMax = 1;
        //playerBullets[playerBullets.length - 1].frameMax = 3;
        //playerBullets[playerBullets.length - 1].frameTimer = 0.05;
        //playerBullets[playerBullets.length - 1].frameTimeMax = 0.065;
    
}

function ResetLevel() {
    player.x = playerInit.x;
    player.y = playerInit.y;
    player.velX = playerInit.velX;
    player.velY = playerInit.velY;
    player.facing = playerInit.facing;
    player.isGrounded = playerInit.isGrounded;
    player.isShooting = playerInit.isShooting;
    if (player.facing == "right")
        SetPlayerSprite("runRight");
    else
        SetPlayerSprite("runLeft");
    score = 0;
}

function PauseInput() {
    if (KeyDown(27))                        // Esc
        ChangeState(2);
    if (KeyDown(13))                        // Enter
    switch (selected) {
        case 0:                             // RESUME
            ChangeState(1);
            break;
        case 1:                             // RETRY
            // TODO: Reset level
            ResetLevel();
            ChangeState(1);
            break;
        case 2:                             // OPTIONS
            // TODO: Options
            break;
        case 3:                             // RETURN TO MENU
            // TODO: Return to menu
            ResetLevel();
            ChangeState(0);
            break;
        default:
            break;
    }
}

function ProcessInput() {
    switch (currentGameState) {
        case GAMESTATES[0]:                 // Splash screen
            SplashInput();
            MenuNavigation();
            break;
        case GAMESTATES[1]:                 // Game screen
            GameInput();
            PlayerControl();
            break;
        case GAMESTATES[2]:                 // Pause screen
            PauseInput();
            MenuNavigation();
            break;
        case GAMESTATES[3]:                 // Game over screen
            // TODO: GameOver input
            break;
        default:
            break;
    }

    if (KeyDown(46))
        debugActive = !debugActive;

    if (debugActive)
        StateControl();
}

function MenuNavigation() {
    if (KeyDown(40)) {
        if (selected + 1 >= menuOptions.length) {
            selected = 0;
            counter = 0;
        }
        else {
            selected++;
            counter = 0;
        }
    }
    if (KeyDown(38)) {
        if (selected - 1 < 0) {
            selected = menuOptions.length - 1;
            counter = 0;
        }
        else {
            selected--;
            counter = 0;
        }
    }
}

function StateControl() {
    if (KeyDown(49)) {                                 // Splash
        selected = 0;
        menuOptions.length = 3;
        currentGameState = GAMESTATES[0];
    }
    if (KeyDown(50)) {                                 // Game
        selected = 0;
        currentGameState = GAMESTATES[1];
    }
    if (KeyDown(51)) {                                 // Pause
        selected = 0;
        currentGameState = GAMESTATES[2];
    }
    if (KeyDown(52)) {                                // Game over
        selected = 0;
        currentGameState = GAMESTATES[3];
    }
}

function SplashInput() {
    // MENU SELECTION
    if (KeyDown(13)) {
        switch (selected) {
            case 0: // Play
                ChangeState(1);
                break;
            case 1: // Hiscores
                currentGameState[4];
                break;
            case 2:
                break;
            default:
                break;
        }
    }
}

function UpdateBullets() {
    for (var i = 0; i < playerBullets.length; i++) {
        playerBullets[i].x += playerBullets[i].velX;
        if (playerBullets[i].x > width)
            playerBullets.splice(i, 1);

    }
    if (playerBullets.length > 0)
        player.shootTimer++;
}

function UpdateObjects() {
    ApplyGravity();
    UpdateBullets();
}

function UpdateGame() {
    UpdateObjects();
    CalculateCollisions();
    ScrollBackground(scrollSpeed);
    DrawGame();
}

function ScrollBackground(scrollSpeed) {
    // Back plane
    for (var i = 0; i < backgroundScroll.length; i++) {
        backgroundScroll[i].x -= (scrollSpeed * 0.3);
        if (backgroundScroll[i].x <= (backgroundImg.width * screenScale * -1) - (500 * screenScale)) {
            backgroundScroll.splice(0, 1);
            if (backgroundIndex > 5) {
                backgroundScroll.push({
                    x: backgroundScroll[backgroundScroll.length - 1].x + backgroundImg.width * screenScale,
                    y: 0,
                    image: backgroundImg2
                });
                backgroundIndex -= backgroundIndex;
            }
            else {
                backgroundScroll.push({
                    x: backgroundScroll[backgroundScroll.length - 1].x + backgroundImg.width * screenScale,
                    y: 0,
                    image: backgroundImg
                });
            }
            backgroundIndex++;
        }
    }
    // Scroll middle plane
    for (var i = 0; i < midgroundScroll.length; i++) {
        midgroundScroll[i].x -= (scrollSpeed * 0.5);
        if (midgroundScroll[i].x <= (midgroundImg.width * screenScale * -1) - (500 * screenScale)) {
            midgroundScroll.splice(0, 1);
            midgroundScroll.push({
                x: midgroundScroll[midgroundScroll.length - 1].x + midgroundImg.width * screenScale,
                y: 0,
                image: midgroundImg
            });
        }
    }
    // Scroll near plane
    for (var i = 0; i < foregroundScroll.length; i++) {
        foregroundScroll[i].x -= scrollSpeed * 0.75;
        if (foregroundScroll[i].x <= (foregroundImg.width * screenScale * -1) - (1000 * screenScale)) {
            foregroundScroll.splice(0, 1);
            foregroundScroll.push({
                x: foregroundScroll[foregroundScroll.length - 1].x + foregroundImg.width * screenScale,
                y: 0,
                image: foregroundImg
            });
        }
    }
}

function Update() {
    ProcessInput();
    var logoMult = Math.sin(counter) / pulseExtent + 0.5;
    counter += increase;
    // Determine state to update
    switch (currentGameState) {
        case GAMESTATES[0]:                 // Splash
            DrawSplash(logoMult);
            break;
        case GAMESTATES[1]:                 // Game
            UpdateGame();
            break;
        case GAMESTATES[2]:                 // Pause
            DrawPause(logoMult);
            break;
        case GAMESTATES[3]:                 // Game over
            DrawGameOver();
            break;
        default:
            break;
    }

    previousKeys = keys.slice(0);   // Store current keystate to compare next frame
    requestAnimationFrame(Update);  // Request animation frame update
}

function DrawGame() {
    DrawBackground();
    DrawCanvas();
    DrawUI();
}

function AnimateMenuSplash(logoMult) {

}

function DrawMenuText(text, sizeSelected, sizeUnselected, pos, spacing, fillCol, strokeColInner, strokeColOuter, shadowCol, strokeWidthInner, strokeWidthOuter, align, baseline, selectID, logoMult) {
    if (selected == selectID) {
        DrawText(text, (sizeSelected * logoMult), [pos[0] + (10 * screenScale), pos[1] + (spacing * screenScale) + (10 * screenScale)], shadowCol, shadowCol, strokeWidthOuter, align, baseline);  // Shadow
        DrawText(text, (sizeSelected * logoMult), [pos[0], pos[1] + (spacing * screenScale)], fillCol, strokeColOuter, strokeWidthOuter, align, baseline);              // Outer
        DrawText(text, (sizeSelected * logoMult), [pos[0], pos[1] + (spacing * screenScale)], fillCol, strokeColInner, strokeWidthInner, align, baseline);              // Inner
    }
    else {
        DrawText(text, (sizeUnselected), [pos[0] + (10 * screenScale), pos[1] + (spacing * screenScale) + (10 * screenScale)], shadowCol, shadowCol, strokeWidthOuter, align, baseline);  // Shadow
        DrawText(text, (sizeUnselected), [pos[0], pos[1] + (spacing * screenScale)], fillCol, strokeColOuter, strokeWidthOuter, align, baseline);              // Outer
        DrawText(text, (sizeUnselected), [pos[0], pos[1] + (spacing * screenScale)], fillCol, strokeColInner, strokeWidthInner, align, baseline);              // Inner
    }
}

function ChangeState(state) {
    switch (state) {
        case 0:
            isAnimating = false;
            break;
        case 1:
            isAnimating = true;
            break;
        case 2:
            isAnimating = false;
            break;
        case 3:
            isAnimating = false;
            break;
        case 4:
            isAnimating = false;
            break;
        default:
            break;
    }
    selected = 0;
    counter = 0;
    menuOptions.length = numOptions[state];
    currentGameState = GAMESTATES[state];
}

//function AnimateMenuOptions() {
//    var logoMult = Math.sin(counter) / pulseExtent + 0.5;
//    counter += increase;

//    switch (currentGameState) {
//        case GAMESTATES[0]:         // Splash
//            AnimateMenuSplash(logoMult);
//            break;
//        case GAMESTATES[1]:         // Game
//            break;
//        case GAMESTATES[2]:         // Pause
//            break;
//        case GAMESTATES[3]:
//            break;
//        default:
//            break;
//    }
//}

function DrawSplash(logoMult) {
    
    UICtx.clearRect(0, 0, width, height);
    backgroundCtx.clearRect(0, 0, width, height);
    backgroundCtx.fillStyle = 'rgba(100, 100, 100)';
    backgroundCtx.fillRect(50, 50, width - 100, height - 100);
    foregroundCtx.clearRect(0, 0, width, height);
    DrawText("TEST", 150, [width / 2, 100], "white", "black", 35, "center", "top");
    DrawMenuText("PLAY", 150, 65, splashPos, 0, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
    DrawMenuText("INSTRUCTIONS", 150, 65, splashPos, 100, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 1, logoMult);
    DrawMenuText("HISCORES", 150, 65, splashPos, 200, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 2, logoMult);
}

function DrawGameOver() {
    backgroundCtx.clearRect(0, 0, width, height);
}

function DrawPause(logoMult) {
    UICtx.clearRect(0, 0, width, height);
    DrawBackground();
    DrawCanvas();
    backgroundCtx.fillStyle = 'rgba(75,75,150,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);
    foregroundCtx.fillStyle = 'rgba(75,75,150,0.3)';
    foregroundCtx.fillRect(0, 0, width, height);
    var pausePos = [width / 2, 75 * screenScale];
    DrawText("PAUSED", 100, pausePos, "white", "black", 35, "center", "top");
    DrawMenuText("RESUME", 150, 65, splashPos, 0, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
    DrawMenuText("RESET", 150, 65, splashPos, 100, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 1, logoMult);
    DrawMenuText("OPTIONS", 150, 65, splashPos, 200, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 2, logoMult);
    DrawMenuText("EXIT", 150, 65, splashPos, 300, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 3, logoMult);
}

function DrawBackground() {
    backgroundCtx.clearRect(0, 0, width, height);
    // Parallax: Back plane
    for (var i = 0; i < backgroundScroll.length; i++) {
        backgroundCtx.drawImage(backgroundScroll[i].image, backgroundScroll[i].x, 0, backgroundImg.width * screenScale, backgroundImg.height * screenScale);
    }
    // Parallax: Mid plane
    for (var i = 0; i < midgroundScroll.length; i++) {
        backgroundCtx.drawImage(midgroundScroll[i].image, midgroundScroll[i].x, 0, midgroundImg.width * screenScale, midgroundImg.height * screenScale);
    }
    // Parallax: Close plane
    for (var i = 0; i < foregroundScroll.length; i++) {
        backgroundCtx.drawImage(foregroundScroll[i].image, foregroundScroll[i].x, 0, foregroundImg.width * screenScale, foregroundImg.height * screenScale);
    }
}

function DrawCanvas() {
    foregroundCtx.clearRect(0, 0, width, height);

    for (var i = 0; i < boxes.length; i++) {
        // Draw the boxes to the background
        backgroundCtx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        backgroundCtx.drawImage(imgCrate, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
    }

    // Draw player
    if (isAnimating) {
        AnimationFrame(player);
        for (var i = 0; i < playerBullets.length; i++) {
            AnimationFrame(playerBullets[i]);
            foregroundCtx.drawImage(bulletImg, playerBullets[i].spriteWidth * playerBullets[i].frameX, playerBullets[i].spriteHeight * playerBullets[i].frameY, playerBullets[i].spriteWidth, playerBullets[i].spriteHeight, playerBullets[i].x, playerBullets[i].y, playerBullets[i].width * screenScale, playerBullets[i].height * screenScale);
        }
    }
    foregroundCtx.drawImage(playerImg, player.spriteWidth * player.frameX, player.spriteHeight * player.frameY, player.spriteWidth, player.spriteHeight, player.x, player.y, player.width * screenScale, player.height * screenScale);
}

function DrawUI() {
    UICtx.clearRect(0, 0, width, height);
    var text = "Score: " + score;
    DrawText(text, 30 * screenScale, [25, 25], "white", "black", 8, "left", "top");
}

function DrawText(text, size, pos, fillCol, strokeCol, strokeWidth, align, baseline) {
    //UICtx.clearRect(0, 0, width, height);
    UICtx.font = '' + (size * screenScale) + 'px "Joystix"';
    UICtx.textAlign = align;
    UICtx.strokeStyle = strokeCol;
    UICtx.lineWidth = strokeWidth * screenScale;
    UICtx.textBaseline = baseline;
    UICtx.strokeText(text, pos[0], pos[1]);
    UICtx.fillStyle = fillCol;
    UICtx.textBaseline = baseline;
    UICtx.fillText(text, pos[0], pos[1]);

}