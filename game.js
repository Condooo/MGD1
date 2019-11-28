var debugActive = true;

var city = new Image();
var backgroundImg = new Image();

var gameStates = ["Splash", "Game", "Pause", "GameOver", "Hiscore"];
var currentGameState = gameStates[0];

var RequestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = RequestAnimationFrame;

var mobilePlatform = false;
// Set dimensions to fullscreen
var width = window.innerWidth;
var height = window.innerHeight;
var screenScale = height / 1080;
// Set layers z-index
var background = document.getElementById("layer1");     // Absolute background
var back1 = document.getElementById("layer2");          // Parallax background 1
var back2 = document.getElementById("layer3");          // Parallax background 2
//var back3 = document.getElementById("layer4");        // Parallax background 3
var canvas = document.getElementById("layer5");         // Foreground
var UI = document.getElementById("layer6");             // UI
// Set context by layers
var backgroundCtx = background.getContext("2d");
var foregroundCtx = canvas.getContext("2d");
var UICtx = UI.getContext("2d");
var contexts = [];

// Splash screen values
var splashPos = [width / 2, height / 2];
var counter = 0;
var pulseSpeed = 1.5;
var pulseExtent = 20;
var increase = Math.PI * pulseSpeed / 100;
var selected = 0;
var menuOptions = [];


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
var isKeyPressed = false;
var friction = 0.8;

var objects = [];
// PLAYER VARIABLES
var player = {
    x: width / 4,
    y: height / 2,
    width: 150,
    height: 150,
    velX: 0,
    velY: 0,
    facing: "right"
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
var speed = 3;
var isGrounded = true;

var globalX = 0;


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
    if (e.keyCode == 40 || e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 37) {
        isKeyPressed = true;
    }
});

// Set keyup
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
    if (e.keyCode == 40 || e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 37) {
        isKeyPressed = false;
    }
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


function Initialise() {

    // Specify canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Load images from file
    backgroundImg.src = "background.png";
    imgCrate.src = "RTS_Crate_0.png";

    menuOptions.length = 3;

    globalX = player.x;
    console.log("player pos" + globalX);

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
    if (mobilePlatform) {                                       // Mobile Input Handler
        // TODO: Mobile input
    }
    else {                                                      // PC Input Handler
        if (keys[83] && isGrounded) {                           // S: Down
            if (player.y < (canvas.height - player.height - 20))
                player.velY += speed;
        }
        if (keys[87]) {                                         // W: Up

        }
        if (keys[68]) {                                         // D: Right
            if (KeyDown(68))
                player.facing = "right";
            if (player.x < (canvas.width - player.width - 20))
                player.velX += speed;
            else
                player.velX = 0;
        }
        if (keys[65]) {                                         // A: Left
            if (KeyDown(65))
                player.facing = "left";
            if (player.x > 0)
                player.velX -= speed;
            else
                player.velX = 0;
        }
        if (keys[32] && !previousKeys[32] && isGrounded) {      // Space: Jump
            if (player.y > 0) {
                player.velY -= 30;
                isGrounded = false;
            }
        }
    }

    // Update player's x-position
    player.velX *= friction;
    if (player.x < width / 2);
        player.x += player.velX;

    // Update the player's global X-position
    globalX += player.velX;
    console.log("compare player: " + player.x + " to global: " +globalX);
}

function ProcessInput() {
    switch (currentGameState) {
        case gameStates[0]:                 // Splash screen
            SplashInput();
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

    if (KeyDown(46))
        debugActive = !debugActive;

    if (debugActive)
        StateControl();
}

function StateControl() {
    if (KeyDown(49)) {                                 // Splash
        selected = 0;
        menuOptions.length = 3;
        currentGameState = gameStates[0];
        console.log("State: " + currentGameState);
    }
    if (KeyDown(50)) {                                 // Game
        selected = 0;
        currentGameState = gameStates[1];
        console.log("State: " + currentGameState);
    }
    if (KeyDown(51)) {                                 // Pause
        selected = 0;
        currentGameState = gameStates[2];
        console.log("State: " + currentGameState);
    }
    if (KeyDown(52)) {                                // Game over
        selected = 0;
        currentGameState = gameStates[3];
        console.log("State: " + currentGameState);
    }

}

function SplashInput() {
    // MENU SELECTION
    if (KeyDown(13)) {
        console.log("Enter - selected: " + selected);
        switch (selected) {
            case 0: // Play
                currentGameState = gameStates[1];
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
    if (KeyDown(40)) {
        if (selected + 1 >= menuOptions.length) {
            selected = 0;
            counter = 0;
        }
        else {
            selected++;
            counter = 0;
        }
        console.log("Selected: " + selected);
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
        console.log("Selected: " + selected);
    }
}

function UpdateGame() {
    ApplyGravity();
    CalculateCollisions();
    DrawGame();
}

function UpdatePause() {
    DrawPause();
}

function Update() {
    ProcessInput();
    // Determine state to update
    switch (currentGameState) {
        case gameStates[0]:                 // Splash
            DrawSplash();
            break;
        case gameStates[1]:                 // Game
            UpdateGame();
            break;
        case gameStates[2]:                 // Pause

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
    DrawUI();
}

function AnimateMenuOptions() {
    var logoMult = Math.sin(counter) / pulseExtent + 0.5;
    counter += increase;

    switch (currentGameState) {
        case gameStates[0]:
            // Option 1
            if (selected == 0) {
                DrawText("PLAY", (150 * logoMult) * screenScale, [splashPos[0] + 10, splashPos[1] + 10], "white", "white", 45, "center", "middle");
                DrawText("PLAY", (150 * logoMult) * screenScale, [splashPos[0], splashPos[1]], "DarkTurquoise", "Black", 45, "center", "middle");
                DrawText("PLAY", (150 * logoMult) * screenScale, [splashPos[0], splashPos[1]], "DarkTurquoise", "white", 20, "center", "middle");
            }
            else {
                DrawText("PLAY", (65) * screenScale, [splashPos[0] + 10, splashPos[1] + 10], "white", "white", 45, "center", "middle");
                DrawText("PLAY", (65) * screenScale, [splashPos[0], splashPos[1]], "DarkTurquoise", "Black", 45, "center", "middle");
                DrawText("PLAY", (65) * screenScale, [splashPos[0], splashPos[1]], "DarkTurquoise", "white", 20, "center", "middle");
            }
            // Option 2
            if (selected == 1) {
                DrawText("OPTION2", (150 * logoMult) * screenScale, [splashPos[0] + 10, splashPos[1] + 100 + 10], "white", "white", 45, "center", "middle");
                DrawText("OPTION2", (150 * logoMult) * screenScale, [splashPos[0], splashPos[1] + 100], "DarkTurquoise", "Black", 45, "center", "middle");
                DrawText("OPTION2", (150 * logoMult) * screenScale, [splashPos[0], splashPos[1] + 100], "DarkTurquoise", "white", 20, "center", "middle");
            }
            else {
                DrawText("OPTION2", (65) * screenScale, [splashPos[0] + 10, splashPos[1] + 100 + 10], "white", "white", 45, "center", "middle");
                DrawText("OPTION2", (65) * screenScale, [splashPos[0], splashPos[1] + 100], "DarkTurquoise", "Black", 45, "center", "middle");
                DrawText("OPTION2", (65) * screenScale, [splashPos[0], splashPos[1] + 100], "DarkTurquoise", "white", 20, "center", "middle");
            }
            // Option 3
            if (selected == 2) {
                DrawText("OPTION3", (150 * logoMult) * screenScale, [splashPos[0] + 10, splashPos[1] + 200 + 10], "white", "white", 45, "center", "middle");
                DrawText("OPTION3", (150 * logoMult) * screenScale, [splashPos[0], splashPos[1] + 200], "DarkTurquoise", "Black", 45, "center", "middle");
                DrawText("OPTION3", (150 * logoMult) * screenScale, [splashPos[0], splashPos[1] + 200], "DarkTurquoise", "white", 20, "center", "middle");
            }
            else {
                DrawText("OPTION3", (65) * screenScale, [splashPos[0] + 10, splashPos[1] + 200 + 10], "white", "white", 45, "center", "middle");
                DrawText("OPTION3", (65) * screenScale, [splashPos[0], splashPos[1] + 200], "DarkTurquoise", "Black", 45, "center", "middle");
                DrawText("OPTION3", (65) * screenScale, [splashPos[0], splashPos[1] + 200], "DarkTurquoise", "white", 20, "center", "middle");
            }
            break;
        case gameStates[1]:
            break;
        case gameStates[2]:
            break;
        case gameStates[3]:
            break;
        default:
            break;
    }
}

function DrawSplash() {
    UICtx.clearRect(0, 0, width, height);
    backgroundCtx.clearRect(0, 0, width, height);
    backgroundCtx.fillStyle = 'rgba(100, 100, 100)';
    backgroundCtx.fillRect(50, 50, width - 100, height - 100);
    DrawText("TEST", 150, [width / 2, 100], "white", "black", 35, "center", "top");
    AnimateMenuOptions();
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

    // Draw player
    if (isKeyPressed && currentGameState == gameStates[1]) {
        AnimationFrame();
        foregroundCtx.drawImage(playerImg, spriteWidth * frameX, spriteHeight * frameY, spriteWidth, spriteHeight, player.x, player.y, player.width, player.height);
    } else
        foregroundCtx.drawImage(playerImg, spriteWidth * 2, spriteHeight * 1, spriteWidth, spriteHeight, player.x, player.y, player.width, player.height);
}

function DrawUI() {
    UICtx.clearRect(0, 0, width, height);
    var text = "Hello World";
    DrawText(text, 30, [width/2,height/2], "white", "black", 8, "top");
    //UICtx.clearRect(0, 0, width, height);
    //UICtx.font = '30px "Joystix"';
    //UICtx.strokeStyle = 'black';
    //UICtx.lineWidth = 8;
    //UICtx.strokeText(text, 0, 0);
    //UICtx.fillStyle = 'white';
    //UICtx.textBaseline = 'top';
    //UICtx.fillText(text, 0, 0);

    playerImg.src = 'braidSpriteSheet.png';
}

function DrawText(text, size, pos, fillCol, strokeCol, strokeWidth, align, baseline) {
    //UICtx.clearRect(0, 0, width, height);
    UICtx.font = '' + size + 'px "Joystix"';
    UICtx.textAlign = align;
    UICtx.strokeStyle = strokeCol;
    UICtx.lineWidth = strokeWidth;
    UICtx.textBaseline = baseline;
    UICtx.strokeText(text, pos[0], pos[1]);
    UICtx.fillStyle = fillCol;
    UICtx.textBaseline = baseline;
    UICtx.fillText(text, pos[0], pos[1]);

}