var DISTCURV = (function($, undefined){

var canvas, ctx;
var wc = 500, hc = 500;
var wl = 100, hl = 100;

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
		x: Math.floor(point.x * wl / wc),
		y: hl - Math.floor(point.y * hl / hc)
	};
}
function l2c(point) {
	return {
		x: point.x * wc / wl,
		y: hc - point.y * hc / hl
	}
}
function sort_points(points) {

}
function mouse_down(event) {
	var point = c2l(canvasxy(event));
	pr('mouse down @ '+point.x+','+point.y);
	points.push(point);
	points.sort(function(a,b){ return b.x - a.x; });
	draw_curve(points);
}
function draw_curve(points) {
	var pp;
	ctx.clearRect(0,0,wc,hc);
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.beginPath();
	_.forEach(points, function(point) {
		var p = l2c(point);
		if (!pp) {
			ctx.moveTo(p.x,p.y);
		} else if (p.x == pp.x) {
			ctx.moveTo(p.x,p.y);
		} else {
			ctx.lineTo(p.x,p.y);
			//log('lineto '+p.x+','+p.y);
		}
		pp = p;
	});
	ctx.stroke();
}
function init() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");
	canvas.addEventListener("mousedown", mouse_down, false);

   

	draw_curve(points);
}
return {
	log: log,
	init: init
}
})(jQuery);

$(document).ready(function() {
	DISTCURV.log('jquery loaded.');
	DISTCURV.init();
});