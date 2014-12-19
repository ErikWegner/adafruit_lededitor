/// <reference path="externals/definitelytyped/jquery/jquery.d.ts" />
var Frame = (function () {
    function Frame(led_count) {
        this.colors = [];
        for (var i = 0; i < led_count; i++) {
            this.colors.push(null);
        }
    }
    return Frame;
})();
var EditorOptions = (function () {
    function EditorOptions() {
    }
    return EditorOptions;
})();
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var PreviewEditor = (function () {
    function PreviewEditor(o) {
        this.centers = [];
        this.led_radius = 20;
        this.led_border = 2;
        this.led_off = '#000000';
        this.frame = new Frame(o.led_count);
        this.InitEditor(o.editor);
        this.InitColorPicker(o.colorpicker);
    }
    PreviewEditor.prototype.InitColorPicker = function (elementselector) {
        $(elementselector).colorpicker({ defaultPalette: 'web' });
    };
    PreviewEditor.prototype.InitEditor = function (canvasid) {
        this.canvas = document.getElementById(canvasid);
        if (this.canvas) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
        if (this.canvas.getContext) {
            this.canvasctx = this.canvas.getContext('2d');
            this.canvasctx.clearRect(0, 0, this.width, this.height);
            var radius = this.width / 2 - this.led_radius - this.led_border;
            var centerX = this.width / 2;
            var centerY = this.height / 2;
            for (var i = 0; i < 12; i++) {
                var winkel = 30 * i + 270;
                var x = Math.cos(winkel * Math.PI / 180) * radius + centerX;
                var y = Math.sin(winkel * Math.PI / 180) * radius + centerY;
                this.centers.push(new Point(x, y));
                this.drawArc(this.canvasctx, x, y, this.led_radius, this.led_off);
            }
        }
    };
    PreviewEditor.prototype.drawArc = function (context, centerX, centerY, radius, color) {
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = '#000000';
        context.stroke();
    };
    return PreviewEditor;
})();
$(function () {
    new PreviewEditor({ editor: "editor", colorpicker: "#colorpicker", led_count: 12 });
});
