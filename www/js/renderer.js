// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const _remote = require('electron').remote
const _fs = require('fs')
const _path = require('path')
const _crypto = require('crypto')
const _directory = _path.dirname(process.execPath)
const _settingsDirectory = _path.join(_directory, 'settings')
const _audioSettingsDirectory = _path.join(_settingsDirectory, 'audio')
const _audioDirectory = _path.join(_directory, 'audio')
let _settings = []
let _waitingForInput = []
let _keyTimestamp = 0
let _keySettings = {}
_keyDefaults()

let _svg = {}
_svg.titlebar = {}
_svg.titlebar.maximize = `<svg width="100%" height="100%" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -32.417)"><path d="m19.844 52.26h224.9v224.9h-224.9z" fill="none" stroke="#000001" stroke-width="39.688" style="paint-order:normal"/></g></svg>`

_svg.titlebar.restore = `<svg width="100%" height="100%" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -32.417)"><path transform="matrix(.26458 0 0 .26458 0 32.417)" d="m300 75v225h400v400h225v-625zm400 625v-400h-625v625h625z" fill="none" stroke="#000001" stroke-width="150" style="paint-order:normal"/></g></svg>`

_svg.sound = {}
_svg.sound.play = `<svg width="100%" height="100%" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -32.417)" fill="none" stroke="#000" stroke-width="39.688"><path transform="matrix(.98893 .050347 -.053932 1.0593 11.192 -15.434)" d="m18.76 269.98-10.963-201.03 220.83 90.239z" fill="#000" stroke="#000001" stroke-width="30.659" style="paint-order:normal"/></g></svg>`

_svg.sound.pause = `<svg width="100%" height="100%" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -32.417)" fill="none" stroke="#000" stroke-width="79.374"><path d="m79.374 32.417v264.58"/><path d="m185.21 32.417v264.58"/></g></svg>`

_svg.sound.hold = `<svg width="100%" height="100%" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -32.417)" fill="none" stroke-linejoin="round" stroke-width="26.458"><path d="m13.229 283.77h238.25l-13.361-79.374c-49.578 24.321-162.81 18.147-211.66 0z" stroke="#000"/><path d="m211.66 138.25-79.374 55.562-79.374-55.562h52.916v-92.603h52.916v92.603z" stroke="#000001" style="paint-order:normal"/></g></svg>`

_svg.sound.loop = `<svg width="100%" height="100%"version="1.1" viewBox="0 0 264.58 110.07" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 -154.51)" preserveAspectRatio="none"><path d="m132.29 208.86s119.44 94.611 119.06 1.2152c-0.0799-93.908-119.06-1.2152-119.06-1.2152s-120.68 94.965-119.06 1.2152c0.28959-94.808 119.06 0 119.06 0" fill="none" stroke="#000" stroke-linejoin="round" stroke-width="26.458" style="paint-order:normal"/></g></svg>`

// Set up the settings and audio folders immediately
_fs.mkdir(_audioSettingsDirectory, {recursive: true}, (err)=>{if(err){alert(err)}})
_fs.mkdir(_audioDirectory, {recursive: true}, (err)=>{if(err){alert(err)}})

class Settings
{
	constructor(fileName, override = {})
	{
		this.fileName = fileName
		this.id = 'id_' + _crypto.createHash('md5').update(this.fileName).digest('hex') + '_' + Date.now().toString()
		this.options = {}
		this.options.fileName = fileName
		this.options.filePath = _path.join(_audioDirectory, fileName)
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

		this.options.constrain = {}
		this.options.constrain.min = override.constrain.min || 0
		this.options.constrain.max = override.constrain.max || 1
	}

	static load(fileName)
	{
		try
		{
			// Check if there's a settings file for it
			// 	If there is: create a Settings from that
			//  If there isn't: create a new Settings from the filename
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
			_fs.writeFile(path, settings, {encoding: 'utf8'}, ()=>{})
			return this
		}
		catch(e)
		{
			throw e
		}
	}

	toHTML()
	{
		let titleHolder = document.createElement('p')
		titleHolder.append(this.options.fileName)
		let title = titleHolder.innerHTML
		let filePath = this.options.filePath.replace("'", "&#39;").replace('"', '&#034;')

		let shiftLight = this.options.modifier.shift ? 'lit' : 'unlit'
		let ctrlLight = this.options.modifier.ctrl ? 'lit' : 'unlit'
		let altLight = this.options.modifier.alt ? 'lit' : 'unlit'
		let loopLight = this.options.loop ? 'lit' : 'unlit'
		let loopSetting = this.options.loop ? ' loop' : ''
		let holdLight = this.options.hold ? 'lit' : 'unlit'

		let key = this.options.key ? this.options.key : '?'
		let keyClass = this.options.key ? ' set' : ''

		let html =
		`
			<div class = 'soundContainer' id = '${this.id}'>
				<audio src = '${filePath}'${loopSetting}>
				</audio>
				<div class = 'soundTop'>
					<div class = 'soundButton playButton fill'>
						${_svg.sound.play}
					</div>
					<div class = 'soundTitle'>
						${title}
					</div>
				</div>
				<div class = 'soundBottom'>
					<div class = 'soundButton controlKey${keyClass}'>
						${key}
					</div>
					<div class = 'controlLights'>
						<div class = '${holdLight} controlLight hold soundButton'>${_svg.sound.hold}</div>
						<div class = 'controlLightsRight'>
							<div class = 'controlLightsTop'>
								<div class = '${shiftLight} controlLight shift'>S</div>
								<div class = '${ctrlLight} controlLight ctrl'>C</div>
								<div class = '${altLight} controlLight alt'>A</div>
							</div>
							<div class = '${loopLight} controlLight loop soundButton'>${_svg.sound.loop}</div>
						</div>
					</div>
					<div class = 'seekHolder'>
					</div>
				</div>
			</div>
		`
		return html
	}
}

// Sort the _settings array alphabetically by filename
function _sortSettings()
{
	return _settings.sort((setA, setB) =>
	{
		const setAFN = setA.fileName.toLowerCase()
		const setBFN = setB.fileName.toLowerCase()
		if(setAFN < setBFN)
		{
			return -1
		}
		else if(setAFN > setBFN)
		{
			return 1
		}
		return 0
	})
}

function _getSetting(event)
{
	let path = event.path
	let soundContainer = null
	for(let i = 0; i < path.length; i++)
	{
		let element = path[i]
		if(element.classList.contains('soundContainer'))
		{
			soundContainer = element
			break
		}
	}

	if(soundContainer == null)
	{
		throw 'Sound Container Does Not Exist'
	}

	let id = soundContainer.id
	for(let i = 0; i < _settings.length; i++)
	{
		let setting = _settings[i]
		if(setting.id == id)
		{
			return setting
		}
	}
}

function _getParts(setting)
{
	let soundContainer = document.querySelector(`#${setting.id}`)
	let output =
	{
		 player: soundContainer
		,audio: soundContainer.querySelector('audio')
		,play: soundContainer.querySelector('.playButton')
		,hold: soundContainer.querySelector('.hold')
		,loop: soundContainer.querySelector('.loop')
		,key: soundContainer.querySelector('.controlKey')
		,alt: soundContainer.querySelector('.alt')
		,shift: soundContainer.querySelector('.shift')
		,ctrl: soundContainer.querySelector('.ctrl')
	}

	return output
}

function _keyDefaults()
{	
	_keySettings =
	{
		 ctrl: false
		,alt: false
		,shift: false
		,key: ''
	}
}

function _writeToDisplay()
{
	// Sort display here before writing
	_sortSettings()

	let display = document.querySelector('#display')
	display.innerHTML = ''
	for(let i = 0; i < _settings.length; i++)
	{
		let setting = _settings[i]
		display.innerHTML += setting.toHTML()
	}

	let players = document.querySelectorAll('.soundContainer')
	for(let i = 0; i < players.length; i++)
	{
		let player = players[i]
		let audio = player.querySelector('audio')
		let play = player.querySelector('.playButton')
		let hold = player.querySelector('.hold')
		let loop = player.querySelector('.loop')
		let key = player.querySelector('.controlKey')
	
		// Toggle if the particular track is playing/paused
		play.addEventListener('click', (e) =>
		{
			let setting = _getSetting(e)
			let parts = _getParts(setting)
			if(audio.paused)
			{
				parts.play.innerHTML = _svg.sound.pause
				parts.audio.play()
			}
			else
			{
				parts.play.innerHTML = _svg.sound.play
				parts.audio.pause()
			}
		})
	
		// Toggle whether you must hold the key to play
		hold.addEventListener('click', (e) =>
		{
			let setting = _getSetting(e)
			let parts = _getParts(setting)
			setting.options.hold = !setting.options.hold
			parts.hold.classList.toggle('unlit')
			parts.hold.classList.toggle('lit')
			setting.save()
		})
	
		// Toggle whether the track loops at the end
		loop.addEventListener('click', (e) =>
		{
			let setting = _getSetting(e)
			let parts = _getParts(setting)
			setting.options.loop = !setting.options.loop
			parts.loop.classList.toggle('unlit')
			parts.loop.classList.toggle('lit')
			parts.audio.loop = !parts.audio.loop
			setting.save()
		})

		// Enable the kotkey entry system to start or stop listening for keypresses
		key.addEventListener('click', (e) =>
		{
			let setting = _getSetting(e)
			let parts = _getParts(setting)
			parts.key.classList.toggle('waitingForInput')
			if(parts.key.classList.contains('waitingForInput'))
			{
				_waitingForInput.push(setting)
			}
			else
			{
				let newArray = []
				for(let i = 0; i < _waitingForInput.length; i++)
				{
					if(_waitingForInput[i] != setting)
					{
						newArray.push(_waitingForInput[i])
					}
					else
					{
						// This should allow people to stop waiting for input while holding a key combination
						_lightKeys(_waitingForInput[i])
					}
				}

				_waitingForInput = newArray
			}
		})
	}
}

function _lightKeys(setting, override)
{
	let parts = _getParts(setting)
	let ctrl = setting.options.modifier.ctrl
	let shift = setting.options.modifier.shift
	let alt = setting.options.modifier.alt

	if(override)
	{
		ctrl = override.ctrl
		shift = override.shift
		alt = override.alt
	}

	// If the ctrl key is pressed light it up, otherwise unlight it
	parts.ctrl.classList.add(ctrl?'lit':'unlit')
	parts.ctrl.classList.remove(ctrl?'unlit':'lit')

	// If the shift key is pressed light it up, otherwise unlight it
	parts.shift.classList.add(shift?'lit':'unlit')
	parts.shift.classList.remove(shift?'unlit':'lit')

	// If the alt key is pressed light it up, otherwise unlight it
	parts.alt.classList.add(alt?'lit':'unlit')
	parts.alt.classList.remove(alt?'unlit':'lit')
}

function _keyDown(setting)
{
	_lightKeys(setting, _keySettings)
}

function _keyUp(setting)
{	
	_lightKeys(setting, _keySettings)
	if(_keySettings.key != '')
	{
		let parts = _getParts(setting)
		setting.options.modifier.ctrl = _keySettings.ctrl
		setting.options.modifier.shift = _keySettings.shift
		setting.options.modifier.alt = _keySettings.alt
		setting.options.key = _keySettings.key
		setting.save()
		parts.key.innerHTML = setting.options.key
		parts.key.classList.add('set')
		parts.key.click()
	}
}

function _addFilesToSettings(files)
{
	for(let i = 0; i < files.length; i++)
	{
		let file = files[i]
		let fileName = _path.basename(file)
		try
		{
			let audioDirectory = _path.join(_audioDirectory, fileName)
			// If the file doesn't already exist in _audioDirectory, copy file
			if(file != audioDirectory)
			{
				_fs.copyFileSync(file, audioDirectory)
			}
			// If file is copied or already exists then we should load the settings and then save it to initialize it if it's new
			let setting = Settings.load(fileName).save()
			_settings.push(setting)
		}
		catch(e)
		{
			alert(e)
		}
	}
	// Write the newly added settings to the display
	_writeToDisplay()
}

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

	// Perform key entry
	document.addEventListener('keydown', (e) =>
	{
		ctrl = e.ctrlKey
		alt = e.altKey
		shift = e.shiftKey
		key = e.key

		if(_waitingForInput.length > 0)
		{
			_keySettings.ctrl = ctrl
			_keySettings.alt = alt
			_keySettings.shift = shift
			_keySettings.key = key

			if(e.timeStamp != _keyTimestamp && !e.repeat)
			{
				for(let i = 0; i < _waitingForInput.length; i++)
				{
					_keyDown(_waitingForInput[i])
				}
			}
		}
		else if(_waitingForInput.length == 0)
		{
			if(e.timeStamp != _keyTimestamp && !e.repeat)
			{
				for(let i = 0; i < _settings.length; i++)
				{
					let setting = _settings[i]
					let ctrlBool = setting.options.modifier.ctrl == ctrl
					let altBool = setting.options.modifier.alt == alt
					let shiftBool = setting.options.modifier.shift == shift
					let keyBool = setting.options.key == key
					if(ctrlBool && altBool && shiftBool && keyBool)
					{
						let player = document.querySelector(`#${setting.id}`)
						player.querySelector('.playButton').click()
					}
				}
			}
		}
		_keyTimestamp = e.timeStamp		
	})
	
	document.addEventListener('keyup', (e) =>
	{
		if(_waitingForInput.length > 0)
		{
			_keySettings.ctrl = e.ctrlKey
			_keySettings.alt = e.altKey
			_keySettings.shift = e.shiftKey
	
			let cancel = e.key == 'Backspace' || e.key == 'Delete' || e.key == 'Escape'
			let clear = e.key == 'Backspace' || e.key == 'Delete'

			if(cancel)
			{
				_keyDefaults()
			}

			// Don't register a key if it's longer than 1 character.
			// This prevents the modifier keys from showing up, but also preserves the space in the UI
			if(e.key.length == 1)
			{
				_keySettings.key = e.key
			}
			else
			{
				_keySettings.key = ''
			}

			if(e.timeStamp != _keyTimestamp && !e.repeat)
			{
				if(clear)
				{
					_waitingForInput.forEach((setting) =>
					{
						setting.options.modifier.ctrl = false
						setting.options.modifier.shift = false
						setting.options.modifier.alt = false
						_lightKeys(setting)
						setting.options.key = null
						let parts = _getParts(setting)
						parts.key.innerHTML = '?'
						parts.key.classList.remove('set')

						setting.save()
					})
				}

				if(cancel)
				{
					_waitingForInput.forEach((setting) =>
					{
						let parts = _getParts(setting)
						parts.key.click()
					})
				}
				else
				{
					_waitingForInput.forEach((setting) =>{_keyUp(setting)})
				}
			}
			
			_keyTimestamp = e.timeStamp
		}
	})

	_fs.readdir(_audioDirectory, (err, files) =>
	{
		let audioFiles = []
		for(let i = 0; i < files.length; i++)
		{
			audioFiles.push(_path.join(_audioDirectory, files[i]))
		}

		_addFilesToSettings(audioFiles)
	})
})