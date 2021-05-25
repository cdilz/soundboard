// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {ipcRenderer, contextBridge} = require('electron')

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
	Settings: require('./main/setting.js')
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
