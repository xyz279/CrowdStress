function createToolbox() {
	setRoom();
	setDirections();
	erase();
	placeHumans();

	let tools = document.querySelectorAll('.toolbox-item');

	for (let i = 0; i < tools.length; i ++) {
		tools[i].addEventListener('click', function() {
			currentTool = tools[i].dataset.tool;

			for (let j = 0; j < tools.length; j ++) {
				tools[j].classList.remove('active');
			}

			tools[i].classList.add('active');
		}, false);
	}
}