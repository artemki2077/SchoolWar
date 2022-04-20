let canvas = document.getElementById("canvas")
let ctx = canvas.getContext('2d')
setInterval(update, 2000);
update();

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 1
let MAX_ZOOM = 20
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
var color_n = 9;
var colors = [
	"#FFA500", "#664200", "#331a00", "#00fac8", "#009476", "#9600c8", "#490061", "#e1beaa", "#c4845e", 
	"#ffaabe", "#ff5f82", "#000000", "#808080", "#COCOCO", "#FFFFFF", "#FFOOFF", "#800080", "#FF0000", 
	"#800000", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080"
]


let cursor = {
  x: -60,
  y: -60,
	i: 0,
	j: 0,
};
var cells = Array(grid).fill().map((cell) => (cell = Array(grid)));
var phone = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
var setk = true;

function setColor(new_color) {
	color = new_color;
}

function rect(x, y, w, h, c, alpha = 1) {
	ctx.globalAlpha = alpha;
	ctx.fillStyle = c;
	ctx.fillRect(x, y, w, h);
	ctx.globalAlpha = 1.0;
}
function draw_cursor(){
	rect(cursor.x, cursor.y, (canvas_size / grid) - (setk ? 1 : 0), (canvas_size / grid) - (setk ? 1 : 0), "#808080", alpha = 0.01);
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
		rect(this.x, this.y, this.w - (setk ? 1 : 0), this.w - (setk ? 1 : 0), this.color);
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
	// rect(-(canvas_size / 2), -canvas_size, canvas_size, canvas_size / 3, "#fff")
	rect(-(canvas_size / 2), -(canvas_size / 2), canvas_size + 2, canvas_size + 2, "#a1e7fb");
    callAll((item) => {
				if(item != undefined){
					item.show();
					if(item.checkMouse(move_x, move_y)){
						cursor.y = item.y;cursor.x = item.x;
						cursor.i = item.i;cursor.j = item.j;
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
	console.log(cursor.i, cursor.j);
	
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
	now_x = ((getEventLocation(e).x - (window.innerWidth / 2))/cameraZoom) + (window.innerWidth / 2)  - cameraOffset.x;
	now_y = ((getEventLocation(e).y - (window.innerHeight / 2))/cameraZoom) + (window.innerHeight / 2)  - cameraOffset.y;
	callAll((item) => {
				if(item != undefined){
					item.show();
					if(item.checkMouse(now_x, now_y)){
						cursor.y = item.y;
						cursor.x = item.x;
						cursor.i = item.i;
						cursor.j = item.j;
					}
				}
			});
	if(confirm('вы точно хотите кликнуть')){
		$.ajax({
			type: 'POST',
			url: 'https://schoolwar.maxar2005.repl.co/click',
			data: {
				'x': cursor.i,
				'y': cursor.j,
				"color": color
			},
			success: function(msg){
					update();
					if (msg.indexOf("SUCCESS") == -1){
						alert(msg);
					}
			}
		});
	}
		
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
canvas.addEventListener( 'wheel', (e) => adjustZoom(-e.deltaY*SCROLL_SENSITIVITY))

draw()