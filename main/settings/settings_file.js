'use strict'

const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const global_settings = require('../global_settings.js')

const settings_path = global_settings.settings_path

fs.mkdir(global_settings.settings_path, {recursive: true}, (err)=>{if(err){alert(err)}})



class Settings_File
{
	constructor(file_name, override = {})
	{
		if(typeof file_name == typeof undefined || file_name == null)
		{
			throw 'file name invalid'
		}
		this.file_name = file_name
		this.id = id ?? 'id_' + crypto.createHash('md5').update(this.file_name).digest('hex') + '_' + Date.now().toString()
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

	delete()
	{
		try
		{
			let settings_file = path.join(settings_path, this.fileName + '.json')
			fs.unlink(settings_file, (e) => {if(e) throw e})
			return this
		}
		catch(e)
		{
			throw e
		}
	}

	static load(file_name)
	{
		try
		{
			// Check if there's a settings file for it
			// 	If there is: create a Settings from that
			//  If there isn't: create a new Settings from the filename
			let path = path.join(settings_path, file_name + '.json')
			if(fs.existsSync(path))
			{
				let file = fs.readFileSync(path, {encoding: 'utf8'})
				if(file)
				{
					let settings = JSON.parse(file) 
					return new Settings(file_name, settings)
				}
			}
			return new Settings(file_name)
		}
		catch(e)
		{
			throw e
		}
	}

	save()
	{
		try
		{
			let save_path = path.join(settings_path, this.file_name + '.json')
			let settings = JSON.stringify(this)
			fs.writeFile(save_path, settings, {encoding: 'utf8'}, (e) => {if(e) throw e})
			return this
		}
		catch(e)
		{
			throw e
		}
	}
}

module.exports = Settings_File