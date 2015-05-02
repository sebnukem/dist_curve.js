var canvas, $canvas, ctx;
var points = [ {x:0,y:0}, {x:100,y:100} ];
function log(o) { $('#d').append(''+o+'<br>'); }
function pr(o) { $('#o').html(''+o); }
function canvasxy(event) {
	var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
function c2l(point) {
	return {
		x: Math.floor(point.x / 5),
		y: 100 - Math.floor(point.y / 5)
	};
}
function l2c(point) {
	return {
		x: point.x * 5,
		y: 500 - point.y * 5
	}
}
function mouse_down(event) {
	var coords = c2l(canvasxy(event));
	pr('mouse down @ '+coords.x+','+coords.y);
}
function draw_curve(points) {

}
function init() {
	$canvas = $('#canvas');
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");
	canvas.addEventListener("mousedown", mouse_down, false);
}
$(document).ready(function() {
	log('jquery loaded.');
	init();
});