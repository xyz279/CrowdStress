function erase() {
    $('canvas').addEventListener('mousemove', function(e) {
        if (currentTool == 'eraser') {
            Tools.update();

            for (let i = 0; i < walls.length; i++) {
                if (e.offsetX >= walls[i].x1 - 2 && e.offsetX <= walls[i].x2 + 2 && e.offsetY >= walls[i].y1 - 2 && e.offsetY <= walls[i].y2 + 2) {
                    $('canvas').style.cursor = 'pointer';

                    highlightWall(walls[i], '#f62459');
                }
            }

            for (let i = 0; i < exits.length; i++) {
                if (e.offsetX >= exits[i].x1 - 2 && e.offsetX <= exits[i].x2 + 2 && e.offsetY >= exits[i].y1 - 2 && e.offsetY <= exits[i].y2 + 2) {
                    $('canvas').style.cursor = 'pointer';

                    highlightExit(exits[i], '#f62459');
                }
            }
        }
    });

    $('canvas').addEventListener('click', function(e) {
        if (currentTool == 'eraser') {
            isModified = true;

            $('status').innerText = 'Файл не сохранен';

            for (let i = 0; i < walls.length; i++) {
                if (e.offsetX >= walls[i].x1 - 2 && e.offsetX <= walls[i].x2 + 2 && e.offsetY >= walls[i].y1 - 2 && e.offsetY <= walls[i].y2 + 2) {
                    $('canvas').style.cursor = 'pointer';

                    highlightWall(walls[i], '#f62459');

                    operationStack.splice(currentOperation + 1);

                    operationStack.push({
                        type: 'erase-wall',
                        object: walls[i]
                    });

                    currentOperation++;

                    walls.splice(i, 1);

                    wallsNumber = walls.length;

                    if (currentOperation > -1) {
                        $('undoButton').classList.remove('disabled');
                        $('undoButton').childNodes[1].src = 'img/undo-active.svg';
                    } else {
                        $('undoButton').classList.remove('disabled');
                        $('undoButton').childNodes[1].src = 'img/undo-active.svg';
                    }

                    if (currentOperation + 1 < operationStack.length) {
                        $('redoButton').classList.remove('disabled');
                        $('redoButton').childNodes[1].src = 'img/redo-active.svg';
                    } else {
                        $('redoButton').classList.add('disabled');
                        $('redoButton').childNodes[1].src = 'img/redo-inactive.svg';
                    }

                    Tools.update();
                }
            }

            for (let i = 0; i < exits.length; i++) {
                if (e.offsetX >= exits[i].x1 - 2 && e.offsetX <= exits[i].x2 + 2 && e.offsetY >= exits[i].y1 - 2 && e.offsetY <= exits[i].y2 + 2) {
                    $('canvas').style.cursor = 'pointer';

                    highlightExit(exits[i], '#f62459');

                    operationStack.splice(currentOperation + 1);

                    operationStack.push({
                        type: 'erase-exit',
                        object: exits[i]
                    });

                    currentOperation++;

                    exits.splice(i, 1);

                    exitsNumber = exits.length;

                    if (currentOperation > -1) {
                        $('undoButton').classList.remove('disabled');
                        $('undoButton').childNodes[1].src = 'img/undo-active.svg';
                    } else {
                        $('undoButton').classList.remove('disabled');
                        $('undoButton').childNodes[1].src = 'img/undo-active.svg';
                    }

                    if (currentOperation + 1 != operationStack.length) {
                        $('redoButton').classList.remove('disabled');
                        $('redoButton').childNodes[1].src = 'img/redo-active.svg';
                    } else {
                        $('redoButton').classList.add('disabled');
                        $('redoButton').childNodes[1].src = 'img/redo-inactive.svg';
                    }

                    Tools.update();
                }
            }
        }
    });
}