document.addEventListener('DOMContentLoaded', () =>
{
	let min    = document.querySelector('#titlebar_minimize')
	let max    = document.querySelector('#titlebar_maximize')
	let close  = document.querySelector('#titlebar_close')
	let add    = document.querySelector('#titlebar_add')

	min.addEventListener('click',() => 
	{
		electron.window.minimize()
	})
	close.addEventListener('click',() => 
	{
		electron.window.close()
	})

	max.addEventListener('click',e => 
	{
		let maximized = electron.window.isMaximized()
		if(maximized)
		{
			electron.window.unmaximize()
		}
		else
		{
			electron.window.maximize()
		}
	})

	add.addEventListener('click', async e =>
	{
		let ids = await electron.window.addSong()
		for(let i = 0; i < ids.length; i++)
		{
			Settings_Event.set_all(ids[i])
		}
	})
})