function undo() {
    let lastOperation = operationStack[currentOperation];

    if (lastOperation.type == 'wall') {
        walls.splice(walls.length - 1, 1);

        wallsNumber = wallsNumber > 0 ? wallsNumber - 1 : wallsNumber;
    }

    if (lastOperation.type == 'exit') {
        exits.splice(exits.length - 1, 1);

        exitsNumber = exitsNumber > 0 ? exitsNumber - 1 : exitsNumber;
    }

    if (lastOperation.type == 'erase-wall') {
        walls.push(lastOperation.object);

        wallsNumber++;
    }

    if (lastOperation.type == 'erase-exit') {
        exits.push(lastOperation.object);

        exitsNumber++;
    }

    if (lastOperation.type == 'clear-all') {
        walls = lastOperation.object.walls;
        exits = lastOperation.object.exits;

        wallsNumber = walls.length + 1;

        exitsNumber = exits.length + 1;
    }

    if (currentOperation > -1) {
        currentOperation--;
    }

    if (currentOperation == -1) {
        $('undoButton').classList.add('disabled');
        $('undoButton').childNodes[1].src = 'img/undo-inactive.svg';
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

function redo() {
    if (currentOperation + 1 != operationStack.length) {
        let canceledOperation = operationStack[currentOperation + 1];

        if (canceledOperation.type == 'wall') {
            walls.push(canceledOperation.object);

            wallsNumber++;
        }

        if (canceledOperation.type == 'exit') {
            exits.push(canceledOperation.object);

            exitsNumber++;
        }

        if (canceledOperation.type == 'erase-wall') {
            let i;

            for (i = 0; i < walls.length; i ++) {
                if (walls[i] == canceledOperation.object) break;
            }

            walls.splice(i, 1);
        }

        if (canceledOperation.type == 'erase-exit') {
            let i;

            for (i = 0; i < exits.length; i ++) {
                if (exits[i] == canceledOperation.object) break;
            }

            exits.splice(i, 1);
        }

        if (canceledOperation.type == 'clear-all') {
            operationStack.splice(currentOperation + 1);

            operationStack.push({
                type: 'clear-all',
                object: {
                    walls: walls,
                    exits: exits
                }
            });

            ctx.clearRect(0, 0, WIDTH, HEIGHT);

            walls = [];

            exits = [];

            humans = [];

            wallsNumber = 0;

            exitsNumber = 0;

            peopleNumber = 0;

            Tools.update();
        }

        currentOperation++;

        if (currentOperation + 1 != operationStack.length) {
            $('redoButton').classList.remove('disabled');
            $('redoButton').childNodes[1].src = 'img/redo-active.svg';
        } else {
            $('redoButton').classList.add('disabled');
            $('redoButton').childNodes[1].src = 'img/redo-inactive.svg';
        }

        if (currentOperation == -1) {
            $('undoButton').classList.add('disabled');
            $('undoButton').childNodes[1].src = 'img/undo-inactive.svg';
        } else {
            $('undoButton').classList.remove('disabled');
            $('undoButton').childNodes[1].src = 'img/undo-active.svg';
        }

        Tools.update();
    } else {
        $('redoButton').classList.add('disabled');
        $('redoButton').childNodes[1].src = 'img/redo-inactive.svg';
    }
}