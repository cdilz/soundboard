'use strict'

function parseJSON(input)
{
	try
	{
		if(typeof input === 'string' || input instanceof String)
		{
			return JSON.parse(input)
		}

		return undefined
	}
	catch(e)
	{
		return undefined
	}
}


class Sound
{
	/*
		If input is a string then load the string as if it were the filepath
		If input is an object then load as the settings for this Sound
	*/
	constructor(input = {})
	{
		if(typeof input === 'string' || input instanceof String)
		{
			let loadValue = parseJSON(input) || {filepath: input}
			this.load(loadValue)
		}
		else if(input instanceof Object)
		{
			this.load(input)
		}
		else
		{
			throw new Error('Invalid Sound constructor input.')
		}
	}

	load(input = {})
	{
		this.settings = {}
		this.settings.filepath = input.filepath || input
		this.settings.key = input.key || null
		this.settings.hold = input.hold || false
		this.settings.loop = input.loop || false
		this.settings.volume = input.volume || 1

		if(input.modifier == null)
		{
			input.modifier = {}
		}

		if(input.constrain == null)
		{
			input.constrain = {}
		}

		this.settings.modifier = {}
		this.settings.modifier.alt = input.modifier.alt || false
		this.settings.modifier.ctrl = input.modifier.ctrl || false
		this.settings.modifier.shift = input.modifier.shift || false
		//This is the menu key on windows, not sure on Mac
		this.settings.modifier.meta = input.modifier.meta || false

		this.settings.constrain = {}
		this.settings.constrain.min = input.constrain.min || 0
		this.settings.constrain.max = input.constrain.max || 1
	}

	toString()
	{
		JSON.stringify(this.settings)
	}

	toHTML()
	{
		let domParser = new DOMParser()
		let title = document.createTextNode(this.title)
		let filepath = this.filepath

		let html =
		`
			<div class = 'soundContainer'>
				<audio src='${filepath}'>
				</audio>
				<div class = 'soundTop'>
					<button class = 'playButton'>
					</button>
					<div class = 'soundTitleContainer'>
						<p class = 'soundTitle'>
							${title}
						</p>
					</div>
				</div>
				<div class = 'soundBottom'>
				</div>
			</div>
		`
		return domParser.parseFromString(html, 'text/html')
	}
}

function marquee()
{
	let titles = document.querySelectorAll('.soundTitleContainer')
	
	/*
		We're making sure that if the title is too wide we can make it marquee
		If someone resizes the app this should add/remove marqueeing as necessary
	*/
	titles.forEach(title => 
	{
		if(title.offsetWidth < title.scrollWidth)
		{
			if(!title.classList.contains('marquee'))
			{
				title.classList.add('marquee')
				title.style.width = title.offsetWidth * 2
			}
		}
		else
		{
			if(title.classList.contains('marquee'))
			{
				title.classList.remove('marquee')
				title.style.width = null
			}
		}
	})
}

setInterval(marquee, 1000)