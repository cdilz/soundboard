//let Settings_Handler = require('./settings_handler.js')
const SVG = electron.svg
const global_settings = electron.global_settings
const marquee_settings = global_settings.marquee

class Settings_Event
{
	static key_dictionary = {}

	static get_parts(id)
	{
		let sound_container = document.querySelector(`#${id}`)
		let parts =
		{
			id
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

		return parts
	}

	static set_all(id)
	{
		let parts = Settings_Event.get_parts(id)

		Settings_Event.play_button(parts)
		Settings_Event.hold_button(parts)
		Settings_Event.restart_button(parts)
		Settings_Event.loop_button(parts)
		Settings_Event.key_button(parts)
		Settings_Event.grips(parts)
		Settings_Event.audio(parts)
		Settings_Event.seek_bar(parts)
		Settings_Event.volume(parts)
		Settings_Event.title(parts)
		Settings_Event.delete(parts)
	}

	static light_keys(parts, overwrite = {})
	{

		let ctrl = overwrite.ctrl ?? electron.audio.get_ctrl(parts.id)
		let alt = overwrite.alt ?? electron.audio.get_alt(parts.id)
		let shift = overwrite.shift ?? electron.audio.get_shift(parts.id)

		parts.ctrl.classList.remove('unlit', 'lit')
		parts.alt.classList.remove('unlit', 'lit')
		parts.shift.classList.remove('unlit', 'lit')
	
		// If the ctrl key is pressed light it up, otherwise unlight it
		parts.ctrl.classList.add(ctrl ? 'lit' : 'unlit')
	
		// If the alt key is pressed light it up, otherwise unlight it
		parts.alt.classList.add(alt ? 'lit' : 'unlit')
	
		// If the shift key is pressed light it up, otherwise unlight it
		parts.shift.classList.add(shift ? 'lit' : 'unlit')
	}

	static clear_key(parts)
	{
		electron.audio.set_ctrl(parts.id, false)
		electron.audio.set_shift(parts.id, false)
		electron.audio.set_alt(parts.id, false)
		Settings_Event.light_keys(parts)
		electron.audio.set_key(parts.id, null)
		parts.key.innerHTML = '?'
		parts.key.classList.remove('set')
		electron.audio.save(parts.id)
	}

	static is_waiting_for_input(parts)
	{
		return parts.key.classList.contains('waitingForInput')
	}

	static min_time(parts)
	{
		return electron.audio.get_grip_min(parts.id) * parts.audio.duration
	}

	static max_time(parts)
	{
		return electron.audio.get_grip_max(parts.id) * parts.audio.duration
	}

	static current_time(parts)
	{
		return parts.audio.currentTime / parts.audio.duration
	}

	static play_button(parts)
	{
		let click_event = (parts) =>
		{
			parts.audio.paused ? parts.audio.play() : parts.audio.pause()
		}

		parts.play.addEventListener('click', click_event.bind(undefined,parts), false)
	}

	static hold_button(parts)
	{
		let click_event = (parts) =>
		{
			electron.audio.toggle_hold(parts.id)
			parts.hold.classList.toggle('unlit')
			parts.hold.classList.toggle('lit')
			electron.audio.save(parts.id)
		}

		parts.hold.addEventListener('click', click_event.bind(undefined, parts), false)
	}

	static restart_button(parts)
	{
		let click_event = (parts) =>
		{
			electron.audio.toggle_restart(parts.id)
			parts.restart.classList.toggle('unlit')
			parts.restart.classList.toggle('lit')
			electron.audio.save(parts.id)
		}

		parts.restart.addEventListener('click', click_event.bind(undefined, parts), false)
	}

	static loop_button(parts)
	{
		let click_event = (parts) =>
		{
			electron.audio.toggle_loop(parts.id)
			parts.loop.classList.toggle('unlit')
			parts.loop.classList.toggle('lit')
			electron.audio.save(parts.id)
		}

		parts.loop.addEventListener('click', click_event.bind(undefined, parts), false)
	}

	static key_button(parts)
	{
		let click_event = (parts) =>
		{
			parts.key.classList.toggle('waitingForInput')
		}

		parts.key.addEventListener('click', click_event.bind(undefined, parts), false)
	}

	static grip_set_position(e, grip, parts)
	{
		let id = parts.id
		let min_grip = electron.audio.get_grip_min(id)
		let max_grip = electron.audio.get_grip_max(id)
		let currentX = e.pageX

		let seekBar = parts.seekBar

		let boundLeft = seekBar.getClientRects()[0].left
		let boundRight = seekBar.getClientRects()[0].right

		let new_value = (currentX - boundLeft) / (boundRight - boundLeft)
		let isMin = grip == parts.seekMinGrip
		let isMax = grip == parts.seekMaxGrip

		if(isMin)
		{
			min_grip = new_value
		}
		else if(isMax)
		{
			max_grip = new_value
		}

		if((min_grip >= max_grip && isMin) || min_grip < 0)
		{
			min_grip = 0
		}
		else if((min_grip >= max_grip && isMin) || max_grip > 1)
		{
			max_grip = 1
		}

		if(seekBar.value < min_grip)
		{
			seekBar.value = min_grip
			parts.audio.currentTime = Settings_Event.min_time(parts)
		}
		else if(seekBar.value > max_grip)
		{
			seekBar.value = max_grip
			parts.audio.currentTime = Settings_Event.max_time(parts)
		}

		let seekBarWidth = parts.seekBar.offsetWidth

		let minWidth = (min_grip * seekBarWidth)
		let maxMargin = (max_grip * seekBarWidth)
		let maxWidth = (seekBarWidth - maxMargin)

		parts.seekMinBox.style.width = `${minWidth}px`
		parts.seekMaxBox.style.marginLeft = maxMargin + 'px'
		parts.seekMaxBox.style.width = `${maxWidth}px`

		electron.audio.set_grip_min(id, min_grip)
		electron.audio.set_grip_max(id, max_grip)

		electron.audio.save(id)
	}

	static grip_resize(parts)
	{
		let id = parts.id
		let container = parts.player
		// Check if the player is still on the board to prevent a potential memory leak.
		if(container.parentElement != null)
		{
			let min_grip = electron.audio.get_grip_min(id)
			let max_grip = electron.audio.get_grip_max(id)

			let seekBarWidth = parts.seekBar.offsetWidth

			//if(this.options.constrain.min < 0) {this.options.constrain.min = 0}
			//else if(this.options.constrain.min > 1) {this.options.constrain.min = 1}

			let minWidth = (min_grip * seekBarWidth)
			let maxMargin = (max_grip * seekBarWidth)
			let maxWidth = (seekBarWidth - maxMargin)

			parts.seekMinBox.style.width = `${minWidth}px`
			parts.seekMaxBox.style.marginLeft = maxMargin + 'px'
			parts.seekMaxBox.style.width = `${maxWidth}px`

			setTimeout(Settings_Event.grip_resize,global_settings.grip_interval, parts)
		}
	}

	static grips(parts)
	{
		let min_sliding_event = (parts, e) => {Settings_Event.grip_set_position(e, parts.seekMinGrip, parts)}
		let max_sliding_event = (parts, e) => {Settings_Event.grip_set_position(e, parts.seekMaxGrip, parts)}

		let min_begin_slide_event = (parts, e) =>
		{
			parts.seekMinGrip.onpointermove = min_sliding_event.bind(undefined, parts)
			parts.seekMinGrip.setPointerCapture(e.pointerId)
			Settings_Event.grip_set_position(e, parts.seekMinGrip, parts)
	
			parts.seekMinGrip.style.cursor = 'ew-resize'
			document.querySelector('html').style.cursor = 'ew-resize'
		}

		let max_begin_slide_event = (parts, e) =>
		{
			parts.seekMaxGrip.onpointermove = max_sliding_event.bind(undefined, parts)
			parts.seekMaxGrip.setPointerCapture(e.pointerId)
			Settings_Event.grip_set_position(e, parts.seekMaxGrip, parts)
	
			parts.seekMaxGrip.style.cursor = 'ew-resize'
			document.querySelector('html').style.cursor = 'ew-resize'
		}

		let min_end_slide_event = (parts, e) =>
		{
			parts.seekMinGrip.onpointermove = null
			parts.seekMinGrip.releasePointerCapture(e.pointerId)

			parts.seekMinGrip.style.cursor = ''
			document.querySelector('html').style.cursor = ''
			
			Settings_Event.grip_set_position(e, parts.seekMinGrip, parts)
		}

		let max_end_slide_event = (parts, e) =>
		{
			parts.seekMaxGrip.onpointermove = null
			parts.seekMaxGrip.releasePointerCapture(e.pointerId)

			parts.seekMaxGrip.style.cursor = ''
			document.querySelector('html').style.cursor = ''
			
			Settings_Event.grip_set_position(e, parts.seekMaxGrip, parts)
		}

		parts.seekMinGrip.addEventListener('dragstart', (e) => {e.preventDefault()}, false)
		parts.seekMinGrip.addEventListener('pointerdown', min_begin_slide_event.bind(undefined, parts), false)
		parts.seekMinGrip.addEventListener('pointerup', min_end_slide_event.bind(undefined, parts), false)

		parts.seekMaxGrip.addEventListener('dragstart', (e) => {e.preventDefault()}, false)
		parts.seekMaxGrip.addEventListener('pointerdown', max_begin_slide_event.bind(undefined, parts), false)
		parts.seekMaxGrip.addEventListener('pointerup', max_end_slide_event.bind(undefined, parts), false)

		Settings_Event.grip_resize(parts)
	}

	static audio(parts)
	{
		let play_event = (parts) =>
		{
			parts.play.innerHTML = SVG.sound.pause
		}

		let pause_event = (parts) =>
		{
			parts.play.innerHTML = SVG.sound.play

			if(electron.audio.get_restart(parts.id))
			{
				parts.audio.currentTime = Settings_Event.min_time(parts)
			}
		}

		let time_update_event = (parts) =>
		{
			let audio = parts.audio
			let seek_bar = parts.seekBar
			let min_time = Settings_Event.min_time(parts)
			let max_time = Settings_Event.max_time(parts)
			let current_time = audio.currentTime

			if(current_time < min_time)
			{
				audio.currentTime = min_time
			}
			else if(current_time >= max_time)
			{
				if(electron.audio.get_loop(parts.id))
				{
					audio.currentTime = min_time
				}
				else
				{
					audio.currentTime = max_time
					audio.pause()
				}
			}
			seek_bar.value = audio.currentTime / audio.duration
		}

		let ended_event = (parts) =>
		{
			let audio = parts.audio
			let min_time = Settings_Event.min_time(parts)
			audio.currentTime = min_time
			if(electron.audio.get_loop(parts.id))
			{
				parts.audio.play()
			}
		}

		parts.audio.addEventListener('play', play_event.bind(undefined, parts), false)
		parts.audio.addEventListener('pause', pause_event.bind(undefined, parts), false)
		parts.audio.addEventListener('timeupdate', time_update_event.bind(undefined, parts), false)
		parts.audio.addEventListener('ended', ended_event.bind(undefined, parts), false)
	}

	static seek_bar_set_position(e, parts)
	{
		let id = parts.id
		let min_grip = electron.audio.get_grip_min(id)
		let max_grip = electron.audio.get_grip_max(id)
		let currentX = e.pageX

		let seekBar = parts.seekBar
		let audio = parts.audio

		let boundLeft = seekBar.getClientRects()[0].left
		let boundRight = seekBar.getClientRects()[0].right

		seekBar.value = (currentX - boundLeft) / (boundRight - boundLeft)

		if(seekBar.value < min_grip)
		{
			seekBar.value = min_grip
		}

		else if(seekBar.value > max_grip)
		{
			seekBar.value = max_grip
		}

		audio.currentTime = seekBar.value * audio.duration
	}

	static seek_bar(parts)
	{
		let click_event = (parts, e) =>{Settings_Event.seek_bar_set_position(e, parts)}
		let sliding_event = (parts, e) =>{Settings_Event.seek_bar_set_position(e, parts)}

		let begin_slide_event = (parts, e) =>
		{
			parts.seekBar.onpointermove = sliding_event.bind(undefined, parts)
			parts.seekBar.setPointerCapture(e.pointerId)
			Settings_Event.seek_bar_set_position(e, parts)
	
			parts.seekBar.style.cursor = 'ew-resize'
			document.querySelector('html').style.cursor = 'ew-resize'
		}

		let end_slide_event = (parts, e) =>
		{
			parts.seekBar.onpointermove = null
			parts.seekBar.releasePointerCapture(e.pointerId)
	
			parts.seekBar.style.cursor = ''
			document.querySelector('html').style.cursor = ''
			
			Settings_Event.seek_bar_set_position(e, parts)
		}

		parts.seekBar.addEventListener('dragstart', (e) => {e.preventDefault()}, false)
		parts.seekBar.addEventListener('pointerdown', begin_slide_event.bind(undefined, parts), false)
		parts.seekBar.addEventListener('pointerup', end_slide_event.bind(undefined, parts), false)
		parts.seekBar.addEventListener('click', click_event.bind(undefined, parts), false)
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
		electron.audio.set_volume(parts.id, audio.volume)
		electron.audio.save(parts.id)
	}

	static volume(parts)
	{	
		let volume_click_event = (parts, e) => {Settings_Event.volume_bar_set_position(e, parts)}
		let slide_event = (parts, e) => {Settings_Event.volume_bar_set_position(e, parts)}
	
		let begin_slide_event = (parts, e) =>
		{
			parts.volumeBar.onpointermove = slide_event.bind(undefined, parts)
			parts.volumeBar.setPointerCapture(e.pointerId)
			Settings_Event.volume_bar_set_position(e, parts)
	
			parts.volumeBar.style.cursor = 'ew-resize'
			document.querySelector('html').style.cursor = 'ew-resize'
		}	
	
		let end_slide_event = (parts, e) =>
		{
			parts.volumeBar.onpointermove = null
			parts.volumeBar.releasePointerCapture(e.pointerId)
	
			parts.volumeBar.style.cursor = ''
			document.querySelector('html').style.cursor = ''
			
			Settings_Event.volume_bar_set_position(e, parts)
		}

		let mute_click_event = (parts) =>
		{
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

		parts.volumeBar.addEventListener('click', volume_click_event.bind(undefined, parts), false)
		parts.volumeBar.addEventListener('dragstart', (e) => {e.preventDefault()}, false)
		parts.volumeBar.addEventListener('pointerdown', begin_slide_event.bind(undefined, parts), false)
		parts.volumeBar.addEventListener('pointerup', end_slide_event.bind(undefined, parts), false)

		parts.volumeButton.addEventListener('click', mute_click_event.bind(undefined, parts), false)

		parts.audio.volume = electron.audio.get_volume(parts.id)
	}

	static title_duplicate(parts)
	{
		let title_outer = parts.title
		let title_inner = parts.titleInner
		let dupes = title_outer.querySelectorAll('.soundTitleInnerDupe')
		// The outer title's content goes outside its bounding box.
		if(title_outer.clientWidth < title_outer.children[0].clientWidth)
		{
			if(dupes.length == 0)
			{
				title_outer.classList.add('soundTitleMarquee')
				// Add a duplicate to marquee.
				let dupe = document.createElement('p')
				dupe.classList.add('soundTitleInnerDupe')
				dupe.classList.add('soundTitleInner')
				dupe.innerHTML = title_inner.innerHTML
				title_outer.append(dupe)
			}
		}
		else
		{
			title_outer.classList.remove('soundTitleMarquee')
			// Delete the duplicates used for marqueeing.
			dupes.forEach((ele) => {ele.remove()})
		}
	}

	static title(parts)
	{
		Settings_Event.title_duplicate(parts)
		let container = parts.player
		// Check if the player is still on the board to prevent a potential memory leak.
		if(container.parentElement != null)
		{
			let title_outer = parts.title
			// Get all duplicate titles then marquee if there are any.
			let dupes = title_outer.querySelectorAll('.soundTitleInnerDupe')
			if(dupes.length > 0)
			{
				let scroll_settings = marquee_settings.scroll
				// Instead of using title_inner here we might have the duplicate.
				let child = title_outer.children[0]
				let child_style = getComputedStyle(child)

				// Scroll the outer title using what the settings state.

				// ScrollBy, while preferred, is nonfunctioning for some unknown reason
				//title_outer.scrollBy({left: scroll_settings.left, behavior: scroll_settings.behavior})
				
				title_outer.scrollLeft += scroll_settings.left

				// Get how far the title is scrolled left.
				let title_x = title_outer.scrollLeft

				// Get the width of the child, plus margin.
				let child_x = child.offsetWidth + parseInt(child_style.marginLeft) + parseInt(child_style.marginRight)

				// If the child is scrolled past the edge of the parent, put the child to
				// the end and scroll back to the start.
				if(child_x < title_x)
				{
					title_outer.append(child)
					title_outer.scrollLeft = 0
				}
			}

			// Run this function again after interval settings.
			setTimeout(Settings_Event.title, marquee_settings.scroll.interval, parts)
		}		
	}

	static delete(parts)
	{
		let click_event = async (parts) =>
		{
			let id = parts.id
			let file_name = electron.audio.get_file_name(id)
			if(window.confirm(`Are you sure you'd like to delete ${file_name}?`))
			{
				await electron.audio.delete(id)
				let ids = electron.audio.get_ids()
				for(let i = 0; i < ids.length; i++)
				{
					Settings_Event.set_all(ids[i])
				}
			}
		}

		parts.delete.addEventListener('click', click_event.bind(undefined, parts), false)
	}
}

document.addEventListener('keydown', (e) =>
	{
		if(!e.repeat)
		{
			let waiting_for_input = document.querySelectorAll('.waitingForInput')
			if(waiting_for_input.length > 0)
			{
				if(e.key != 'Backspace' && e.key != 'Delete' && e.key != 'Escape')
				{
					for(let i = 0; i < waiting_for_input.length; i++)
					{
						let id = waiting_for_input[i].dataset.id
						let parts = Settings_Event.get_parts(id)
						// Light up the settings keys and overwrite the defaults with our new potentials
						Settings_Event.light_keys(parts, Key_Press)
					}
				}
			}
			else
			{
				let ids = electron.audio.get_ids()
				for(let i = 0; i < ids.length; i++)
				{
					let id = ids[i]
					let key = electron.audio.get_key(id)
					let ctrl = electron.audio.get_ctrl(id)
					let alt = electron.audio.get_alt(id)
					let shift = electron.audio.get_shift(id)

					if(Key_Press.is_pressed(key, ctrl, alt, shift))
					{
						let parts = Settings_Event.get_parts(id)
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
			let waiting_for_input = document.querySelectorAll('.waitingForInput')
			// If there is audio waiting for input we don't want to accidentally pause anything
			if(waiting_for_input.length > 0)
			{
				// We have a few options to clear a key or cancel input
				let cancel = e.key == 'Backspace' || e.key == 'Delete' || e.key == 'Escape'
				let clear = e.key == 'Backspace' || e.key == 'Delete'

				// If we're clearing the key run the clear function
				if(clear)
				{
					for(let i = 0; i < waiting_for_input.length; i++)
					{
						let id = waiting_for_input[i].dataset.id
						let parts = Settings_Event.get_parts(id)
						
						Settings_Event.clear_key(parts)
					}
				}

				// If we're cancelling input just click the key entry button again
				if(cancel)
				{
					for(let i = 0; i < waiting_for_input.length; i++)
					{
						let id = waiting_for_input[i].dataset.id
						let parts = Settings_Event.get_parts(id)
						parts.key.click()
						Settings_Event.light_keys(parts)
					}
				}
				else
				{
					for(let i = 0; i < waiting_for_input.length; i++)
					{
						let id = waiting_for_input[i].dataset.id
						let parts = Settings_Event.get_parts(id)

						// Adjust keys for the ones that are lifted				
						Settings_Event.light_keys(parts, Key_Press)

						// If lifting a non-modifier key then save it
						if(!Key_Press.is_key_pressed && Key_Press.latest != '')
						{
							electron.audio.set_key(id, Key_Press.latest)
							electron.audio.set_ctrl(id, Key_Press.ctrl)
							electron.audio.set_alt(id, Key_Press.alt)
							electron.audio.set_shift(id, Key_Press.shift)
							electron.audio.save(id)

							parts.key.innerHTML = Key_Press.latest
							parts.key.classList.add('set')
							parts.key.click()
							Key_Press.clear()
						}
					}
				}
			}
			else
			{
				let ids = electron.audio.get_ids()
				for(let i = 0; i < ids.length; i++)
				{
					let id = ids[i]
					let parts = Settings_Event.get_parts(id)
					let key = electron.audio.get_key(id)
					let ctrl = electron.audio.get_ctrl(id)
					let alt = electron.audio.get_alt(id)
					let shift = electron.audio.get_shift(id)
					let hold = electron.audio.get_hold(id)
	
					// If the key not pressed then pause the audio if it's a hold
					if(!Key_Press.is_pressed(key, ctrl, alt, shift) && hold)
					{
						if(!parts.audio.paused)
						{
							parts.player.querySelector('.playButton').click()
						}
					}
				}
			}
		}
	})