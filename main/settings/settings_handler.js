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
			let files = fs.readdirSync(audio_path)
			for(let i = 0; i < files.length; i++)
			{
				let file = files[i]
				let file_name = path.basename(file)
				this.add_setting(file_name)
			}
		}
		catch(e)
		{
			throw e
		}
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
		return this.settings[get_index(id)]
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
			console.log(this.settings.length)
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
			if(!this.audio_exists(file_name))
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
}

module.exports = Settings_Handler