function keyPress(e) {
    var evtobj = window.event ? event : e;

    if (evtobj.keyCode == 78 && evtobj.ctrlKey) {
        if (isModified) {
            dialog.showMessageBox({
                type: 'warning',
                buttons: ['Сохранить', 'Не сохранять', 'Отмена'],
                title: 'Предупреждение',
                message: 'Сохранить изменения в файле?'
            }, (response) => {
                if (response == 0) {
                    let preset = exportPreset();

                    if (openedFile != null) {
                        savePreset(preset);
                    } else {
                        savePresetAs(preset);
                    }
                }

                if (response == 1) {
                    $('info').innerText = 'untitled';

                    isModified = false;

                    isRunning = false;

                    humansPlaces = [];
                    peopleNumber = 0;
                    humans = [];

                    speed = 1;

                    ctx.clearRect(0, 0, WIDTH, HEIGHT);
                    walls = [];
                    wallsNumber = 0;

                    exits = [];
                    exitsNumber = 0;

                    Tools.update();
                }
            });
        } else {
            $('info').innerText = 'untitled';

            isModified = false;

            isRunning = false;

            humansPlaces = [];
            peopleNumber = 0;
            humans = [];

            speed = 1;

            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            walls = [];
            wallsNumber = 0;

            exits = [];
            exitsNumber = 0;

            Tools.update();
        }
    }

    if (evtobj.keyCode == 79 && evtobj.ctrlKey) {
        if (isModified) {
            dialog.showMessageBox({
                type: 'warning',
                buttons: ['Сохранить', 'Не сохранять', 'Отмена'],
                title: 'Предупреждение',
                message: 'Сохранить изменения в файле?'
            }, (response) => {
                if (response == 0) {
                    let preset = exportPreset();

                    if (openedFile != null) {
                        savePreset(preset);
                    } else {
                        savePresetAs(preset);
                    }
                }

                if (response == 1) {
                    loadPreset();
                }
            });
        } else {
            loadPreset();
        }
    }

    if (evtobj.keyCode == 83 && evtobj.ctrlKey) {
        let preset = exportPreset();

        if (openedFile != null) {
            savePreset(preset);
        } else {
            savePresetAs(preset);
        }
    }

    if (evtobj.keyCode == 90 && evtobj.ctrlKey)
        undo();

    if (evtobj.keyCode == 89 && evtobj.ctrlKey)
        redo();

}