var sock = io();
var myGamePiece;
var otherGamePiece;
var myObstacles = [];
var myScore;
var projectiles = [];

function startGame() {
//    myGamePiece = new component(10, 10, "blue", 10, 120);
//    otherGamePiece = new component(10, 10, "red", 100, 120);
    myGamePiece = new component(20, 20, "roll.png", 10, 120, "image");
    otherGamePiece = new component(20, 20, "flushed.png", 10, 120, "image");
    myGamePiece.gravity = 0.05;
    otherGamePiece.gravity = 0.05;
    myScore = new component("30px", "Consolas", "black", 280, 40, "text");
    myGameArea.start();
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 640;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 60);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.update = function () {
        ctx = myGameArea.context;
        if (this.type == "image") {
            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.width,
                this.height);
        }
        else if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.updatePos = function () {
        //myGamePiece.image.src = "fine.png"
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.bound();
    }
    this.posEmit = function () {
        sock.emit('pos', this.x, this.y);
    }
    this.posRecive = function () {
        sock.on('pos', (x, y) => {
            this.x = x;
            this.y = y;
        });
    }
    this.bound = function () {
        var bottom = myGameArea.canvas.height - this.height;
        var rightBound = myGameArea.canvas.width - this.width;
        if (this.y > bottom) {
            this.y = bottom;
            this.gravitySpeed = 0;
        }
        if (this.x > rightBound) {
            this.x = rightBound;
            this.speedX = 0;
        }
        if (this.x < 0) {
            this.x = 0;
            this.speedX = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.speedY = 0;
        }

    }
    this.crashWith = function (otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
    this.move = function (accelrateX, accelrateY) {
        myGamePiece.image.src = "fine.png";
        this.speedX += accelrateX;
        if (this.gravitySpeed > -1) {
            this.gravitySpeed += accelrateY;
        }
    }
    this.attack1 = function () {
        myGamePiece.image.src = "roll.png";
        var direction = myGamePiece.x - otherGamePiece.x;
        if (direction < 0) {
            direction = 1;
        } else {
            direction = -1;
        }
        sock.emit('fire', this.x, this.y, direction);
        sock.on('firec', (x, y, direction) => {
            var projectile = new component(10, 10, "green", x+direction*(this.width+1), y);
            projectile.speedX = direction;
            projectiles.push(projectile);
        });
    }
}

function updateGameArea() {
    checkCrash();
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (everyinterval(50)) {
        myGamePiece.attack1();
    }
    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.updatePos();
    myGamePiece.update();
    myGamePiece.posEmit();

    otherGamePiece.posRecive();
    otherGamePiece.update();

    updateProjectiles();
}

function updateProjectiles() {
    for (i = 0; i < projectiles.length; i += 1) {
        projectiles[i].updatePos();
        projectiles[i].update();
    }
}

function checkCrash() {
    for (i = 0; i < projectiles.length; i += 1) {
        if (myGamePiece.crashWith(projectiles[i])) {
            clearInterval(myGameArea.interval);
            document.getElementById("demo").innerHTML = "You lose";
        }
        if (otherGamePiece.crashWith(projectiles[i])) {
            clearInterval(myGameArea.interval);
            document.getElementById("demo").innerHTML = "You win";
        }
    }
}

function endGame() {
    sock.on('end', (x, y, direction) => {
        document.getElementById("demo").innerHTML = "You win";
        clearInterval(myGameArea.interval);
    });
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function accelerate(n) {
    myGamePiece.speedX += n;
}

document.addEventListener('keypress', (event) => {
    const keyName = event.key;
    if (keyName == 'd') {
        //alert('keypress event\n\n' + 'key: ' + keyName);
        myGamePiece.move(0.1, 0);
    }
    if (keyName == 's') {
        myGamePiece.move(0, 0.1);
    }
    if (keyName == 'w') {
        myGamePiece.move(0, -1);
    }
    if (keyName == 'a') {
        myGamePiece.move(-0.1, 0);
    }
    if (keyName == 'j') {
        myGamePiece.attack1();
    }
});

function test() {
    document.getElementById("demo").innerHTML = "Hello World form test";
}

document.getElementById('match').addEventListener('click', function () {
    sock.emit('match');
    sock.on('matchStart', function () {
        startGame();
    });
});
//otherGamePiece.posRecive();
//fireRecive();