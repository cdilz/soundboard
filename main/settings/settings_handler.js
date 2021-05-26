'use strict'

const fs = require('fs')
const path = require('path')

const global_settings = require('../global_settings.js')
const audio_path = global_settings.audio_path

let Settings_File = require('./settings_file.js')

class Settings_Handler
{
	static settings = []

	static full_load()
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

	static get(id)
	{
		return this.settings[get_index(id)]
	}

	static audio_exists(file_name)
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

	static add(files)
	{
		try
		{
			for(let i = 0; i < files.length; i++)
			{
				this.add_audio(files[i])
			}
		}
		catch (e)
		{
			throw e
		}
	}

	static add_audio(file)
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

	static add_setting(file_name)
	{
		try
		{
			this.settings.push(Settings_File.load(file_name).save())
			this.sort()
		}
		catch(e)
		{
			throw e
		}
	}

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

	static delete(id)
	{
		try
		{
			this.get(id).delete()
			this.settings.splice(i, 1)
		}
		catch(e)
		{
			throw e
		}
	}
}

module.exports = Settings_Handler