let canvas = document.getElementById("canvas")
let ctx = canvas.getContext('2d')
setInterval(update, 2000);
update();

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 1
let MAX_ZOOM = 10
let MIN_ZOOM = 0.8
var last_map = [];
var canvas_size = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
let SCROLL_SENSITIVITY = 0.0005
var grid = 100;
var move_x = 0;
var move_y = 0;
var click_x;
var click_y;
var color = "#000000"

let cursor = {
  x: -60,
  y: -60,
	i: 0,
	j: 0,
};
var cells = Array(grid).fill().map((cell) => (cell = Array(grid)));
var phone = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

function rect(x, y, w, h, c, alpha = 1) {
	ctx.globalAlpha = alpha;
	ctx.fillStyle = c;
	ctx.fillRect(x, y, w, h);
	ctx.globalAlpha = 1.0;
}
function draw_cursor(){
	rect(cursor.x, cursor.y, (canvas_size / grid) - 1, (canvas_size / grid) - 1, "#808080", alpha = 0.5);
}

class Cell {
	constructor(i, j, c="#ffffff") {
		this.i = i;
		this.j = j;
		this.w = canvas_size / grid;
		this.x = (i * this.w + 2) - (canvas_size / 2);
		this.y = (j * this.w + 2) - (canvas_size / 2);
		this.c = c
		this.changeColor();
		this.show();
	}
	
	changeColor(color = this.c) {
		this.color = color;
	}

	checkMouse(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
	}
	show() {
		rect(this.x, this.y, this.w - 1, this.w - 1, this.color);
	}
	
}

function draw()
{
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
    ctx.scale(cameraZoom, cameraZoom)
    ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
    ctx.clearRect(0,0, window.innerWidth, window.innerHeight)
	rect(-(canvas_size / 2), -(canvas_size / 2), canvas_size + 2, canvas_size + 2, "#A1E7FB");
    callAll((item) => {
				if(item != undefined){
					item.show();
					if(item.checkMouse(move_x, move_y)){
						cursor.y = item.y;
						cursor.x = item.x;
						cursor.i = item.i;
						cursor.j = item.j;
					}
				}
			if(!phone){
				draw_cursor();
			}
			});
    requestAnimationFrame(draw)
}


function update() {
	$.getJSON('https://schoolwar.maxar2005.repl.co/map', function(data) {
	   	if(JSON.stringify(data)!=JSON.stringify(last_map)){
		    last_map = data;
			if(cells.length == 0){
				for (let ix = 0; ix < grid; ix += 1){
					for (let iy = 0; iy < grid; iy += 1){
						cells[ix][iy] = new Cell(ix, iy, data[ix][iy].team == null ? "#ffffff" : data[ix][iy].team);
					}
				}
			}else{
				for (let ix = 0; ix < grid; ix += 1){
					for (let iy = 0; iy < grid; iy += 1){
						if(cells[ix][iy] != undefined){
							if(data[ix][iy].team != cells[ix][iy].c){
								cells[ix][iy] = new Cell(ix, iy, data[ix][iy].team == null ? "#ffffff" : data[ix][iy].team);
							}
						}else{
							cells[ix][iy] = new Cell(ix, iy, data[ix][iy].team == null ? "#ffffff" : data[ix][iy].team);
						}
							
					}
				}
			}
			callAll((item) => {
				if(item != undefined){
					item.show();
				}
			});
			
			
	   }
	});
}



// Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }        
    }
}

function drawRect(x, y, width, height)
{
    ctx.fillRect( x, y, width, height )
}

function drawText(text, x, y, size, font)
{
    ctx.font = `${size}px ${font}`
    ctx.fillText(text, x, y)
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

function onPointerDown(e)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
    dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
	click_x = getEventLocation(e).x;
	click_y = getEventLocation(e).y;
	

	
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
	if (Math.abs(click_x - getEventLocation(e).x) < 6  && Math.abs(click_y - getEventLocation(e).y) < 6 && 
		move_x < (canvas_size / 2) && move_y < (canvas_size / 2)){
		click(e);
	}
	
}

function onPointerMove(e)
{
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
    }
	move_x = ((getEventLocation(e).x - (window.innerWidth / 2))/cameraZoom) + (window.innerWidth / 2)  - cameraOffset.x;
	move_y =((getEventLocation(e).y - (window.innerHeight / 2))/cameraZoom) + (window.innerHeight / 2)  - cameraOffset.y;
	// console.log(move_x, move_y);
	
}

function handleTouch(e, singleTouchHandler)
{
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e)
{
    e.preventDefault()
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (initialPinchDistance == null)
    {
        initialPinchDistance = currentDistance
    }
    else
    {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function callAll(callback, reverse) {
	if (reverse)
		for (var i = grid - 1; i >= 0; i--)
			for (var j = grid - 1; j >= 0; j--) callback(cells[j][i], i, j);
	else
		for (var i = 0; i < grid; i++)
			for (var j = 0; j < grid; j++) callback(cells[j][i], i, j);
}

function adjustZoom(zoomAmount, zoomFactor)
{
    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor)
        {
            cameraZoom = zoomFactor*lastZoom
        }
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
    }
}

function click(e) {
	$.ajax({
		type: 'POST',
		url: 'https://schoolwar.maxar2005.repl.co/click',
		data: {
			'x': cursor.i,
			'y': cursor.j,
			"color": "#ff0000"
		},
		success: function(msg){
				update();
				if (msg.indexOf("SUCCESS") == -1){
					alert(msg);
				}
		}
	});
}

for(let i=0;i < 50; i++){
	console.log(`%c ${i + 1}:  Стас лох`, 'background: #222; color: #ff0000; font-size: 1.5em');
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

draw()

// 	// import {teams, codes} from './config.js';

// window.onload = () => setInterval(draw, 1000 / 60);

// setInterval(update, 2000);

// // for(let i=0;i < 50; i++){
// // 	console.log(`%c ${i + 1}:  если вы хотите что то взломать то вы здесь ничего не найдёте`, 'background: #222; color: #ff0000; font-size: 1.5em');
// // }

// var canvas = document.getElementById("canvas");
// var ctx = canvas.getContext("2d");
// var minw = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight
// var width = minw - 100;
// var height = minw - 100;
// var grid = 100;
// let cursor = {
//   x: -60,
//   y: -60,
// 	i: 0,
// 	j: 0,
// };
// var last_map;
// var neighbor = [[0, 1], [1, 0], [-1, 0], [0, -1]];

// canvas.width = width + 2;
// canvas.height = height + 2;
// ctx.textAlign = "center";
// var cells = Array(grid).fill().map((cell) => (cell = Array(grid)));
// var code = "666";

// function rect(x, y, w, h, c, alpha = 1) {
// 	ctx.globalAlpha = alpha;
// 	ctx.fillStyle = c;
// 	ctx.fillRect(x, y, w, h);
// 	ctx.globalAlpha = 1.0;
// }

// class Cell {
// 	constructor(i, j, c="#ffffff") {
// 		this.i = i;
// 		this.j = j;
// 		this.w = width / grid;
// 		this.x = i * this.w + 2;
// 		this.y = j * this.w + 2;
// 		this.c = c
// 		this.changeColor();
// 		this.show();
// 	}
// 	check(team){
// 		for(let i=0; i < neighbor.length;i++ ){
			
// 		}
// 	}	

// 	checkMouse(x, y) {
// 		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
// 	}
// 	darkColor(){
// 		this.color = "#A1E7FB";
// 	}

// 	changeColor(color = this.c) {
// 		this.color = color;
// 	}
// 	show() {
// 		rect(this.x, this.y, this.w - 2, this.w - 2, this.color);
// 	}
	
// }

// function addHexColor(c1, c2) {
//   var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
//   while (hexStr.length < 6) { hexStr = '0' + hexStr; }
//   return hexStr;
// }

// function start(){
// 	rect(0, 0, width + 2, width + 2, "#A1E7FB");
// 	$.getJSON('https://schoolwar.maxar2005.repl.co/map', function(data) {
// 		last_map = data;
// 	   for (let ix = 0; ix < grid; ix += 1){
// 		for (let iy = 0; iy < grid; iy += 1){
// 			if(data[ix][iy].team == null){
// 				cells[ix][iy] = new Cell(ix, iy);
// 			}else{
// 				cells[ix][iy] = new Cell(ix, iy, data[ix][iy].team);
// 			}
// 		}
// 	}
// 	draw();
// 	});
	
// }

// function update() {
// 	$.getJSON('https://schoolwar.maxar2005.repl.co/map', function(data) {
// 	   if(JSON.stringify(data)!=JSON.stringify(last_map)){
// 		   last_map = data;
// 		   start();
// 	   }
// 	});
// }


// // rect(ix + 2, iy + 2, width / grid - 2, height / grid - 2, "#fff");

// function getCursorPosition(canvas, event) {
// 	const rect = canvas.getBoundingClientRect();
// 	const x = event.clientX - rect.left;
// 	const y = event.clientY - rect.top;
// 	callAll((item) => {
// 		if(item != undefined){
// 			if (item.checkMouse(x, y)) {
// 				cursor.x = item.x;
// 				cursor.y = item.y;
// 				cursor.i = item.i;
// 				cursor.j = item.j;
// 			}
// 		}
// 	});
// }


// function click(e) {
// 	if(1){
// 		$.ajax({
// 		    type: 'POST',
// 		    url: 'https://schoolwar.maxar2005.repl.co/click',
// 		    data: {
// 		        'x': cursor.i,
// 				'y': cursor.j,
// 		        "id": "10"
// 		    },
// 		    success: function(msg){
// 					start();
// 					if (msg.indexOf("SUCCESS") == -1){
// 						alert(msg);
// 					}
		
					
// 		    }
// 		});}
// }

// function callAll(callback, reverse) {
// 	if (reverse)
// 		for (var i = grid - 1; i >= 0; i--)
// 			for (var j = grid - 1; j >= 0; j--) callback(cells[j][i], i, j);
// 	else
// 		for (var i = 0; i < grid; i++)
// 			for (var j = 0; j < grid; j++) callback(cells[j][i], i, j);
// }
// start();

// canvas.addEventListener("mousemove", function (e) {
// 	getCursorPosition(canvas, e);
// });
// canvas.addEventListener("click", click)

// function draw() {
// 	callAll((item) => {
// 		if(item != undefined){
// 			item.show();
// 		}
// 	});
// 	rect(cursor.x, cursor.y, (width / grid) -2, (height / grid) - 2, "#808080", alpha = 0.5);
// }