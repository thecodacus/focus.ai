import { app, BrowserWindow, globalShortcut, Tray, Menu } from "electron";
import { Core } from "./core";
import { Subject, Subscription, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { Result } from "./plugin";
const url = require("url");
const path = require("path");
const { ipcMain } = require("electron");

export default class Main {
	static mainWindow: Electron.BrowserWindow;
	static application: Electron.App;
	static BrowserWindow;
	static core: Core = new Core();
	static tray: Electron.Tray;
	static renderarPath = `${__dirname}/ui/`;
	static QuertResults: Subject<any> = new Subject();
	static onResponse: Observable<any> = Main.QuertResults.pipe(
		switchMap((arg) => {
			let ret: any = Main.core.GetResults(arg);
			//console.log("inside ResoOBS Switch Map",ret);
			return ret;
		})
	);
	static responseSubsription: Subscription;
	private static setuptray() {
		try {
			console.log("setting up tray");

			Main.tray = new Tray(
				path.join(Main.renderarPath, "/assets/codacus tray head.png")
			);
			const contextMenu = Menu.buildFromTemplate([
				{
					label: "Toggle Search bar",
					type: "normal",
					click: Main.toggleSearch,
				},
				{ type: "separator" },
				{ label: "Plugins", type: "normal", click: Main.showPlugins },
				{ label: "Settings", type: "normal", click: () => Main.showSettings },
				{ type: "separator" },
				{ type: "separator" },
				//{ label: 'reload', type: 'normal', click:reload},
				{ label: "Open Dev Tools", type: "normal", click: Main.openDevTool },
				{ type: "separator" },
				{ label: "Quit Codacus", type: "normal", click: () => app.quit() },
			]);
			Main.tray.setToolTip("Codacus Search Bar.");
			Main.tray.setContextMenu(contextMenu);
		} catch (error) {
			console.log(error);
		}
	}
	private static async createWindow() {
		// Create the browser window.

		try {
			Main.mainWindow = new BrowserWindow({
				height: 150,
				width: 820,
				frame: false,
				transparent: true,
				show: false,
				webPreferences: {
					nodeIntegration: true,
					contextIsolation: false,
				},
				resizable: false,
				alwaysOnTop: true,
				center: true,
				fullscreenable: false,
			});
			Main.mainWindow.setVisibleOnAllWorkspaces(true, {
				visibleOnFullScreen: true,
			});

			// and load the index.html of the app.
			Main.mainWindow.loadFile(path.join(Main.renderarPath, "index.html"));

			// Open the DevTools.
			//mainWindow.webContents.openDevTools();

			// Emitted when the window is closed.
			Main.mainWindow.on("closed", () => {
				// Dereference the window object, usually you would store windows
				// in an array if your app supports multi windows, this is the time
				// when you should delete the corresponding element.
				//mainWindow;
			});
			Main.mainWindow.once("ready-to-show", () => {
				Main.mainWindow.show();
			});
			Main.mainWindow.on("blur", () => {
				Main.mainWindow.hide();
			});
			Main.mainWindow.setAlwaysOnTop(true, "floating", 1);
			Main.mainWindow.setVisibleOnAllWorkspaces(true, {
				visibleOnFullScreen: true,
			});
		} catch (error) {
			console.log(error);
		}
		//mainWindow.setFullScreenable(false);
	}
	private static async toggleSearch() {
		if (!Main.mainWindow) await Main.createWindow();
		else if (Main.mainWindow.isVisible()) Main.mainWindow.hide();
		else {
			Main.mainWindow.show();
			Main.mainWindow.focus();
		}
	}
	private static showPlugins() {}
	private static showSettings() {}
	private static openDevTool() {
		Main.mainWindow.webContents.openDevTools();
	}

	private static reload() {
		Main.mainWindow.close();
		Main.mainWindow.destroy();
		Main.createWindow();
		Main.mainWindow.show();
		Main.mainWindow.focus();
		Main.initIPC();
	}

	private static onWindowAllClosed() {
		if (process.platform !== "darwin") {
			Main.application.quit();
		}
	}

	private static onClose() {
		// Dereference the window object.
		Main.mainWindow = null;
	}

	private static onReady() {
		// Register a 'CommandOrControl+X' shortcut listener.
		//app.dock.bounce()
		console.log("Setting up tray");
		Main.setuptray();
		Main.initIPC();
		console.log("registration hot key");
		const ret = globalShortcut.register(
			"CommandOrControl+B",
			Main.toggleSearch
		);

		if (!ret) {
			console.log("registration failed");
		}

		// Check whether a shortcut is registered.
		console.log(globalShortcut.isRegistered("CommandOrControl+B"));
	}
	private static initIPC() {
		ipcMain.removeAllListeners("resize-window");
		ipcMain.removeAllListeners("get-result");
		// In this file you can include the rest of your app's specific main process
		// code. You can also put them in separate files and import them here.
		ipcMain.on("resize-window", (event, arg) => {
			console.log(arg); // prints "ping"
			//event.reply('asynchronous-reply', 'pong')
			//let {x,y,width,height}=arg
			Main.mainWindow.setBounds(arg);
		});
		ipcMain.on("get-results", (event: Electron.IpcMainEvent, arg) => {
			console.log(arg); // prints "ping"
			if (!Main.responseSubsription)
				Main.responseSubsription = Main.onResponse.subscribe((results) => {
					console.log("replying to UI", results);

					event.sender.send("on-results", results);
				});
			Main.QuertResults.next(arg);
			//if(responseSubsription) responseSubsription.unsubscribe()
		});
		ipcMain.on("on-select", (event: Electron.IpcMainEvent, arg: Result) => {
			console.log(arg); // prints "ping"
			Main.core.OnSelect(arg);
			Main.mainWindow.hide();
		});
	}

	static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
		// we pass the Electron.App object and the
		// Electron.BrowserWindow into this function
		// so this class has no dependencies. This
		// makes the code easier to write tests for
		Main.BrowserWindow = browserWindow;
		Main.application = app;
		Main.application.on("window-all-closed", Main.onWindowAllClosed);
		Main.application.on("ready", Main.onReady);

		// hides the dock icon for our app which allows our windows to join other
		// apps' spaces. without this our windows open on the nearest "desktop" space
		if (Main.application.dock) Main.application.dock.hide();
		//
		// This method will be called when Electron has finished
		// initialization and is ready to create browser windows.
		// Some APIs can only be used after this event occurs.

		Main.application.on("activate", () => {
			// On OS X it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (Main.mainWindow === null) {
				Main.createWindow();
			}
		});
		Main.application.on("will-quit", () => {
			// Unregister a shortcut.
			globalShortcut.unregister("CommandOrControl+B");

			// Unregister all shortcuts.
			globalShortcut.unregisterAll();
		});
	}
}

Main.main(app, BrowserWindow);
