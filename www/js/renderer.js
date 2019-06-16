// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote
document.addEventListener('DOMContentLoaded', () =>
{
	let window = remote.getCurrentWindow()
	let min    = document.querySelector('#titlebar_minimize')
	let max    = document.querySelector('#titlebar_maximize')
	let close  = document.querySelector('#titlebar_close')

	let maxsvg = `<svg width="1e3" height="1e3" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg">
	<g transform="translate(0 -32.417)">
		<path d="m19.844 52.26h224.9v224.9h-224.9z" fill="none" stroke="#000001" stroke-width="39.688" style="paint-order:normal"/>
	</g>
</svg>`

	let ressvg = `<svg width="1e3" height="1e3" version="1.1" viewBox="0 0 264.58 264.58" xmlns="http://www.w3.org/2000/svg">
	<g transform="translate(0 -32.417)">
		<path transform="matrix(.26458 0 0 .26458 0 32.417)" d="m300 75v225h400v400h225v-625zm400 625v-400h-625v625h625z" fill="none" stroke="#000001" stroke-width="150" style="paint-order:normal"/>
	</g>
</svg>
`

	min.addEventListener('click',() => {window.minimize()})
	close.addEventListener('click',() => {window.close()})

	max.addEventListener('click',e => 
	{
		let target = e.target
		while(target.tagName.toLowerCase() != 'div')
		{
			target = target.parentElement
		}

		let maximize = target.classList.contains('titlebar_maximize')
		if(maximize)
		{
			window.maximize()
			max.innerHTML = ressvg
			target.classList.replace('titlebar_maximize', 'titlebar_restore')
		}
		else
		{
			window.unmaximize()
			max.innerHTML = maxsvg
			target.classList.replace('titlebar_restore', 'titlebar_maximize')
		}
	})
})