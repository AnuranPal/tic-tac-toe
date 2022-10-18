$(function () {
    var $divUserInputs = $("#divUserInputs");
    var symbols = $(".symbol");
    symbols.click(function () {
        if (!$(this).hasClass("active")) {
            symbols.removeClass("active");
            $(this).addClass("active");
        }
    });

    var playButton = $("#btnPlay");
    var $playboardContainer = $("#tic-tac-toe-board");
    var $checkFirstMove = $("#checkFirstMove");

    playButton.click(function () {
        var chosenSymbol = symbols.filter(function () {
            return $(this).hasClass("active");
        }).attr("id");
        var hasCheckedFirstMove = $checkFirstMove.is(":checked");
        $divUserInputs.hide();
        var playBoard = new PlayBoard();
        var user = new User(+chosenSymbol, playBoard, "You");
        var computer = new User((chosenSymbol % 2) + 1, playBoard, "computer", true);
        user.setOpponent(computer);
        computer.setOpponent(user);
        playBoard.draw($playboardContainer).done(function () {
            if (!hasCheckedFirstMove)
                setTimeout(computer.playMove.bind(computer), 500);
            else
                playBoard.on("click", user.playMove.bind(user));
        });
        
    });

    function getColor() {
        var colors = ["red", "green", "blue", "yellow", "chartreuse", "CornflowerBlue", "Crimson", "DarkMagenta", "ForestGreen", "Gold", "LawnGreen", "OrangeRed", "Turquoise", "Violet"];
        var idx = Math.random() * (colors.length - 1);
        return colors[Math.floor(idx)];
    }

    var canvas = document.getElementById("burst");
    var ctx = canvas.getContext("2d");
    var Circle = function (cx, cy, r, color, life) {
        this.cx = cx;
        this.cy = cy;
        this.radius = r;
        this.color = color || getColor();
        this.life = life || 100;
        this.update = function () {
            if (this.life > 0) {
                this.life -= 10;
            } else {
                this.cx = Math.random() * canvas.width;
                this.cy = Math.random() * canvas.height;
                this.life = 100;
                this.color = getColor();
            }
        }
        this.draw = function () {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life / 100;
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, this.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    var circles = [];
    for (var i = 0; i < 500; i++) {
        var posX = Math.random() * canvas.width;
        var posY = Math.random() * canvas.height;
        var radius = Math.random() * 5;
        var color = getColor();
        var life = Math.random() * 100;
        circles.push(new Circle(posX, posY, radius, color, life));
    }

    var _burst = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0, iL = circles.length; i < iL; i++) {
            circles[i].draw();
            circles[i].update();
        }

        requestAnimationFrame(_burst);
    }
    requestAnimationFrame(_burst);    
});
