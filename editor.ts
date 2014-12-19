/// <reference path="externals/definitelytyped/jquery/jquery.d.ts" />
interface JQuery {
  colorpicker: (options: any) => JQuery;
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
  
  constructor (o: EditorOptions) {
    this.frame = new Frame(o.led_count);
    this.InitEditor(o.editor);
    this.InitColorPicker(o.colorpicker);
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





$(function() {
  new PreviewEditor({ editor: "editor", colorpicker: "#colorpicker", led_count: 12});
});