const _crypto = require('crypto')

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

	get parts()
	{
		let soundContainer = document.querySelector(`#${this.id}`)
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
			,title: soundContainer.querySelector('.soundTitle')
			,titleInner: soundContainer.querySelector('.soundTitleInner')
		}
	
		return output
	}

	get waitingForInput()
	{
		return this.parts.key.classList.contains('waitingForInput')
	}

	lightKeys(override = {})
	{
		let parts = this.parts
		let ctrl = this.options.modifier.ctrl || override.ctrl
		let shift = this.options.modifier.shift || override.shift
		let alt = this.options.modifier.alt || override.alt
	
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

	// Resets the key entry button and lights to a default state
	clear()
	{
		this.options.modifier.alt = false
		this.options.modifier.ctrl = false
		this.options.modifier.shift = false
		this.lightKeys()
		this.options.key = null
		let parts = this.parts
		parts.key.innerHTML = '?'
		parts.key.classList.remove('set')
		this.save()
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
						<p class = 'soundTitleInner'>
							${title}
						</p>
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

	playEvent(e)
	{
		let parts = this.parts
		if(parts.audio.paused)
		{
			parts.play.innerHTML = _svg.sound.pause
			parts.audio.play()
		}
		else
		{
			parts.play.innerHTML = _svg.sound.play
			parts.audio.pause()
		}
	}

	holdEvent(e)
	{
		let parts = this.parts
		this.options.hold = !this.options.hold
		parts.hold.classList.toggle('unlit')
		parts.hold.classList.toggle('lit')
		this.save()
	}

	loopEvent(e)
	{
		let parts = this.parts
		this.options.loop = !this.options.loop
		parts.loop.classList.toggle('unlit')
		parts.loop.classList.toggle('lit')
		parts.audio.loop = !parts.audio.loop
		this.save()
	}

	keyEvent(e)
	{
		let parts = this.parts
		parts.key.classList.toggle('waitingForInput')
	}

	addEvents()
	{
		this.parts.play.addEventListener('click', this.playEvent.bind(this), false)
		this.parts.hold.addEventListener('click', this.holdEvent.bind(this), false)
		this.parts.loop.addEventListener('click', this.loopEvent.bind(this), false)
		this.parts.key.addEventListener('click', this.keyEvent.bind(this), false)
	}
}