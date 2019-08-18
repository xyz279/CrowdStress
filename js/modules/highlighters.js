function highlightExit(_exit, _color) {
	ctx.beginPath();
	ctx.strokeStyle = _color;
	ctx.lineWidth = 2;
		
	ctx.moveTo(_exit.x1, _exit.y1);
	ctx.lineTo(_exit.x2, _exit.y2);

	if (_exit.dx == 0) {
		ctx.moveTo(_exit.x1 - 6, _exit.y1);
		ctx.lineTo(_exit.x1 + 6, _exit.y1);

		ctx.moveTo(_exit.x2 - 6, _exit.y2);
		ctx.lineTo(_exit.x2 + 6, _exit.y2);
	}

	if (_exit.dy == 0) {
		ctx.moveTo(_exit.x1, _exit.y1 - 6);
		ctx.lineTo(_exit.x1, _exit.y1 + 6);

		ctx.moveTo(_exit.x2,_exit.y2 - 6);
		ctx.lineTo(_exit.x2, _exit.y2 + 6);
	}

	ctx.stroke();
	ctx.closePath();


	ctx.beginPath();
	ctx.fillStyle = 'white';
	ctx.strokeStyle = _color;
	ctx.lineWidth = 2;

	if (_exit.direction != undefined) {
		ctx.arc((_exit.x1 + _exit.x2) / 2, (_exit.y1 + _exit.y2) / 2, 14, 0, 2 * Math.PI, false);
		if (_exit.direction == 'left') {
			ctx.moveTo((_exit.x1 + _exit.x2) / 2 + 4, (_exit.y1 + _exit.y2) / 2 - 7);
			ctx.lineTo((_exit.x1 + _exit.x2) / 2 - 6, (_exit.y1 + _exit.y2) / 2);
			ctx.moveTo((_exit.x1 + _exit.x2) / 2 - 6, (_exit.y1 + _exit.y2) / 2);
			ctx.lineTo((_exit.x1 + _exit.x2) / 2 + 4, (_exit.y1 + _exit.y2) / 2 + 7);
		}

		if (_exit.direction == 'up') {
			ctx.moveTo((_exit.x1 + _exit.x2) / 2 - 7, (_exit.y1 + _exit.y2) / 2 + 4);
			ctx.lineTo((_exit.x1 + _exit.x2) / 2, (_exit.y1 + _exit.y2) / 2 - 6);
			ctx.moveTo((_exit.x1 + _exit.x2) / 2, (_exit.y1 + _exit.y2) / 2 - 6);
			ctx.lineTo((_exit.x1 + _exit.x2) / 2 + 7, (_exit.y1 + _exit.y2) / 2 + 4);
		}

		if (_exit.direction == 'right') {
			ctx.moveTo((_exit.x1 + _exit.x2) / 2 - 4, (_exit.y1 + _exit.y2) / 2 - 7);
			ctx.lineTo((_exit.x1 + _exit.x2) / 2 + 6, (_exit.y1 + _exit.y2) / 2);
			ctx.moveTo((_exit.x1 + _exit.x2) / 2 + 6, (_exit.y1 + _exit.y2) / 2);
			ctx.lineTo((_exit.x1 + _exit.x2) / 2 - 4, (_exit.y1 + _exit.y2) / 2 + 7);
		}

		if (_exit.direction == 'down') {
			ctx.moveTo((_exit.x1 + _exit.x2) / 2 - 7, (_exit.y1 + _exit.y2) / 2 - 4);
			ctx.lineTo((_exit.x1 + _exit.x2) / 2, (_exit.y1 + _exit.y2) / 2 + 6);
			ctx.moveTo((_exit.x1 + _exit.x2) / 2, (_exit.y1 + _exit.y2) / 2 + 6);
			ctx.lineTo((_exit.x1 + _exit.x2) / 2 + 7, (_exit.y1 + _exit.y2) / 2 - 4);
		}
	}

	ctx.fill();
	ctx.stroke();
	ctx.closePath();
}

function highlightWall(_wall, _color) {
	ctx.beginPath();
	ctx.strokeStyle = _color;
	ctx.lineWidth = 4;

	ctx.moveTo(_wall.x1, _wall.y1);
	ctx.lineTo(_wall.x2, _wall.y2);

	ctx.stroke();
	ctx.closePath();
}