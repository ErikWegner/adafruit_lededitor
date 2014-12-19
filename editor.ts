/// <reference path="externals/definitelytyped/jquery/jquery.d.ts" />
interface JQuery {
  colorpicker: (options: any) => JQueryStatic;
}

class Frame {
  colors: Array<string>
  delay: number
  
  constructor(led_count: number) {
    this.colors = [];
    for (var i = 0; i < led_count; i++) {
      this.colors.push(null);
    }
  }
}

class EditorOptions {
  public editor: string 
  public colorpicker: string
  public led_count: number
}

class Point {
  constructor(public x: number, public y: number) {}
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

  frame: Frame
  
  constructor (o: EditorOptions) {
    this.frame = new Frame(o.led_count);
    this.InitEditor(o.editor);
    this.InitColorPicker(o.colorpicker);
  }
  
  private InitColorPicker(elementselector) {
    $(elementselector).colorpicker({defaultPalette:'web'});
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
        this.drawArc(this.canvasctx, x, y, this.led_radius, this.led_off);
      }
    }
  }

  private drawArc(context, centerX, centerY, radius, color) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#000000';
    context.stroke();
  }

}





$(function() {
  new PreviewEditor({ editor: "editor", colorpicker: "#colorpicker", led_count: 12});
});