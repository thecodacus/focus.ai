"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var core_1 = require("./electron/dist/core");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var url = require('url');
var path = require('path');
var ipcMain = require('electron').ipcMain;
var mainWindow;
var tray;
var setuptray = function () {
    tray = new electron_1.Tray(__dirname + "/dist/electron-ng-app/assets/codacus tray head.png");
    var contextMenu = electron_1.Menu.buildFromTemplate([
        { label: 'Toggle Search bar', type: 'normal', click: toggleSearch },
        { type: 'separator' },
        { label: 'Plugins', type: 'normal', click: showPlugins },
        { label: 'Settings', type: 'normal', click: function () { return showSettings; } },
        { type: 'separator' },
        { type: 'separator' },
        //{ label: 'reload', type: 'normal', click:reload},
        { label: 'Open Dev Tools', type: 'normal', click: openDevTool },
        { type: 'separator' },
        { label: 'Quit Codacus', type: 'normal', click: function () { return electron_1.app.quit(); } },
    ]);
    tray.setToolTip('Codacus Search Bar.');
    tray.setContextMenu(contextMenu);
};
var createWindow = function () {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        height: 150,
        width: 820,
        frame: false,
        transparent: true,
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
        alwaysOnTop: true,
        center: true,
        fullscreenable: true
    });
    mainWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true
    });
    // and load the index.html of the app.
    mainWindow.loadURL("file://" + __dirname + "/dist/electron-ng-app/index.html");
    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
    });
    mainWindow.on('blur', function () {
        //mainWindow.hide()
    });
    mainWindow.setAlwaysOnTop(true, "floating", 1);
    mainWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true
    });
    //mainWindow.setFullScreenable(false);
};
var toggleSearch = function () {
    if (!mainWindow)
        createWindow();
    else if (mainWindow.isVisible())
        mainWindow.hide();
    else {
        mainWindow.show();
        mainWindow.focus();
    }
};
var showPlugins = function () {
};
var showSettings = function () {
};
var openDevTool = function () {
    mainWindow.webContents.openDevTools();
};
var reload = function () {
    mainWindow.close();
    mainWindow.destroy();
    createWindow();
    mainWindow.show();
    mainWindow.focus();
    InitIPC();
};
// hides the dock icon for our app which allows our windows to join other 
// apps' spaces. without this our windows open on the nearest "desktop" space
electron_1.app.dock.hide();
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', function () {
    // Register a 'CommandOrControl+X' shortcut listener.
    //app.dock.bounce()
    setuptray();
    var ret = electron_1.globalShortcut.register('CommandOrControl+B', function () {
        console.log('CommandOrControl+Space is pressed');
        toggleSearch();
    });
    if (!ret) {
        console.log('registration failed');
    }
    // Check whether a shortcut is registered.
    console.log(electron_1.globalShortcut.isRegistered('CommandOrControl+B'));
});
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
electron_1.app.on('will-quit', function () {
    // Unregister a shortcut.
    electron_1.globalShortcut.unregister('CommandOrControl+B');
    // Unregister all shortcuts.
    electron_1.globalShortcut.unregisterAll();
});
//Send results to UI once we receive from core
var QuertResults = new rxjs_1.Subject();
var onResponse = QuertResults.pipe(operators_1.switchMap(function (arg) {
    var ret = core_1["default"](arg);
    //console.log("inside ResoOBS Switch Map",ret);
    return ret;
}));
var responseSubsription;
function InitIPC() {
    ipcMain.removeAllListeners("resize-window");
    ipcMain.removeAllListeners("get-result");
    // In this file you can include the rest of your app's specific main process
    // code. You can also put them in separate files and import them here.
    ipcMain.on('resize-window', function (event, arg) {
        console.log(arg); // prints "ping"
        //event.reply('asynchronous-reply', 'pong')
        //let {x,y,width,height}=arg
        mainWindow.setBounds(arg);
    });
    ipcMain.on('get-results', function (event, arg) {
        console.log(arg); // prints "ping"
        if (!responseSubsription)
            responseSubsription = onResponse.subscribe(function (results) {
                console.log("replying to UI", results);
                event.sender.send('on-results', results);
            });
        QuertResults.next(arg);
        //if(responseSubsription) responseSubsription.unsubscribe()
    });
}
InitIPC();
