var PlayBoard = (function () {

    var _defaultOptions = {
        width: 300,
        height: 300,
        style: {
            color: "red",
            strokeWidth: 8
        }
    };

    var _playBoard = function (options) {
        this._cells = [];        
        this.options = $.extend({}, _defaultOptions, options);
        this._container = document.createElement("canvas");
        this._container.height = this.options.height;
        this._container.width = this.options.width;
        this._ctx = this._container.getContext("2d");
        this.style = this.options.style;
        this._interactiveLayer = this._container;

        
        _buildReferences.call(this);
        this.attachListeners();
    };

    $.extend(_playBoard.prototype, Evented);

    var _buildReferences = function () {
        var rows = this.rows = [];
        var columns = this.columns = [];
        var diagonals = this.diagonals = [[], []];
        var cellWidth = this.options.width / 3;
        var cellHeight = this.options.height / 3;

        for (var i = 0, i1=0; i < this._container.height; i += cellHeight, i1++) {
            row = rows[rows.length] = [];
            for (var j = 0, j1=0 ; j < this._container.width; j += cellWidth, j1++) {
                if (i1 === 0) {
                    columns[j1] = [];
                }
                var options = {
                    startPos: [j, i],
                    size: [cellWidth, cellHeight],
                    strokeWidth: this.style.strokeWidth
                };
                cell = new Cell(options, this)
                this._cells.push(cell);
                row.push(cell);
                columns[j1].push(cell);
                if (i1 === j1) {
                    diagonals[0].push(cell);
                }
                if (i1 + j1 == 2)
                    diagonals[1].push(cell);
            }
        }
    };

    var _onMouseMove = function (event) {
        var dimension = this._container.getBoundingClientRect();
        var pos = [event.clientX - dimension.left, event.clientY - dimension.top];
        var cell = null;
        for (var i = 0, iL = this._cells.length; i < iL; i++) {
            if (this._cells[i].contains(pos)) {
                cell = this._cells[i];
                break;
            }
        }

        if (cell) {
            if (!cell.isEmpty) {
                this.lastHoveredCell = null;
                return;
            }
            if (this.lastHoveredCell == cell)
                return;
            else {
                if (this.lastHoveredCell)
                    this.lastHoveredCell.trigger("mouseout");
                this.lastHoveredCell = cell;
                cell.trigger("mouseover");
            }
        } else {
            if (this.lastHoveredCell)
                this.lastHoveredCell.trigger("mouseout");
            this.lastHoveredCell = null;
        }

        return cell;
    };

    var _onClick = function (event) {
        var dimension = this._container.getBoundingClientRect();
        var pos = [event.clientX - dimension.left, event.clientY - dimension.top];
        var cell = null;
        for (var i = 0, iL = this._cells.length; i < iL; i++) {
            if (this._cells[i].contains(pos)) {
                cell = this._cells[i];
                break;
            }
        }
        if (cell) {
            if (!cell.isEmpty)
                return;
            else
                this.trigger("click", [cell]);
        }
        
    };

    _playBoard.prototype.draw = function (container) {
        var d = $.Deferred();
        var _draw = function () {
            var canvas = this._container;
            var ctx = this._ctx;
            var cellWidth = this.options.width / 3;
            var cellHeight = this.options.height / 3;
            var h = canvas.height,
                w = canvas.width;
            // draw squared blocks
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = this.style.color;
            ctx.lineWidth = this.style.strokeWidth;
            ctx.lineCap = "round";
            for (var i = cellWidth, j = cellHeight; i < canvas.width && j < canvas.height; i += cellWidth, j += cellHeight) {
                // draw vertical line
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, h);
                ctx.stroke();
                ctx.closePath();

                // draw horizontal line
                ctx.beginPath();
                ctx.moveTo(0, j);
                ctx.lineTo(w, j);
                ctx.stroke();
                ctx.closePath();
            }
            $(container).append(canvas);
            d.resolve();
        }.bind(this);
        setTimeout(_draw, 0);
        return d.promise();
    };
  
    _playBoard.prototype.getSize = function () {
        return [this.options.width, this.options.height];
    };

    _playBoard.prototype.getContainer = function () {
        return this._container;
    }

    _playBoard.prototype.getCtx = function () {
        return this._ctx;
    }

    _playBoard.prototype.attachListeners = function () {
        this._cells.forEach(function (cell) {
            cell.attachListeners();
        });

        this.on("mousemove", _onMouseMove.bind(this), this._interactiveLayer);
        this.on("click", _onClick.bind(this), this._interactiveLayer);
    };

    _playBoard.prototype.removeListeners = function () {
        this._cells.forEach(function (cell) {
            cell.removeListeners();
        });

        this.off("mousemove");
        this.off("click");
    };


    _playBoard.prototype.getEmptyCells = function () {
        return this._cells.filter(function (cell) { return cell.isEmpty; })
    }
   
    return _playBoard;

}())
