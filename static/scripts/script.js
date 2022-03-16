window.onload = () => setInterval(draw, 1000 / 60);

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = 600;
var height = 600;
var grid = 20;
canvas.width = width + 2;
canvas.height = height + 2;
ctx.textAlign = "center";
var cells = Array(grid).fill().map((cell) => (cell = Array(grid)));

function rect(x, y, w, h, c) {
	ctx.fillStyle = c;
	ctx.fillRect(x, y, w, h);
}

class Cell {
	constructor(i, j, c="#ffffff") {
		this.i = i;
		this.j = j;
		this.w = width / grid;
		this.x = i * this.w + 2;
		this.y = j * this.w + 2;
		this.changeColor();
		this.show();
		this.c = c
	}

	checkMouse(x, y) {
		return (
			x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w
		);
	}
	darkColor(){
		this.color = ;
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
			item.darkColor();
		}else{
			item.changeColor();
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

function draw() {
	callAll((item) => {
		item.show();
	});
}