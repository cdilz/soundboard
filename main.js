// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () 
{
  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      width: 800,
      minWidth: 800,
      height: 600,
      minHeight: 600,
      frame: false,
      webPreferences: 
      {
        preload: path.join(__dirname, 'preload.js')
      }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('www/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () 
  {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  
  let titlebar = require('./main/titlebar.js')
  titlebar(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(()=>
{
  createWindow()
  
  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  app.on('activate', function () 
  {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () 
{
  if (process.platform !== 'darwin') app.quit()
})

// After we've created the web contents, when we get an input
// then, before doing anything else, check if it's F5 or F12
// and instead refresh or open dev tools, respectively
app.on('web-contents-created', function (e, wc) 
{
  wc.on('before-input-event', function (e, input) 
  {
    //wc.setIgnoreMenuShortcuts(true)
    if(input.key == 'F5')
    {
      mainWindow.reload()
    }
    else if(input.key == 'F12')
    {
      wc.openDevTools()
    }
  })
})