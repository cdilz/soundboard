'use strict'

const fs = require('fs')
const path = require('path')

const global_settings = require('../global_settings.js')
let Settings_File = require('./settings_file.js')

class Settings_Handler
{
	static settings = []

	static full_load()
	{
		fs.readdir(global_settings.audio_path, (err, files) =>
		{
			for(let i = 0; i < files.length; i++)
			{
				let file = files[i]
				let file_name = path.basename(file)
				this.add(file_name)
			}
		})
	}

	static sort()
	{
		return settings.sort((setA, setB) =>
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
		for(let i = 0; i < settings.length; i++)
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

	static add(file_name)
	{
		this.list.push(Settings_File.load(file_name).save())
		this.sort()
	}

	static save(id)
	{
		this.get(id).save()
	}

	static delete(id)
	{
		this.get(id).delete()
		this.settings.splice(i, 1)
	}
}

module.exports = Settings_Handler