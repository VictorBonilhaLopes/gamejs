//playable area
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize * 2;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight,
}

let shipImg;
let shipVelocityX = tileSize; //ship speed

//alien
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize * 1.2;
let alienX = tileSize;
let alienY = tileSize;
let alienImages = [
    "../img/enemy1.png",
    "../img/enemy2.png",
    "../img/enemy1.png",
    "../img/enemy2.png"
];
let currentAlienImageIndex = 0;
let alienImg = new Image();
alienImg.src = alienImages[currentAlienImageIndex]; //image array

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number to defeat
let alienVelocityX = 2; //alien speed

//bullet
let bulletArray = [];
let bulletVelocityY = -10;

//score
let score = 0;
let gameState = "start";

window.onload = function () {
    board = document.getElementById('board');
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext('2d');

    shipImg = new Image();
    shipImg.src = "../img/attack.png";
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    };

    requestAnimationFrame(update);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", shoot)
}

function drawStartScreen() {
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "white";
    context.font = "30px Arial";
    context.textAlign = "center";
    context.fillText("Press Enter to Start", board.width / 2, board.height / 2);
}

function drawGameOverScreen() {
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "white";
    context.font = "30px Arial";
    context.textAlign = "center";
    context.fillText("Game Over", board.width / 2, board.height / 2 - 60);
    context.fillText("Your Score: " + score, board.width / 2, board.height / 2 - 20);
    context.fillText("Press Enter to Restart", board.width / 2, board.height / 2 + 30);
}

function handleKeyDown(e) {
    if (gameState === "start" || gameState === "gameOver") {
        if (e.code === "Enter") {
            startGame();
        }
    } else if (gameState === "playing") {
        moveShip(e);
    }
}

function startGame() {
    score = 0;
    currentAlienImageIndex = 0;
    gameState = "playing";
    alienArray = [];
    alienCount = 0;
    alienColumns = 3; 
    alienRows = 2; 
    alienVelocityX = 2;
    ship.x = shipX;
    ship.y = shipY;
    bulletArray = [];
    creatAliens();
}

function update() {
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    if (gameState === "start") {
        drawStartScreen();
        return;
    }

    if (gameState === "gameOver") {
        drawGameOverScreen();
        return;
    }

    if (gameState === "playing") {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

        for (let i = 0; i < alienArray.length; i++) {
            let alien = alienArray[i];
            if (alien.alive) {
                alien.x += alienVelocityX;
                if (alien.x + alien.width >= board.width || alien.x <= 0) {
                    alienVelocityX *= -1;
                    alien.x += alienVelocityX * 2;

                    for (let j = 0; j < alienArray.length; j++) {
                        alienArray[j].y += alienHeight;
                    }
                }

                context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

                if (alien.y >= ship.y) {
                    gameState = "gameOver";
                }
            }
        }

        for (let i = 0; i < bulletArray.length; i++) {
            let bullet = bulletArray[i];
            bullet.y += bulletVelocityY;
            context.fillStyle = "white";
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            //bullets collisions with alians
            for (let j = 0; j < alienArray.length; j++) {
                let alien = alienArray[j]
                if (!bullet.used && alien.alive && detectColision(bullet, alien)) {
                    bullet.used = true;
                    alien.alive = false;
                    alienCount--;
                    score += 100;
                }
            }
        }

        while (bulletArray.length > 0 && bulletArray[0].used) {
            bulletArray.shift();//removes the first
        }

        //next level
        if (alienCount == 0) {
            //change image
            currentAlienImageIndex = (currentAlienImageIndex + 1) % alienImages.length;
            alienImg.src = alienImages[currentAlienImageIndex];
            //increse alien
            alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
            alienRows = Math.min(alienRows + 1, rows - 4);
            alienVelocityX += 0.2;
            alienArray = [];
            bulletArray = [];
            creatAliens();
        }
    }
}

function moveShip(e) {
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if ((e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width)) {
        ship.x += shipVelocityX;
    }
}

function creatAliens() {
    for (let i = 0; i < alienColumns; i++) {
        for (let j = 0; j < alienRows; j++) {
            let alien = {
                img: alienImg,
                x: alienX + i * alienWidth,
                y: alienY + j * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true,
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (e.code == "Space" && gameState === "playing") {
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false,
        }
        bulletArray.push(bullet);

        const audio = document.getElementById('audio');
        audio.currentTime = 0; // Reinicia o áudio
        audio.play().catch(error => {
            console.error('Erro ao tentar reproduzir o áudio:', error);
        });
    }
}

function detectColision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
