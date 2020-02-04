import  {app,BrowserWindow, globalShortcut, Tray, Menu} from 'electron'
import core from './electron/dist/core'
import { fromEvent, of, Subject, Subscription, Observable } from 'rxjs'
import { map, switchMap, tap } from 'rxjs/operators'
const url =require('url')
const path =require('path')
const { ipcMain } = require('electron')


let mainWindow:Electron.BrowserWindow;
let tray:Electron.Tray;

const setuptray=()=>{
	tray = new Tray(`${__dirname}/dist/electron-ng-app/assets/codacus tray head.png`)
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Toggle Search bar', type: 'normal', click:toggleSearch },
		{ type: 'separator'},
		{ label: 'Plugins', type: 'normal', click: showPlugins},
		{ label: 'Settings', type: 'normal', click: ()=>showSettings},
		{ type: 'separator'},
		{ type: 'separator'},
		//{ label: 'reload', type: 'normal', click:reload},
		{ label: 'Open Dev Tools', type: 'normal', click:openDevTool},
		{ type: 'separator'},
		{ label: 'Quit Codacus', type: 'normal', click: ()=>app.quit()},
	])
	tray.setToolTip('Codacus Search Bar.')
	tray.setContextMenu(contextMenu)
}
const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
	  height: 150,
	  width: 820,
	  frame: false,
	  transparent:true,
	  show:false,
	  webPreferences:{
		nodeIntegration:true
	  },
	  resizable:false,
	  alwaysOnTop:true,
	  center:true,
	  fullscreenable:true
	});
	mainWindow.setVisibleOnAllWorkspaces(true,{
		visibleOnFullScreen:true
	})
  
	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/dist/electron-ng-app/index.html`);

	// Open the DevTools.
	//mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})
	mainWindow.on('blur', () => {
		//mainWindow.hide()
	})
	mainWindow.setAlwaysOnTop(true, "floating", 1);
	mainWindow.setVisibleOnAllWorkspaces(true,{
		visibleOnFullScreen:true
	})
	//mainWindow.setFullScreenable(false);
};
const toggleSearch= ()=>{
	if(! mainWindow) createWindow()
	else if (mainWindow.isVisible())mainWindow.hide()
	else {
		mainWindow.show()
		mainWindow.focus()
	}
}
const showPlugins=()=>{
}
const showSettings=()=>{
}
const openDevTool=()=>{
	mainWindow.webContents.openDevTools()
}

const reload=()=>{
	mainWindow.close()
	mainWindow.destroy()
	createWindow()
	mainWindow.show()
	mainWindow.focus()
	InitIPC()
}


// hides the dock icon for our app which allows our windows to join other 
// apps' spaces. without this our windows open on the nearest "desktop" space
if (app.dock) app.dock.hide();
//
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
	// Register a 'CommandOrControl+X' shortcut listener.
	//app.dock.bounce()
	setuptray()
	const ret = globalShortcut.register('CommandOrControl+B', () => {
		console.log('CommandOrControl+Space is pressed')
		toggleSearch()
	  })
	
	  if (!ret) {
		console.log('registration failed')
	  }
	
	  // Check whether a shortcut is registered.
	  console.log(globalShortcut.isRegistered('CommandOrControl+B'))
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});
app.on('will-quit', () => {
	// Unregister a shortcut.
	globalShortcut.unregister('CommandOrControl+B')
  
	// Unregister all shortcuts.
	globalShortcut.unregisterAll()
})


//Send results to UI once we receive from core
let QuertResults:Subject<any>=new Subject()
let onResponse:Observable<any>=QuertResults.pipe(
	switchMap((arg)=>{
		let ret:any=core(arg)
		//console.log("inside ResoOBS Switch Map",ret);
		return ret
	})
)
let responseSubsription:Subscription;


function InitIPC(){
	ipcMain.removeAllListeners("resize-window")
	ipcMain.removeAllListeners("get-result")
	// In this file you can include the rest of your app's specific main process
	// code. You can also put them in separate files and import them here.
	ipcMain.on('resize-window', (event, arg) => {
		console.log(arg) // prints "ping"
		//event.reply('asynchronous-reply', 'pong')
		//let {x,y,width,height}=arg
		mainWindow.setBounds(arg)

	})
	ipcMain.on('get-results', (event:Electron.IpcMainEvent, arg) => {
		console.log(arg) // prints "ping"
		if(!responseSubsription)
		responseSubsription=onResponse.subscribe((results)=>{
			console.log("replying to UI",results);
			
			event.sender.send('on-results',results)
		})
		QuertResults.next(arg)
		//if(responseSubsription) responseSubsription.unsubscribe()
	})
}
InitIPC()




