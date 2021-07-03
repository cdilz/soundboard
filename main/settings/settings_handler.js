'use strict'

const { settings } = require('cluster')
const fs = require('fs')
const path = require('path')

const global_settings = require('../global_settings.js')
/**
 * Path to audio files represented in the global_settings file.
 */
const audio_path = global_settings.audio_path

let Settings_File = require('./settings_file.js')

/**
 * Class to handle all the settings files.
 */
class Settings_Handler
{
	/**
	 * Array of all settings files.
	 */
	static settings = []

	/**
	 * Loads every file in association with the audio_path.
	 */
	static async full_load()
	{
		try
		{
			this.settings = []
			let files = fs.readdirSync(audio_path)
			for(let i = 0; i < files.length; i++)
			{
				let file = files[i]
				let file_name = path.basename(file)
				await this.add_setting(file_name)
			}
			await this.fill_display()
		}
		catch(e)
		{
			throw e
		}
	}

	static get_ids()
	{
		let output = []
		for(let i = 0; i < this.settings.length; i++)
		{
			output.push(this.settings[i].id)
		}
		return output
	}

	/**
	 * Sorts the settings array by alphabetical order, ignoring case.
	 * 
	 * @returns - The sorted settings array.
	 */
	static sort()
	{
		return this.settings.sort((setA, setB) =>
		{
			const setAFN = setA.file_name.toLowerCase()
			const setBFN = setB.file_name.toLowerCase()
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

	/**
	 * Gets the index for a specified ID.
	 * 
	 * @param {String} id - ID of requested settings file.
	 * @returns - Index of settings file with ID of id.
	 */
	static get_index(id)
	{
		for(let i = 0; i < this.settings.length; i++)
		{
			if(this.settings[i].id == id)
			{
				return i
			}
		}
	}

	/**
	 * Get a specific settings file by ID.
	 * 
	 * @param {String} id - ID of requested settings file.
	 * @returns - a Settings_File representing the ID of id.
	 */
	static get(id)
	{
		return this.settings[this.get_index(id)]
	}

	/**
	 * Checks if an audio file exists in the audio_path.
	 * 
	 * @param {String} file_name - File name of the audio file.
	 * @returns - True if file exists, else false.
	 */
	static async audio_exists(file_name)
	{
		try
		{
			let files = fs.readdirSync(audio_path)
			for(let i = 0; i < files.length; i++)
			{
				let check_name = path.basename(files[i])
				if(check_name == file_name)
				{
					return true
				}
			}

			return false
		}
		catch(e)
		{
			throw e
		}
	}

	/**
	 * Meant to handle files from the file prompt in Electron.
	 * 
	 * @param {String[]} files - Array of audio files to add to the system.
	 */
	static async add(files)
	{
		try
		{
			for(let i = 0; i < files.length; i++)
			{
				await this.add_audio(files[i])
			}
			await this.fill_display()
		}
		catch (e)
		{
			throw e
		}
	}

	/**
	 * Processes an audio file to add to the system.
	 * 
	 * @param {String} file - Audio file to add to the system.
	 */
	static async add_audio(file)
	{
		try
		{
			let file_name = path.basename(file)

			// If the file doesn't already exist in _audioDirectory, copy file
			if(!(await this.audio_exists(file_name)))
			{
				let audio_file_directory = path.join(audio_path, file_name)
				fs.copyFileSync(file, audio_file_directory)
			}
			// If file is copied or already exists then we should load the settings and then save it to initialize it if it's new
			this.add_setting(file_name)
		}
		catch(e)
		{
			throw(e)
		}
	}

	/**
	 * Saves the audio file to the array.
	 * 
	 * @param {String} file_name - File name of the audio file we're saving.
	 */
	static async add_setting(file_name)
	{
		try
		{
			let setting = await Settings_File.load(file_name)
			setting.save()
			this.settings.push(setting)
		}
		catch(e)
		{
			throw e
		}
	}

	/**
	 * Saves a Settings_File by ID.
	 * 
	 * @param {String} id - ID of settings file to save.
	 */
	static save(id)
	{
		try
		{
			this.get(id).save()
		}
		catch(e)
		{
			throw e
		}
	}

	/**
	 * Deletes a Settings_File by ID.
	 * 
	 * @param {String} id - ID of settings file to delete.
	 */
	static delete(id)
	{
		try
		{
			this.get(id).delete()
			this.settings.splice(i, 1)
			this.fill_display()
		}
		catch(e)
		{
			throw e
		}
	}

	/**
	 * Fills the display (#display) with each setting's HTML.
	 */
	static fill_display()
	{
		let display = document.querySelector('#display')
		this.sort()
		display.innerHTML = ''
		for(let i = 0; i < this.settings.length; i++)
		{
			let setting = this.settings[i]
			display.innerHTML += setting.toHTML()
			setting.set_events()
		}
	}

	/**
	 * Toggle hold on setting with ID of id.
	 * 
	 * @param {string} id - ID of setting to modify
	 */
	static toggle_hold(id)
	{
		let setting = this.get(id)
		setting.hold = !setting.hold
	}
	static get_hold(id){return this.get(id).setting.hold}
	static set_hold(id, value){this.get(id).setting.hold = value}

	/**
	 * Toggle restart on setting with ID of id.
	 * 
	 * @param {string} id - ID of setting to modify
	 */
	static toggle_restart(id)
	{
		let setting = this.get(id)
		setting.restart = !setting.restart
	}
	static get_restart(id){return this.get(id).setting.restart}
	static set_restart(id, value){this.get(id).setting.restart = value}

	/**
	 * Toggle loop on setting with ID of id.
	 * 
	 * @param {string} id - ID of setting to modify
	 */
	static toggle_loop(id)
	{
		let setting = this.get(id)
		setting.loop = !setting.loop
	}
	static get_loop(id){return this.get(id).setting.loop}
	static set_loop(id, value){this.get(id).setting.loop = value}

	static toggle_ctrl(id)
	{
		let setting = this.get(id)
		setting.modifier.ctrl = !setting.modifier.ctrl
	}
	static get_ctrl(id){return this.get(id).modifier.ctrl}
	static set_ctrl(id, value){this.get(id).modifier.ctrl = value}

	static toggle_alt(id)
	{
		let setting = this.get(id)
		setting.modifier.alt = !setting.modifier.alt
	}
	static get_alt(id){return this.get(id).modifier.alt}
	static set_alt(id, value){this.get(id).modifier.alt = value}

	static toggle_shift(id)
	{
		let setting = this.get(id)
		setting.modifier.shift = !setting.modifier.shift
	}
	static get_shift(id){return this.get(id).modifier.shift}
	static set_shift(id, value){this.get(id).modifier.shift = value}

	static get_key(id){return this.get(id).key}
	static set_key(id, value){this.get(id).key = value}

	static get_grip_min(id){return this.get(id).constrain.min}
	static set_grip_min(id, value){this.get(id).constrain.min = value}

	static get_grip_max(id){return this.get(id).constrain.max}
	static set_grip_max(id, value){this.get(id).constrain.max = value}

	static get_volume(id){return this.get(id).volume}
	static set_volume(id, value){this.get(id).volume = value}

	static get_file_name(id){return this.get(id).file_name}
}

module.exports = Settings_Handler