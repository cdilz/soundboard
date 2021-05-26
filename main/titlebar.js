const {ipcMain, dialog} = require('electron')
const Settings_Handler = require('./settings/settings_handler.js')

function on(channel, func)
{
	ipcMain.on(channel, func)
}

function init(mainWindow)
{
	on('closeWindow', () =>
	{
		mainWindow.close()
	})

	on('minimizeWindow', () =>
	{
		mainWindow.minimize()
	})

	on('maximizeWindow', () =>
	{
		mainWindow.maximize()
	})

	on('unmaximizeWindow', () =>
	{
		mainWindow.unmaximize()
	})

	on('isWindowMaximized', (event) =>
	{
		event.returnValue = mainWindow.isMaximized()
	})

	on('addSong', () =>
	{
		dialog.showOpenDialog(mainWindow,
			{
				 title: 'Add Songs'
				,buttonLabel: 'Import'
				,filters:
				[
					 {name: 'Audio', extensions: ['mp3','wav','ogg','m4a','aac','webm','flac']}
					,{name: 'All Extensions', extensions: ['*']}
				]
				,properties: ['multiSelections']
			}).
			then(
				(files) => 
				{
					if(!files.canceled)
					{
						Settings_Handler.add(files.filePaths)
					}
				})
	})
}

module.exports = init