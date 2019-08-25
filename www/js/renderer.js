// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const _fs = require('fs')
const _path = require('path')
const _crypto = require('crypto')
const _directory = _path.dirname(process.execPath)
const _settingsDirectory = _path.join(_directory, 'settings')
const _audioSettingsDirectory = _path.join(_settingsDirectory, 'audio')
const _audioDirectory = _path.join(_directory, 'audio')
let _settings = []
let _waitingForInput = []
let _keySettings = {}
let _prevKeySettings = {}
_keyDefaults()

// Set up the settings and audio folders immediately
_fs.mkdir(_audioSettingsDirectory, {recursive: true}, (err)=>{if(err){alert(err)}})
_fs.mkdir(_audioDirectory, {recursive: true}, (err)=>{if(err){alert(err)}})

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
	for(let i = 0; i < _settings.length; i++)
	{
		let setting = _settings[i]
		setting.addEvents()
	}
}

function _keyDown(setting)
{
	setting.lightKeys(_keySettings)
}

function _keyUp(setting)
{	
	setting.lightKeys(_keySettings)
	if(_keySettings.key != '')
	{
		let parts = setting.parts
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

function _getWaiting()
{
	let output = []
	for(let i = 0; i < _settings.length; i++)
	{
		let setting = _settings[i]
		if(setting.waitingForInput)
		{
			output.push(setting)
		}
	}

	return output
}

document.addEventListener('DOMContentLoaded', () =>
{
	// Perform key entry
	document.addEventListener('keydown', (e) =>
	{
		_keySettings.ctrl = e.ctrlKey
		_keySettings.alt = e.altKey
		_keySettings.shift = e.shiftKey
		_keySettings.key = e.key

		if(!e.repeat)
		{
			let waitingForInput = _getWaiting()

			if(waitingForInput.length > 0)
			{
				for(let i = 0; i < waitingForInput.length; i++)
				{
					_keyDown(waitingForInput[i])
				}
			}
			else if(waitingForInput.length == 0)
			{
				for(let i = 0; i < _settings.length; i++)
				{
					let setting = _settings[i]
					let ctrlBool = setting.options.modifier.ctrl == _keySettings.ctrl
					let altBool = setting.options.modifier.alt == _keySettings.alt
					let shiftBool = setting.options.modifier.shift == _keySettings.shift
					let keyBool = setting.options.key == _keySettings.key
					if(ctrlBool && altBool && shiftBool && keyBool)
					{
						let parts = setting.parts
						parts.play.click()
					}
				}
			}
		}
	})
	
	document.addEventListener('keyup', (e) =>
	{
		if(!e.repeat)
		{
			let waitingForInput = _getWaiting()
			_prevKeySettings = JSON.parse(JSON.stringify(_keySettings))
			_keySettings.ctrl = e.ctrlKey
			_keySettings.alt = e.altKey
			_keySettings.shift = e.shiftKey

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

			if(waitingForInput.length > 0)
			{		
				let cancel = e.key == 'Backspace' || e.key == 'Delete' || e.key == 'Escape'
				let clear = e.key == 'Backspace' || e.key == 'Delete'

				if(cancel)
				{
					_keyDefaults()
				}

				if(clear)
				{
					waitingForInput.forEach((setting) =>
					{
						setting.options.modifier.ctrl = false
						setting.options.modifier.shift = false
						setting.options.modifier.alt = false
						setting.lightKeys()
						setting.options.key = null
						let parts = setting.parts
						parts.key.innerHTML = '?'
						parts.key.classList.remove('set')

						setting.save()
					})
				}

				if(cancel)
				{
					waitingForInput.forEach((setting) =>
					{
						let parts = setting.parts
						parts.key.click()
					})
				}
				else
				{
					waitingForInput.forEach((setting) =>{_keyUp(setting)})
				}
			}
			else if(waitingForInput.length == 0)
			{
				for(let i = 0; i < _settings.length; i++)
				{
					let setting = _settings[i]
					let ctrlBool = setting.options.modifier.ctrl == _prevKeySettings.ctrl
					let altBool = setting.options.modifier.alt == _prevKeySettings.alt
					let shiftBool = setting.options.modifier.shift == _prevKeySettings.shift
					let keyBool = setting.options.key == _prevKeySettings.key
					if(ctrlBool && altBool && shiftBool && keyBool && setting.options.hold)
					{
						setting.parts.player.querySelector('.playButton').click()
					}
				}
			}
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