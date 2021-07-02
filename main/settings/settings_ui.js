'use strict'

const path = require('path')
const global_settings = require('../global_settings.js')
const SVG = require('../svg.js')
/**
 * Path to audio files represented in the global_settings file.
 */
const audio_path = global_settings.audio_path


/**
 * Static class that generates the HTML for a Settings_File
 */
class Settings_UI
{
	static generate_html(settings)
	{
		let audio = this.audio(settings)
		let top = this.top(settings)
		let bottom = this.bottom(settings)
		return `<div class='soundContainer' id='${settings.id}'>${audio}${top}${bottom}</div>`
	}

	static light_class(bool)
	{
		return bool ? 'lit' : 'unlit'
	}

	static audio(settings)
	{
		// String santization for file names.
		let file_name = settings.file_name.replace("'", "&#39;").replace('"', '&#034;')
		let file_path = path.join(audio_path, file_name)
		let loop = settings.loop ? ' loop' : ''
		return `<audio src='${file_path}'${loop} data-id='${settings.id}'></audio>`
	}

	static top(settings)
	{
		let play = this.play(settings)
		let title = this.title(settings)
		let volume = this.volume(settings)
		let delete_button = this.delete_button(settings)
		return `<div class = 'soundTop'>${play}${title}${volume}${delete_button}</div>`
	}

	static play(settings)
	{
		return `<div class='soundButton playButton fill' data-id='${settings.id}'>${SVG.sound.play}</div>`
	}

	static title(settings)
	{
		let title = settings.file_name
		return `<div class='soundTitle'><p class='soundTitleInner'>${title}</p></div>`
	}

	static volume(settings)
	{
		let volume = settings.volume
		let volume_button = `<div class='soundButton volumeButton' data-id='${settings.id}'>${SVG.sound.volume}</div>`
		let volume_bar = `<progress draggable='true' value=${volume} class='volumeBar' data-id='${settings.id}'></progress>`
		return `<div class='volumeContainer'>${volume_button}${volume_bar}</div>`
	}

	static delete_button(settings)
	{
		return `<div class='soundButton delete' data-id='${settings.id}'>${SVG.titlebar.close}</div>`
	}

	static bottom(settings)
	{
		let key = this.key(settings)
		let control_lights = this.control_lights(settings)
		let seek = this.seek(settings)
		return `<div class='soundBottom'>${key}${control_lights}${seek}</div>`
	}

	static key(settings)
	{
		let key = settings.key ?? '?'
		let key_class = settings.key ? ' set' : ''
		return `<div class='soundButton controlKey${key_class}' data-id='${settings.id}'>${key}</div>`
	}

	static control_lights(settings)
	{
		let hold = this.hold(settings)
		let top = this.control_top(settings)
		let loop = this.loop(settings)
		let restart = this.restart(settings)
		return `<div class='controlLights'>${hold}<div class='controlLightsRight'>${top}${loop}</div>${restart}</div>`
	}

	static hold(settings)
	{
		let light = this.light_class(settings.hold)
		return `<div class='${light} controlLight hold soundButton' data-id='${settings.id}'>${SVG.sound.hold}</div>`
	}

	static control_top(settings)
	{
		let shift = this.shift(settings)
		let ctrl = this.ctrl(settings)
		let alt = this.alt(settings)
		return `<div class='controlLightsTop'>${shift}${ctrl}${alt}</div>`
	}

	static shift(settings)
	{
		let light = this.light_class(settings.shift)
		return `<div class='${light} controlLight shift' data-id='${settings.id}'>S</div>`
	}

	static ctrl(settings)
	{
		let light = this.light_class(settings.ctrl)
		return `<div class='${light} controlLight ctrl' data-id='${settings.id}'>C</div>`
	}

	static alt(settings)
	{
		let light = this.light_class(settings.alt)
		return `<div class='${light} controlLight alt' data-id='${settings.id}'>A</div>`
	}

	static loop(settings)
	{
		let light = this.light_class(settings.loop)
		return `<div class='${light} controlLight loop soundButton' data-id='${settings.id}'>${SVG.sound.loop}</div>`
	}

	static restart(settings)
	{
		let light = this.light_class(settings.restart)
		return `<div class='${light} controlLight restart soundButton' data-id='${settings.id}'>${SVG.sound.restart}</div>`
	}

	static seek(settings)
	{
		let min_clamp = this.min_clamp(settings)
		let seek_bar = this.seek_bar(settings)
		let max_clamp = this.max_clamp(settings)
		return `<div class='seekHolder'>${min_clamp}${seek_bar}${max_clamp}</div>`
	}

	static min_clamp(settings)
	{
		return `<div class='seekMinBox seekClampBox' data-id='${settings.id}'><div class='seekMinCover seekClampCover' data-id='${settings.id}'>&nbsp;</div><div class='seekMinGrip seekClampGrip' draggable='true' data-id='${settings.id}'>&nbsp;</div></div>`
	}

	static seek_bar(settings)
	{
		let progress = settings.constrain.min
		return `<progress draggable='true' value=${progress} class='seekBar' data-id='${settings.id}'></progress>`
	}

	static max_clamp(settings)
	{
		return `<div class='seekMaxBox seekClampBox' data-id='${settings.id}'><div class='seekMaxGrip seekClampGrip' draggable='true' data-id='${settings.id}'>&nbsp;</div><div class='seekMaxCover seekClampCover' data-id='${settings.id}'>&nbsp;</div></div>`
	}
}

module.exports = Settings_UI