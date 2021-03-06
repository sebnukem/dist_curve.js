var DISTCURV = (function($, _, undefined){

var canvasbg, ctxbg, canvas, ctx;
var wbg = 500, hbg = 500; // css #canvasbg width, height
var fgleft = 80, fgtop = 20; // css #canvas left, top
var wc = 400, hc = 400; // css #canvas width, height
var wl = 100, hl = 100; // logical size
var points = [ {x:0,y:0}, {x:100,y:100} ];
var livepoints, livepoint, pointer; // mouse hover points and pointer

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
	if (!pointer || !livepoint) return;
	lp = c2l(pointer);
	ax = lp.x>90?-40:16; ay = lp.y<8?-20:12;
	ctx.save();
	ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect (pointer.x+ax-4, pointer.y+ay-12, 38, 30);
    ctx.fillStyle = "#000000";
	ctx.fillText('x: '+livepoint.x, pointer.x+ax, pointer.y+ay);
	ctx.fillText('y: '+livepoint.y, pointer.x+ax, pointer.y+ay+14);
	ctx.restore();
}
function draw_point(lp, paint_coords) {
	if (!lp) return;
	var hover = !!pointer;
	var p = l2c(lp);
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = hover ? '#68a' : '000';
	ctx.arc(p.x, p.y, hover ? 5 : 3, 0, 2*Math.PI, true);
	ctx.fill();
	if (paint_coords !== false) {
		ctx.fillStyle = '#68a';
		ctx.fillText(lp.x+','+lp.y, p.x+(lp.x>90?-42:6), p.y+(lp.y<10?-6:12));
	}
	ctx.restore();
}
function draw_curve() {
	var first, pp;
	ctx.clearRect(0,0,wc,hc);

	// curve
	_.forEach(points, function(point) {
		var coords, pcoords;
		if (!pp) {
			pp = point;
			return;
		}
		coords = l2c(point);
		pcoords = l2c(pp);
		if (pp.x === point.x) {
			ctx.save();
			ctx.beginPath();
			ctx.strokeStyle = "#fafafa";
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 0;
			ctx.moveTo(pcoords.x, pcoords.y);
			ctx.lineTo(coords.x,coords.y);
			ctx.stroke();
			ctx.restore();
		} else {
			ctx.beginPath();
			ctx.moveTo(pcoords.x, pcoords.y);
			ctx.lineTo(coords.x,coords.y);
			ctx.stroke();
		}
		pp = point;
	});

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
	_.forEach(points, function(point) { draw_point(point, true); });

	// pointer
	draw_pointer();
}
function draw_grid() {
	var i;
	var x2b = function(x) { return x * wc / wl + fgleft; }
	var y2b = function(y) { return hc + fgtop - y * hc / hl; }
	ctxbg.lineWidth = 1;
	ctxbg.strokeStyle = '#444';
	ctxbg.font = "11px sans-serif";
	ctxbg.save();

	// x axis
	ctxbg.beginPath();
	ctxbg.moveTo(x2b(0), y2b(0)+1);
	ctxbg.lineTo(x2b(100), y2b(0)+1);
	ctxbg.stroke();
	// label
	ctxbg.font = "15px sans-serif";
	ctxbg.fillText('score', x2b(40), y2b(0)+40);
	// ticks
	ctxbg.font = "11px sans-serif";
	for (i = 0; i <= 100; i += 10) {
		ctxbg.beginPath();
		ctxbg.moveTo(x2b(i), y2b(0)+1);
		ctxbg.lineTo(x2b(i), y2b(0)+5);
		ctxbg.stroke();
		ctxbg.fillText(''+i, x2b(i)-6, y2b(0)+16);
		if (i) {
			ctxbg.save();
			ctxbg.strokeStyle = '#ddd';
			ctxbg.setLineDash([2,2])
			ctxbg.moveTo(x2b(i), y2b(0));
			ctxbg.lineTo(x2b(i), y2b(100));
			ctxbg.stroke();
			ctxbg.restore();
		}
	}
	// y axis
	ctxbg.beginPath();
	ctxbg.moveTo(x2b(0)-1, y2b(0));
	ctxbg.lineTo(x2b(0)-1, y2b(100));
	ctxbg.stroke();
	// label
	ctxbg.save();
	ctxbg.font = "16px sans-serif";
	ctxbg.translate(30, hc/2+40);
	ctxbg.rotate(-Math.PI/2);
	ctxbg.textAlign = "center";
	ctxbg.fillText("funding", 0, 0);
	ctxbg.restore();
	// ticks
	ctxbg.font = "11px sans-serif";
	for (i = 0; i <= 100; i += 10) {
		ctxbg.beginPath();
		ctxbg.moveTo(x2b(0)-1, y2b(i));
		ctxbg.lineTo(x2b(0)-5, y2b(i));
		ctxbg.stroke();
		ctxbg.fillText(''+i+'%', x2b(0)-36, y2b(i)+4);
		if (i) {
			ctxbg.save();
			ctxbg.strokeStyle = '#ddd';
			ctxbg.setLineDash([2,2])
			ctxbg.moveTo(x2b(0), y2b(i));
			ctxbg.lineTo(x2b(100), y2b(i));
			ctxbg.stroke();
			ctxbg.restore();
		}
	}
}
function reset() {
	points = [ {x:0,y:0}, {x:100,y:100} ];
	pointer = null;
	livepoints = null;
	window.requestAnimationFrame(draw_curve);
}
function init() {
	canvasbg = document.getElementById('canvasbg');
	ctxbg = canvasbg.getContext("2d");
	draw_grid();

	canvas = document.getElementById('canvas');
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

	canvas.addEventListener("mousemove", mouse_move, false);
	canvas.addEventListener("mouseout",  mouse_out,  false);
	canvas.addEventListener("mousedown", mouse_down, false);

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