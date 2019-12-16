// Storage
var gameStorage = window.localStorage;  // Declare a local storage variable

// Framerate
var fps = 60;                           // Target FPS
var now;                                // Current time
var then = Date.now();                  // Previous time
var interval = 1000 / fps;              // Ms interval per fps
var delta;                              // Time delta

// Images
var titleImg = new Image();             // Splash title image
var charPort0 = new Image();            // Character select portraits:
var charPort1 = new Image();            //
var charPort2 = new Image();            //
var charPort0trans = new Image();       // Character select portraits: transparent:
var charPort1trans = new Image();       //
var charPort2trans = new Image();       //
// ---Sprites
var playerImg = new Image();            // Player
var enemyImg = new Image();             // Enemy
var bulletImg = new Image();            // Bullet
var heartImg = new Image();             // Player health indicator
var explosionImg = new Image();         // Enemy explosion
var p1Img = new Image();                // Powerup 1 image
var p2Img = new Image();                // Powerup 2 image
// ---Parallax background
var backgroundIndex = 0;                // Iterator for background scroll
var backgroundImg = new Image();        // Parallax background images:
var backgroundImg2 = new Image();       //
var midgroundImg = new Image();         //
var foregroundImg = new Image();        //
var highwayImg = new Image();           //
var treeImg = new Image();              //
var backgroundScroll = [];              // Background image scrolls:
var midgroundScroll = [];               //
var foregroundScroll = [];              //
var treesScroll = [];                   //
var highwayScroll = [];                 //
var scrollSpeed = 5;                    // Base screen scroll speed
var isAnimating = false;                // Define whether sprite animation is active

// Audio: music
var BGM = new Audio("assets/sfx/title.mp3");                    // Background music
BGM.loop = true;                                                // Set music to loop
BGM.autoplay = true;                                            // Autoplay on load
// Audio: SFX
var menuMove = new Audio("assets/sfx/blip1.mp3");               // Menu navigation
var menuSelect = new Audio("assets/sfx/blip2.mp3");             // Menu select
var lasersfx = new Audio("assets/sfx/laser.ogg");               // Laser shot
var explosionsfx = new Audio("assets/sfx/explosion.mp3");       // Explosion
var levelUpsfx = new Audio("assets/sfx/levelUp.mp3");           // Level up
var hitsfx = new Audio("assets/sfx/hit.mp3");                   // Player hit
var powerup1sfx = new Audio("assets/sfx/p1.mp3");               // Powerup collection

// Game states
var GAMESTATES = ["Splash", "Game", "Pause", "GameOver", "Hiscore", "Instructions", "CharSelect"];  // Store the available gamestates
var currentGameState = GAMESTATES[0];                                                               // Store and assign the currently selected gamestate
var menuOptions = [];                                                                               // Array to store the current number of menu options
var selected = 0;                                                                                   // Iterator to indicate current selected menu option
var numOptions = [3, 0, 3, 2, 1, 1, 3];                                                             // Specify number of menu options available for each game state

// Level and scoring
var level = 1;              // Current level
var levelUpScore = 200;     // Current score to level up
var levelIncrement = 400;   // Value levelUpScore increments by level
var score = 0;              // Current score
var scoreIncrement = 100;   // Score awarded per enemy defeated
var powerupBonus = 50;      // Score awarded on powerup collection
var hiscore = 0;            // Current hiscore
var defaultHiscore = 5000;  // Default hiscore if no hiscore saved to local storage
var newHiscore = false;     // Determine whether to display new hiscore text on gameover

// Update definition
var RequestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;    // Determine browser update function
window.requestAnimationFrame = RequestAnimationFrame;   // Store determined update function

// Window and Canvas layers
// ---Maximise window
var width = window.innerWidth;                          // Store the game window's maximised inner width
var height = window.innerHeight;                        // Store the game window's maximised inner height
var screenScale = screen.height / 950;                 // Multiplier to scale drawn elements by
// ---Get canvas layer and z-index
var background = document.getElementById("layer1");     // Absolute background
var canvas = document.getElementById("layer2");         // Foreground
var UI = document.getElementById("layer3");             // UI
// ---Obtain layer context
var backgroundCtx = background.getContext("2d");        // Background layer
var foregroundCtx = canvas.getContext("2d");            // Gameplay layer
var UICtx = UI.getContext("2d");                        // UI layer
// ---Set canvas dimensions to window size
backgroundCtx.canvas.width = width;                     // Background
backgroundCtx.canvas.height = height;                   //
foregroundCtx.canvas.width = width;                     // Foreground
foregroundCtx.canvas.height = height;                   //
UICtx.canvas.width = width;                             // UI
UICtx.canvas.height = height;                           //

// Menu values
var splashPos = [width / 2, height / 2];                // Set position for splash screen menu text
var counter = 0;                                        // Animation counter
var pulseSpeed = 1.5;                                   // Text pulse speed
var pulseExtent = 20;                                   // Set extent text pulses to
var increase = Math.PI * pulseSpeed / 100;              // Rate counter increases at



// Keystates
var keys = [];              // Current keystate
var previousKeys = [];      // Previous keystate

var objects = [];           // Array storing all game objects

// DEFAULT SPRITE DATA
var sprite = {
    x: 0,                   // X-position
    y: 0,                   // Y-position
    width: 0,               // Draw width
    height: 0,              // Draw height
    velX: 0,                // X-velocity
    velY: 0,                // Y-velocity
    prevVelX: 0,            // Previous x-velocity
    prevVelY: 0,            // Previous y-velocity
    sprite: "",             // Sprite name
    spriteWidth: 0,         // Sprite source width
    spriteHeight: 0,        // Sprite source height
    isAnimating: true,      // Determine animation state
    startTimeMS: 0,         // Current time to determine animation speed
    frame: 0,               // Current frame number
    frameX: 0,              // Current spritesheet x-position
    frameY: 0,              // Current spritesheet y-position
    frameMax: 0,            // Max no. spritesheet positions
    frameXMax: 0,           // Max no. spritesheet positions on x-axis
    frameYMax: 0,           // Max no. spritesheet positions on y-axis
    frameTimer: 0.05,       // Current frame time
    frameTimeMax: 0.065,    // Max time to increment sprite
    tag: ""                 // Object tag
};

// Sprite class
class Sprite {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.velX = 0;
        this.velY = 0;
        this.img;
        this.spriteWidth = 0;
        this.spriteHeight = 0;
        this.width = 0;
        this.height = 0;
        this.tag = "";
    }
}

// DEFAULT PLAYER DATA
var playerInit = {
    characterIndex: 0,              // Determine player character
    x: width / 4,                   // Player x-position
    y: height - 282 * screenScale,  // Player y-position
    width: 200,                     // Draw width
    height: 200,                    // Draw height
    moveSpeed: 4,                   // Player movement speed
    jumpForce: 25,                  // Player jump force
    health: 3,                      // Player health
    healthMax: 3,                   // Player max health
    facing: "right",                // Indicate current facing
    isGrounded: false,              // Determine if grounded
    isShooting: false,              // Determine if currently shooting
    shootTimerMax: 20,              // Max time between shots when fire held
    isAnimating: true,              // Determine if player sprite animating
    isImmune: false,                // Determine if currently immune
    immuneTimer: 0,                 // Timer for immune state
    immuneTimerMax: 150,            // Max time for immune state
    isHurt: false,                  // Determine if player is in hurt state
    hurtTimer: 0,                   // Timer for hurt state
    hurtTimerMax: 35,               // Max time for hurt state
    frameMax: 7,                    // Max no. spritesheet positions
    frameXMax: 2,                   // Max no. spritesheet positions on x-axis
    frameYMax: 2,                   // Max no. spritesheet positions on y-axis
    tag: "player",                  // Set object tagged as "player"
    spriteWidth: 199,               // Source sprite width
    spriteHeight: 188,              // Source sprite height
    powerup1Active: false,          // Determine if powerup1 is active
    powerup2Active: false,          // Determine if powerup2 is active
    powerup1Timer: 0,               // Current powerup1 timer
    powerup2Timer: 0,               // Current powerup2 timer
    powerup1TimerMax: 150,          // Max time for powerup1 active
    powerup2TimerMax: 150           // Max time for powerup2 active
};
var player = Object.assign({}, sprite, playerInit); // Combine sprite and playerInit objects and assign to player

// DEFAULT ENEMY DATA
var enemyData = {
    width: 102,         // Draw width
    height: 144,        // Draw height
    health: 3,          // Enemy health
    frameMax: 0,        // Max no. spritesheet positions
    frameXMax: 0,       // Max no. spritesheet positions on x-axis
    frameYMax: 0,       // Max no. spritesheet positions on y-axis
    tag: "enemy",       // Set object tagged as "enemy"
    spriteWidth: 102,   // Source sprite width
    spriteHeight: 144,  // Source sprite height
    active: true,       // Set object marked for deletion
    isExploding: false  // Set object as exploding
};
var enemy = Object.assign({}, sprite, enemyData);   // Combine sprite and enemyData objects and assign to enemy
var enemies = [];                                   // Array to store enemies
var enemySpawnTimer = 0;                            // Timer to determine enemy spawn
var enemySpawnTimerMax = 50;                        // Max time to spawn enemy

// DEFAULT BULLET DATA
var bullet = {
    width: 42,          // Draw width
    height: 31,         // Draw height
    speed: 20,          // Bullet movement speed
    spriteWidth: 42,    // Source sprite width
    spriteHeight: 31,   // Source sprite height
    frameMax: 3,        // Max no. spritesheet positions
    frameXMax: 1,       // Max no. spritesheet positions on x-axis
    frameYMax: 1,       // Max no. spritesheet positions on y-axis
    active: true        // Set object marked for deletion
}
bullet = Object.assign({}, sprite, bullet); // Combine sprite and bullet objects and assign to bullet
var playerBullets = [];                     // Array to store player bullets
var enemyBullets = [];                      // Array to store enemy bullets
var powerups = [];                          // Array to store spawned powerups

// Rate at which velocity decreases
var groundFriction = 0.8;                   // When grounded
var airFriction = 0.85;                     // When airborne


var groundHeight = height - (282 * screenScale);    // Define ground height position on screen

function Initialise() {
    // Load music and SFX
    BGM.play();                                                             // Play background music on start

    // Check for highscore
    hiscore = gameStorage.getItem('hiscore');                               // Retrieve stored hiscore
    if (hiscore == null) {
        hiscore = defaultHiscore;
        gameStorage.setItem('hiscore', hiscore);                            // Set new hiscore if no previous hiscore set
    }

    // Load images from file
    titleImg.src = "title.png";                                             // Splash screen title image
    backgroundImg.src = "skyline-a.png";                                    // Parallax background: 1
    backgroundImg2.src = "skyline-b.png";                                   //      2
    midgroundImg.src = "midground.png";                                     //      Midground
    foregroundImg.src = "foreground.png";                                   //      Foreground
    highwayImg.src = "assets/environment/highway.png";                      //      Highway
    treeImg.src = "assets/environment/tree.png";                            //      Treeline
    bulletImg.src = "assets/player/bullet.png";                             // Bullet
    enemyImg.src = "assets/enemy/drone.png";                                // Enemy 1
    explosionImg.src = "assets/enemy/explosion.png";                        // Explosion
    heartImg.src = "assets/UI/heart.png";                                   // Health indicator

    charPort0.src = "assets/player/character0/portrait.png";                // Character portrait: VELA
    charPort1.src = "assets/player/character1/portrait.png";                //      QUINN
    charPort2.src = "assets/player/character2/portrait.png";                //      PYXEL
    charPort0trans.src = "assets/player/character0/portraitTrans.png";      //      VELA (TRANSPARENT)
    charPort1trans.src = "assets/player/character1/portraitTrans.png";      //      QUINN (TRANSPARENT)
    charPort2trans.src = "assets/player/character2/portraitTrans.png";      //      PYXEL (TRANSPARENT)

    p1Img.src = "assets/props/powerup1.png";                                // Powerup 1
    p2Img.src = "assets/props/powerup2.png";                                // Powerup 2

    SetPlayerCharacter(0, "idleRight");                                     // Initialise player sprite
    
    ResetLevel();                                           // Set initial game values

    // DRAW INITIAL PARALLAX BACKGROUND
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
    // Parallax: Trees
    for (var i = 0; i < 15; i++) {
        treesScroll.push({
            x: i * (288 * screenScale),
            y: 0,
            height: 1080,
            width: 288,
            image: treeImg
        });
    }
    // Parallax: Highway
    for (var i = 0; i < 7; i++) {
        highwayScroll.push({
            height: 303,
            width: 384,
            x: i * (384 * screenScale),
            y: height - (303 / 3) * 2 * screenScale,
            image: highwayImg
        });
        console.log("Highway pos: " + highwayScroll[i].x);
    }

    menuOptions.length = numOptions[0];     // Initialise menu options length to number of splash screen options

    objects.push(player);                   // Add player to object array
    
    DrawUI();                               // Draw UI to screen
}

// Update function
function Update() {
    requestAnimationFrame(Update);                              // Request update before next repaint

    now = Date.now();                                           // Set current frame time
    delta = now - then;                                         // Calculate delta time from last frame
    ProcessInput();                                             // Process game input depending on game state (menu navigation and selection)

    if (delta > interval) {
        then = now - (delta % interval);                        // Set previous frame time when interval time passed

        var logoMult = Math.sin(counter) / pulseExtent + 0.5;   // Calculate menu option pulse size multiplier as sin function
        counter += increase;                                    // Increment sin function counter by specified rate of increase

        // Determine game state to update
        switch (currentGameState) {
            case GAMESTATES[0]:                 // Splash
                ScrollBackground(scrollSpeed);  // ---Scroll parallax background
                DrawSplash(logoMult);           // ---Draw splash screen
                break;
            case GAMESTATES[1]:                 // Game
                UpdateGame();                   // ---Update game (objects and draw)
                break;
            case GAMESTATES[2]:                 // Pause
                DrawPause(logoMult);            // ---Draw pause screen
                break;
            case GAMESTATES[3]:                 // Game over
                DrawGameOver(logoMult);         // ---Draw game over screen
                break;
            case GAMESTATES[4]:                 // Hiscores
                ScrollBackground(scrollSpeed);  // ---Scroll parallax background
                DrawHiscore(logoMult);         // ---Draw highscore screen
                break;
            case GAMESTATES[5]:                 // Instructions
                ScrollBackground(scrollSpeed);  // ---Scroll parallax background
                DrawInstructions(logoMult);     // ---Draw instruction screen
                break;
            case GAMESTATES[6]:                 // Character select
                ScrollBackground(scrollSpeed);  // ---Scroll parallax background
                DrawCharSelect();               // ---Draw character select screen
            default:
                break;
        }
    }
    previousKeys = keys.slice(0);               // Store current keystate to compare next frame
}

// Particle system
class Particle {
    constructor() {
        this.x = 0;                                                         // X-position
        this.y = 0;                                                         // Y-position
        this.velX = Math.floor(Math.random() * 50) - 25;                    // Set random x-velocity
        this.velY = Math.floor(Math.random() * 50) - 25;                    // Set random y-velocity
        this.r = Math.floor(Math.random() * 255);                                                       // Set colour value: red
        this.g = Math.floor(Math.random() * 255);                      //                 : green
        this.b = Math.floor(Math.random() * 255);                      //                 : blue
        this.alpha = 1.0;                                                   //                 : alpha
        this.fillStyle = "rbga(" + this.r + "," + this.g + "," + this.b + "," + this.alpha+")";       // Combine colour values as fill style
    }

    // Generate particle cluster
    generate(x, y, numParticles) {
        for (var i = 0; i < numParticles; i++) {    // Iterate through specified number of particles
            var p = new Particle();                 // Declare new particle
            p.x = x;                                // Assign: x-position
            p.y = y;                                //       : y-position
            p.velX *= 0.2;                          //       : x-velocity
            p.velY *= 0.2;                          //       : y-velocity
            particles.push(p);                      // Add particle to array
        }
    }

    // Update function
    update() {
        this.x += this.velX;                        // Update: x-position by velocity
        this.y += this.velY;                        //       : y-position
        this.velX *= 0.995;                         // Slow particle over time
        this.velY *= 0.995;                         //
        this.alpha -= 0.015;                        // Fade particle out over time
        this.x -= scrollSpeed;                      // Move particle by screen scroll speed
    }

    getFillStyle() {
        return this.fillStyle;                      // Return fill style
    }

    // Draw function
    Draw(ctx) {
        ctx.beginPath();                                                // Start shape
        ctx.fillRect(this.x, this.y, 5 * screenScale, 5 * screenScale); // Draw rectangle at position
    }
}
var p = new Particle(); // Particle base object
let particles = [];     // Array to store particles

// Run setup on loaded
window.addEventListener("load", function () {
    Initialise();               // Initialise game
    Update();                   // First update
});

// Set keystate on key down
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

// Set keystate on key up
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

// Compares keyboard states and returns true only once on key down
function KeyDown(keycode) {
    if (keys[keycode] && keys[keycode] != previousKeys[keycode]) {
        previousKeys[keycode] = true;
        return true;
    }
    else
        return false;
}

// Compares keyboard states and returns true only once on key up
function KeyUp(keycode) {
    if (!keys[keycode] && keys[keycode] != previousKeys[keycode]) {
        previousKeys[keycode] = false;
        return true;
    }
    else
        return false;
}

// Set player character from character selection
function SetPlayerCharacter(characterIndex) {
    player.characterIndex = characterIndex;         // Character index
    SetPlayerSprite(characterIndex, "idleRight");   // Initialise player sprite as "idleRight" according to character index
    switch (characterIndex) {                       // Specify sprite source width and height according to character index
        case 0:
            player.spriteWidth = 199;
            player.spriteHeight = 188;
            break;
        case 1:
            player.spriteWidth = 199;
            player.spriteHeight = 199;
            break;
        case 2:
            player.spriteWidth = 199;
            player.spriteHeight = 178;
            break;
        case 3:
            player.spriteWidth = 199;
            player.spriteHeight = 199;
            break;
        default:
            player.spriteWidth = 199;
            player.spriteHeight = 188;
            break;
    }
}

// Change player sprite
function SetPlayerSprite(characterIndex, sprite) {
    player.sprite = sprite;     // Update current sprite
    var tempSprite = sprite;    // Store temporary sprite


    // Return to start of spritesheet
    player.frame = 0;
    player.frameX = 0;
    player.frameY = 0;

    // Set spritesheet size by character index and sprite state
    switch (characterIndex) {
        case 0:                                                                     // CHARACTER 1: VELA
            if (sprite == "runRight" || sprite == "runLeft") {                      // ---Run
                player.frameMax = 7;
                player.frameXMax = 2;
                player.frameYMax = 2;
            }
            else if (sprite == "idleLeft" || sprite == "idleRight") {               // ---Idle
                player.frameMax = 3;
                player.frameXMax = 1;
                player.frameYMax = 1;
            }
            else if (sprite == "runShootRight" || sprite == "runShootLeft") {       // ---Run/shoot
                player.frameMax = 7;
                player.frameXMax = 2;
                player.frameYMax = 2;
            }
            else if (sprite == "shootRight" || sprite == "shootLeft") {             // ---Static shoot
                player.frameMax = 0;
                player.frameXMax = 0;
                player.frameYMax = 0;
            }
            else if (sprite == "jumpLeft" || sprite == "jumpRight") {               // ---Jump
                player.frameMax = 2;
                player.frameXMax = 1;
                player.frameYMax = 1;
            }
            else if (sprite == "jumpShootLeft" || sprite == "jumpShootRight") {     // ---Jump/shoot
                player.frameMax = 0;
                player.frameXMax = 0;
                player.frameYMax = 0;
            }
            break;
        case 1:                                                                     // CHARACTER 2: QUINN
            if (sprite == "runRight" || sprite == "runLeft") {                      // ---Run
                player.frameMax = 7;
                player.frameXMax = 7;
                player.frameYMax = 0;
            }
            else if (sprite == "idleLeft" || sprite == "idleRight") {               // ---Idle
                player.frameMax = 3;
                player.frameXMax = 3;
                player.frameYMax = 0;
            }
            else if (sprite == "runShootRight" || sprite == "runShootLeft") {       // ---Run/shoot
                player.frameMax = 7;
                player.frameXMax = 7;
                player.frameYMax = 0;
            }
            else if (sprite == "shootRight" || sprite == "shootLeft") {             // ---Static shoot
                player.frameMax = 0;
                player.frameXMax = 0;
                player.frameYMax = 0;
            }
            else if (sprite == "jumpLeft" || sprite == "jumpRight") {               // ---Jump
                tempSprite = sprite;                                                //      -Store current sprite
                if (sprite == "jumpLeft") {                                         // Left facing:
                    if (player.velY < 0)                                            // If moving up, assign sprite:
                        sprite = "jumpLeftUp";                                      //      ---Jump up
                    else                                                            //
                        sprite = "jumpLeftDown";                                    //      ---Jump down
                }
                else {                                                              // Right facing:
                    if (player.velY < 0)                                            // If moving down, assign sprite:
                        sprite = "jumpRightUp";                                     //      ---Jump up
                    else                                                            //
                        sprite = "jumpRightDown";                                   //      ---Jump down
                }
                player.frameMax = 0;
                player.frameXMax = 0;
                player.frameYMax = 0;
            }
            else if (sprite == "jumpShootLeft" || sprite == "jumpShootRight") {     // ---Jump/shoot
                player.frameMax = 0;
                player.frameXMax = 0;
                player.frameYMax = 0;
            }
            break;
        case 2:                                                                     // CHARACTER 2: PYXEL
            if (sprite == "runRight" || sprite == "runLeft") {                      // ---Run
                player.frameMax = 11;
                player.frameXMax = 11;
                player.frameYMax = 0;
            }
            else if (sprite == "idleLeft" || sprite == "idleRight") {               // ---Idle
                player.frameMax = 3;
                player.frameXMax = 1;
                player.frameYMax = 1;
            }
            else if (sprite == "runShootRight" || sprite == "runShootLeft") {       // ---Run/shoot
                player.frameMax = 11;
                player.frameXMax = 3;
                player.frameYMax = 2;
            }
            else if (sprite == "shootRight" || sprite == "shootLeft") {             // ---Idle/shoot
                player.frameMax = 0;
                player.frameXMax = 0;
                player.frameYMax = 0;
            }
            else if (sprite == "jumpLeft" || sprite == "jumpRight") {               // ---Jump
                player.frameMax = 7;
                player.frameXMax = 2;
                player.frameYMax = 2;
            }
            else if (sprite == "jumpShootLeft" || sprite == "jumpShootRight") {     // ---Jump/shoot
                player.frameMax = 0;
                player.frameXMax = 0;
                player.frameYMax = 0;
            }
            break;
        default:
            break;
    }

    playerImg.src = "assets/player/character" + player.characterIndex + "/" + sprite + ".png";  // Load appropriate sprite
    player.sprite = tempSprite;                                                                 // Return to assigned sprite
}

// TODO Add enemy types
function SetEnemySprite(i) {
    // Set enemy values
    // ---Exploding
    enemies[i].sprite = explosionImg;   // Change to explosion spritesheet
    enemies[i].frameMax = 5;            // Set spritesheet dimensions
    enemies[i].frameXMax = 2;           //
    enemies[i].frameYMax = 1;           //
    enemies[i].width = 152;             // Draw width
    enemies[i].height = 144;            // Draw height
    enemies[i].spriteWidth = 152;       // Sprite source width
    enemies[i].spriteHeight = 144;      // Sprite source height
    enemies[i].isExploding = true;      // Set to exploding
    p.generate(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2, 50);    // Generate explosion particle effect on enemy position
}


// Check for collision between 2 objects
function colCheck(shapeA, shapeB, isTrigger) {
    // Get vectors to check against
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

        if (oX >= oY) {                     // Check if the object overlap is greater on the X-axis         (Collision more likely in direction with less overlap)
            if (vY > 0) {                   // Check if object A is above object B
                colDir = "t";               // Set collision direction as Top
                if (!isTrigger)
                    shapeA.y += oY;         // Offset object A away from object B up by the Y-overlap
            } else {
                colDir = "b";               // Set collision direction as Bottom
                if (!isTrigger)
                    shapeA.y -= oY;         // Offset object A away from object B down by the Y-overlap
            }
        } else {                            // ELSE if the object overlap is greater on the Y-axis
            if (vX > 0) {                   // Check if object A is to the right of object B
                colDir = "l";               // Set collision direction as Left
                if (!isTrigger)
                    shapeA.x += oX;         // Offset object A away from object B left by the X-overlap
            } else {
                colDir = "r";               // Set collision direction as Right
                if (!isTrigger)
                    shapeA.x -= oX;         // Offset object A away from object B right by the overlap
            }
        }
    }

    return colDir;                          // Return the collision direction
}

// Update sprite animation frame
function AnimationFrame(object) {
    var elapsed = (Date.now() - object.startTimeMS) / 1000; // Calculate time elapsed since last frame in ms
    object.startTimeMS = Date.now();                        // Set current time

    object.frameTimer = object.frameTimer - elapsed;        // Reduce timer by elapsed time
    if (object.frameTimer <= 0) {                           // Update frame when timer reaches 0
        object.frameTimer = object.frameTimeMax;
        object.frameX++;
        if (object.frameX > object.frameXMax) {             // Return to first x-position when end of row reached
            object.frameX = 0;
            object.frameY++;
            //end of row, move down to next row in sheet
            if (object.frameY > object.frameYMax) {         // Return to first y-position when end of column reached
                object.frameY = 0;
            }
        }
        object.frame++;
        if (object.frame > object.frameMax) {               // Return to first spritesheet position when end of sheet reached (skip empty frames)
            object.frame = 0;
            object.frameX = 0;
            object.frameY = 0;
        }
    }

}

// Calculate all collisions
function CalculateCollisions() {
    // Player/Screen edge collision
    if (player.x <= 0)                              // Left edge
    {
        player.x = 0;
    }
    if (player.x > (width - player.width))          // Right edge
        player.x = (width - player.width);
    if (player.y < 0) {                             // Top edge
        player.y = 0;
        player.velY = 0;
    }
    if (player.y > (height - 282 * screenScale)) {  // Bottom edge
        player.y = (height - 282 * screenScale);
        player.velY = 0;
        player.isGrounded = true;
    }

    // Powerups
    for (var i = 0; i < powerups.length; i++) {     
        if (powerups[i].y > (height - powerups[i].height * screenScale - 65 * screenScale)) {   // Ground collision  
            powerups[i].y = (height - powerups[i].height * screenScale - 65 * screenScale)
            powerups[i].velY = 0;
        }
        if (powerups[i].x < 0 - powerups[i].width * screenScale)    // Delete powerup when off screen
            powerups.splice(i, 1);

        var dir = null;
        if (powerups.length > 0) {                      // Check for player/powerup collision if powerup array isn't empty
            dir = colCheck(player, powerups[i], true);
            

            if (dir != null) {                          // If collision detected
                switch (powerups[i].tag) {
                    case 0:                             // Activate Powerup 1
                        powerup1sfx.currentTime = 0;
                        powerup1sfx.play();
                        player.powerup1Active = true;
                        player.powerup1Timer = 0;
                        powerups.splice(i, 1);
                        break;
                    case 1:                             // Activate Powerup 2
                        powerup1sfx.currentTime = 0;
                        powerup1sfx.play();
                        player.shootTimerMax = 5;
                        player.powerup2Active = true;
                        player.powerup2Timer = 0;
                        powerups.splice(i, 1);
                        break;
                    default:
                        break;
                }
            }
        }

    }

    // Player bullet collision
    for (var i = 0; i < playerBullets.length; i++) {
        var dir = null;
        for (var j = 0; j < enemies.length; j++) {
            if (enemies[j] != null && playerBullets[i] != null && !enemies[j].isExploding) {
                dir = colCheck(enemies[j], playerBullets[i], true); // Detect collision if enemy and playerBullets arrays aren't empty and enemy isn't exploding
            }
            if (dir != null) {                                      // On collision detected
                explosionsfx.currentTime = 0;                       // Reset explosion SFX
                explosionsfx.play();                                // Play explosion SFX
                SetEnemySprite(j);                                  // Set iterated enemy as exploding
                playerBullets[i].active = false;                    // Mark player bullet for deletion
                score += scoreIncrement;                            // Increment score
                var rng = Math.floor(Math.random() * 100);          // Powerup rng
                if (rng < 5) {                                      // 5% chance to spawn powerup on enemy defeat
                    Generate("powerup", enemies[j]);                //      Generate powerup
                    score += powerupBonus;                          //      Add powerup bonus
                }
                if (score > levelUpScore) {                         
                    LevelUp();  // Level up when level up score reached
                }
            }
        }
    }

    for (var i = 0; i < enemies.length; i++) {          // Iterate through all enemies
        if (!enemies[i].isExploding) {
            var dir = null;
            dir = colCheck(player, enemies[i], true);   // Check for player/enemy collision if enemy isn't exploding
            if (dir != null) {
                if (!player.isImmune) {
                    player.health--;                    // Reduce player health on collision
                    if (player.health <= 0) {
                        if (score > hiscore) {
                            hiscore = score;
                            newHiscore = true;
                            gameStorage.setItem('hiscore', hiscore);
                        }
                        ChangeState(3);                 // Game Over if player health reaches 0
                    }
                    player.isImmune = true;             // Set player temporary immunity on hit
                    player.isHurt = true;               // Set player to hurt state
                    hitsfx.play();                      // Play hit SFX
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
            i--;
        }
    }
}

// Level up
function LevelUp() {
    level++;                                    // Increase level
    levelUpScore += (levelIncrement * level);   // Increase next level up score to reach by level increment multiplied by the current level
    levelUpsfx.currentTime = 0;                 // Reset level up SFX
    levelUpsfx.play();                          // Play level up SFX
    if (player.health < player.healthMax)       //
        player.health++;                        // Restore player health if below max health
    enemySpawnTimerMax -= level* 5 ;            // Speed up enemy spawn on level progression
}

// Apply gravity to all objects stored in objects array
function ApplyGravity() {
    for (var i = 0; i < objects.length; i++) {
        objects[i].velY += 1;
        objects[i].y += objects[i].velY;
        objects[i].x -= scrollSpeed;            // Scroll all objects across screen by scroll speed
    }
}

// Handle player sprite input
function PlayerControl() {                                                   // PC Input Handler
    if (KeyDown(32)) {                                      // SPACE (first press):
        if (!player.isHurt) {                               // Generate and fire bullet if player is not hurt
            lasersfx.currentTime = 0;
            lasersfx.play();
            Generate("bullet");
            player.facing = "right";
        }
    }
    if (keys[32] && player.facing != "left") {              // SPACE (held):
        if (player.shootTimer > player.shootTimerMax) {     // Generate and fire bullet max shoot timer is reached and player is not hurt
            if (!player.isHurt) {
                lasersfx.currentTime = 0;
                lasersfx.play();
                Generate("bullet");
            }
        }
        player.isShooting = true;
    }

    if (keys[68]) {                                         // D: Right
        if (!player.isShooting)
            player.facing = "right";
        if (player.isGrounded) {                            // Set appropriate sprite
            if (player.isShooting) {
                if (player.sprite != "runShootRight")
                    SetPlayerSprite(player.characterIndex, "runShootRight");
            }
            else if (player.sprite != "runRight")
                SetPlayerSprite(player.characterIndex, "runRight");
        }
        if (player.x < (width) - player.width)
            player.velX += player.moveSpeed;                // Increase player speed if within screen bounds
        else
            player.velX = 0;                                // Otherwise stop movement
    }
    if (keys[65]) {                                         // A: Left
        if (!player.isShooting)
            player.facing = "left";
        if (player.isGrounded) {                            // Set appropriate sprite
            if (player.sprite != "runLeft")
                SetPlayerSprite(player.characterIndex, "runLeft");
        }
        if (player.x > 0)                                   // Increase player speed if within screen bounds
            player.velX -= player.moveSpeed;
        else
            player.velX = 0;                                // Otherwise stop movement
    }
    if (!keys[68] && !keys[65]) {
        if (player.isShooting) {
            if (player.isGrounded) {
                if (player.x > 0) {
                    player.facing = "right";
                    if (player.facing == "right") {
                        var sprite = "shootRight";
                        if (player.sprite != sprite) {
                            SetPlayerSprite(player.characterIndex, sprite);      // Set sprite to shoot right if grounded, shooting and idle
                        }
                    }
                }
                else if (player.sprite != "runShootRight")
                    SetPlayerSprite(player.characterIndex, "runShootRight");     // Set sprite to run/shoot right if grounded, shooting and at screen edge
            }
        }
        else {
            if (player.isGrounded)
                if (player.x > 0) {
                    if (player.sprite != "idleRight") {
                        SetPlayerSprite(player.characterIndex, "idleRight");     // Set sprite to idle right if grounded, NOT shooting and idle
                        player.facing = "right";
                    }
                }
                else if (player.sprite != "runRight") {
                    SetPlayerSprite(player.characterIndex, "runRight");          // Set sprite to run right if grounded, NOT shooting and at screen edge
                    player.facing = "right";
                }
        }
    }

    if (!player.isGrounded) {
        if (player.facing == "right") {
            if (!player.isShooting) {
                if (player.velY > 0 && player.prevVelY <= 0)
                    SetPlayerSprite(player.characterIndex, "jumpRight");        // Set sprite is airborne and not shooting
                if (player.sprite != "jumpRight")
                    SetPlayerSprite(player.characterIndex, "jumpRight");
            }
            else {
                if (player.sprite != "jumpShootRight")
                    SetPlayerSprite(player.characterIndex, "jumpShootRight");    // Set sprite if airborne and shooting
            }
        }
        else {
            if (!player.isShooting) {
                if (player.velY > 0 && player.prevVelY <= 0)
                    SetPlayerSprite(player.characterIndex, "jumpLeft");         // Set sprite if falling
                if (player.sprite != "jumpLeft")
                    SetPlayerSprite(player.characterIndex, "jumpLeft");          // Set sprite if airborne
            }
            else {
                if (player.sprite != "jumpShootLeft")
                    SetPlayerSprite(player.characterIndex, "jumpShootLeft");     // Set sprite if airborne and shooting
            }
        }

    }

    if (keys[87] && !previousKeys[87] && player.isGrounded) {                   // Space:
        if (player.y > 0) {                                                     // Jump if grounded and within screen bounds
            player.velY -= player.jumpForce;
            player.isGrounded = false;
        }
    }

    if (player.isHurt) {
        player.velX = 0;                                        // Stop player while hurt
        player.velY = 0;                                        //
        player.facing = "right";                                // Set player to face right
        if (player.sprite != "hurt")                            //  
            SetPlayerSprite(player.characterIndex, "hurt");      // Set player sprite to hurt if not already set
    }


    // Update player's x-position
    if (player.isGrounded)
        player.velX *= groundFriction;      // Slow player while grounded at groundFriction rate
    else
        player.velX *= airFriction;         // Slow player while airborne at airFriction rate

    player.prevVelY = player.velY;          // Assign previous frame's y-velocity
}

// Generate specified object at point
function Generate(object, origin) {
    switch (object) {   // Determine object to generate
        case "bullet":  // BULLET
            playerBullets.push(bullet);                                                         // Add default bullet values to playerBullets array
            var bulletData = {                                                                  // Centre bullet position on player
                x: player.x + player.width - (65 * screenScale),
                y: player.y + (player.height / 3) * screenScale - (7 * screenScale),

            }
            playerBullets[playerBullets.length - 1] = Object.assign({}, bullet, bulletData);    // Modify bullet with updated position
            if (player.powerup1Active) {                                                        // POWERUP 1
                playerBullets.push(bullet);                                                     // Fire extra bullet at 45o up 
                var bulletData = {
                    x: player.x + player.width - (65 * screenScale),
                    y: player.y + (player.height / 3) * screenScale - (7 * screenScale),
                    velX: 5,
                    velY: -5
                }
                playerBullets[playerBullets.length - 1] = Object.assign({}, bullet, bulletData);
                playerBullets.push(bullet);                                                     // Fire extra bullet at 45o down
                var bulletData = {
                    x: player.x + player.width - (65 * screenScale),
                    y: player.y + (player.height / 3) * screenScale - (7 * screenScale),
                    velX: 5,
                    velY: 5
                }
                playerBullets[playerBullets.length - 1] = Object.assign({}, bullet, bulletData);
            }
            player.shootTimer = 0;                                                              // Reset bullet timer
            break;
        case "enemy":   // TODO: Add more enemy types
            var tempEnemy;                                                                      // Enemy object to be assigned to array
            var enemyData = {                                                                   //
                x: width,                                                                       // Set spawn x-position 
                y: groundHeight + 50 * screenScale - ((Math.random() * 300) * screenScale),     // Randomise spawn y-position
                speed: Math.floor(Math.random() * 5) + scrollSpeed + level,                     // Randomise movement speed, increase by level
                sprite: enemyImg                                                                // Set spritesheet
            }
            tempEnemy = Object.assign({}, enemy, enemyData);                                    // Combine default enemy and enemyData values
            enemies.push(tempEnemy);                                                            // Push enemy to enemies array
            break;
        case "powerup": // POWERUP
            var pUp = new Sprite();                         // Declare new Sprite object
            pUp.x = origin.x + origin.width / 2;            // Centre powerup on specified origin
            pUp.y = origin.y + origin.height / 2;           //
            pUp.spriteWidth = 48;                           // Set powerup sprite source width
            pUp.spriteHeight = 60;                          // Set powerup sprite source height
            pUp.width = 48 * screenScale;                   // Set powerup draw width
            pUp.height = 60 * screenScale;                  // Set powerup draw height

            var rnd = Math.floor(Math.random() * 100);      
            if (rnd < 50) {                                 // Determine powerup to spawn: 50/50
                pUp.img = p1Img;
            pUp.tag = 0;
            }
            else {
                pUp.img = p2Img;
                pUp.tag = 1;
            }
            powerups.push(pUp);                             // Add powerup to powerups array
            objects.push(pUp);                              // Add powerup to objects array
            break;
        default:
            break;
    }
}

// Game functionality
function GameInput() {
    if (KeyDown(27)) {                                      // ESCAPE:
        menuMove.currentTime = 0;
        menuMove.play();
        ChangeState(2);                                     // Change to Pause screen
    }

    PlayerControl();

}

// Reset game level to initial values
function ResetLevel() {
    // Player
    player.x = Object.assign(playerInit.x);
    player.y = (height - 282 * screenScale);
    player.isImmune = false;
    player.health = Object.assign(playerInit.healthMax);
    player.isHurt = false;
    player.hurtTimer = 0;
    // Level values
    score = 0;
    level = 1;
    levelUpScore = 200;
    enemySpawnTimerMax = 50;
    // Arrays
    enemies.length = 0;
    playerBullets.length = 0;
    powerups.length = 0;
    particles.length = 0;
    newHiscore = false;
}

// Pause menu functionality
function PauseInput() {
    if (KeyDown(27))                // ESCAPE:
        ChangeState(1);             // ---Return to gameplay
    if (KeyDown(13)) {              // ENTER:
        menuSelect.currentTime = 0; // ---Play menu select SFX
        menuSelect.play();
        switch (selected) {
            case 0:                 // RESUME
                ChangeState(1);     // ---Return to gameplay
                break;
            case 1:                 // RETRY
                ResetLevel();       // ---Reset level
                ChangeState(1);     // ---Return to gameplay
                break;
            case 2:                 // EXIT
                ResetLevel();       // ---Reset level
                ChangeState(0);     // ---Return to main menu
                break;
            default:
                break;
        }
    }
}


// Determine input functionality by state
function ProcessInput() {
    switch (currentGameState) {
        case GAMESTATES[0]:                 // Splash screen
            SplashInput();
            MenuNavigation();
            break;
        case GAMESTATES[1]:                 // Gameplay screen
            GameInput();
            break;
        case GAMESTATES[2]:                 // Pause screen
            PauseInput();
            MenuNavigation();
            break;
        case GAMESTATES[3]:                 // Game over screen
            GameOverInput();
            MenuNavigation();
            break;
        case GAMESTATES[4]:                 // Hiscore screen
            HiscoreInput();
            MenuNavigation();
            break;
        case GAMESTATES[5]:                 // Instruction screen
            InstructionInput();
            MenuNavigation();
            break;
        case GAMESTATES[6]:                 // Character select screen
            CharSelectInput();
            MenuNavigation();
        default:
            break;
    }
}

// Hiscore screen input functionality
function HiscoreInput() {
    if (KeyDown(27))                    // ESCAPE:
        ChangeState(0);                 // ---Return to main menu
    if (KeyDown(13)) {                  // ENTER:
        menuSelect.currentTime = 0;
        menuSelect.play();
        switch (selected) {
            case 0:                     // RETURN
                ChangeState(0);         // ---Return to main menu
                break;
            default:
                break;
        }
    }
}

// Gameover screen input functionality
function GameOverInput() {
    if (KeyDown(27))                    // ESCAPE:
        ChangeState(0);                 // ---Return to main menu
    if (KeyDown(13)) {                  // ENTER:
        menuSelect.currentTime = 0;     
        menuSelect.play();
        switch (selected) {
            case 0:                     // RETRY
                ResetLevel();           // ---Reset level
                ChangeState(1);         // ---Return to gameplay
                break;
            case 1:                     // EXIT
                ResetLevel();           // ---Reset level
                ChangeState(0);         // ---Return to main menu
                break;
            default:
                break;
        }
    }
}

// Generic menu navigation functionality based on menuOptions length
function MenuNavigation() {
    if (currentGameState == GAMESTATES[6]) {
        // Character Select screen: uses LEFT and RIGHT arrow keys to navigate options
        if (KeyDown(39)) {                              // RIGHT arrow
            menuMove.currentTime = 0;
            menuMove.play();

            if (selected + 1 >= menuOptions.length) {   // Return to first menu option when end of array reached
                selected = 0;
                counter = 0;
            }
            else {                                      // Else select next menu option
                selected++;
                counter = 0;
            }
        }
        if (KeyDown(37)) {                              // LEFT arrow
            menuMove.currentTime = 0;
            menuMove.play();
            if (selected - 1 < 0) {                     // Return to last menu option when end of array reached
                selected = menuOptions.length - 1;
                counter = 0;
            }
            else {                                      // Else select previous menu option
                selected--;
                counter = 0;
            }
        }
    }
    else {
        // All other menu screens: use UP and DOWN arrow keys to navigate options
        if (KeyDown(40)) {                              // DOWN arrow
            menuMove.currentTime = 0;
            menuMove.play();

            if (selected + 1 >= menuOptions.length) {   // ---Return to first menu option when end of array reached
                selected = 0;
                counter = 0;
            }
            else {                                      // ---Else select next menu option
                selected++;
                counter = 0;
            }
        }

        if (KeyDown(38)) {                              // UP arrow
            menuMove.currentTime = 0;
            menuMove.play();
            if (selected - 1 < 0) {                     // ---Return to last menu option when end of array reached
                selected = menuOptions.length - 1;
                counter = 0;
            }
            else {                                      // ---Else select previous menu option
                selected--;
                counter = 0;
            }
        }
    }
}

// Instruction screen input functionality
function InstructionInput() {
    if (KeyDown(13) || KeyDown(27)) {   // ENTER or ESCAPE
        menuSelect.currentTime = 0;
        menuSelect.play();
        ChangeState(0);                 // ---Return to main menu
    }
}

// Character select screen input functionality
function CharSelectInput() {
    if (KeyDown(13)) {                  // ENTER
        menuSelect.currentTime = 0;
        menuSelect.play();
        switch (selected) {
            case 0:                     // Select CHARACTER 1:
                SetPlayerCharacter(0);  // ---Set player character as VELA
                ChangeState(1);         // ---Go to gameplay
                break;
            case 1:                     // Select CHARACTER 2:
                SetPlayerCharacter(1);  // ---Set player character as QUINN
                ChangeState(1);         // ---Go to gameplay
                break;
            case 2:                     // Select CHARACTER 3:
                SetPlayerCharacter(2);  // ---Set player character as PYXEL
                ChangeState(1);         // ---Go to gameplay
                break;
            default:
                break;
        }
    }
    if (KeyDown(27)) {                  // ESCAPE
        menuSelect.currentTime = 0;
        menuSelect.play();
        ChangeState(0);                 // ---Return to main menu
    }
}

// Splash screen input functionality
function SplashInput() {
    // MENU SELECTION
    if (KeyDown(13)) {                  // ENTER
        menuSelect.currentTime = 0;
        menuSelect.play();
        switch (selected) {
            case 0:                     // Play:
                BGM.play();             // ---Play background music
                ChangeState(6);         // ---Go to character select
                break;
            case 1:                     // Instructions:
                ChangeState(5);         // ---Go to instruction screen
                break;
            case 2:                     // Hiscores:
                ChangeState(4);         // ---Go to hiscore screen
                break;
            default:
                break;
        }
    }
}

// Update all bullets
function UpdateBullets() {
    // Player bullets
    for (var i = 0; i < playerBullets.length; i++) {
        playerBullets[i].x += playerBullets[i].speed;
        playerBullets[i].y += playerBullets[i].velY;
        if (playerBullets[i].x > width)
            playerBullets.splice(i, 1);                 // Delete bullet if off-screen

    }
    if (keys[32] && player.facing != "left")            // SPACE:
        player.shootTimer++;                            // ---Increment shot timer when fire held and not facing left
}

// Update all enemies
function UpdateEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        if (!enemies[i].isExploding)
            enemies[i].x -= enemies[i].speed;                               // Move enemy if not exploding
        else
            enemies[i].x -= scrollSpeed;                                    // Else move at scroll speed
        if (enemies[i].x < (enemies[i].spriteWidth * screenScale) * -1)
            enemies.splice(i, 1);                                           // Delete enemy if off-screen
        if (enemies[i].isExploding)
            if (enemies[i].frame >= enemies[i].frameMax)
                enemies[i].active = false;                                  // Mark enemy for deletion when explosion animation finished
    }
}

// Update all objects
function UpdateObjects() {
    // Update game objects
    ApplyGravity();
    UpdateBullets();
    UpdateEnemies();

    // Enemy spawn
    enemySpawnTimer++;
    if (enemySpawnTimer > enemySpawnTimerMax) {
        var rnd = Math.random() * 100;          
        if (rnd < (5 + level * 2)) {            // 5% (+ double level value) chance to spawn enemy every frame after max spawn timer reached
            Generate("enemy");                  // Generate enemy
            enemySpawnTimer = 0;                // Reset spawn timer
        }

    }

    // Player
    if (player.isImmune) {
        player.immuneTimer++;
        if (player.immuneTimer > player.immuneTimerMax) {       // Stop player immunity when max timer reached
            player.isImmune = false;
            player.immuneTimer = 0;
        }
    }
    if (player.isHurt) {
        player.hurtTimer++;
        if (player.hurtTimer > player.hurtTimerMax) {           // Remove player hurt state when max timer reached
            player.isHurt = false;
            player.hurtTimer = 0;
        }
    }

    // Powerups
    if (player.powerup1Active) {
        player.powerup1Timer++;
        if (player.powerup1Timer > player.powerup1TimerMax) {   // Deactivate powerup1 when max timer reached
            player.powerup1Active = false;
            player.powerup1Timer = 0;
        }
    }
    if (player.powerup2Active) {
        player.powerup2Timer++;
        if (player.powerup2Timer > player.powerup2TimerMax) {   // Deactivate powerup2 when max timer reached
            player.powerup2Active = false;
            player.powerup2Timer = 0;
            player.shootTimerMax = 20;
        }
    }

    player.x += player.velX;                                    // Move player by velocity
}

// Update Gameplay
function UpdateGame() {
    UpdateObjects();
    CalculateCollisions();              
    ScrollBackground(scrollSpeed);  
    DrawGame();                     
}

// Scroll parallax background
function ScrollBackground(scrollSpeed) {
    // Background Scroll
    for (var i = 0; i < backgroundScroll.length; i++) {
        backgroundScroll[i].x -= (scrollSpeed * 0.3);                                                           // Move background tile
        if (backgroundScroll[i].x <= (backgroundImg.width * screenScale * -1) - (500 * screenScale)) {          // 
            backgroundScroll.splice(0, 1);                                                                      // Delete background tile when off screen
            if (backgroundIndex > 5) {
                backgroundScroll.push({                                                                         // Add background tile to array when previous tile deleted
                    x: backgroundScroll[backgroundScroll.length - 1].x + backgroundImg.width * screenScale,
                    y: 0,
                    image: backgroundImg2
                });
                backgroundIndex -= backgroundIndex;                                                             // Reduce index
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

    // Midground scroll
    for (var i = 0; i < midgroundScroll.length; i++) {
        midgroundScroll[i].x -= (scrollSpeed * 0.5);                                                        // Scroll midground tile
        if (midgroundScroll[i].x <= (midgroundImg.width * screenScale * -1) - (500 * screenScale)) {
            midgroundScroll.splice(0, 1);                                                                   // Remove tile when off-screen
            midgroundScroll.push({                                                                          // Add new tile when tile removed
                x: midgroundScroll[midgroundScroll.length - 1].x + midgroundImg.width * screenScale,
                y: 0,
                image: midgroundImg
            });
        }
    }

    // Foreground Scroll
    for (var i = 0; i < foregroundScroll.length; i++) {
        foregroundScroll[i].x -= scrollSpeed * 0.75;                                                        // Scroll foreground tile
        if (foregroundScroll[i].x <= (foregroundImg.width * screenScale * -1) - (1000 * screenScale)) {
            foregroundScroll.splice(0, 1);                                                                  // Remove tile when off-screen
            foregroundScroll.push({                                                                         // Add new tile when tile removed
                x: foregroundScroll[foregroundScroll.length - 1].x + foregroundImg.width * screenScale,
                y: 0,
                image: foregroundImg
            });
        }
    }

    // Tree Scroll
    for (var i = 0; i < treesScroll.length; i++) {
        treesScroll[i].x -= scrollSpeed * 0.85;                                                             // Scroll tree tile
        if (treesScroll[i].x <= 0 - (treesScroll[i].width * 2 * screenScale)) {
            treesScroll.splice(0, 1);                                                                       // Remove tile when off-screen
            treesScroll.push({                                                                              // Add new tile when tile removed
                x: treesScroll[treesScroll.length - 1].x + treesScroll[i].width * screenScale,
                y: 0,
                height: 1080,
                width: 288,
                image: treeImg
            });
        }
    }

    // Highway Scroll
    for (var i = 0; i < highwayScroll.length; i++) {
        highwayScroll[i].x -= scrollSpeed;                                                                  // Scroll highway tile
        if (highwayScroll[i].x <= 0-(highwayScroll[i].width * 2 * screenScale)) {
            highwayScroll.splice(0, 1);                                                                     // Remove tile when off-screen
            highwayScroll.push({                                                                            // Add new tile when tile removed
                x: highwayScroll[highwayScroll.length - 1].x + highwayScroll[i].width * screenScale,
                y: height - (highwayImg.height /3) * 2 * screenScale,
                height: 303,
                width: 384,
                image: highwayImg
            });
        }
    }
}


// Draw instruction screen
function DrawInstructions(logoMult) {
    // Clear layers
    backgroundCtx.clearRect(0, 0, width, height);
    foregroundCtx.clearRect(0, 0, width, height);
    UICtx.clearRect(0, 0, width, height);
    // Background
    DrawBackground();
    backgroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);    // Apply screen darkening filter over background
    // UI: title
    var titlePos = [width / 2, 75 * screenScale];
    DrawText("INSTRUCTIONS", 100, titlePos, "white", "black", 35, "center", "top");
    // UI: instrctions
    var instructPos = [width / 2, 300 * screenScale];
    var textOffset = 65;
    DrawText("Move left/right: [A] / [D]", 35, instructPos, "white", "black", 15, "center", "top");
    DrawText("Jump: [W]", 35, [instructPos[0], instructPos[1] + textOffset], "white", "black", 15, "center", "top");
    DrawText("Shoot: [SPACE]", 35, [instructPos[0], instructPos[1] + textOffset * 2], "white", "black", 15, "center", "top");
    DrawText("Pause: [ESC]", 35, [instructPos[0], instructPos[1] + textOffset * 3], "white", "black", 15, "center", "top");
    // UI: menu options
    DrawMenuText("RETURN", 150, 65, [width / 2, height - 200 * screenScale], 75, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
}

// Draw character select screen
function DrawCharSelect() {
    // Clear layers
    UICtx.clearRect(0, 0, width, height);
    UICtx.clearRect(0, 0, width, height);
    foregroundCtx.clearRect(0, 0, width, height);
    // Background
    DrawBackground();
    // UI: title
    DrawText("SELECT A CHARACTER", 75, [width / 2, 100], "white", "black", 35, "center", "top");
    // UI: character select portraits
    var portSize = 200 * screenScale;       // Portrait size
    var deselectSize = 225 * screenScale;   // Portrait outline size when selected
    var selectSize = 325 * screenScale;     // Portrait outline size when not selected

    switch (selected) {
        case 0: // Character 1 selected
            // Draw Character 1
            UICtx.strokeStyle = 'rgba(255,255,255,1.0)';
            UICtx.lineWidth = 10 * screenScale;
            UICtx.strokeRect((width / 3) - selectSize / 2, height / 2 - selectSize / 2, selectSize, selectSize);
            UICtx.globalAlpha = 1.0;
            UICtx.drawImage(charPort0, (width / 3) - ((portSize * 1.5) / 2), height / 2 - ((portSize * 1.5) / 2), (portSize * 1.5), (portSize * 1.5));
            DrawText("VELA", 50, [width / 3, height / 2 + selectSize / 2 + 25 * screenScale], "white", "black", 10, "center", "top");
            UICtx.globalAlpha = 1.0;
            // Draw Character 2
            UICtx.strokeStyle = 'rgba(255,255,255,0.35)';
            UICtx.strokeRect((width / 2) - deselectSize / 2, height / 2 - deselectSize / 2, deselectSize, deselectSize);
            UICtx.globalAlpha = 0.5;
            UICtx.drawImage(charPort1trans, (width / 2) - (portSize / 2), height / 2 - (portSize / 2), portSize, portSize);
            UICtx.globalAlpha = 1.0;
            // Draw Character 3
            UICtx.strokeStyle = 'rgba(255,255,255,0.35)';
            UICtx.strokeRect((width / 3) * 2 - deselectSize / 2, height / 2 - deselectSize / 2, deselectSize, deselectSize);
            UICtx.globalAlpha = 0.5;
            UICtx.drawImage(charPort2trans, ((width / 3) * 2) - (portSize / 2), height / 2 - (portSize / 2), portSize, portSize);
            UICtx.globalAlpha = 1.0;
            break;
        case 1: // Character 2 selected
            // Draw Character 1
            UICtx.strokeStyle = 'rgba(255,255,255,0.35)';
            UICtx.lineWidth = 10 * screenScale;
            UICtx.strokeRect((width / 3) - deselectSize / 2, height / 2 - deselectSize / 2, deselectSize, deselectSize);
            UICtx.globalAlpha = 0.5;
            UICtx.drawImage(charPort0trans, (width / 3) - (portSize / 2), height / 2 - ((portSize / 2)), portSize, portSize);
            UICtx.globalAlpha = 1.0;
            // Draw Character 2
            UICtx.strokeStyle = 'rgba(255,255,255,1.0)';
            UICtx.strokeRect((width / 2) - selectSize / 2, height / 2 - selectSize / 2, selectSize, selectSize);
            UICtx.globalAlpha = 1.0;
            UICtx.drawImage(charPort1, (width / 2) - ((portSize * 1.5) / 2), height / 2 - (((portSize * 1.5) / 2)), (portSize * 1.5), (portSize * 1.5));
            DrawText("QUINN", 50, [width / 2, height / 2 + selectSize / 2 + 25 * screenScale], "white", "black", 10, "center", "top");
            // Draw Character 3
            UICtx.strokeStyle = 'rgba(255,255,255,0.35)';
            UICtx.strokeRect(((width / 3) * 2) - deselectSize / 2, height / 2 - deselectSize / 2, deselectSize, deselectSize);
            UICtx.globalAlpha = 0.5;
            UICtx.drawImage(charPort2trans, ((width / 3) * 2) - (portSize / 2), height / 2 - (portSize / 2), portSize, portSize);
            UICtx.globalAlpha = 1.0;
            break;
        case 2: // Character 3 selected
            // Draw Character 1
            UICtx.strokeStyle = 'rgba(255,255,255,0.35)';
            UICtx.lineWidth = 10 * screenScale;
            UICtx.strokeRect((width / 3) - deselectSize / 2, height / 2 - deselectSize / 2, deselectSize, deselectSize);
            UICtx.globalAlpha = 0.5;
            UICtx.drawImage(charPort0trans, (width / 3) - (portSize / 2), height / 2 - ((portSize / 2)), portSize, portSize);
            UICtx.globalAlpha = 1.0;
            // Draw Character 2
            UICtx.strokeStyle = 'rgba(255,255,255,0.35)';
            UICtx.strokeRect((width / 2) - deselectSize / 2, height / 2 - deselectSize / 2, deselectSize, deselectSize);
            UICtx.globalAlpha = 0.5;
            UICtx.drawImage(charPort1, (width / 2) - ((portSize) / 2), height / 2 - (((portSize) / 2)), (portSize), (portSize));
            UICtx.globalAlpha = 1.0;
            // Draw Character 3
            UICtx.strokeStyle = 'rgba(255,255,255,1.0)';
            UICtx.strokeRect(((width / 3) * 2) - selectSize / 2, height / 2 - selectSize / 2, selectSize, selectSize);
            UICtx.globalAlpha = 1.0;
            UICtx.drawImage(charPort2trans, ((width / 3) * 2) - (portSize * 1.5 / 2), height / 2 - (portSize * 1.5 / 2), portSize * 1.5, portSize * 1.5);
            DrawText("PYXEL", 50, [(width / 3) * 2, height / 2 + selectSize / 2 + 25 * screenScale], "white", "black", 10, "center", "top");
            break;
        default:
            break;
    }
}

// Draw Gameplay screen
function DrawGame() {
    DrawBackground();   // Parallax background
    DrawCanvas();       // Foreground (sprites)
    DrawUI();           // UI
}

// Change the game state and reset menu options
function ChangeState(state) {
    if (state == 1)
        isAnimating = true;     // Animate sprites during gameplay
    else
        isAnimating = false;

    menuSelect.currentTime = 0;
    menuSelect.play();
    selected = 0;                               // Default to first menu option when changing gamestates
    counter = 0;                                // Reset menu option pulse effect on state change
    menuOptions.length = numOptions[state];     // Set menu option array length according to gamestate
    currentGameState = GAMESTATES[state];       // Change to specified gamestate
}

// Draw splash screen
function DrawSplash(logoMult) {
    // Clear layers
    UICtx.clearRect(0, 0, width, height);
    foregroundCtx.clearRect(0, 0, width, height);
    // Draw background
    DrawBackground();
    // UI: title
    UICtx.drawImage(titleImg, width / 2 - (titleImg.width * screenScale) / 2, 100, titleImg.width * screenScale, titleImg.height * screenScale);
    // UI: menu options
    DrawMenuText("PLAY", 150, 65, splashPos, 0, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
    DrawMenuText("INSTRUCTIONS", 150, 65, splashPos, 100, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 1, logoMult);
    DrawMenuText("HISCORES", 150, 65, splashPos, 200, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 2, logoMult);
}

// Draw hiscore screen
function DrawHiscore(logoMult) {
    // Clear layers
    backgroundCtx.clearRect(0, 0, width, height);
    foregroundCtx.clearRect(0, 0, width, height);
    UICtx.clearRect(0, 0, width, height);
    // Draw background
    DrawBackground();
    backgroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);    // Apply darkening filter over background
    // UI: title
    var titlePos = [width / 2, 75 * screenScale];
    DrawText("HISCORE", 100, titlePos, "white", "black", 35, "center", "top");
    var scorePos = [width / 2, height/2];
    DrawText("Hiscore: " + hiscore, 75, scorePos, "white", "black", 35, "center", "middle");
    // UI: menu options
    DrawMenuText("RETURN TO MENU", 150, 65, [width / 2, height - 200 * screenScale], 75, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
}

// Draw game over screen
function DrawGameOver(logoMult) {
    // Clear layers
    backgroundCtx.clearRect(0, 0, width, height);
    foregroundCtx.clearRect(0, 0, width, height);
    UICtx.clearRect(0, 0, width, height);
    // Draw background
    DrawBackground();
    backgroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);    // Apply darkening filter over background
    // UI: title
    var titlePos = [width / 2, 75 * screenScale];
    DrawText("GAME OVER", 100, titlePos, "white", "black", 35, "center", "top");
    var scorePos = [width / 2, 250 * screenScale];
    // UI: menu options
    DrawText("Score: " + score, 75, scorePos, "white", "black", 35, "center", "top");
    if (newHiscore) {
        scorePos = [scorePos[0], 350 * screenScale];
        DrawText("New hiscore!", 75, scorePos, "white", "black", 35, "center", "top");
    }
    DrawMenuText("RETRY", 150, 65, splashPos, 75, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
    DrawMenuText("EXIT", 150, 65, splashPos, 200, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 1, logoMult);
}

// Draw pause screen
function DrawPause(logoMult) {
    // Clear layers
    UICtx.clearRect(0, 0, width, height);
    // Draw background and sprites
    DrawBackground();
    DrawCanvas();
    // Apply darkening over background and sprites
    backgroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);
    foregroundCtx.fillStyle = 'rgba(0,0,0,0.3)';
    foregroundCtx.fillRect(0, 0, width, height);
    // UI: title
    var titlePos = [width / 2, 75 * screenScale];
    DrawText("PAUSED", 100, titlePos, "white", "black", 35, "center", "top");
    // UI: menu options
    DrawMenuText("RESUME", 150, 65, splashPos, 0, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 0, logoMult);
    DrawMenuText("RESET", 150, 65, splashPos, 100, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 1, logoMult);
    DrawMenuText("EXIT", 150, 65, splashPos, 200, "DarkTurquoise", "white", "black", "white", 20, 45, "center", "middle", 2, logoMult);
}

// Draw parallax background
function DrawBackground() {
    // Clear layer
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
    // Parallax: Tree plane
    for (var i = 0; i < treesScroll.length; i++) {
        backgroundCtx.drawImage(treesScroll[i].image, treesScroll[i].x, 0, treesScroll[i].width * screenScale, treesScroll[i].height * screenScale);
    }
    // Parallax: Highway plane
    for (var i = 0; i < highwayScroll.length; i++) {
        backgroundCtx.drawImage(highwayScroll[i].image, highwayScroll[i].x, highwayScroll[i].y, highwayScroll[i].width * screenScale, highwayScroll[i].height * screenScale);
    }

}

// Draw foreground canvas
function DrawCanvas() {
    // Clear layer
    foregroundCtx.clearRect(0, 0, width, height);

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
    // Draw powerups
    for (var i = 0; i < powerups.length; i++) {
        foregroundCtx.drawImage(powerups[i].img, powerups[i].x, powerups[i].y, powerups[i].width * screenScale, powerups[i].height * screenScale);
    }
    // Animate sprites
    if (isAnimating) {
        AnimationFrame(player);
        for (var i = 0; i < playerBullets.length; i++) {
            AnimationFrame(playerBullets[i]);
        }
    }
}

// Draw gameplay UI
function DrawUI() {
    // Clear layer
    UICtx.clearRect(0, 0, width, height);
    // Score text
    var text = "Score: " + score;
    DrawText(text, 30 * screenScale, [25 * screenScale, 25 * screenScale], "white", "black", 8, "left", "top");
    // Health text
    text = "Health: " + player.health;
    DrawText(text, 30 * screenScale, [25 * screenScale, 65 * screenScale], "white", "black", 8, "left", "top");
    // Health indicator
    for (var i = 0; i < player.healthMax; i++) {    // Draw indicator transparent when below iterated health value
        if (player.health - 1 < i) {
            UICtx.globalAlpha = 0.2;
            UICtx.drawImage(heartImg, 25 * screenScale + (i * 60) * screenScale, 110 * screenScale, 50, 47);
        }
        else {                                      // Draw health indicator at full opacity when player health above interated value
            UICtx.globalAlpha = 1;
            UICtx.drawImage(heartImg, 25 * screenScale + (i * 60) * screenScale, 110 * screenScale, 50, 47);
        }

        UICtx.globalAlpha = 1;  // Return global alpha to opaque
    }

    // Set level text colour depending on current level
    var textCol = "";
    if (level < 2)
        textCol = "DarkTurquoise";
    else if (level < 3)
        textCol = "Chartreuse ";
    else if (level < 4)
        textCol = "Gold";
    else if (level < 5)
        textCol = "DarkOrange";
    else if (level < 6)
        textCol = "Crimson";
    else
        textCol = "DeepPink"

    if (level < 6)  // Draw level text using determined colour below max level
        DrawMenuText("LEVEL " + level, 75, 75, [width / 2, 25 * screenScale], 0, textCol, "white", "black", "white", 10, 25, "center", "top", 0);
    else            // Draw level text using set colour when max level reached
        DrawMenuText("LEVEL MAX", 75, 75, [width / 2, 25 * screenScale], 0, textCol, "white", "black", "white", 10, 25, "center", "top", 0);

    if (particles.length > 0) {
        for (var i = particles.length - 1; i >= 0; i--) {
            particles[i].update();          // Update particles if array isn't empty
            UICtx.fillStyle = "rgba(" + particles[i].r + "," + particles[i].g + "," + particles[i].b + "," + particles[i].alpha + ")";
            particles[i].Draw(UICtx);       // Draw particle using specified colour values
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);     // Delete particle when alpha reaches 0
                i--;
            }
        }
    }
}

// Generic text draw function (title text)
function DrawText(text, size, pos, fillCol, strokeCol, strokeWidth, align, baseline) {
    UICtx.font = '' + (size * screenScale) + 'px "Joystix"';    // Set font
    UICtx.textAlign = align;                                    // Set text alignment
    UICtx.strokeStyle = strokeCol;                              // Set stroke colour
    UICtx.lineWidth = strokeWidth * screenScale;                // Set stroke width
    UICtx.textBaseline = baseline;                              // Set text baseline
    UICtx.strokeText(text, pos[0], pos[1]);                     // Stroke text at position
    UICtx.fillStyle = fillCol;                                  // Set text fill colour
    UICtx.fillText(text, pos[0], pos[1]);                       // Fill text at position

}

// Generic text draw function (menu text)
function DrawMenuText(text, sizeSelected, sizeUnselected, pos, spacing, fillCol, strokeColInner, strokeColOuter, shadowCol, strokeWidthInner, strokeWidthOuter, align, baseline, selectID, logoMult) {
    if (selected == selectID) { // Draw menu text when selected
        DrawText(text, (sizeSelected * logoMult), [pos[0] + (10 * screenScale), pos[1] + (spacing * screenScale) + (10 * screenScale)], shadowCol, shadowCol, strokeWidthOuter, align, baseline);   // Shadow
        DrawText(text, (sizeSelected * logoMult), [pos[0], pos[1] + (spacing * screenScale)], fillCol, strokeColOuter, strokeWidthOuter, align, baseline);                                          // Outer
        DrawText(text, (sizeSelected * logoMult), [pos[0], pos[1] + (spacing * screenScale)], fillCol, strokeColInner, strokeWidthInner, align, baseline);                                          // Inner
    }
    else {                      // Draw menu text when deselected
        DrawText(text, (sizeUnselected), [pos[0] + (10 * screenScale), pos[1] + (spacing * screenScale) + (10 * screenScale)], shadowCol, shadowCol, strokeWidthOuter, align, baseline);    // Shadow
        DrawText(text, (sizeUnselected), [pos[0], pos[1] + (spacing * screenScale)], fillCol, strokeColOuter, strokeWidthOuter, align, baseline);                                           // Outer
        DrawText(text, (sizeUnselected), [pos[0], pos[1] + (spacing * screenScale)], fillCol, strokeColInner, strokeWidthInner, align, baseline);                                           // Inner
    }
}