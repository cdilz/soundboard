// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {ipcRenderer, contextBridge} = require('electron')
let SVG = require('./main/svg.js')
let global_settings = require('./main/global_settings.js')
let Settings_Handler = require('./main/settings/settings_handler.js')

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
		addSong: async () => 
    {
      let files = sendSync('addSong')
      await Settings_Handler.add(files)
      return Settings_Handler.get_ids()
    }
  },
  global_settings,
  svg: SVG,
  audio:
  {
    //get: (id) => {return Settings_Handler.get(id)}
    save: (id) => {Settings_Handler.save(id)}

    ,get_ids: () => {return Settings_Handler.get_ids()}

    ,toggle_ctrl: (id) => {Settings_Handler.toggle_ctrl(id)}
    ,get_ctrl: (id) => {return Settings_Handler.get_ctrl(id)}
    ,set_ctrl: (id, value) => {Settings_Handler.get_ctrl(id, value)}

    ,toggle_hold: (id) => {Settings_Handler.toggle_hold(id)}
    ,get_hold: (id) => {return Settings_Handler.get_hold(id)}
    ,set_hold: (id, value) => {Settings_Handler.get_hold(id, value)}

    ,toggle_restart: (id) => {Settings_Handler.toggle_restart(id)}
    ,get_restart: (id) => {return Settings_Handler.get_restart(id)}
    ,set_restart: (id, value) => {Settings_Handler.get_restart(id, value)}

    ,toggle_loop: (id) => {Settings_Handler.toggle_loop(id)}
    ,get_loop: (id) => {return Settings_Handler.get_loop(id)}
    ,set_loop: (id, value) => {Settings_Handler.get_loop(id, value)}

    ,get_key: (id) => {return Settings_Handler.get_key(id)}
    ,set_key: (id, value) => {Settings_Handler.set_key(id, value)}

    ,get_grip_min: (id) => {return Settings_Handler.get_grip_min(id)}
    ,set_grip_min: (id, value) => {Settings_Handler.set_grip_min(id, value)}

    ,get_grip_max: (id) => {return Settings_Handler.get_grip_max(id)}
    ,set_grip_max: (id, value) => {Settings_Handler.set_grip_max(id, value)}

    ,get_volume: (id) => {return Settings_Handler.get_volume(id)}
    ,set_volume: (id, value) => {Settings_Handler.set_volume(id, value)}

    ,get_file_name: (id) => {return Settings_Handler.get_file_name(id)}

    ,delete: async (id) => {await Settings_Handler.delete(id)}
  }
	//Settings_Handler: Settings_Handler
  //_sortSettings: require()
})

window.addEventListener('DOMContentLoaded', () => 
{
  Settings_Handler.full_load()

  /*
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  */
})
