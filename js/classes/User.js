var User = (function () {
    var _user = function (chosenSymbolType, playboard, userName, autoPlay) {
        if (!chosenSymbolType)
            throw new Error("User must have a symbol.");
        if (!playboard)
            throw new Error("User needs a playboard.")
        this.chosenSymbolType = chosenSymbolType;
        this.playBoard = playboard;
        this.autoPlay = !!autoPlay;
        this.userName = userName || 'User';
        this.cellsVisited = [];
    };

    var _getRandomInt = function (min, max) {
        return min + Math.floor((max - min) * Math.random());
    }

    var _animate = function (cells) {
        var d = $.Deferred();
        var x1 = cells[0].center[0],
            y1 = cells[0].center[1],
            x0 = x1,
            y0= y1,
            x2 = cells[cells.length - 1].center[0],
            y2 = cells[cells.length - 1].center[1];
        var ctx = this.playBoard.getCtx();
        var gradient = ctx.createLinearGradient(0, 0, 300, 0);
        var _self = this;
        // Add three color stops
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.5, 'orange');
        gradient.addColorStop(1, 'blue');
        var fragmentSizeX = (x2 - x1) / 100;
        var fragmentSizeY = (y2 - y1) / 100;    
        x2 = fragmentSizeX * 100 + x1;
        y2 = fragmentSizeY * 100 + y1;
        
        ctx.lineWidth = 10;
        ctx.strokeStyle = gradient;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.5;
        var _draw = function () {
            var x3 = x1 + fragmentSizeX;
            var y3 = y1 + fragmentSizeY;
            ctx.moveTo(x1, y1);
            ctx.beginPath();
            ctx.lineTo(x3, y3);
            ctx.stroke();
            x1 = x3;
            y1 = y3;
            if (Math.abs(x1 - x2) > Math.abs(fragmentSizeX) || Math.abs(y1 - y2) > Math.abs(fragmentSizeY))
                requestAnimationFrame(_draw);
            else {
                d.resolve();                
            }
        } 
        requestAnimationFrame(_draw);
        return d.promise();
    };


    _user.prototype.getSuggestion = function () {        
        var rows = this.playBoard.rows,
            columns = this.playBoard.columns,
            diagonals = this.playBoard.diagonals,
            symbol = this.chosenSymbolType,
            matched = [],
            attentionRequired = [];
            alternateSuggestions=[];

        // Check for row match
        for (var i = 0, iL = rows.length, row, opponentSymbols; i < iL; i++) {
            row = rows[i];
            matched = [];
            emptyCells = [];
            opponentSymbols = [];
            for (var c = 0, cL = row.length; c < cL; c++) {
                if (row[c].symbol) {
                    if (row[c].symbol.type == symbol)
                        matched.push(row[c]);
                    else
                        opponentSymbols.push(row[c]);
                }
                if (row[c].isEmpty)
                    emptyCells.push(row[c]);
                
            }
            if (matched.length === 2 && emptyCells.length == 1) {
                return row.find(function (cell) { return cell.isEmpty; });
            }
            if (matched.length == 1 && emptyCells.length == 2) {
                emptyCells.forEach(function (cell) { alternateSuggestions.push(cell); });
            }

            if (opponentSymbols.length == 2 && emptyCells.length == 1) {
                attentionRequired.push(emptyCells[0]);
            }
        }

        // Check for column match
        for (var j = 0, jL = columns.length, column, opponentSymbols; j < jL; j++) {
            column = columns[j];
            matched = [];
            emptyCells = [];
            opponentSymbols = [];
            for (var c = 0, cL = column.length; c < cL; c++) {
                if (column[c].symbol) {
                    if (column[c].symbol.type == symbol)
                        matched.push(column[c]);
                    else
                        opponentSymbols.push(column[c]);
                }
               
                if (column[c].isEmpty)
                    emptyCells.push(column[c]);
            }
            if (matched.length === 2 && emptyCells.length == 1) {
                return column.find(function (cell) { return cell.isEmpty; });
            }
            if (matched.length == 1 && emptyCells.length == 2) {
                emptyCells.forEach(function (cell) { alternateSuggestions.push(cell); });
            }
            if (opponentSymbols.length == 2 && emptyCells.length == 1) {
                attentionRequired.push(emptyCells[0]);
            }
        }

        // Check for diagonal match
        for (var k = 0, kL = diagonals.length, diagonal, opponentSymbols; k < kL; k++) {
            diagonal = diagonals[k];
            matched = [];
            emptyCells = [];
            opponentSymbols = [];
            for (var c = 0, cL = diagonal.length; c < cL; c++) {
                if (diagonal[c].symbol) {
                    if (diagonal[c].symbol.type == symbol)
                        matched.push(diagonal[c]);
                    else
                        opponentSymbols.push(diagonal[c]);
                }
                
                if (diagonal[c].isEmpty)
                    emptyCells.push(diagonal[c]);
            }
            if (matched.length === 2 && emptyCells.length == 1)
                return diagonal.find(function (cell) { return cell.isEmpty; });
            if (matched.length == 1 && emptyCells.length == 2) {
                emptyCells.forEach(function (cell) { alternateSuggestions.push(cell); });
            }
            if (opponentSymbols.length == 2 && emptyCells.length == 1) {
                attentionRequired.push(emptyCells[0]);
            }
        }

        var hardLevel = 0.96;
        if (attentionRequired.length == 2) {
            return attentionRequired[_getRandomInt(0, attentionRequired.length - 1)];
        }
        var random = Math.random();

        if (attentionRequired.length && random < hardLevel) {
            return attentionRequired[_getRandomInt(0, attentionRequired.length - 1)];
        }

        if (alternateSuggestions.length) 
            return alternateSuggestions[_getRandomInt(0, alternateSuggestions.length - 1)];
        return null;
       
    };

    _user.prototype.playMove = function (event, cell) {
        if (this.autoPlay) {
            var emptyCells = this.playBoard.getEmptyCells();
            if (emptyCells.length) {
                if (this.cellsVisited.length >= 1)
                    cell = this.getSuggestion();
                if (!cell) {
                    var nextMove = _getRandomInt(0, emptyCells.length - 1);
                    cell = emptyCells[nextMove];
                }                
            }
        } 

        if (cell) {
            this.playBoard.off("click");
            this.playBoard.removeListeners();
            cell.drawSymbol(this.chosenSymbolType);
            this.cellsVisited.push(cell);
            var _rs = this.getResult();
            if (_rs) {
                var _reset = function () {
                    $("#tic-tac-toe-board").empty();
                    $("#loss,#win,#draw").hide();
                    $("#divUserInputs").show();
                };
                if (_rs.result === "win") {
                    _animate.call(this, _rs.pattern).done(function () {
                        var _self = this;
                        if (_self.userName == "You") {
                            $("#tic-tac-toe-board").empty();
                            $("#win").show();
                            setTimeout(_reset, 3000);
                        } else {
                            $("#loss").show();
                            setTimeout(_reset, 1000);
                        }
                    }.bind(this));
                }
                else {
                    $("#draw").show();
                    setTimeout(_reset, 1000);
                }
                return;
            }            
            var opponent = this.opponent;
            if (opponent) {
                if (opponent.autoPlay) {
                    setTimeout(function () {
                        opponent.playMove();
                    }, 300);
                } else {
                    this.playBoard.attachListeners();
                    this.playBoard.on("click", opponent.playMove.bind(opponent));   
                }
            }
        }
        
    };

    _user.prototype.getResult = function () {
        var rows = this.playBoard.rows,
            columns = this.playBoard.columns,
            diagonals = this.playBoard.diagonals,
            symbol = this.chosenSymbolType,
            matched = false;
        var emptyCells = this.playBoard.getEmptyCells();
        if (emptyCells.length === 0) {
            return {
                result: "draw",
            };
        }

        // Check for row match
        for (var i = 0, iL = rows.length, row; i < iL; i++) {
            row = rows[i];
            matched = true;
            for (var c = 0, cL = row.length; c < cL; c++) {
                if ((!row[c].symbol) || (row[c].symbol.type !== symbol)) {
                    matched = false;
                    break;
                }
            }
            if (matched === true) {
                return {
                    result: "win",
                    pattern: row
                };
            }
        }

        // Check for column match
        for (var j = 0, jL = columns.length, column; j < jL; j++) {
            column = columns[j];
            matched = true;
            for (var c = 0, cL = column.length; c < cL; c++) {
                if ((!column[c].symbol) || (column[c].symbol.type !== symbol)) {
                    matched = false;
                    break;
                }
            }
            if (matched === true) {
                return {
                    result: "win",
                    pattern: column
                };
            }
        }

        // Check for diagonal match
        for (var k = 0, kL = diagonals.length, diagonal; k < kL; k++) {
            diagonal = diagonals[k];
            matched = true;
            for (var c = 0, cL = diagonal.length; c < cL; c++) {
                if ((!diagonal[c].symbol) || (diagonal[c].symbol.type !== symbol)) {
                    matched = false;
                    break;
                }
            }
            if (matched === true) {
                return {
                    result: "win",
                    pattern: diagonal
                };
            }
        }

        return null;
    };

    _user.prototype.setOpponent = function (opponent) {
        if (!(opponent instanceof User)) {
            throw new Error("Opponent must be a instance of User Class");
        }
        this.opponent = opponent;
    };

    return _user;
}())