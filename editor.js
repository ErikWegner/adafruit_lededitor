/// <reference path="externals/definitelytyped/jquery/jquery.d.ts" />
/// <reference path="externals/definitelytyped/angularjs/angular.d.ts" />
var Frame = (function () {
    function Frame(led_count) {
        this.colors = [];
        for (var i = 0; i < led_count; i++) {
            this.colors.push(null);
        }
    }
    Frame.prototype.Rotate = function (step) {
        var i;
        var l = this.colors.length;
        var oldcolors = [];
        for (i = 0; i < l; i++) {
            oldcolors.push(this.colors[i]);
        }
        this.colors = [];
        for (i = 0; i < l; i++) {
            this.colors.push(oldcolors[(i + step + l) % l]);
        }
    };
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
    Point.prototype.hitByClick = function (clickx, clicky, radius) {
        return (Math.pow(clickx - this.x, 2) + Math.pow(clicky - this.y, 2)) <= Math.pow(radius, 2);
    };
    return Point;
})();
var PreviewEditor = (function () {
    function PreviewEditor(o) {
        this.o = o;
        this.centers = [];
        this.led_radius = 20;
        this.led_border = 2;
        this.led_off = '#000000';
        this.active_led = 0;
        this.frame = new Frame(o.led_count);
        this.InitEditor(o.editor);
        this.InitColorPicker(o.colorpicker);
    }
    PreviewEditor.prototype.Rotate = function (step) {
        this.frame.Rotate(step);
        for (var i = 0; i < this.o.led_count; i++) {
            this.drawLed(i);
        }
    };
    PreviewEditor.prototype.HighlightLed = function (led) {
        var old_active = this.active_led;
        this.active_led = led;
        if (old_active != led) {
            this.drawLed(old_active);
            this.drawLed(led);
        }
    };
    PreviewEditor.prototype.setActiveLedColor = function (htmlcolor) {
        this.frame.colors[this.active_led] = htmlcolor;
        this.drawLed(this.active_led);
    };
    PreviewEditor.prototype.PalettePick = function (e, htmlcolor) {
        this.setActiveLedColor(htmlcolor);
    };
    PreviewEditor.prototype.InitColorPicker = function (elementselector) {
        $(elementselector).colorpicker({ defaultPalette: 'web' }).on('change.color', $.proxy(this.PalettePick, this));
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
                this.drawLed(i);
            }
        }
        this.InitEventHandler();
    };
    PreviewEditor.prototype.InitEventHandler = function () {
        jQuery(this.canvas).on('click', $.proxy(this.HandleClick, this));
    };
    PreviewEditor.prototype.HandleClick = function (e) {
        var leftclick = e.button == 0;
        var x = e.offsetX;
        var y = e.offsetY;
        var led_found = -1;
        if (leftclick) {
            for (var ledi in this.centers) {
                if (this.centers[ledi].hitByClick(x, y, this.led_radius)) {
                    led_found = ledi;
                }
            }
        }
        if (led_found >= 0) {
            this.HighlightLed(led_found);
        }
    };
    PreviewEditor.prototype.drawLed = function (led_index) {
        var c = this.centers[led_index];
        this.drawArc(this.canvasctx, c.x, c.y, this.led_radius, this.frame.colors[led_index] || this.led_off, led_index == this.active_led);
    };
    PreviewEditor.prototype.drawArc = function (context, centerX, centerY, radius, color, is_active) {
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = is_active ? '#0f0' : '#000';
        context.stroke();
    };
    return PreviewEditor;
})();
var FramesListController = (function () {
    // dependencies are injected via AngularJS $injector
    // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
    function FramesListController($scope, editorwindow) {
        this.$scope = $scope;
        this.editorwindow = editorwindow;
        var f = new Frame(12);
        f.delay = 15;
        this.frameslist = $scope.frameslist = [f];
        // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
        // for its methods to be accessible from view / HTML
        $scope.vm = this;
        // watching for events/changes in scope, which are caused by view/user input
        // if you subscribe to scope or event with lifetime longer than this controller, make sure you unsubscribe.
    }
    FramesListController.prototype.rotateLeft = function () {
        this.editorwindow.Rotate(-1);
    };
    FramesListController.prototype.rotateRight = function () {
        this.editorwindow.Rotate(1);
    };
    // $inject annotation.
    // It provides $injector with information about dependencies to be injected into constructor
    // it is better to have it close to the constructor, because the parameters must match in count and type.
    // See http://docs.angularjs.org/guide/di
    FramesListController.$inject = [
        '$scope',
        'editorwindow'
    ];
    return FramesListController;
})();
var eapp = angular.module('editorapp', []).factory('editorwindow', function () {
    var e;
    e = new PreviewEditor({ editor: "editor", colorpicker: "#colorpicker", led_count: 12 });
    return e;
}).controller('FramesListController', FramesListController);
