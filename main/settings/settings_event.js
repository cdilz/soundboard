let Settings_Handler = require('./settings_handler.js')
const SVG = require('../svg.js')

class Settings_Event
{
	static set_all(settings)
	{
		let sound_container = document.querySelector(`#${this.id}`)
		let parts =
		{
			settings
			,player: sound_container
			,audio: sound_container.querySelector('audio')
			,delete: sound_container.querySelector('.delete')
			,play: sound_container.querySelector('.playButton')
			,hold: sound_container.querySelector('.hold')
			,loop: sound_container.querySelector('.loop')
			,key: sound_container.querySelector('.controlKey')
			,alt: sound_container.querySelector('.alt')
			,shift: sound_container.querySelector('.shift')
			,ctrl: sound_container.querySelector('.ctrl')
			,title: sound_container.querySelector('.soundTitle')
			,titleInner: sound_container.querySelector('.soundTitleInner')
			,restart: sound_container.querySelector('.restart')
			,seekBar: sound_container.querySelector('.seekBar')
			,seekMinBox: sound_container.querySelector('.seekMinBox')
			,seekMaxBox: sound_container.querySelector('.seekMaxBox')
			,seekMinGrip: sound_container.querySelector('.seekMinGrip')
			,seekMaxGrip: sound_container.querySelector('.seekMaxGrip')
			,seekMinCover: sound_container.querySelector('.seekMinCover')
			,seekMaxCover: sound_container.querySelector('.seekMaxCover')
			,volumeButton: sound_container.querySelector('.volumeButton')
			,volumeBar: sound_container.querySelector('.volumeBar')
		}

		this.play_button(parts)
		this.hold_button(parts)
		this.restart_button(parts)
		this.loop_button(parts)
		this.key_button(parts)
		this.grips(parts)
		this.audio(parts)
		this.seek_bar(parts)
	}

	static is_waiting_for_input(parts)
	{
		return parts.key.classList.contains('waitingForInput')
	}

	static min_time(parts)
	{
		return parts.settings.constrain.min * parts.audio.duration
	}

	static max_time(parts)
	{
		return parts.settings.constrain.max * parts.audio.duration
	}

	static current_time(parts)
	{
		return parts.audio.currentTime / parts.audio.duration
	}

	static play_button(parts)
	{
		let click_event = (e) =>
		{
			let parts = this
			parts.audio.paused ? parts.audio.play() : parts.audio.pause()
		}


		parts.play.addEventListener('click', click_event.bind(parts), false)
	}

	static hold_button(parts)
	{
		let click_event = (e) =>
		{
			let parts = this
			parts.settings.hold = !parts.settings.hold
			parts.hold.classList.toggle('unlit')
			parts.hold.classList.toggle('lit')
			parts.settings.save()
		}

		parts.hold.addEventListener('click', click_event.bind(parts), false)
	}

	static restart_button(parts)
	{
		let click_event = (e) =>
		{
			let parts = this
			parts.settings.restart = !parts.settings.restart
			parts.restart.classList.toggle('unlit')
			parts.restart.classList.toggle('lit')
			parts.settings.save()
		}

		parts.restart.addEventListener('click', click_event.bind(parts), false)
	}

	static loop_button(parts)
	{
		
		let click_event = (e) =>
		{
			let parts = this
			parts.settings.loop = !parts.settings.loop
			parts.loop.classList.toggle('unlit')
			parts.loop.classList.toggle('lit')
			parts.settings.save()
		}

		parts.loop.addEventListener('click', click_event.bind(parts), false)
	}

	static light_keys(parts)
	{
		let ctrl = parts.settings.modifier.ctrl 
		let shift = parts.settings.modifier.shift
		let alt = parts.settings.modifier.alt


		parts.ctrl.classList.remove('unlit', 'lit')
		parts.shift.classList.remove('unlit', 'lit')
		parts.alt.classList.remove('unlit', 'lit')
	
		// If the ctrl key is pressed light it up, otherwise unlight it
		parts.ctrl.classList.add(ctrl ? 'lit' : 'unlit')
	
		// If the shift key is pressed light it up, otherwise unlight it
		parts.shift.classList.add(shift ? 'lit' : 'unlit')
	
		// If the alt key is pressed light it up, otherwise unlight it
		parts.alt.classList.add(alt ? 'lit' : 'unlit')
	}

	static clear_key(parts)
	{		
		parts.settings.modifier.alt = false
		parts.settings.modifier.ctrl = false
		parts.settings.modifier.shift = false
		Settings_Event.light_keys(parts)
		parts.settings.key = null
		parts.key.innerHTML = '?'
		parts.key.classList.remove('set')
		parts.settings.save()
	}

	static key_button(parts)
	{
		let click_event = (e) =>
		{
			let parts = this
			parts.key.classList.toggle('waitingForInput')
		}

		parts.key.addEventListener('click', click_event.bind(parts), false)
	}

	static grip_set_position(e, grip, parts)
	{
		let settings = parts.settings
		let currentX = e.pageX

		let seekBar = parts.seekBar

		let boundLeft = seekBar.getClientRects()[0].left
		let boundRight = seekBar.getClientRects()[0].right

		let setValue = (currentX - boundLeft) / (boundRight - boundLeft)
		let isMin = grip == parts.seekMinGrip
		let isMax = grip == parts.seekMaxGrip

		if(isMin)
		{
			settings.constrain.min = setValue
		}
		else if(isMax)
		{
			settings.constrain.max = setValue
		}

		if(seekBar.value < settings.constrain.min)
		{
			seekBar.value = settings.constrain.min
		}
		else if(seekBar.value > settings.constrain.max)
		{
			seekBar.value = settings.constrain.max
		}

		if(settings.constrain.min >= settings.constrain.max)
		{
			if(isMin)
			{
				settings.constrain.min = 0
			}
			else if(isMax)
			{
				settings.constrain.max = 1
			}
		}		

		if(settings.constrain.min < 0)
		{
			settings.constrain.min = 0
		}
		else if(settings.constrain.max > 1)
		{
			settings.constrain.max = 1
		}

		let seekBarWidth = parts.seekBar.offsetWidth

		let minWidth = (settings.constrain.min * seekBarWidth)
		let maxMargin = (settings.constrain.max * seekBarWidth)
		let maxWidth = (seekBarWidth - maxMargin)

		parts.seekMinBox.style.width = `${minWidth}px`
		parts.seekMaxBox.style.marginLeft = maxMargin + 'px'
		parts.seekMaxBox.style.width = `${maxWidth}px`
	}

	static grips(parts)
	{
		let min_sliding_event = (e) => {Settings_Event.gripSetPosition(e, this.seekMinGrip, this)}
		let max_sliding_event = (e) => {Settings_Event.gripSetPosition(e, this.seekMaxGrip, this)}

		let min_begin_slide_event = (e) =>
		{
			let parts = this
			parts.seekMinGrip.onpointermove = min_sliding_event.bind(this)
			parts.seekMinGrip.setPointerCapture(e.pointerId)
			gripSetPosition(e, parts.seekMinGrip)
	
			parts.seekMinGrip.style.cursor = 'ew-resize'
			document.querySelector('html').style.cursor = 'ew-resize'
		}

		let max_begin_slide_event = (e) =>
		{
			let parts = this
			parts.seekMaxGrip.onpointermove = max_sliding_event.bind(this)
			parts.seekMaxGrip.setPointerCapture(e.pointerId)
			gripSetPosition(e, parts.seekMaxGrip)
	
			parts.seekMaxGrip.style.cursor = 'ew-resize'
			document.querySelector('html').style.cursor = 'ew-resize'
		}

		let min_end_slide_event = (e) =>
		{
			let parts = this
			parts.seekMinGrip.onpointermove = null
			parts.seekMinGrip.releasePointerCapture(e.pointerId)

			parts.seekMinGrip.style.cursor = ''
			document.querySelector('html').style.cursor = ''
			
			Settings_Event.grip_set_position(e, parts.seekMinGrip)
			parts.settings.save()
		}

		let max_end_slide_event = (e) =>
		{
			let parts = this
			parts.seekMaxGrip.onpointermove = null
			parts.seekMaxGrip.releasePointerCapture(e.pointerId)

			parts.seekMaxGrip.style.cursor = ''
			document.querySelector('html').style.cursor = ''
			
			Settings_Event.grip_set_position(e, parts.seekMaxGrip)
			parts.settings.save()
		}

		parts.seekMinGrip.addEventListener('dragstart', (e) => {e.preventDefault()}, false)
		parts.seekMinGrip.addEventListener('pointerdown', min_begin_slide_event.bind(parts), false)
		parts.seekMinGrip.addEventListener('pointerup', min_end_slide_event.bind(parts), false)

		parts.seekMaxGrip.addEventListener('dragstart', (e) => {e.preventDefault()}, false)
		parts.seekMaxGrip.addEventListener('pointerdown', max_begin_slide_event.bind(parts), false)
		parts.seekMaxGrip.addEventListener('pointerup', max_end_slide_event.bind(parts), false)
	}

	static audio(parts)
	{
		let play_event = (e) =>
		{
			this.play.innerHTML = SVG.sound.pause
		}

		let pause_event = (e) =>
		{
			let parts = this
			parts.play.innerHTML = SVG.sound.play

			if(parts.settings.restart)
			{
				parts.audio.currentTime = Settings_Event.minTime(parts)
			}
		}

		let time_update_event = (e) =>
		{
			let parts = this
			let audio = parts.audio
			let min_time = Settings_Event.min_time(parts)
			let max_time = Settings_Event.max_time(parts)
			let current_time = audio.currentTime

			if(current_time < min_time)
			{
				audio.currentTime = min_time
			}
			else if(current_time >= max_time)
			{
				if(this.settings.loop)
				{
					audio.currentTime = min_time
				}
				else
				{
					audio.currentTime = max_time
					audio.pause()
				}
			}

		}

		let ended_event = (e) =>
		{
			let parts = this
			parts.audio.currentTime = min_time
			if(parts.settings.loop)
			{
				parts.audio.play()
			}
		}
		parts.audio.addEventListener('play', play_event.bind(parts), false)
		parts.audio.addEventListener('pause', pause_event.bind(parts), false)
		parts.audio.addEventListener('timeupdate', time_update_event.bind(parts), false)
		parts.audio.addEventListener('ended', ended_event.bind(parts), false)
	}

	static seek_bar_set_position(e, parts)
	{
		let settings = parts.settings
		let currentX = e.pageX

		let seekBar = parts.seekBar
		let audio = parts.audio

		let boundLeft = seekBar.getClientRects()[0].left
		let boundRight = seekBar.getClientRects()[0].right

		seekBar.value = (currentX - boundLeft) / (boundRight - boundLeft)

		if(seekBar.value < settings.constrain.min)
		{
			seekBar.value = settings.constrain.min
		}

		else if(seekBar.value > settings.constrain.max)
		{
			seekBar.value = settings.constrain.max
		}

		audio.currentTime = seekBar.value * audio.duration
	}

	static seek_bar(parts)
	{
		let click_event = (e) =>{Settings_Event.seek_bar_set_position(e, this)}
		let sliding_event = (e) =>{Settings_Event.seek_bar_set_position(e, this)}

		let begin_slide_event = (e) =>
		{
			let parts = this
			parts.seekBar.onpointermove = sliding_event.bind(this)
			parts.seekBar.setPointerCapture(e.pointerId)
			Settings_Event.seekBarSetPosition(e)
	
			parts.seekBar.style.cursor = 'ew-resize'
			document.querySelector('html').style.cursor = 'ew-resize'
		}

		let end_slide_event = (e) =>
		{
			let parts = this
			parts.seekBar.onpointermove = null
			parts.seekBar.releasePointerCapture(e.pointerId)
	
			parts.seekBar.style.cursor = ''
			document.querySelector('html').style.cursor = ''
			
			Settings_Event.seek_bar_set_position(e, parts)
		}

		parts.seekBar.addEventListener('dragstart', (e) => {e.preventDefault()}, false)
		parts.seekBar.addEventListener('pointerdown', begin_slide_event.bind(this), false)
		parts.seekBar.addEventListener('pointerup', end_slide_event.bind(this), false)
		parts.seekBar.addEventListener('click', click_event.bind(this), false)
	}

	static volume_bar_set_position(e, parts)
	{
		let currentX = e.pageX
		let volumeBar = parts.volumeBar
		let audio = parts.audio
		
		if(audio.muted)
		{
			parts.volumeButton.click()
		}

		let boundLeft = volumeBar.getClientRects()[0].left
		let boundRight = volumeBar.getClientRects()[0].right

		volumeBar.value = (currentX - boundLeft) / (boundRight - boundLeft)

		audio.volume = volumeBar.value
		parts.settings.volume = audio.Volume
		parts.settings.save()
	}

	static volume(parts)
	{	
		let volume_click_event = (e) => {Settings_Event.volumeBarSetPosition(e, this)}
		let slide_event = (e) => {Settings_Event.volumeBarSetPosition(e, this)}
	
		let begin_slide_event = (e) =>
		{
			let parts = this
			parts.volumeBar.onpointermove = slide_event.bind(this)
			parts.volumeBar.setPointerCapture(e.pointerId)
			Settings_Event.volumeBarSetPosition(e)
	
			this.parts.volumeBar.style.cursor = 'ew-resize'
			document.querySelector('html').style.cursor = 'ew-resize'
		}	
	
		let end_slide_event = (e) =>
		{
			let parts = this
			parts.volumeBar.onpointermove = null
			parts.volumeBar.releasePointerCapture(e.pointerId)
	
			parts.volumeBar.style.cursor = ''
			document.querySelector('html').style.cursor = ''
			
			Settings_Event.volumeBarSetPosition(e)
		}

		let mute_click_event = (e) =>
		{
			let parts = this
			let volumeButton = parts.volumeButton
			let audio = parts.audio
	
			volumeButton.classList.toggle('muted')
			audio.muted = volumeButton.classList.contains('muted')
	
			if(audio.muted)
			{
				volumeButton.innerHTML = SVG.sound.mute
			}
			else
			{
				volumeButton.innerHTML = SVG.sound.volume
			}
		}

		parts.volumeBar.addEventListener('click', volume_click_event.bind(parts), false)
		parts.volumeBar.addEventListener('dragstart', (e) => {e.preventDefault()}, false)
		parts.volumeBar.addEventListener('pointerdown', begin_slide_event.bind(parts), false)
		parts.volumeBar.addEventListener('pointerup', end_slide_event.bind(parts), false)

		parts.volumeButton.addEventListener('click', mute_click_event.bind(parts), false)
	}
}

module.exports = Settings_Event