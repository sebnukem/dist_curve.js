var DISTCURV = (function($, _, undefined){

var canvas, ctx;
var wc = 500, hc = 500;
var wl = 100, hl = 100;
var pointer; // canvas coords mouse pointer
var points = [ {x:0,y:0}, {x:100,y:100} ];
var livepoints, livepoint;

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
	if (!point) return null;
	return {
		x: Math.floor(point.x * wl / wc),
		y: hl - Math.floor(point.y * hl / hc)
	};
}
function l2c(point) {
	if (!point) return null;
	return {
		x: point.x * wc / wl,
		y: hc - point.y * hc / hl
	}
}
function add_point(points, point) {
	if (!point) return points;
	points.push(point);
	sort_points(points);
	return trim_points(points);
}
function trim_points(points) {
	var i, l = points.length;
	for (i = l-2; i>0; i--) {
		if (points[i-1].x === points[i].x && points[i].x === points[i+1].x) points.splice(i,1);
		else if (points[i-1].y === points[i].y && points[i].y === points[i+1].y) points.splice(i,1);
	}	
}
function sort_points(points) {
	return points.sort(function(a,b){ if (a.x - b.x) return a.x - b.x; else return a.y - b.y; });
}
function is_over_point(point) {
	return _.findIndex(points, function(p) {
		return Math.sqrt(Math.pow(point.x-p.x,2)+Math.pow(point.y-p.y,2)) < 5;
	});
}
function mouse_move(event) {
	pointer = canvasxy(event);
	var point = c2l(pointer);
	pr('mouse @ '+point.x+','+point.y);
	var tmpts = _.clone(points);
	add_point(tmpts, point);
	var pi = _.findIndex(tmpts, point);
	livepoints = null;
	if (pi >= 0) {
		var fromp = pi > 0 ? tmpts[pi -1] : null;
		var top = pi < tmpts.length - 1 ? tmpts[pi + 1] : null;
		livepoints = [ point ];
		livepoint = point;
		if (fromp) {
			livepoints.unshift(fromp);
			if (point.y < fromp.y) point.y = fromp.y;
			if (Math.abs(fromp.x - point.x) < 5) point.x = fromp.x;
			if (Math.abs(fromp.y - point.y) < 5) point.y = fromp.y;
		}
		if (top) {
			livepoints.push(top);
			if (Math.abs(top.x - point.x) < 5) point.x = top.x;
			if (Math.abs(top.y - point.y) < 5) point.y = top.y;
			if (point.y > top.y) point.y = top.y;
		}
	}
	window.requestAnimationFrame(draw_curve);
}
function mouse_out(event) {
	pointer = null;
	livepoints = null;
	window.requestAnimationFrame(draw_curve);
}
function mouse_down(event) {
	var point = livepoint ? livepoint : c2l(canvasxy(event));
	pr('mouse down @ '+point.x+','+point.y);
	var overi = is_over_point(point);
	if (overi != -1 ) {
//		pr('mouse down over @ '+point.x+','+point.y);
		points.splice(overi,1);
	} else {
		add_point(points, point);
	}
	livepoints = null;
	window.requestAnimationFrame(draw_curve);
}
function draw_pointer() {
	var lp, ax, ay;
	if (!pointer) return;
	lp = c2l(pointer);
	ax = lp.x>90?-40:16; ay = lp.y<8?-20:12;
	ctx.save();
	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect (pointer.x+ax-4, pointer.y+ay-12, 38, 30);
    ctx.fillStyle = "#000000";
	ctx.fillText('x: '+lp.x, pointer.x+ax, pointer.y+ay);
	ctx.fillText('y: '+lp.y, pointer.x+ax, pointer.y+ay+14);
	ctx.restore();
}
function draw_point(lp, paint_coords) {
	if (!lp) return;
	var p = l2c(lp);
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = "#c86";
	ctx.arc(p.x, p.y, 6, 0, 2*Math.PI, true);
	ctx.fill();
	if (paint_coords !== false) ctx.fillText(lp.x+','+lp.y, p.x+(lp.x>90?-42:6), p.y+(lp.y<10?-6:12));
	ctx.restore();
}
function draw_curve() {
	var first;
	ctx.clearRect(0,0,wc,hc);
	ctx.beginPath();

	// curve
	first = true;
	_.forEach(points, function(point) {
		var coords = l2c(point);
		if (first) {
			ctx.moveTo(coords.x,coords.y);
			first = false;
		} else {
			ctx.lineTo(coords.x,coords.y);
		}
	});
	ctx.stroke();

	// live curve
	if (livepoints) {
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = "#44c";
		first = true;
		_.forEach(livepoints, function(point) {
			var coords = l2c(point);
			if (first) {
				ctx.moveTo(coords.x,coords.y);
				first = false;
			} else {
				ctx.lineTo(coords.x,coords.y);
			}
		});
		ctx.stroke();
		draw_point(livepoint, false);
		ctx.restore();
	}

	// points
	_.forEach(points, function(point) {
		draw_point(point);
	});

	// pointer
	draw_pointer();
}
function reset() {
	points = [ {x:0,y:0}, {x:100,y:100} ];
	pointer = null;
	livepoints = null;
	window.requestAnimationFrame(draw_curve);
}
function init() {
	canvas = document.getElementById('canvas');
	canvas.addEventListener("mousemove", mouse_move, false);
	canvas.addEventListener("mouseout",  mouse_out,  false);
	canvas.addEventListener("mousedown", mouse_down, false);

	ctx = canvas.getContext("2d");
	ctx.shadowOffsetX = 1;
	ctx.shadowOffsetY = 1;
	ctx.shadowBlur = 2;
 	ctx.shadowColor = "rgba(100, 100, 100, 0.3)";
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.strokeStyle = "#000";
	ctx.font = "10px sans-serif";
	ctx.save();
	window.requestAnimationFrame(draw_curve);
}
return {
	log: log,
	init: init,
	reset: reset
}
})(jQuery, _);

$(document).ready(function() {
	DISTCURV.log('jquery loaded.');
	$('#reset').on('click', DISTCURV.reset);
	DISTCURV.init();
});