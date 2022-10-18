var Symbol = (function () {
    var _default = {
        size: 24,
        color: "blue",
        strokeWidth: 4
    };

    var _symbol = function (type, options) {
        if (!type) throw new Error("type of Symbol must be defined.");
        this.type = type;
        this.options = $.extend({}, _default, options);        
    };

    _symbol.prototype.getSize = function () {
        return this.options.size;
    };

    _symbol.prototype.create = function () {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var size = this.options.size,
            color = this.options.color,
            lineWidth = this.options.strokeWidth;
        // Set actual size in memory (scaled to account for extra pixel density).
        var scale = window.devicePixelRatio; // <--- Change to 1 on retina screens to see blurry canvas.
        canvas.width = size * scale;
        canvas.height = size * scale;
        canvas.height = canvas.width = size;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        switch (this.type) {
            case SYMBOL.CIRCLE:
                var offset = 4;
                    center = [size / 2, size / 2],
                    radius = size / 2 - lineWidth / 2 - offset;
                console.log(center + "," + radius);
                ctx.beginPath();
                ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();
                break;
            case SYMBOL.CROSS:
                var offset = 12;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(offset, offset);
                ctx.lineTo(size - offset, size - offset);
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.moveTo(size - offset, offset);
                ctx.lineTo(offset, size - offset);
                ctx.stroke();
                ctx.closePath();
                break;
        }
        return canvas;
    };

    return _symbol;
})();