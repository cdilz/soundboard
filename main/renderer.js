// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const _fs = require('fs')
const _path = require('path')
const _directory = _path.dirname(process.execPath)
const _settingsDirectory = _path.join(_directory, 'settings')
const _audioDirectory = _path.join(_directory, 'audio')
let _settings = []

// Set up the settings and audio folders immediately
_fs.mkdir(_audioDirectory, {recursive: true}, (err)=>{if(err){alert(err)}})



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
				let cancel = e.key == 'Backspace' || e.key == 'Delete' || e.key == 'Escape'
				let clear = e.key == 'Backspace' || e.key == 'Delete'

				// If we're clearing the key run the clear function
				if(clear)
				{
					waitingForInput.forEach((setting) =>
					{
						setting.clearKey()
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
							keypress.clear()
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