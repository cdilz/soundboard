// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {ipcRenderer, contextBridge} = require('electron')
let global_settings = require('./main/global_settings.js')
//const Settings = require('./main/setting.js')

function send(channel, ...args)
{
  return ipcRenderer.send(channel, ...args)
}

function sendSync(channel, ...args)
{
  return ipcRenderer.sendSync(channel, ...args)
}

contextBridge.exposeInMainWorld('electron',
{
  window:
  {
    isMaximized: () => {return sendSync('isWindowMaximized')},
    close: () => {send('closeWindow')},
    minimize: () => {send('minimizeWindow')},
    maximize: () => {send('maximizeWindow')},
    unmaximize: () => {send('unmaximizeWindow')},
		addSong: () => {send('addSong')}
  },
  global_settings,
  audio:
  {
    
  }
	//Settings_Handler: Settings_Handler
  //_sortSettings: require()
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
