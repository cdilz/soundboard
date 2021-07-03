document.addEventListener('readystatechange', () =>
{
	if(document.readyState == 'complete')
	{
		let sounds = electron.audio.get_ids()
		for(let i = 0; i < sounds.length; i++)
		{
			Settings_Event.set_all(sounds[i])
		}
	}
})