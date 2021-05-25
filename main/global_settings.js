const path = require('path')

let main_dir = path.dirname(process.execPath)

let settings_path = path.join(main_dir, 'settings')
let audio_path = path.join(main_dir, 'audio')

module.exports =
{
	settings_path,
	audio_path
}