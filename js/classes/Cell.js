var Cell = (function () {
    var id = 0;
    var _cell = function (options, playBoard) {

        if (!(playBoard instanceof PlayBoard)) {
            throw new Error("PlayBoard must be initialized.");
        }

        var startPos = this.startPos = options.startPos; // top-left corner
        var size = this.size = options.size;
        var strokeWidth = this.strokeWidth = options.strokeWidth;
        var endPos = [startPos[0] + size[0], startPos[1] + size[1]]; // bottom-right corner
        this.id = ++id;
        this.playBoard = playBoard;
        this.isEmpty = true;
        var playBoardSize = playBoard.getSize();
        this._bounds = {
            topLeft: startPos,
            bottomRight: endPos
        };
        var drawBounds = this._drawBounds = {
            topLeft: [(startPos[0] !== 0 ? (startPos[0] + strokeWidth / 2) : startPos[0]), (startPos[1] !== 0 ? (startPos[1] + strokeWidth / 2) : startPos[1])],
            bottomRight: [(Math.floor(playBoardSize[0] - endPos[0]) !== 0 ? (endPos[0] - strokeWidth / 2) : endPos[0]), (Math.floor(playBoardSize[1] - endPos[1]) !== 0 ? (endPos[1] - strokeWidth / 2) : endPos[1])]
        };
        this.center = [(drawBounds.topLeft[0] + drawBounds.bottomRight[0]) / 2, (drawBounds.topLeft[1] + drawBounds.bottomRight[1]) / 2];
    };

    $.extend(_cell.prototype, Evented);

    var _onMouseOver = function () {
        var canvas = this.playBoard.getContainer();
        var ctx = this.playBoard.getCtx();
        canvas.style.cursor = "pointer";
        var startPos = this._drawBounds.topLeft;
        var width = this._drawBounds.bottomRight[0] - startPos[0];
        var height = this._drawBounds.bottomRight[1] - startPos[1];
        ctx.fillStyle = "#F0F0F0";
        ctx.fillRect(startPos[0], startPos[1], width, height);
    };

    var _onMouseOut = function () {
        var canvas = this.playBoard.getContainer();
        var ctx = this.playBoard.getCtx();
        canvas.style.cursor = "default";
        var startPos = this._drawBounds.topLeft;
        var width = this._drawBounds.bottomRight[0] - startPos[0];
        var height = this._drawBounds.bottomRight[1] - startPos[1];
        ctx.clearRect(startPos[0], startPos[1], width, height);
    };

    _cell.prototype.contains = function (point) {
        var topLeft = this._drawBounds.topLeft;
        var bottomRight = this._drawBounds.bottomRight;
        var containsAlongX = point[0] >= topLeft[0] && point[0] <= bottomRight[0];
        var containsAlongY = point[1] >= topLeft[1] && point[1] <= bottomRight[1];
        return containsAlongX && containsAlongY;
    };

    _cell.prototype.attachListeners = function () {
        this.on("mouseover", _onMouseOver.bind(this));
        this.on("mouseout", _onMouseOut.bind(this));
    };

    _cell.prototype.removeListeners = function () {
        this.off("mouseover");
        this.off("mouseout");
    };

    _cell.prototype.drawSymbol = function (type) {
        if (!this.isEmpty)
            return;
        var bounds = this._drawBounds;
        var symbol = new Symbol(type, {
            size: Math.min(bounds.bottomRight[0] - bounds.topLeft[0], bounds.bottomRight[1] - bounds.topLeft[1]),
            strokeWidth: 8
        });
        var image = symbol.create();
        var ctx = this.playBoard.getCtx();
        ctx.clearRect(bounds.topLeft[0], bounds.topLeft[1], bounds.bottomRight[0] - bounds.topLeft[0], bounds.bottomRight[1] - bounds.topLeft[1]);
        ctx.drawImage(image, bounds.topLeft[0], bounds.topLeft[1], image.width, image.height);
        this.isEmpty = false;
        this.symbol = symbol;
        if (this.playBoard.lastHoveredCell === this)
            this.playBoard.lastHoveredCell = null;
    }

    return _cell;
}());
