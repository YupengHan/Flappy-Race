var sock = io();
var myGamePiece;
var otherGamePiece;
var myObstacles = [];
var myScore;

function startGame() {
    myGamePiece = new component(10, 10, "blue", 10, 120);
    otherGamePiece = new component(10, 10, "red", 100, 120);
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
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function () {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.posEmit = function () {
        sock.emit('pos', this.x, this.y);
    }
    this.posRecive = function () {
        
        sock.on('pos', function (x, y) {
      
            document.getElementById("demo").innerHTML = x + "and" + y;
            otherGamePiece.x = x;
            otherGamePiece.y = y;
        });

    }

    this.hitBottom = function () {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
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
        this.speedX += accelrateX;
        if (this.gravitySpeed > -1) {
            this.gravitySpeed += accelrateY;
        }

    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            return;
        }
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        //minGap = 50;
        //maxGap = 200;
        //gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
    }

    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
    myGamePiece.posEmit();
    sock.on('pos', function (x, y) {
        document.getElementById("demo").innerHTML = x + "and" + y;
        otherGamePiece.x = x;
        otherGamePiece.y = y;
    });
    otherGamePiece.update();
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