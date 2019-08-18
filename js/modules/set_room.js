var wallsNumber = 0;
var exitsNumber = 0;

function setRoom() {
    let isDrawing = false;
    let startPoint = { x: 0, y: 0 };
    let endPoint = { x: 0, y: 0 };

    $('canvas').addEventListener('click', function(e) {
        if (!isDrawing && (currentTool == 'walls' || currentTool == 'exits')) {
            startPoint.x = step * Math.round(e.offsetX / step);
            startPoint.y = step * Math.round(e.offsetY / step);

            isDrawing = true;
        } else if (isDrawing && (currentTool == 'walls' || currentTool == 'exits')) {
            isDrawing = false;

            isModified = true;

            $('status').innerText = 'Файл не сохранен';

            if (currentTool == 'walls') {
                walls[wallsNumber] = {
                    x1: startPoint.x < endPoint.x ? startPoint.x : endPoint.x,
                    y1: startPoint.y < endPoint.y ? startPoint.y : endPoint.y,

                    x2: startPoint.x < endPoint.x ? endPoint.x : startPoint.x,
                    y2: startPoint.y < endPoint.y ? endPoint.y : startPoint.y,

                    dx: Math.abs(endPoint.x - startPoint.x),
                    dy: Math.abs(endPoint.y - startPoint.y)
                }

                operationStack.splice(currentOperation + 1);

                operationStack.push({
                    type: 'wall',
                    object: walls[wallsNumber]
                });

                currentOperation++;

                wallsNumber++;

            } else if (currentTool == 'exits') {
                exits[exitsNumber] = {
                    x1: startPoint.x < endPoint.x ? startPoint.x : endPoint.x,
                    y1: startPoint.y < endPoint.y ? startPoint.y : endPoint.y,

                    x2: startPoint.x < endPoint.x ? endPoint.x : startPoint.x,
                    y2: startPoint.y < endPoint.y ? endPoint.y : startPoint.y,

                    dx: Math.abs(endPoint.x - startPoint.x),
                    dy: Math.abs(endPoint.y - startPoint.y)
                }

                operationStack.splice(currentOperation + 1);

                operationStack.push({
                    type: 'exit',
                    object: exits[exitsNumber]
                });

                currentOperation++;

                exitsNumber++;
            }

            if (currentOperation > -1) {
                $('undoButton').classList.remove('disabled');
                $('undoButton').childNodes[1].src = 'img/undo-active.svg';
            } else {
                $('undoButton').classList.add('disabled');
                $('undoButton').childNodes[1].src = 'img/undo-inactive.svg';
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

    }, false);

    $('canvas').addEventListener('mousemove', function(i) {
        if (currentTool == 'walls' || currentTool == 'exits') {
            $('canvas').style.cursor = 'crosshair';

            if (isDrawing) {
                Tools.update();

                ctx.beginPath();

                if (currentTool == 'walls') {
                    ctx.strokeStyle = 'gray';
                    ctx.lineWidth = 4;
                } else if (currentTool == 'exits') {
                    ctx.strokeStyle = '#19b5fe';
                    ctx.lineWidth = 2;
                }

                ctx.moveTo(startPoint.x, startPoint.y);

                if (Math.abs(i.offsetX - startPoint.x) > Math.abs(i.offsetY - startPoint.y)) {
                    endPoint.x = step * Math.round(i.offsetX / step);
                    endPoint.y = startPoint.y;
                } else {
                    endPoint.x = startPoint.x;
                    endPoint.y = step * Math.round(i.offsetY / step);
                }

                ctx.lineTo(endPoint.x, endPoint.y);

                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = .5;
                ctx.moveTo(0, endPoint.y);
                ctx.lineTo(WIDTH, endPoint.y);
                ctx.moveTo(endPoint.x, 0);
                ctx.lineTo(endPoint.x, HEIGHT);
                ctx.stroke();
                ctx.closePath();
            }
        } else {
            $('canvas').style.cursor = 'default';
        }
    });
}