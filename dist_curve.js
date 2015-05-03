var DISTCURV = (function($, undefined){

var canvas, ctx;
var wc = 500, hc = 500;
var wl = 100, hl = 100;
var pointer;

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
function is_over_point(point) {
	return _.find(points, function(p) {
		return Math.sqrt(Math.pow(point.x-p.x,2)+Math.pow(point.y-p.y,2)) < 12;
	});
}
function mouse_move(event) {
	pointer = canvasxy(event);
	var point = c2l(pointer);
	pr('mouse @ '+point.x+','+point.y);
}
function mouse_out(event) {
	pointer = null;
}
function mouse_down(event) {
	var point = c2l(canvasxy(event));
	pr('mouse down @ '+point.x+','+point.y);
	if (is_over_point(point)) {
		pr('mouse down over @ '+point.x+','+point.y);
		points = _.remove(points, function(p){ return p.x != point.x; });
	} else {
		points.push(point);
		points.sort(function(a,b){ return a.x - b.x; });
	}
}
function draw_pointer() {
	var lp, ax, ay;
	if (!pointer) return;
	lp = c2l(pointer);
	ax = lp.x>90?-40:16; ay = lp.y<8?-20:12;
	ctx.save();
	ctx.font = "10px sans-serif";
	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect (pointer.x+ax-4, pointer.y+ay-12, 38, 30);
    ctx.fillStyle = "#000000";
	ctx.fillText('x: '+lp.x, pointer.x+ax, pointer.y+ay);
	ctx.fillText('y: '+lp.y, pointer.x+ax, pointer.y+ay+14);
	ctx.restore();
}
function draw_point(p, lp) {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = "#c86";
	ctx.arc(p.x, p.y, 6, 0, 2*Math.PI, true);
	ctx.fill();
	ctx.font = "10px sans-serif";
	ctx.fillText(lp.x+','+lp.y, p.x+(lp.x>90?-42:6), p.y+(lp.y<10?-6:12));
	ctx.restore();
}
function draw_curve() {
	var first = true;
	ctx.clearRect(0,0,wc,hc);
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.save();
	ctx.beginPath();

	// curve
	_.forEach(points, function(point) {
		var p = l2c(point);
		if (first) {
			ctx.moveTo(p.x,p.y);
			first = false;
		} else {
			ctx.lineTo(p.x,p.y);
		}
		pp = point;
	});
	ctx.stroke();
	_.forEach(points, function(point) {
		var p = l2c(point);
		draw_point(p, point);
	});
	// pointer
	draw_pointer();

	window.requestAnimationFrame(draw_curve);
}
function init() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");
	canvas.addEventListener("mousemove", mouse_move, false);
	canvas.addEventListener("mouseout",  mouse_out,  false);
	canvas.addEventListener("mousedown", mouse_down, false);

	window.requestAnimationFrame(draw_curve);
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