const fs = require('fs')
const path = require('path')

let main_dir = path.dirname(process.execPath)

let settings_path = path.join(main_dir, 'settings')
let audio_path = path.join(main_dir, 'audio')

fs.mkdir(settings_path, {recursive: true}, (err)=>{if(err){alert(err)}})
fs.mkdir(audio_path, {recursive: true}, (err)=>{if(err){alert(err)}})

module.exports =
{
	settings_path,
	audio_path
}