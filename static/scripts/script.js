// import {teams, codes} from './config.js';

window.onload = () => setInterval(draw, 1000 / 60);

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = 600;
var height = 600;
var grid = 20;
let cursor = {
  x: -60,
  y: -60,
	i: 0,
	j: 0,
};
canvas.width = width + 2;
canvas.height = height + 2;
ctx.textAlign = "center";
var cells = Array(grid).fill().map((cell) => (cell = Array(grid)));
var code = "1";

function rect(x, y, w, h, c, alpha = 1) {
	ctx.globalAlpha = alpha;
	ctx.fillStyle = c;
	ctx.fillRect(x, y, w, h);
	ctx.globalAlpha = 1.0;
}

class Cell {
	constructor(i, j, c="#ffffff") {
		this.i = i;
		this.j = j;
		this.w = width / grid;
		this.x = i * this.w + 2;
		this.y = j * this.w + 2;
		this.c = c
		this.changeColor();
		this.show();
	}

	checkMouse(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
	}
	darkColor(){
		this.color = "#A1E7FB";
	}

	changeColor(color = this.c) {
		this.color = color;
	}
	show() {
		rect(this.x, this.y, this.w - 2, this.w - 2, this.color);
	}
	
}

function addHexColor(c1, c2) {
  var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
  while (hexStr.length < 6) { hexStr = '0' + hexStr; }
  return hexStr;
}

function start(){
	rect(0, 0, width + 2, width + 2, "#A1E7FB");
	$.getJSON('https://schoolwar.maxar2005.repl.co/map', function(data) {
		console.log(data);
	   for (let ix = 0; ix < grid; ix += 1){
		for (let iy = 0; iy < grid; iy += 1){
			if(data[ix][iy].team == null){
				cells[ix][iy] = new Cell(ix, iy);
			}else{
				cells[ix][iy] = new Cell(ix, iy, data[ix][iy].team);
			}
		}
	}
	draw();
	});
	
}


// rect(ix + 2, iy + 2, width / grid - 2, height / grid - 2, "#fff");

function getCursorPosition(canvas, event) {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	callAll((item) => {
		if (item.checkMouse(x, y)) {
			cursor.x = item.x;
			cursor.y = item.y;
			cursor.i = item.i;
			cursor.j = item.j;
		}
	});
}

function click(e) {
		alert("click");
		$.ajax({
    type: 'POST',
    url: 'https://schoolwar.maxar2005.repl.co/click',
    data: {
        'x': cursor.i,
				'y': cursor.j,
        "id": 1
    },
    success: function(msg){
			if msg.indexOf("SUCCESS") == -1:
				alert(msg);
			start();
			
    }
});
}

function callAll(callback, reverse) {
	if (reverse)
		for (var i = grid - 1; i >= 0; i--)
			for (var j = grid - 1; j >= 0; j--) callback(cells[j][i], i, j);
	else
		for (var i = 0; i < grid; i++)
			for (var j = 0; j < grid; j++) callback(cells[j][i], i, j);
}
start();

canvas.addEventListener("mousemove", function (e) {
	getCursorPosition(canvas, e);
});
canvas.addEventListener("click", click)

function draw() {
	callAll((item) => {
		item.show();
	});
	rect(cursor.x, cursor.y, (width / grid) -2, (height / grid) - 2, "#808080", alpha = 0.5);
}