// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote
const dialog = remote.dialog

document.addEventListener('DOMContentLoaded', () =>
{
	let window = remote.getCurrentWindow()
	let min    = document.querySelector('#titlebar_minimize')
	let max    = document.querySelector('#titlebar_maximize')
	let close  = document.querySelector('#titlebar_close')
	let add    = document.querySelector('#titlebar_add')
	
	// Maximize button SVG in text for insert into UI
	let maxsvg = `<svg width="1e3" height="1e3" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg">
	<g transform="translate(0 -32.417)">
		<path d="m19.844 52.26h224.9v224.9h-224.9z" fill="none" stroke="#000001" stroke-width="39.688" style="paint-order:normal"/>
	</g>
</svg>`

	// Restore button SVG in text for insert into the UI
	let ressvg = `<svg width="1e3" height="1e3" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg">
	<g transform="translate(0 -32.417)">
		<path transform="matrix(.26458 0 0 .26458 0 32.417)" d="m300 75v225h400v400h225v-625zm400 625v-400h-625v625h625z" fill="none" stroke="#000001" stroke-width="150" style="paint-order:normal"/>
	</g>
</svg>
`

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
		max.innerHTML = ressvg
		max.classList.replace('titlebar_maximize', 'titlebar_restore')
	})

	window.on('unmaximize', e =>
	{
		max.innerHTML = maxsvg
		max.classList.replace('titlebar_restore', 'titlebar_maximize')
	})

	add.addEventListener('click', e =>
	{
		let files = dialog.showOpenDialog(window,
			{
				 title: 'Add Songs'
				,buttonLabel: 'Add'
				,filters:
				[
					 {name: 'Audio', extensions: ['mp3','wav','ogg','m4a','aac','webm','flac']}
					,{name: 'All Extensions', extensions: ['*']}
				]
				,properties: ['multiSelections']
			})

		
	})
})