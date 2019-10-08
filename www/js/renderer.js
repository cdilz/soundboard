// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const _fs = require('fs')
const _path = require('path')
const _directory = _path.dirname(process.execPath)
const _settingsDirectory = _path.join(_directory, 'settings')
const _audioSettingsDirectory = _path.join(_settingsDirectory, 'audio')
const _audioDirectory = _path.join(_directory, 'audio')
let _settings = []

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

function _marquee()
{
	for(let i = 0; i < _settings.length; i++)
	{
		let parts = _settings[i].parts
		let title = parts.title
		let titleInner = parts.titleInner
		// Remove all previous dupes in case we don't need to scroll anymore
		let filler = parts.title.querySelectorAll('.soundTitleInnerDupe')
		// Remove the marquee to check if the width without margins fits
		title.classList.remove('soundTitleMarquee')
		filler.forEach((ele) => {ele.remove()})

		// If the title's content goes outside its bounding box
		if(title.clientWidth < title.scrollWidth)
		{
			title.classList.add('soundTitleMarquee')
			// Add a duplicate of the track title so we can marquee
			let dupe = document.createElement('p')
			dupe.classList.add('soundTitleInnerDupe')
			dupe.classList.add('soundTitleInner')
			dupe.innerHTML = titleInner.innerHTML

			title.append(dupe)
		}
	}
}

function _setAllClamps()
{
	_settings.forEach((setting) => {setting.setMinMaxClamp()}
	)
}

function _deleteEvent(e)
{
	this.delete()
	let spliced = false
	for(let i = 0; i < _settings.length; i++)
	{
		if(_settings[i] == this)
		{
			_settings.splice(i, 1)
			spliced = true
			break
		}
	}
}

document.addEventListener('DOMContentLoaded', () =>
{
	document.addEventListener('keydown', (e) =>
	{
		// Don't repeat if the key is being held
		if(!e.repeat)
		{
			let waitingForInput = _getWaiting()

			// If there is audio waiting for input we don't want to accidentally play anything
			if(waitingForInput.length > 0)
			{
				for(let i = 0; i < waitingForInput.length; i++)
				{
					// Light up the settings keys and overwrite the defaults with our new potentials
					waitingForInput[i].lightKeys(keypress.settings)
				}
			}
			else if(waitingForInput.length == 0)
			{
				for(let i = 0; i < _settings.length; i++)
				{
					let setting = _settings[i]
					let alt = setting.options.modifier.alt
					let ctrl = setting.options.modifier.ctrl
					let shift = setting.options.modifier.shift
					let key = setting.options.key

					// If the key is pressed then play the audio
					if(keypress.isPressed(alt, ctrl, shift, key))
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
		// Don't repeat if the key is being held
		if(!e.repeat)
		{
			let waitingForInput = _getWaiting()
	
			// If there is audio waiting for input we don't want to accidentally pause anything
			if(waitingForInput.length > 0)
			{
				// We have a few options to clear a key or cancel input
				let cancel = e.key == 'Backspace' || e.key == 'Delete' || e.key == 'Escape' || keypress.latest == ''
				let clear = e.key == 'Backspace' || e.key == 'Delete'

				// If we're clearing the key run the clear function
				if(clear)
				{
					waitingForInput.forEach((setting) =>
					{
						setting.clear()
					})
				}

				// If we're cancelling input just click the key entry button again
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
					waitingForInput.forEach((setting) =>
					{
						// Adjust keys for the ones that are lifted						
						setting.lightKeys(keypress.settings)
						// If lifting a non-modifier key then save it
						if(!keypress.isKeyPressed && keypress.latest != '')
						{
							let parts = setting.parts
							setting.options.modifier.ctrl = keypress.ctrl
							setting.options.modifier.shift = keypress.shift
							setting.options.modifier.alt = keypress.alt
							setting.options.key = keypress.latest
							setting.save()
							parts.key.innerHTML = setting.options.key
							parts.key.classList.add('set')
							parts.key.click()
						}
					})
				}
			}
			else if(waitingForInput.length == 0)
			{
				for(let i = 0; i < _settings.length; i++)
				{
					let setting = _settings[i]
					let alt = setting.options.modifier.alt
					let ctrl = setting.options.modifier.ctrl
					let shift = setting.options.modifier.shift
					let hold = setting.options.hold
					let key = setting.options.key

					// If the key is pressed not pressed then pause the audio if it's a hold
					if(!keypress.isPressed(alt, ctrl, shift, key) && hold)
					{
						if(!setting.parts.audio.paused)
						{
							setting.parts.player.querySelector('.playButton').click()
						}
					}
				}
			}
		}
	})

	window.addEventListener('resize', (e) =>
	{
		_marquee()
		_setAllClamps()
	})

	_fs.readdir(_audioDirectory, (err, files) =>
	{
		let audioFiles = []
		for(let i = 0; i < files.length; i++)
		{
			audioFiles.push(_path.join(_audioDirectory, files[i]))
		}

		_addFilesToSettings(audioFiles)
		_marquee()
		_setAllClamps()

		for(let i = 0; i < _settings.length; i++)
		{
			_settings[i].parts.delete.addEventListener('click', _deleteEvent.bind(_settings[i]), false)
		}
	})
})

function _marqueeScroll()
{
	let marquees = document.querySelectorAll('.soundTitleMarquee')
	for(let i = 0; i < marquees.length; i++)
	{
		let m = marquees[i]
		let child = m.children[0]
		let childStyle = getComputedStyle(child)
		m.scrollBy({left: 1, top: 0})

		// How far the element is scrolled
		let titleX = m.scrollLeft

		// The width of the child, plus margin
		let childX = child.offsetWidth + parseInt(childStyle.marginLeft) + parseInt(childStyle.marginRight)

		// If the child is scrolled past the edge of the parent
		if(childX < titleX)
		{
			m.append(child)
			m.scrollLeft = 0
		}
	}
}

setInterval(_marqueeScroll, 10)