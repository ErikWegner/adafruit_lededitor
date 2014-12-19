var canvas, width, height, canvasctx;

var centers = []

var led_radius = 20;
var led_border = 2;

var led_off = '#000000';

function InitColorPicker(elementselector) {
  $(elementselector).colorpicker();
}

function InitEditor(canvasid) {
  canvas = document.getElementById(canvasid);
  if (canvas) {
    width = canvas.width;
    height = canvas.height;
  }

  if (canvas.getContext) {
    canvasctx = canvas.getContext('2d');
    canvasctx.clearRect(0, 0, width, height);
    
    var radius = width / 2 - led_radius - led_border;
    var centerX = width / 2;
    var centerY = height / 2;
    for (var i = 0; i < 12; i++) {
      var winkel = 30 * i + 270;
      var x = Math.cos(winkel * Math.PI/ 180) * radius + centerX;
      var y = Math.sin(winkel * Math.PI / 180) * radius + centerY;
      centers.push({ x: x, y: y })
      drawArc(canvasctx, x, y, led_radius, led_off);
    }
  }
}

function drawArc(context, centerX, centerY, radius, color) {
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = '#000000';
  context.stroke();
}

$(function() {
  InitEditor("editor");
  InitColorPicker("#colorpicker");
});