function setDirections() {
	let toolPopup;
	let protector;

	$('canvas').addEventListener('mousemove', function(e) {
		if (currentTool == 'directions') {
			if(toolPopup == undefined) {
				Tools.update();

				for (let i = 0; i < exits.length; i ++) {
					if (e.offsetX > exits[i].x1 - 10 && e.offsetX < exits[i].x2 + 10 && e.offsetY > exits[i].y1 - 10 && e.offsetY < exits[i].y2 + 10) {
						$('canvas').style.cursor = 'pointer';

						highlightExit(exits[i], 'red');
					}
				}
			}
		}
	});

	$('canvas').addEventListener('click', function(e) {
		if(toolPopup != undefined) {
			document.body.removeChild(toolPopup);

			toolPopup = undefined;

			Tools.update();
		}

		if (currentTool == 'directions') {
			isModified = true;
			
			$('status').innerText = 'Файл не сохранен';

			for (let i = 0; i < exits.length; i ++) {
				if (e.offsetX > exits[i].x1 - 10 && e.offsetX < exits[i].x2 + 10 && e.offsetY > exits[i].y1 - 10 && e.offsetY < exits[i].y2 + 10) {

					toolPopup = createPopup(e.offsetX - 40, e.offsetY + 40);

					directionButtons = document.querySelectorAll('.direction-button');

					for (let j = 0; j < directionButtons.length; j ++) {
						directionButtons[j].addEventListener('click', function() {
							exits[i].direction = directionButtons[j].id;

							Tools.update();

							for (let k = 0; k < directionButtons.length; k ++) {
								directionButtons[k].classList.remove('active');
							}

							directionButtons[j].classList.add('active');
						});
					}
				}
			}
		}
	});
}