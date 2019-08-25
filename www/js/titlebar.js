const _remote = require('electron').remote

document.addEventListener('DOMContentLoaded', () =>
{
	let window = _remote.getCurrentWindow()
	let min    = document.querySelector('#titlebar_minimize')
	let max    = document.querySelector('#titlebar_maximize')
	let close  = document.querySelector('#titlebar_close')
	let add    = document.querySelector('#titlebar_add')

	min.addEventListener('click',() => {window.minimize()})
	close.addEventListener('click',() => {window.close()})

	max.addEventListener('click',e => 
	{
		let maximize = max.classList.contains('titlebar_maximize')
		if(maximize)
		{
			window.maximize()
		}
		else
		{
			window.unmaximize()
		}
	})

	window.on('maximize', e =>
	{
		max.innerHTML = _svg.titlebar.restore
		max.classList.replace('titlebar_maximize', 'titlebar_restore')
	})

	window.on('unmaximize', e =>
	{
		max.innerHTML = _svg.titlebar.maximize
		max.classList.replace('titlebar_restore', 'titlebar_maximize')
	})

	add.addEventListener('click', e =>
	{
		let files = _remote.dialog.showOpenDialog(window,
			{
				 title: 'Add Songs'
				,buttonLabel: 'Import'
				,filters:
				[
					 {name: 'Audio', extensions: ['mp3','wav','ogg','m4a','aac','webm','flac']}
					,{name: 'All Extensions', extensions: ['*']}
				]
				,properties: ['multiSelections']
			})
		
			if(files)
			{
				_addFilesToSettings(files)
			}
		
	})
})