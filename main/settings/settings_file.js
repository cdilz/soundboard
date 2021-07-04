'use strict'

const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const Settings_UI = require('./settings_ui.js')
const Settings_Event = require('./settings_event.js')
const global_settings = require('../global_settings.js')

const settings_path = global_settings.settings_path

/**
 * Class representing the settings file.
 */

class Settings_File
{
	/**
	 * @param {String} file_name - The name of the file.
	 * @param {Object} override - Overrides for this file's settings.
	 * @param {String} override.key - Key that this file should listen for.
	 * @param {Boolean} override.hold - Should Key be held down?
	 * @param {Boolean} override.loop - Should audio loop?
	 * @param {Boolean} override.restart - Should audio return to the start, but pause when it's done?
	 * @param {Number} override.volume - Volume level of this file as percent (0-1).
	 * @param {Object} override.modifier - Container for modifier keys.
	 * @param {Boolean} override.modifier.alt - Should user hold alt?
	 * @param {Boolean} override.modifier.ctrl - Should user hold control?
	 * @param {Boolean} override.modifier.shift - Should user hold shift?
	 * @param {Object} override.constrain - Container for audio constraints.
	 * @param {Number} override.constrain.min - Minimum value as percent of seek bar (0-1).
	 * @param {Number} override.constrain.max - Maximum value as percent of seek bar (0-1).
	 */
	constructor(file_name, override = {})
	{
		if(typeof file_name == typeof undefined || file_name == null)
		{
			throw 'file name invalid'
		}
		this.file_name = file_name
		this.id = override.id ?? 'id_' + crypto.createHash('md5').update(this.file_name).digest('hex') + '_' + Date.now().toString()
		this.key = override.key ?? null
		this.hold = override.hold ?? false
		this.loop = override.loop ?? false
		this.restart = override.restart ?? false
		this.volume = override.volume ?? 1

		override.modifier ??= {}
		
		this.modifier = {}
		this.modifier.alt = override.modifier.alt ?? false
		this.modifier.ctrl = override.modifier.ctrl ?? false
		this.modifier.shift = override.modifier.shift ?? false

		override.constrain ??= {}

		this.constrain = {}
		this.constrain.min = override.constrain.min ?? 0
		this.constrain.max = override.constrain.max ?? 1
	}

	/**
	 * Deletes the file associated with this instance.
	 * 
	 * @returns - this.
	 */

	async delete()
	{
		try
		{
			let settings_file = path.join(settings_path, this.file_name + '.json')
			fs.unlinkSync(settings_file)
			return this
		}
		catch(e)
		{
			throw e
		}
	}

	/**
	 * Loads a file and tries to generate a Settings_File from it.
	 * 
	 * @param {String} file_name 
	 * @returns - A new instance of Settings_File.
	 */
	static async load(file_name)
	{
		try
		{
			// Check if there's a settings file for it.
			// 	If there is: create a Settings from that.
			//  If there isn't: create a new Settings from the filename.
			let save_path = path.join(settings_path, file_name + '.json')
			if(fs.existsSync(save_path))
			{
				let file = fs.readFileSync(save_path, {encoding: 'utf8'})
				if(file)
				{
					let settings = JSON.parse(file) 
					return new Settings_File(file_name, settings)
				}
			}
			return new Settings_File(file_name)
		}
		catch(e)
		{
			throw e
		}
	}

	/**
	 * Saves the settings file to disk.
	 * 
	 * @returns - this.
	 */
	async save()
	{
		try
		{
			let save_path = path.join(settings_path, this.file_name + '.json')
			let settings = JSON.stringify(this)
			fs.writeFileSync(save_path, settings, {encoding: 'utf8'})
			return this
		}
		catch(e)
		{
			throw e
		}
	}

	toHTML()
	{
		return Settings_UI.generate_html(this)
	}

	set_events()
	{
		//Settings_Event.set_all(this)
	}
}

module.exports = Settings_File