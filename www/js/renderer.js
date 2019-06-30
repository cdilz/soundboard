// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const _remote = require('electron').remote
const _fs = require('fs')
const _path = require('path')
const _directory = _path.dirname(process.execPath)
const _settingsDirectory = _path.join(_directory, 'settings')
const _audioSettingsDirectory = _path.join(_settingsDirectory, 'audio')
const _audioDirectory = _path.join(_directory, 'audio')

// Set up the settings and audio folders immediately
_fs.mkdir(_audioSettingsDirectory, {recursive: true}, (err)=>{if(err){alert(err)}})
_fs.mkdir(_audioDirectory, {recursive: true}, (err)=>{if(err){alert(err)}})

class Settings
{
	constructor(fileName, override = {})
	{
		this.fileName = fileName
		this.options = {}
		this.options.fileName = fileName
		this.options.filepath = _path.join(_audioDirectory, fileName)
		this.options.key = override.key || null
		this.options.hold = override.hold || false
		this.options.loop = override.loop || false
		this.options.volume = override.volume || 1
		
		// We force these to be objects so we don't have issues with setting them
		if(override.modifier == null) {override.modifier = {}}
		if(override.constrain == null) {override.constrain = {}}

		this.options.modifier = {}
		this.options.modifier.alt = override.modifier.alt || false
		this.options.modifier.ctrl = override.modifier.ctrl || false
		this.options.modifier.shift = override.modifier.shift || false
		//This is the menu key on windows, not sure on Mac
		this.options.modifier.meta = override.modifier.meta || false

		this.options.constrain = {}
		this.options.constrain.min = override.constrain.min || 0
		this.options.constrain.max = override.constrain.max || 1
	}

	static load(fileName)
	{
		try
		{
			let path = _path.join(_audioSettingsDirectory, fileName + '.json')
			if(_fs.existsSync(path))
			{
				let file = _fs.readFileSync(path, {encoding: 'utf8'})
				if(file)
				{
					let settings = JSON.parse(file) 
					return new Settings(fileName, settings)
				}
			}
			return new Settings(fileName)
		}
		catch(e)
		{
			throw e
		}
	}

	save()
	{
		try
		{
			let path = _path.join(_audioSettingsDirectory, this.fileName + '.json')
			let settings = JSON.stringify(this.options)
			_fs.writeFileSync(path, settings, {encoding: 'utf8'})
		}
		catch(e)
		{
			throw e
		}
	}
}

document.addEventListener('DOMContentLoaded', () =>
{
	let window = _remote.getCurrentWindow()
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
				for(let i = 0; i < files.length; i++)
				{
					let file = files[i]
					let fileName = _path.basename(file)
					try
					{
						a = _fs.copyFileSync(file, _path.join(_audioDirectory, fileName))
						// If file is copied then we should save it to the settings area and initialize it in the display
						Settings.load(fileName).save()
					}
					catch(e)
					{
						alert(e)
					}
				}
			}
		
	})
})