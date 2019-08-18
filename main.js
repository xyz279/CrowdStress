const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');

var mainWindow;
var loaderWindow;
var mayBeClosed;

function createWindow() {
    loaderWindow = new BrowserWindow({
        frame: false,
        width: 544,
        height: 222,
        show: false,
        alwaysOnTop : true,
        icon : 'img/whiteboard.png',
    });

    mainWindow = new BrowserWindow({
    	width: 1846,
    	height: 1040,
        frame: false,
        backgroundColor: '#2e2c29',
        show: false,
        icon : 'img/whiteboard.png',
        resizable : false,
    });

    loaderWindow.loadFile('loader/loader.html');

    loaderWindow.once('ready-to-show', () => {
        loaderWindow.show();
    });

    mainWindow.maximize();
    mainWindow.hide();

    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools();
    
    setTimeout(() => {
        loaderWindow.close();
        loaderWindow = null;

        mainWindow.show();
    }, 5000);

    mainWindow.on('close', (e) => {});

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    Menu.setApplicationMenu(null);

    ipcMain.on('asynchronous-message', (event, arg) => {
        if (arg == 'true') {
            mayBeClosed = false;

            dialog.showMessageBox({
                type: 'warning',
                buttons: ['Сохранить', 'Не сохранять', 'Отмена'],
                title: 'Предупреждение',
                message: 'Сохранить изменения в файле?',
                cancelId: 2
            }, (response) => {
                if (response == 0) {
                    event.sender.send('asynchronous-reply', 'save');
                }

                if (response == 1) {
                    mainWindow.close();
                }

                if (response == 2) {
                    event.sender.send('asynchronous-reply', 'cancel');
                }
            });
        }

        if (arg == 'false') {
            mayBeClosed = true;
            mainWindow.close();
        }
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

global.MainWindow = mainWindow;