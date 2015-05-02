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
function is_over_point(point) {
	return _.find(points, function(p) {
		return Math.sqrt(Math.pow(point.x-p.x,2)+Math.pow(point.y-p.y,2)) < 12;
	});
}
function mouse_move(event) {
	var point = c2l(canvasxy(event));
	pr('mouse @ '+point.x+','+point.y);
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
	draw_curve(points);
}
function draw_point(p, lp) {
//	ctx.save();
	ctx.beginPath();
	ctx.arc(p.x, p.y, 6, 0, 2*Math.PI, true);
	ctx.fill();
	ctx.beginPath();
	ctx.font = "10px sans-serif";
	ctx.fillStyle = "#666";
	ctx.fillText(lp.x+','+lp.y, p.x+(lp.x>90?-42:8), p.y+(lp.y<10?-8:12));
	ctx.moveTo(p.x,p.y);
//	ctx.restore();
}
function draw_curve(points) {
	var pp;
	ctx.clearRect(0,0,wc,hc);
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.save();
	ctx.beginPath();
	_.forEach(points, function(point) {
		var p = l2c(point);
		if (!pp) {
			ctx.stroke();
			draw_point(p, point);
		} else if (point.x == pp.x) {
			ctx.stroke();
			draw_point(p, point);
		} else {
			ctx.lineTo(p.x,p.y);
			ctx.stroke();
			draw_point(p, point);
		}
		pp = point;
	});
	ctx.stroke();
}
function init() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");
	canvas.addEventListener("mousemove", mouse_move, false);
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