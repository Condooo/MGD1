var layer1;
var layer2;
var layer3;
var city = new Image();
var backgroundImg = new Image();

var gameStates = ["Splash", "Game", "Pause", "GameOver"];
var currentGameState = gameStates[0];

var RequestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = RequestAnimationFrame;

// Set dimensions to fullscreen
var width = window.innerWidth;
var height = window.innerHeight;
// Set layers z-index
var background = document.getElementById("layer1");
var canvas = document.getElementById("layer2");
var UI = document.getElementById("layer3");
// Set context by layers
var backgroundCtx = background.getContext("2d");
var foregroundCtx = canvas.getContext("2d");
var UICtx = UI.getContext("2d");
// Store current and previous frame keystates
var keys = [];
var previousKeys = [];
var isKeyPressed = false;
var friction = 0.8;

var objects = [];
// PLAYER VARIABLES
var player = {
    x: width / 2,
    y: height / 2,
    width: 150,
    height: 150,
    velX: 0,
    velY: 0
};
// -Animation
var startTimeMS = 0;
var frameX = 0;
var frameXMax = 6;
var frameY = 0;
var frameYMax = 3;
var frame = 0;
var frameMax = 26;
var frameTimer = 0.05;
var frameTimeMax = 0.017;
// -Sprite
var spriteWidth = 74;
var spriteHeight = 86;
var playerImg = new Image();
var speed = 5;
var isGrounded = true;


var imgCrate = new Image();
var boxes = [];

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

// Run setup when loaded
window.addEventListener("load", function () {
    Initialise();
    Update();
});

// Detect keypress for movement animation start
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
    if (e.keyCode == 40 || e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 37) {
        isKeyPressed = true;
    }
});

// Detect keyup for movement animation end
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
    if (e.keyCode == 40 || e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 37) {
        isKeyPressed = false;
    }
});


function Initialise() {
    // Specify canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Load images from file
    city.src = "city.png";
    backgroundImg.src = "background.png";
    imgCrate.src = "RTS_Crate_0.png";

    boxes.push({
        x: 120,
        y: 120,
        width: 200,
        height: 200,
        velX: 0,
        velY: 0
    });
    boxes.push({
        x: 500,
        y: 300,
        width: 200,
        height: 200,
        velX: 0,
        velY: 0
    });

    // Add all boxes to objects array
    for (var i = 0; i < boxes.length; i++) {
        objects.push(boxes[i]);
        console.log("Object: " + i + " " + objects[i].x);
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
        var oX = hWidths - Math.abs(vX),    // How far the objects are colliding within each other on X-axis        (overlap on X-axis)
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

function AnimationFrame() {
    var elapsed = (Date.now() - startTimeMS) / 1000;
    startTimeMS = Date.now();

    //only update frames when timer is below 0
    frameTimer = frameTimer - elapsed;
    if (frameTimer <= 0) {
        frameTimer = frameTimeMax;
        frameX++;
        if (frameX > frameXMax) {
            frameX = 0;
            frameY++;
            //end of row, move down to next row in sheet
            if (frameY > frameYMax) {
                frameY = 0;
            }
        }
        frame++;
        // Reset frames to 0 if empty spaces on sprite sheet
        if (frame > frameMax) {
            frame = 0;
            frameX = 0;
            frameY = 0;
        }
    }

}

function CalculateCollisions() {
    // Screen edge collision
    if (player.x < 0)                           // Left edge
        player.x = 0;
    if (player.x > (width - player.width))      // Right edge
        player.x = (width - player.width);
    if (player.y < 0) {                         // Top edge
        player.y = 0;
        player.velY = 0;
    }
    if (player.y > (height - player.height)) {  // Bottom edge
        player.y = (height - player.height);
        player.velY = 0;
        isGrounded = true;
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
            isGrounded = true;
        }
    }
}

// Apply gravity to all objects stored in objects array
function ApplyGravity() {
    for (var i = 0; i < objects.length; i++) {
        objects[i].velY += 1;
        objects[i].y += objects[i].velY;
    }
}

function PlayerControl() {
    if (keys[40] && isGrounded) {
        // Down arrow
        if (player.y < (canvas.height - player.height - 20))
            player.velY += speed;
    }
    if (keys[38] && !previousKeys[38] && isGrounded) {
        // Up arrow
        if (player.y > 0) {
            player.velY -= 50;
            isGrounded = false;
        }
    }
    if (keys[39]) {
        // Right arrow
        if (player.x < (canvas.width - player.width - 20))
            player.velX += speed;
    }
    if (keys[37]) {
        // Left arrow
        if (player.x > 0)
            player.velX -= speed;
    }

    // Update player's x-position
    player.velX *= friction;
    player.x += player.velX;
}

function ProcessInput() {

    switch (currentGameState) {
        case gameStates[0]:                 // Splash screen
            // TODO: Splash input
            break;
        case gameStates[1]:                 // Game screen
            PlayerControl();
            break;
        case gameStates[2]:                 // Pause screen
            // TODO: Pause input
            break;
        case gameStates[3]:                 // Game over screen
            // TODO: GameOver input
            break;
        default:
            break;
    }

    StateControl();
}

function StateControl() {
    if (keys[97]) {                                 // Splash
        currentGameState = gameStates[0];
        console.log("State: " + currentGameState);
    }
    if (keys[98]) {                                 // Game
        currentGameState = gameStates[1];
        console.log("State: " + currentGameState);
    }
    if (keys[99]) {                                 // Pause
        currentGameState = gameStates[2];
        console.log("State: " + currentGameState);
    }
    if (keys[100]) {                                // Game over
        currentGameState = gameStates[3];
        console.log("State: " + currentGameState);
    }

}

function Update() {
    ProcessInput();

    // Determine state to update
    switch (currentGameState) {
        case gameStates[0]:                 // Splash
            DrawSplash();
            break;
        case gameStates[1]:                 // Game
            ApplyGravity();
            CalculateCollisions();
            DrawGame();
            break;
        case gameStates[2]:                 // Pause
            DrawPause();
            break;
        case gameStates[3]:                 // Game over
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
}

function DrawSplash() {
    backgroundCtx.clearRect(0, 0, width, height);
    backgroundCtx.fillStyle = 'rgb(150, 0, 150)';
    backgroundCtx.rect(50, 50, width-50, height-50);
}

function DrawGameOver() {
    backgroundCtx.clearRect(0, 0, width, height);
}

function DrawPause() {
    DrawBackground();
    DrawCanvas();
    backgroundCtx.fillStyle = 'rgba(75,75,150,0.3)';
    backgroundCtx.fillRect(0, 0, width, height);
    foregroundCtx.fillStyle = 'rgba(75,75,150,0.3)';
    foregroundCtx.fillRect(0, 0, width, height);
}

function DrawBackground() {
    backgroundCtx.clearRect(0, 0, width, height);
    backgroundCtx.drawImage(backgroundImg, 0, 0, width, height);
}

function DrawCanvas() {
    foregroundCtx.clearRect(0, 0, width, height);

    for (var i = 0; i < boxes.length; i++) {
        // Draw the boxes to the background
        backgroundCtx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        backgroundCtx.drawImage(imgCrate, boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
    }

    if (isKeyPressed && currentGameState == gameStates[1]) {
        AnimationFrame();
        foregroundCtx.drawImage(playerImg, spriteWidth * frameX, spriteHeight * frameY, spriteWidth, spriteHeight, player.x, player.y, player.width, player.height);
    } else
        foregroundCtx.drawImage(playerImg, spriteWidth * 2, spriteHeight * 1, spriteWidth, spriteHeight, player.x, player.y, player.width, player.height);
}

function DrawUI() {
    UICtx.font = "30px Comic Sans MS";
    UICtx.fillStyle = "red";
    UICtx.textAlign = "center";
    UICtx.fillText("Hello World", 100, 20);

    playerImg.src = 'braidSpriteSheet.png';
}