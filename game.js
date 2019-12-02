var debugActive = true;

var titleImg = new Image();
var BGM = new Audio("assets/sfx/title.mp3");
BGM.loop = true;
BGM.autoplay = true;
var menuMove = new Audio("assets/sfx/blip1.mp3");
var menuSelect = new Audio("assets/sfx/blip2.mp3")
var lasersfx = new Audio("assets/sfx/laser.ogg")
var explosionsfx = new Audio("assets/sfx/explosion.mp3")
var levelUpsfx = new Audio("assets/sfx/levelUp.mp3")
var hitsfx = new Audio("assets/sfx/hit.mp3")


var GAMESTATES = ["Splash", "Game", "Pause", "GameOver", "Hiscore", "Instructions"];    // Store the available gamestates
var currentGameState = GAMESTATES[0];                                   // Store and assign the currently selected gamestate
var level = 1;
var levelUpScore = 200;
var levelIncrement = 400;

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
var numOptions = [3, 0, 4, 2, 1, 1];                       // Specify number of menu options available for each game state



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
// DEFAULT SPRITE DATA
var sprite = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    velX: 0,
    velY: 0,
    sprite: "",
    spriteWidth: 0,
    spriteHeight: 0,
    isAnimating: true,
    startTimeMS: 0,
    frameX: 0,
    frameXMax: 0,
    frameY: 0,
    frameYMax: 0,
    frame: 0,
    frameMax: 0,
    spriteWidth: 0,
    spriteHeight: 0,
    frameTimer: 0.05,
    frameTimeMax: 0.065,
    tag: ""
};

// PLAYER DATA
var playerInit = {
    x: width / 4,                   // Player position: X
    y: height - 282 * screenScale,                  //                : Y
    width: 200,                     // Player dimensions: width
    height: 200,                    //                  : height
    moveSpeed: 4,
    jumpForce: 25,
    health: 3,
    healthMax: 3,
    facing: "right",                // Indicates current facing
    isGrounded: false,
    isShooting: false,
    isAnimating: true,
    isImmune: false,
    isHurt: false,
    hurtTimer: 0,
    hurtTimerMax: 35,
    immuneTimer: 0,
    immuneTimerMax: 150,
    frameXMax: 2,
    frameYMax: 2,
    frameMax: 7,
    shootTimerMax: 20,
    tag: "player",
    spriteWidth: 199,
    spriteHeight: 188,

};
var player = Object.assign({}, sprite, playerInit);

// ENEMY DATA
var enemyData = {
    width: 102,
    height: 144,
    health: 3,
    frameXMax: 0,
    frameYMax: 0,
    frameMax: 0,
    tag: "enemy",
    spriteWidth: 102,
    spriteHeight: 144,
    active: true,
    isExploding: false
};
var enemy = Object.assign({}, sprite, enemyData);
var enemies = [];
var enemySpawnTimer = 0;
var enemySpawnTimerMax = 50;

// BULLET DATA
var bullet = {
    width: 42,
    height: 31,
    speed: 20,
    spriteWidth: 42,
    spriteHeight: 31,
    frameXMax: 1,
    frameYMax: 1,
    frameMax: 3,
    active: true
}
bullet = Object.assign({}, sprite, bullet);
var playerBullets = [];
var enemyBullets = [];

// Rate at which velocity decreases
var groundFriction = 0.8;                 
var airFriction = 0.85;

var score = 0;
var scoreIncrement = 100;

// -Sprite
var playerImg = new Image();
var enemyImg = new Image();
var bulletImg = new Image();
var heartImg = new Image();
var explosionImg = new Image();

var groundHeight = height - (282 * screenScale);
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
    else if (sprite == "jumpLeft" || sprite == "jumpRight") {
        player.frameMax = 2;
        player.frameXMax = 1;
        player.frameYMax = 1;
    }
    else if (sprite == "jumpShootLeft" || sprite == "jumpShootRight") {
        player.frameMax = 0;
        player.frameXMax = 0;
        player.frameYMax = 0;
    }
}

function SetEnemySprite(i) {
    enemies[i].sprite = explosionImg;
    enemies[i].frameXMax = 2;
    enemies[i].frameYMax = 1;
    enemies[i].frameMax = 5;
    enemies[i].width = 152;
    enemies[i].height = 144;
    enemies[i].spriteWidth = 152;
    enemies[i].spriteHeight = 144;
    enemies[i].isExploding = true;
}


function Initialise() {
    // Load music and SFX
    BGM.play();

    // Load images from file
    titleImg.src = "title.png";
    backgroundImg.src = "skyline-a.png";
    backgroundImg2.src = "skyline-b.png";
    midgroundImg.src = "midground.png";
    foregroundImg.src = "foreground.png";
    bulletImg.src = "assets/player/bullet.png";
    enemyImg.src = "assets/enemy/drone.png";
    explosionImg.src = "assets/enemy/explosion.png";
    imgCrate.src = "RTS_Crate_0.png";
    heartImg.src = "assets/UI/heart.png";
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

    // Initialise menu options length to number of splash screen options
    menuOptions.length = numOptions[0];


    //boxes.push({
    //    x: 120,
    //    y: 120,
    //    width: 200,
    //    height: 200,
    //    velX: 0,
    //    velY: 0,
    //    tag: "box"
    //});
    //boxes.push({
    //    x: 500,
    //    y: 300,
    //    width: 200,
    //    height: 200,
    //    velX: 0,
    //    velY: 0,
    //    tag: "box"
    //});

    // Add all boxes to objects array
    for (var i = 0; i < boxes.length; i++) {
        objects.push(boxes[i]);
    }
    objects.push(player);
    
    DrawUI();
}

function colCheck(shapeA, shapeB, isTrigger) {
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
                if (!isTrigger)
                    shapeA.y += oY;     // Offset object A away from object B up by the Y-overlap
            } else {
                colDir = "b";       // Set collision direction as Bottom
                if (!isTrigger)
                    shapeA.y -= oY;     // Offset object A away from object B down by the Y-overlap
            }
        } else {                    // ELSE if the object overlap is greater on the Y-axis
            if (vX > 0) {           // Check if object A is to the right of object B
                colDir = "l";       // Set collision direction as Left
                if (!isTrigger)
                    shapeA.x += oX;     // Offset object A away from object B left by the X-overlap
            } else {
                colDir = "r";       // Set collision direction as Right
                if (!isTrigger)
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
    if (player.y > (height - 282 * screenScale)) {  // Bottom edge
        player.y = (height - 282 * screenScale);
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
        var dir = null;
        var enemyIndex;
        for (var j = 0; j < enemies.length; j++) {
            if (enemies[j] != null && playerBullets[i] != null && !enemies[j].isExploding) {
                dir = colCheck(enemies[j], playerBullets[i], true);
            }
            if (dir != null) {                                      // Set hit enemies as inactive
                explosionsfx.currentTime = 0;
                explosionsfx.play();
                SetEnemySprite(j);
                playerBullets[i].active = false;
                score += scoreIncrement;
                if (score > levelUpScore) {
                    level++;
                    levelUpScore += (levelIncrement * level);
                    levelUpsfx.currentTime = 0;
                    levelUpsfx.play();
                    if (player.health < player.healthMax)
                        player.health++;
                }
            }
        }
    }

    for (var i = 0; i < enemies.length; i++) {
        if (!enemies[i].isExploding) {
            var dir = null;
            dir = colCheck(player, enemies[i], true);
            if (dir != null) {
                if (!player.isImmune) {
                    player.health--;
                    if (player.health <= 0)
                        ChangeState(3);
                    player.isImmune = true;
                    player.isHurt = true;
                    hitsfx.play();
                }
            }
        }
    }

    // Remove inactive enemies and bullets
    for (var i = 0; i < playerBullets.length; i++) {
        if (!playerBullets[i].active)
            playerBullets.splice(i, 1);
    }
    for (var i = 0; i < enemies.length; i++) {
        if (!enemies[i].active) {
            enemies.splice(i, 1);
        }
    }
}

//function DestroyEnemy(enemyIndex, bulletIndex) {
//    playerBullets.splice(bulletIndex, 1);
//    enemies.splice(enemyIndex, 1);
//}

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
            //if (player.y < (canvas.height - player.height))

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
            }
            if (player.x < (width) - player.width)
                player.velX += player.moveSpeed;
            else
                player.velX = 0;
        }
        if (keys[65]) {                                         // A: Left
            if (player.isGrounded) {
                player.facing = "left";
                //if (player.isShooting) {
                //    if (player.sprite != "runShootLeft")
                //        SetPlayerSprite("runShootLeft");
                //}
                //else
                    if (player.sprite != "runLeft")
                    SetPlayerSprite("runLeft");
            }
            if (player.x > 0)
                player.velX -= player.moveSpeed;
            else
                player.velX = 0;
        }
        if (!keys[68] && !keys[65]) {
            if (player.isShooting) {
                if (player.isGrounded) {
                    if (player.x > 0) {
                        player.facing = "right";
                        if (player.facing == "right") {
                            var sprite = "shootRight";
                            if (player.sprite != sprite) {
                                SetPlayerSprite(sprite);
                            }
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

        if (!player.isGrounded) {
            if (player.facing == "right") {
                if (!player.isShooting) {
                    if (player.sprite != "jumpRight")
                        SetPlayerSprite("jumpRight");
                }
                else {
                    if (player.sprite != "jumpShootRight")
                        SetPlayerSprite("jumpShootRight");
                }
            }
            else {
                if (!player.isShooting) {
                    if (player.sprite != "jumpLeft")
                        SetPlayerSprite("jumpLeft");
                }
                else {
                    if (player.sprite != "jumpShootLeft")
                        SetPlayerSprite("jumpShootLeft");
                }
            }

        }        

        if (keys[32] && !previousKeys[32] && player.isGrounded) { // Space: Jump
            if (player.y > 0) {
                player.velY -= player.jumpForce;
                player.isGrounded = false;
            }
        }

        if (player.isHurt) {
            player.velX = 0;
            player.velY = 0;
            player.facing = "right";
            if (player.sprite != "hurt")
                SetPlayerSprite("hurt");
        }
    }

    // Update player's x-position
    if (player.isGrounded)
        player.velX *= groundFriction;
    else
        player.velX *= airFriction;

    player.x += player.velX;
}

function Generate(object) {
    switch (object) {
        case "bullet":
            playerBullets.push(bullet);
            var bulletData = {
                x: player.x + player.width - (65 * screenScale),
                y: player.y + (player.height / 3) * screenScale - (7 * screenScale),
            }
            playerBullets[playerBullets.length - 1] = Object.assign({}, bullet, bulletData);
            player.shootTimer = 0;
            break;
        case "enemy":
            var tempEnemy;
            var enemyData = {
                x: width * screenScale,
                y: groundHeight + 50 * screenScale - ((Math.random() * 300) * screenScale),
                speed: Math.floor(Math.random() * 5) + scrollSpeed + level,
                sprite: enemyImg
            }
            tempEnemy = Object.assign({}, enemy, enemyData);
            enemies.push(tempEnemy);
            break;
        default:
            break;
    }
}

function GameInput() {
    console.log(player.x + " " + player.isGrounded);
    if (KeyDown(27)) {
        menuMove.currentTime = 0;
        menuMove.play();
        ChangeState(2);
    }
    if (KeyDown(13)) {
        if (!player.isHurt) {
            lasersfx.currentTime = 0;
            lasersfx.play();
            Generate("bullet");
        }
    }
    if (keys[13] && player.facing != "left") {
        if (player.shootTimer > player.shootTimerMax) {
            if (!player.isHurt) {
                lasersfx.currentTime = 0;
                lasersfx.play();
                Generate("bullet");
            }
        }
    }
}

function ResetLevel() {
    player.x = Object.assign(playerInit.x);
    player.y = (height - 282 * screenScale);
    player.isImmune = false;
    player.health = Object.assign(playerInit.healthMax);
    score = 0;
    enemies.length = 0;
    playerBullets.length = 0;
    level = 1;
    levelUpScore = 200;
    enemySpawnTimerMax = 50;
    player.isHurt = false;
    player.hurtTimer = 0;
}

function PauseInput() {
    if (KeyDown(27))                        // Esc
        ChangeState(2);
    if (KeyDown(13)) {                 // Enter
        menuSelect.currentTime = 0;
        menuSelect.play();
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
            GameOverInput();
            MenuNavigation();
            // TODO: GameOver input
            break;
        case GAMESTATES[4]:
            // TODO: Hiscore input
            break;
        case GAMESTATES[5]:
            InstructionInput();
            MenuNavigation();
        default:
            break;
    }

    if (KeyDown(46))
        debugActive = !debugActive;

    if (debugActive)
        StateControl();
}

function GameOverInput() {
    if (KeyDown(27))                        // Esc
        ChangeState(0);
    if (KeyDown(13)) {                     // Enter
        menuSelect.currentTime = 0;
        menuSelect.play();
        switch (selected) {
            case 0:                             // RETRY
                ResetLevel();
                ChangeState(1);
                break;
            case 1:                             // EXIT
                // TODO: Reset level
                ResetLevel();
                ChangeState(0);
                break;
            default:
                break;
        }
    }
}

function MenuNavigation() {
    if (KeyDown(40)) {  // Down arrow
        menuMove.currentTime = 0;
        menuMove.play();

        if (selected + 1 >= menuOptions.length) {
            selected = 0;
            counter = 0;
        }
        else {
            selected++;
            counter = 0;
        }
    }

    if (KeyDown(38)) {  // Up arrow
        menuMove.currentTime = 0;
        menuMove.play();
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

function InstructionInput() {
    if (KeyDown(13)) {
        menuSelect.currentTime = 0;
        menuSelect.play();
        ChangeState(0);
    }
}

function SplashInput() {
    // MENU SELECTION
    if (KeyDown(13)) {
        menuSelect.currentTime = 0;
        menuSelect.play();
        switch (selected) {
            case 0: // Play
                BGM.play();
                ChangeState(1);
                break;
            case 1: // Instructions
                ChangeState(5);
                break;
            case 2: // Hiscores
                //ChangeState(4);
                break;
            default:
                break;
        }
    }
}

function DrawInstructions(logoMult) {
    backgroundCtx.clearRect(0, 0, width, height);
    foregroundCtx.clearRect(0, 0, width, height);
    UICtx.clearRect(0, 0, width, height);
    DrawBackground();
    backgroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);
    var titlePos = [width / 2, 75 * screenScale];
    DrawText("INSTRUCTIONS", 100, titlePos, "white", "black", 35, "center", "top");
    var instructPos = [width / 2, 300 * screenScale];
    var textOffset = 65;
    DrawText("Move left/right: A / D", 35, instructPos, "white", "black", 15, "center", "top");
    DrawText("Jump: SPACE", 35, [instructPos[0], instructPos[1] + textOffset], "white", "black", 15, "center", "top");
    DrawText("Shoot: RETURN", 35, [instructPos[0], instructPos[1] + textOffset * 2], "white", "black", 15, "center", "top");
    DrawText("Pause: ESC", 35, [instructPos[0], instructPos[1] + textOffset * 3], "white", "black", 15, "center", "top");
    DrawMenuText("RETURN", 150, 65, [width / 2, height - 200 * screenScale], 75, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
}

function UpdateBullets() {
    for (var i = 0; i < playerBullets.length; i++) {
        playerBullets[i].x += playerBullets[i].speed;
        if (playerBullets[i].x > width)
            playerBullets.splice(i, 1);

    }
    if (keys[13])
        player.shootTimer++;
}

function UpdateEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        if (!enemies[i].isExploding)
            enemies[i].x -= enemies[i].speed;
        else
            enemies[i].x -= scrollSpeed;
        if (enemies[i].x < (enemies[i].spriteWidth * screenScale) * -1)
            enemies.splice(i, 1);
        if (enemies[i].isExploding)
            if (enemies[i].frame >= enemies[i].frameMax)
                enemies[i].active = false;
    }
}

function UpdateObjects() {
    ApplyGravity();
    UpdateBullets();
    UpdateEnemies();
    enemySpawnTimer++;
    if (enemySpawnTimer > enemySpawnTimerMax) {
        var rnd = Math.random() * 100;
        if (rnd < (5 + level * 2)) {                          
            Generate("enemy");                  // Spawn enemy at rate of 5% every frame after max timer reached (increasing with level progression)
            enemySpawnTimer = 0;
            enemySpawnTimerMax--;        // Speed up enemy spawn on level progression
        }

    }
    if (player.isImmune) {
        player.immuneTimer++;
        if (player.immuneTimer > player.immuneTimerMax) {
            player.isImmune = false;
            player.immuneTimer = 0;
        }
    }

    if (player.isHurt) {
        player.hurtTimer++;
        if (player.hurtTimer > player.hurtTimerMax) {
            player.isHurt = false;
            player.hurtTimer = 0;
        }
    }
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
            ScrollBackground(scrollSpeed);
            DrawSplash(logoMult);
            break;
        case GAMESTATES[1]:                 // Game
            UpdateGame();
            break;
        case GAMESTATES[2]:                 // Pause
            DrawPause(logoMult);
            break;
        case GAMESTATES[3]:                 // Game over
            DrawGameOver(logoMult);
            break;
        case GAMESTATES[4]:                 // Hiscores
            ScrollBackground(scrollSpeed);
            DrawHiscores(logoMult);
            break;
        case GAMESTATES[5]:                 // Instructions
            ScrollBackground(scrollSpeed);
            DrawInstructions(logoMult);
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

function DrawSplash(logoMult) {
    
    UICtx.clearRect(0, 0, width, height);
    UICtx.clearRect(0, 0, width, height);
    DrawBackground();
    foregroundCtx.clearRect(0, 0, width, height);
    //DrawText("TEST", 150, [width / 2, 100], "white", "black", 35, "center", "top");
    UICtx.drawImage(titleImg, width / 2 - (titleImg.width * screenScale) / 2, 100, titleImg.width * screenScale, titleImg.height * screenScale);
    DrawMenuText("PLAY", 150, 65, splashPos, 0, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
    DrawMenuText("INSTRUCTIONS", 150, 65, splashPos, 100, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 1, logoMult);
    DrawMenuText("HISCORES", 150, 65, splashPos, 200, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 2, logoMult);
}

function DrawGameOver(logoMult) {
    backgroundCtx.clearRect(0, 0, width, height);
    foregroundCtx.clearRect(0, 0, width, height);
    UICtx.clearRect(0, 0, width, height);
    DrawBackground();
    backgroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);
    var titlePos = [width / 2, 75 * screenScale];
    DrawText("GAME OVER", 100, titlePos, "white", "black", 35, "center", "top");
    var scorePos = [width / 2, 250 * screenScale];
    DrawText("Score: " + score, 75, scorePos, "white", "black", 35, "center", "top");
    DrawMenuText("RETRY", 150, 65, splashPos, 75, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
    DrawMenuText("EXIT", 150, 65, splashPos, 200, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 1, logoMult);
}

function DrawPause(logoMult) {
    UICtx.clearRect(0, 0, width, height);
    DrawBackground();
    DrawCanvas();
    backgroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);
    foregroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    foregroundCtx.fillRect(0, 0, width, height);
    var titlePos = [width / 2, 75 * screenScale];
    DrawText("PAUSED", 100, titlePos, "white", "black", 35, "center", "top");
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
        //backgroundCtx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        backgroundCtx.drawImage(imgCrate, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
    }

    // Animate sprites
    if (isAnimating) {
        AnimationFrame(player);
        for (var i = 0; i < playerBullets.length; i++) {
            AnimationFrame(playerBullets[i]);
        }
    }
    // Draw player
    foregroundCtx.drawImage(playerImg, player.spriteWidth * player.frameX, player.spriteHeight * player.frameY, player.spriteWidth, player.spriteHeight, player.x, player.y, player.width * screenScale, player.height * screenScale);
    // Draw bullets
    for (var i = 0; i < playerBullets.length; i++) {
        foregroundCtx.drawImage(bulletImg, playerBullets[i].spriteWidth * playerBullets[i].frameX, playerBullets[i].spriteHeight * playerBullets[i].frameY, playerBullets[i].spriteWidth, playerBullets[i].spriteHeight, playerBullets[i].x, playerBullets[i].y, playerBullets[i].width * screenScale, playerBullets[i].height * screenScale);
    }
    // Draw enemies
    for (var i = 0; i < enemies.length; i++) {
        if (isAnimating)
            AnimationFrame(enemies[i]);
        foregroundCtx.drawImage(enemies[i].sprite, enemies[i].spriteWidth * enemies[i].frameX, enemies[i].spriteHeight * enemies[i].frameY, enemies[i].spriteWidth, enemies[i].spriteHeight, enemies[i].x, enemies[i].y, enemies[i].width * screenScale, enemies[i].height * screenScale);
    }
}


function DrawUI() {
    UICtx.clearRect(0, 0, width, height);
    var text = "Score: " + score;
    DrawText(text, 30 * screenScale, [25 * screenScale, 25 * screenScale], "white", "black", 8, "left", "top");
    text = "Health: " + player.health;
    DrawText(text, 30 * screenScale, [25 * screenScale, 65 * screenScale], "white", "black", 8, "left", "top");
    for (var i = 0; i < player.healthMax; i++) {
        if (player.health-1 < i) {
            UICtx.globalAlpha = 0.2;
            UICtx.drawImage(heartImg, 25 * screenScale + (i * 60) * screenScale, 110 * screenScale, 50, 47);
        }
        else {
            UICtx.globalAlpha = 1;
            UICtx.drawImage(heartImg, 25 * screenScale + (i * 60) * screenScale, 110 * screenScale, 50, 47);
        }

        UICtx.globalAlpha = 1;
    }

    var textCol = "";
    if (level < 2)
        textCol = "DarkTurquoise";
    else if (level < 3)
        textCol = "Green";
    else if (level < 4)
        textCol = "Gold";
    else if (level < 5)
        textCol = "DarkOrange";
    else if (level < 6)
        textCol = "Crimson";
    else
        textCol = "DeepPink"

    if (level < 6)
        DrawMenuText("LEVEL " + level, 75, 75, [width / 2, 25 * screenScale], 0, textCol, "white", "black", "white", 10, 25, "center", "top", 0);
    else
        DrawMenuText("LEVEL MAX", 75, 75, [width / 2, 25 * screenScale], 0, textCol, "white", "black", "white", 10, 25, "center", "top", 0);
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