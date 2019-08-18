var peopleNumber = 0;

function placeHumans() {
	$('canvas').addEventListener('click', function(e) {
		if (currentTool == 'place') {
			humansPlaces[peopleNumber] = {
				x : e.offsetX,
				y : e.offsetY
			}

			peopleNumber ++;

			ctx.clearRect(0, 0, WIDTH, HEIGHT);
			Tools.drawGrid(step);
			Tools.drawWalls();
			Tools.drawExits();
			Tools.drawDirections();

			for (let i = 0; i < humansPlaces.length; i ++) {
				ctx.beginPath();
				ctx.fillStyle = '#1e824c';
				ctx.arc(humansPlaces[i].x, humansPlaces[i].y, 10, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
			}
		}
	});

	$('canvas').addEventListener('mousemove', () => {
		if (currentTool == 'place') {
			$('canvas').style.cursor = 'crosshair';
		}
	});
}