/// <reference path="externals/definitelytyped/jquery/jquery.d.ts" />
/// <reference path="externals/definitelytyped/angularjs/angular.d.ts" />
declare var ngDialog: any;

interface JQuery {
  colorpicker: (options: any) => JQuery;
}

class Frame {
  colors: Array<string>
  delay: number
  dataUrl: string
  
  constructor(led_count: number) {
    this.colors = [];
    for (var i = 0; i < led_count; i++) {
      this.colors.push(null);
    }
  }
  
  public toObj() {
    var r: any = {colors: {}, delay: this.delay}
    for (var i = 0; i < this.colors.length; i++) {
      if (this.colors[i]) {
        r.colors[i] = this.colors[i];
      }
    }
    return r;
  }
  
  public Rotate(step: number) {
    var i;
    var l = this.colors.length;
    var oldcolors = [];
    // make a copy of all items
    for (i = 0; i < l; i++) {
      oldcolors.push(this.colors[i]);
    }
    this.colors = [];
    // copy with an offset
    for (i = 0; i < l; i++) {
      this.colors.push(oldcolors[(i - step + l) % l]);
    }
  }
  
  public Clone(): Frame {
    var clone = new Frame(0);
    var i;
    var l = this.colors.length;
    for (i = 0; i < l; i++) {
      clone.colors.push(this.colors[i]);
    }
    clone.delay = this.delay;
    return clone;
  }
}

class EditorOptions {
  public editor: string 
  public colorpicker: string
  public led_count: number
}

class Point {
  constructor(public x: number, public y: number) {}
  
  public hitByClick(clickx: number, clicky: number, radius: number): boolean {
    return (Math.pow(clickx - this.x, 2) + Math.pow(clicky - this.y, 2)) <= Math.pow(radius, 2);
  }
}

class PreviewEditor {
  canvas: HTMLCanvasElement
  width: number
  height: number
  canvasctx: CanvasRenderingContext2D

  centers: Array<Point> = []
  led_radius = 20;
  led_border = 2;
  led_off = '#000000';
  
  active_led: number = 0;

  frame: Frame
  
  constructor (private o: EditorOptions) {
    this.frame = new Frame(o.led_count);
    this.InitEditor(o.editor);
    this.InitColorPicker(o.colorpicker);
  }
  
  public SetFrame(frame) {
    this.frame = frame;
    this.drawAll();
  }
  
  public GetFrame() {
    this.frame.dataUrl = this.canvas.toDataURL();
    return this.frame;
  }
  
  public Rotate(step: number) {
    this.frame.Rotate(step);
    this.drawAll();
  }
  
  public HighlightLed(led: number) {
    var old_active = this.active_led;
    this.active_led = led;
    
    if (old_active != led) {
      this.drawLed(old_active);
      this.drawLed(led);
    }
  }
  
  public setActiveLedColor(htmlcolor: string) {
    this.frame.colors[this.active_led] = htmlcolor;
    this.drawLed(this.active_led);
  }
  
  private PalettePick(e: JQueryEventObject, htmlcolor: string) {
    this.setActiveLedColor(htmlcolor);
  }
  
  private InitColorPicker(elementselector) {
    $(elementselector).colorpicker({defaultPalette:'web'}).on('change.color', $.proxy(this.PalettePick, this));
  }

  private InitEditor(canvasid) {
    this.canvas = <HTMLCanvasElement>document.getElementById(canvasid);
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
        var x = Math.cos(winkel * Math.PI/ 180) * radius + centerX;
        var y = Math.sin(winkel * Math.PI / 180) * radius + centerY;
        this.centers.push(new Point(x, y));
        this.drawLed(i);
      }
    }
    
    this.InitEventHandler() ;
  }

  private InitEventHandler() {
    jQuery(this.canvas).on('click', $.proxy(this.HandleClick, this));
  }

  private HandleClick(e: JQueryEventObject) {
    var leftclick = e.button == 0;
    var x = e.offsetX
    var y = e.offsetY
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
  }
  
  private drawAll() {
    for (var i = 0; i < this.o.led_count; i++) {
      this.drawLed(i);
    }
  }
  
  private drawLed(led_index: number) {
    var c = this.centers[led_index];
    this.drawArc(this.canvasctx, c.x, c.y, this.led_radius, this.frame.colors[led_index] || this.led_off, led_index == this.active_led);
  }
  
  private drawArc(context: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, color : any, is_active: boolean) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = is_active ? '#0f0' : '#000';
    context.stroke();
  }

}

interface IFramesListScope extends ng.IScope {
  frameslist: Frame[];
  vm: FramesListController;
}

class FramesListController {
  //https://github.com/tastejs/todomvc/blob/gh-pages/examples/typescript-angular/js/controllers/TodoCtrl.ts
  
  private frameslist: Array<Frame>
  private active_frame: number = 0;
  // $inject annotation.
  // It provides $injector with information about dependencies to be injected into constructor
  // it is better to have it close to the constructor, because the parameters must match in count and type.
  // See http://docs.angularjs.org/guide/di
  public static $inject = [
    '$scope',
    'ngDialog',
    'editorwindow',
    'led_count'
  ];
  
// dependencies are injected via AngularJS $injector
  // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
  constructor(private $scope: IFramesListScope, private ngDialog, private editorwindow: PreviewEditor, private led_count: number) {
    this.frameslist = $scope.frameslist = [new Frame(led_count)];
    // 'vm' stands for 'view model'. We're adding a reference to the controller to the scope
    // for its methods to be accessible from view / HTML
    $scope.vm = this;
    
  }
  
  rotateLeft() {
    this.editorwindow.Rotate(-1);
  }
  
  rotateRight() {
    this.editorwindow.Rotate(1);
  }
  
  saveFrame() {
    this.frameslist[this.active_frame] = this.editorwindow.GetFrame();
  }
  
  saveAndNextFrame() {
    this.saveFrame();
    var newframe = this.frameslist[this.active_frame].Clone();
    this.frameslist.push(new Frame(this.led_count));
    this.active_frame = this.frameslist.length - 1;
    this.editorwindow.SetFrame(newframe);
  }
  
  activate(a) {
    this.saveFrame();
    this.active_frame = a.$index;
    this.editorwindow.SetFrame(this.frameslist[this.active_frame]);
  }
  
  saveJSON() {
    var exportdata = this.frameslistToJSON()
    this.$scope["exportdata"] = exportdata;
    var dlg = this.ngDialog.open({ 
      template: 'savejson',
      className: 'ngdialog-theme-default',
      scope: this.$scope
    });
  }
  
  frameslistToJSON() {
    var r:any = {}
    r.led_count = this.led_count;
    r.frames = [];
    for (var i in this.frameslist) {
      r.frames.push(this.frameslist[i].toObj());
    }
    
    return JSON.stringify(r);
  }
}

var eapp = angular.module('editorapp', ['ngDialog']).value('led_count', 12).factory('editorwindow', function() {
  var e;
  e = new PreviewEditor({ editor: "editor", colorpicker: "#colorpicker", led_count: 12});
  return e;
}).controller('FramesListController', FramesListController);
