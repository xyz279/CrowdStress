const electron = require('electron');
const { ipcRenderer } = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const remote = require('electron').remote;
const { dialog } = require('electron').remote;
const fs = require('fs');
const parseXML = require('xml2js').parseString;
const path = require('path');

const canvas = 'canvas';
const step = 20;
var ctx;
var WIDTH;
var HEIGHT;
var humans = [];
var showVectors = false;
var showDirections = false;
var walls = [];
var exits = [];
var humansPlaces = [];
var escapedNumber = 0;
var currentTool = null;
var isRunning = false;
var isPaused = false;
var openedFile = null;
var isModified = false;
var speed = 1;

var operationStack = [];
var currentOperation = -1;

var viewSettings = fs.readFileSync(path.join(__dirname, 'view-settings.html'));

function $(_id) {
    return document.getElementById(_id);
}

document.addEventListener('keydown', keyPress);

$('close-button').addEventListener('click', () => {
    ipcRenderer.send('asynchronous-message', isModified.toString());

    ipcRenderer.on('asynchronous-reply', (event, arg) => {
        if (arg == 'save') {
            let preset = exportPreset();

            if (openedFile != null) {
                savePreset(preset);
            } else {
                savePresetAs(preset);
            }
        }
    });
});

$('minimize-button').addEventListener('click', () => {
    let currentWindow = remote.getCurrentWindow();
    currentWindow.minimize();
});

document.body.onload = function() {
    currentTool = 'none';

    WIDTH = $(canvas).offsetWidth;
    $(canvas).width = WIDTH;

    HEIGHT = $(canvas).offsetHeight;
    $(canvas).height = HEIGHT;

    $('createFileButton').addEventListener('click', () => {
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
                    $('info').innerText = 'Новый проект';

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
            $('info').innerText = 'Новый проект';

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

    $('openFileButton').addEventListener('click', () => {
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
    });

    $('saveFileButton').addEventListener('click', () => {
        let preset = exportPreset();

        if (openedFile != null) {
            savePreset(preset);
        } else {
            savePresetAs(preset);
        }
    });

    $('undoButton').addEventListener('click', () => {
        if (operationStack.length != 0 && currentOperation > -1) {
            undo();
        }
    });

    $('redoButton').addEventListener('click', () => {
        if (currentOperation + 1 != operationStack.length) {
            redo();
        }
    });

    $('runButton').addEventListener('click', function() {
        if (!isRunning) {
            isRunning = true;

            start();

            $('runButton').childNodes[1].src = 'img/pause.svg';
            $('runButton').title = 'Пауза';

            $('stopButton').classList.remove('disabled');
            $('stopButton').childNodes[1].src = 'img/stop-active.svg';

            let tools = document.querySelectorAll('.toolbox-item');
            currentTool = 'none';

            for (let i = 0; i < tools.length; i++) {
                tools[i].classList.remove('active');
                tools[i].classList.add('disabled');
            }

            let menubarItems = document.querySelectorAll('.menubar-item');

            for (let i = 0; i < menubarItems.length; i++) {
                menubarItems[i].classList.add('disabled');
            }

            $('createFileButton').classList.add('disabled');
            $('openFileButton').classList.add('disabled');
            $('saveFileButton').classList.add('disabled');
            $('undoButton').classList.add('disabled');
            $('redoButton').classList.add('disabled');
        } else {
            if (!isPaused) {
                speed = 0;
                isPaused = true;
                $('runButton').childNodes[1].src = 'img/play.svg';
                $('runButton').title = 'Запустить';
            } else {
                speed = 1;
                isPaused = false;
                $('runButton').childNodes[1].src = 'img/pause.svg';
                $('runButton').title = 'Пауза';
            }
        }
    });

    $('stopButton').addEventListener('click', () => {
        isRunning = false;

        humansPlaces = [];
        peopleNumber = 0;
        humans = [];

        speed = 1;

        $('runButton').childNodes[1].src = 'img/play.svg';
        $('runButton').title = 'Запустить';

        $('stopButton').classList.add('disabled');
        $('stopButton').childNodes[1].src = 'img/stop-inactive.svg';

        let tools = document.querySelectorAll('.toolbox-item');

        for (let i = 0; i < tools.length; i++) {
            tools[i].classList.remove('disabled');
        }

        let menubarItems = document.querySelectorAll('.menubar-item');

        for (let i = 0; i < menubarItems.length; i++) {
            menubarItems[i].classList.remove('disabled');
        }

        $('createFileButton').classList.remove('disabled');
        $('openFileButton').classList.remove('disabled');
        $('saveFileButton').classList.remove('disabled');
        $('undoButton').classList.remove('disabled');
        $('redoButton').classList.remove('disabled');
    });

    let menu;
    let isMenuOpened = false;

    $('viewSettingsButton').addEventListener('click', (e) => {
        if (!isMenuOpened) {
            $('viewSettingsButton').classList.add('active');

            menu = createMenu($('viewSettingsButton').offsetLeft, $('viewSettingsButton').offsetTop + 35, viewSettings);

            if (showVectors) {
                $('showVectors').checked = true;
            }

            if (showDirections) {
                $('showDirections').checked = true;
            }

            $('showVectors').addEventListener('change', () => {
                showVectors = $('showVectors').checked;
            });

            $('showDirections').addEventListener('change', () => {
                showDirections = $('showDirections').checked;
            });

            isMenuOpened = true;
        }
    });

    let menubarItems = document.querySelectorAll('.menubar-item');
    let dropdownMenu;
    let isDropdownOpened = false;

    let menuItems = [
        [
            { title: 'Создать', keys: 'Ctrl + N', id: 'createFile' },

            { title: 'Открыть', keys: 'Ctrl + O', id: 'openFile' },

            { title: 'separator' },

            { title: 'Сохранить', keys: 'Ctrl + S', id: 'saveFile' },

            { title: 'Сохранить как', id: 'saveFileAs' },

            { title: 'separator' },

            { title: 'Выход', id: 'exit' }
        ],
        [
            { title: 'Отменить', keys: 'Ctrl + Z', id: 'undo' },

            { title: 'Вернуть', keys: 'Ctrl + Y', id: 'redo' },

            { title: 'separator' },

            { title: 'Очистить все', id: 'clearAll' }
        ],
        [
            { title: 'Стена', id: 'walls' },

            { title: 'Выход', id: 'exits' },

            { title: 'Направление', id: 'directions' },

            { title: 'Индивид', id: 'place' },

            { title: 'Уничтожить', id: 'eraser' }
        ],
        [
            { title: 'Инструкция', id: 'instruction' },

            { title: 'separator' },

            { title: 'О программе', id: 'about' }
        ]
    ];

    for (let i = 0; i < menubarItems.length; i++) {
        menubarItems[i].addEventListener('click', (e) => {
            if (dropdownMenu != undefined) {
                document.body.removeChild(dropdownMenu);

                for (let j = 0; j < menubarItems.length; j++) {
                    menubarItems[j].classList.remove('active');
                }
            }

            dropdownMenu = showDropdownMenu(e.path[0].id, menuItems[i]);
            isDropdownOpened = true;
        });

        menubarItems[i].addEventListener('mouseover', (e) => {
            if (isDropdownOpened) {
                if (dropdownMenu != undefined) {
                    document.body.removeChild(dropdownMenu);

                    for (let j = 0; j < menubarItems.length; j++) {
                        menubarItems[j].classList.remove('active');
                    }
                }

                dropdownMenu = showDropdownMenu(e.path[0].id, menuItems[i]);
                isDropdownOpened = true;
            }
        });
    }

    document.body.addEventListener('click', (e) => {
        if (isDropdownOpened && !e.path[0].classList.contains('menubar-item')) {
            if (e.path[0].classList.contains('menu-item')) {
                if (e.path[0].id == 'createFile') {
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
                                $('info').innerText = 'Новый проект';

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
                        $('info').innerText = 'Новый проект';

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

                if (e.path[0].id == 'openFile') {
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

                if (e.path[0].id == 'saveFile') {
                    let preset = exportPreset();

                    if (openedFile != null) {
                        savePreset(preset);
                    } else {
                        savePresetAs(preset);
                    }
                }

                if (e.path[0].id == 'saveFileAs') {
                    let preset = exportPreset();

                    savePresetAs(preset);
                }

                if (e.path[0].id == 'exit') {
                    ipcRenderer.send('asynchronous-message', isModified.toString());

                    ipcRenderer.on('asynchronous-reply', (event, arg) => {
                        if (arg == 'save') {
                            let preset = exportPreset();

                            if (openedFile != null) {
                                savePreset(preset);
                            } else {
                                savePresetAs(preset);
                            }
                        }
                    });
                }

                if (e.path[0].id == 'undo') {
                    if (operationStack.length != 0 && currentOperation > -1) {
                        undo();
                    }
                }

                if (e.path[0].id == 'redo') {
                    if (currentOperation + 1 != operationStack.length) {
                        redo();
                    }
                }

                if (e.path[0].id == 'clearAll') {
                    operationStack.splice(currentOperation + 1);

                    operationStack.push({
                        type: 'clear-all',
                        object: {
                            walls: walls,
                            exits: exits
                        }
                    });

                    currentOperation++;

                    ctx.clearRect(0, 0, WIDTH, HEIGHT);

                    walls = [];

                    exits = [];

                    humans = [];

                    wallsNumber = 0;

                    exitsNumber = 0;

                    peopleNumber = 0;

                    Tools.update();

                    if (currentOperation > -1) {
                        $('undoButton').classList.remove('disabled');
                        $('undoButton').childNodes[1].src = 'img/undo-active.svg';
                    } else {
                        $('undoButton').classList.add('disabled');
                        $('undoButton').childNodes[1].src = 'img/undo-inactive.svg';
                    }
                }

                if (e.path[0].id == 'walls') {
                    currentTool = 'walls';
                }

                if (e.path[0].id == 'exits') {
                    currentTool = 'exits';
                }

                if (e.path[0].id == 'directions') {
                    currentTool = 'directions';
                }

                if (e.path[0].id == 'place') {
                    currentTool = 'place';
                }

                if (e.path[0].id == 'eraser') {
                    currentTool = 'eraser';
                }

                if (e.path[0].id == 'about') {
                    alert('CrowdStress v0.9.0\nby hood52 \nⒸ 2019');
                }
            }

            document.body.removeChild(dropdownMenu);

            for (let i = 0; i < menubarItems.length; i++) {
                menubarItems[i].classList.remove('active');
            }

            isDropdownOpened = false;
            dropdownMenu = undefined;
        }

        if (isMenuOpened && !(e.path[0].id == 'viewSettingsButton' || e.path[1].id == 'viewSettingsButton' || (e.path[0].classList.contains('item') || e.path[1].classList.contains('item') || e.path[2].classList.contains('item')))) {
            document.body.removeChild(menu);

            $('viewSettingsButton').classList.remove('active');

            isMenuOpened = false;
        }
    });

    ctx = $(canvas).getContext('2d');

    Tools.update();

    createToolbox();
}

function start() {
    isRunning = true;

    for (let i = 0; i < peopleNumber; i++) {
        var h = new Human();
        h.place(humansPlaces[i].x, humansPlaces[i].y);

        humans[i] = h;
    }


    function redraw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        Tools.drawGrid(step);
        Tools.drawWalls();
        Tools.drawExits();
        if (isRunning) {
            if (showDirections) {
                Tools.drawDirections();
            }
        } else {
            Tools.drawDirections();
        }

        for (let i = 0; i < humans.length; i++) {
            humans[i].setDirection();
            humans[i].setVelocity();
            humans[i].setHumansDistances(humans);
            humans[i].setWallsDistances(walls);
            humans[i].F_2(humans);
            humans[i].F_3(humans);
            humans[i].F_4(walls);
            humans[i].F_5(walls);
            humans[i].deleteEscaped(humans);
            humans[i].acceleration();
            humans[i].move();
        }

        if (isRunning) {
            window.requestAnimationFrame(redraw);
        }
    }

    redraw();
}

var Tools = {
    drawGrid: function(_step) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;

        ctx.beginPath();

        for (let i = _step + .5; i < WIDTH; i += _step) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, HEIGHT);
            ctx.stroke();
        }

        for (let i = _step + .5; i < HEIGHT; i += _step) {
            ctx.moveTo(0, i);
            ctx.lineTo(WIDTH, i);
            ctx.stroke();
        }

        ctx.closePath();
    },

    drawWalls: function() {
        // Уплотнение на случай если элементы удалялись
        walls = condense(walls);

        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 4;

        ctx.beginPath();

        for (let i = 0; i < walls.length; i++) {
            ctx.moveTo(walls[i].x1, walls[i].y1);
            ctx.lineTo(walls[i].x2, walls[i].y2);
        }

        ctx.stroke();
        ctx.closePath();
    },

    drawExits: function() {
        // Уплотнение на случай если элементы удалялись
        exits = condense(exits);

        ctx.strokeStyle = '#19b5fe';
        ctx.lineWidth = 2;

        ctx.beginPath();

        for (let i = 0; i < exits.length; i++) {
            ctx.moveTo(exits[i].x1, exits[i].y1);
            ctx.lineTo(exits[i].x2, exits[i].y2);

            if (exits[i].dx == 0) {
                ctx.moveTo(exits[i].x1 - 6, exits[i].y1);
                ctx.lineTo(exits[i].x1 + 6, exits[i].y1);

                ctx.moveTo(exits[i].x2 - 6, exits[i].y2);
                ctx.lineTo(exits[i].x2 + 6, exits[i].y2);
            }

            if (exits[i].dy == 0) {
                ctx.moveTo(exits[i].x1, exits[i].y1 - 6);
                ctx.lineTo(exits[i].x1, exits[i].y1 + 6);

                ctx.moveTo(exits[i].x2, exits[i].y2 - 6);
                ctx.lineTo(exits[i].x2, exits[i].y2 + 6);
            }
        }

        ctx.stroke();
        ctx.closePath();
    },

    drawDirections: function() {
        ctx.beginPath();

        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#19b5fe';
        ctx.lineWidth = 2;

        for (let i = 0; i < exits.length; i++) {
            if (exits[i].direction != undefined) {
                ctx.moveTo((exits[i].x1 + exits[i].x2) / 2 + 14, (exits[i].y1 + exits[i].y2) / 2);
                ctx.arc((exits[i].x1 + exits[i].x2) / 2, (exits[i].y1 + exits[i].y2) / 2, 14, 0, 2 * Math.PI, false);

                if (exits[i].direction == 'left') {
                    ctx.moveTo((exits[i].x1 + exits[i].x2) / 2 + 4, (exits[i].y1 + exits[i].y2) / 2 - 7);
                    ctx.lineTo((exits[i].x1 + exits[i].x2) / 2 - 6, (exits[i].y1 + exits[i].y2) / 2);
                    ctx.moveTo((exits[i].x1 + exits[i].x2) / 2 - 6, (exits[i].y1 + exits[i].y2) / 2);
                    ctx.lineTo((exits[i].x1 + exits[i].x2) / 2 + 4, (exits[i].y1 + exits[i].y2) / 2 + 7);
                }

                if (exits[i].direction == 'up') {
                    ctx.moveTo((exits[i].x1 + exits[i].x2) / 2 - 7, (exits[i].y1 + exits[i].y2) / 2 + 4);
                    ctx.lineTo((exits[i].x1 + exits[i].x2) / 2, (exits[i].y1 + exits[i].y2) / 2 - 6);
                    ctx.moveTo((exits[i].x1 + exits[i].x2) / 2, (exits[i].y1 + exits[i].y2) / 2 - 6);
                    ctx.lineTo((exits[i].x1 + exits[i].x2) / 2 + 7, (exits[i].y1 + exits[i].y2) / 2 + 4);
                }

                if (exits[i].direction == 'right') {
                    ctx.moveTo((exits[i].x1 + exits[i].x2) / 2 - 4, (exits[i].y1 + exits[i].y2) / 2 - 7);
                    ctx.lineTo((exits[i].x1 + exits[i].x2) / 2 + 6, (exits[i].y1 + exits[i].y2) / 2);
                    ctx.moveTo((exits[i].x1 + exits[i].x2) / 2 + 6, (exits[i].y1 + exits[i].y2) / 2);
                    ctx.lineTo((exits[i].x1 + exits[i].x2) / 2 - 4, (exits[i].y1 + exits[i].y2) / 2 + 7);
                }

                if (exits[i].direction == 'down') {
                    ctx.moveTo((exits[i].x1 + exits[i].x2) / 2 - 7, (exits[i].y1 + exits[i].y2) / 2 - 4);
                    ctx.lineTo((exits[i].x1 + exits[i].x2) / 2, (exits[i].y1 + exits[i].y2) / 2 + 6);
                    ctx.moveTo((exits[i].x1 + exits[i].x2) / 2, (exits[i].y1 + exits[i].y2) / 2 + 6);
                    ctx.lineTo((exits[i].x1 + exits[i].x2) / 2 + 7, (exits[i].y1 + exits[i].y2) / 2 - 4);
                }
            }
        }

        ctx.fill();
        ctx.stroke();

        ctx.closePath();
    },

    drawHumans(_places) {
        for (let i = 0; i < humansPlaces.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = '#1e824c';
            ctx.arc(humansPlaces[i].x, humansPlaces[i].y, 10, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
        }
    },

    update() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.drawGrid(step);
        this.drawWalls();
        this.drawExits();
        this.drawDirections();
        this.drawHumans();
    }
}

// Модуль векторной алгебры (велосипед)
var Vector = {
    sum: function(_vectors) {
        let result = {
            dx: 0,
            dy: 0
        }

        for (let i = 0; i < _vectors.length; i++) {
            result.dx += _vectors[i].dx;
            result.dy += _vectors[i].dy;
        }

        return result;
    },

    scalar: function(_a, _b) {
        let vectorA = _a;
        let vectorB = _b;

        let result = vectorA.dx * vectorB.dx + vectorA.dy * vectorB.dy;

        return result;
    },

    crossing: function(_a, _b) {
        let x1 = _a.x1;
        let x2 = _a.x2;
        let y1 = _a.y1;
        let y2 = _a.y2;

        let x3 = _b.x1;
        let x4 = _b.x2;
        let y3 = _b.y1;
        let y4 = _b.y2;

        let result = {
            x: 0,
            y: 0
        }

        let _ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        let _ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        result = {
            x: x1 + _ua * (x2 - x1),
            y: y1 + _ua * (y2 - y1)
        }

        return result;
    }
}

// Функция Хевисайда
function Heaviside(_n) {
    if (_n < 0) return 0;
    if (_n >= 0) return 1;
}

function randomInt(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

function addMouseWheelIncrement() {
    let inputs = document.querySelectorAll('input[type=number], input[type=range]');

    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('wheel', function(e) {
            let delta = e.deltaY;

            let increment = parseFloat(inputs[i].dataset.increment);

            if (delta < 0) {
                inputs[i].value = parseFloat(parseFloat(inputs[i].value) + increment).toFixed(2);
            } else if (delta > 0) {
                inputs[i].value = parseFloat(parseFloat(inputs[i].value) - increment).toFixed(2);
            }
        });
    }
}

function createPopup(_x, _y) {
    newPopup = document.createElement('div');
    newPopup.classList.add('popup');
    newPopup.innerHTML = '<div class="item"><label>Направление движения</label><div class="row row-4"><div class="direction-button" id="left">&#x1F868;</div><div class="direction-button" id="up">&#x1F869;</div><div class="direction-button" id="right">&#x1F86A;</div><div class="direction-button" id="down">&#x1F86B;</div></div><div>';
    newPopup.style.left = _x + 'px';
    newPopup.style.top = _y + 'px';

    document.body.appendChild(newPopup);

    return newPopup;
}

function createMenu(_x, _y, _content) {
    let newMenu = document.createElement('div');
    newMenu.classList.add('options');
    newMenu.innerHTML = _content;
    newMenu.style.left = _x + 'px';
    newMenu.style.top = _y + 'px';

    document.body.appendChild(newMenu);

    return newMenu;
}

function showDropdownMenu(_senderid, _items) {
    let menu = document.createElement('div');
    menu.classList.add('dropdown');
    menu.style.top = $(_senderid).offsetTop + 35 + 'px';
    menu.style.left = $(_senderid).offsetLeft + 'px';

    let inner = '<ul>';

    for (let i = 0; i < _items.length; i++) {
        if (_items[i].title != 'separator') {
            let disabled = '';

            if (_items[i].id == 'undo') {
                if (currentOperation == -1) {
                    disabled = 'disabled';
                }
            }

            if (_items[i].id == 'redo') {
                if (currentOperation + 1 == operationStack.length) {
                    disabled = 'disabled';
                }
            }

            let keys = _items[i].keys == undefined ? '&emsp;&emsp;&emsp;&emsp;&emsp;' : _items[i].keys;

            inner += '<li class="menu-item ' + disabled + '" id="' + _items[i].id + '">' + _items[i].title + '<div>' + keys + '</div></li>';
        } else {
            inner += '<div class="dropdown-separator"></div>';
        }
    }

    inner += '</ul>';

    menu.innerHTML = inner;

    document.body.appendChild(menu);

    $(_senderid).classList.add('active');

    return menu;
}

function condense(_array) {
    let _result = [];

    for (let i = 0; i < _array.length; i++) {
        if (_array[i] != null) {
            _result.push(_array[i]);
        }
    }

    return _result;
}

function savePreset(_content) {
    $('status').innerText = 'Сохранение...';

    fs.writeFile(openedFile, _content, (error) => {
        if (error) {
            console.log(error.message);
        }

        isModified = false;

        $('status').innerText = 'Файл сохранен';

        window.setTimeout(() => {
            $('status').innerText = '';
        }, 3000);
    });
}

function savePresetAs(_content) {
    dialog.showSaveDialog({
        title: 'Сохранить как',
        defaultPath: 'preset.xml',
        filters: [
            { name: 'XML', extensions: ['xml'] }
        ]
    }, (_filename) => {
        if (_filename.indexOf('.xml') == -1) _filename += '.xml';

        $('status').innerText = 'Сохранение...';

        fs.writeFile(_filename, _content, function(error) {
            if (error) {
                console.log(error.message);
            }

            isModified = false;
        });

        openedFile = _filename;
        $('info').innerText = openedFile;

        $('status').innerText = 'Файл сохранен';

        window.setTimeout(() => {
            $('status').innerText = '';
        }, 3000);
    });
}

function loadPreset() {
    $('status').innerText = '';

    let file = dialog.showOpenDialog({
        title: 'Открыть',
        filters: [
            { name: 'XML', extensions: ['xml'] }
        ],
        properties: ['openFile']
    });

    let xml; // = fs.readFileSync(file.toString(), 'utf-8');

    fs.readFile(file.toString(), 'utf-8', (error, contents) => {
        xml = contents;

        parseXML(xml, (error, result) => {
            if (result.room.walls != undefined) {
                for (let i = 0; i < result.room.walls.length; i++) {
                    walls[i] = {};

                    for (let _param in result.room.walls[i]) {

                        let _value = parseInt(result.room.walls[i][_param][0]);

                        walls[i][_param] = _value;
                    }

                    wallsNumber++;
                }
            }

            wallsNumber += 1;

            if (result.room.exits != undefined) {
                for (let i = 0; i < result.room.exits.length; i++) {
                    exits[i] = {};

                    for (let _param in result.room.exits[i]) {
                        let _value = isNaN(parseInt(result.room.exits[i][_param][0])) ? result.room.exits[i][_param][0] : parseInt(result.room.exits[i][_param][0]);

                        exits[i][_param] = _value;
                    }

                    exitsNumber++;
                }
            }

            exitsNumber += 1;
        });

        Tools.update();

        openedFile = file.toString();

        $('info').innerText = openedFile;
    });
}