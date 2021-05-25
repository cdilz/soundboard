marqueeSettings = globalSettings.marquee

/*
function marquee_detect()
{
	let titles = document.querySelectorAll('.soundTitleContainer')
	let detectSettings = marqueeSettings.scroll
	
	
	//	We're making sure that if the title is too wide we can make it marquee
	//	If someone resizes the app this should add/remove marqueeing as necessary
	
	titles.forEach(title => 
	{
		if(title.offsetWidth < title.scrollWidth)
		{
			if(!title.classList.contains('marquee'))
			{
				title.classList.add('marquee')
				title.style.width = title.offsetWidth * detectSettings.width_multiplier
			}
		}
		else
		{
			if(title.classList.contains('marquee'))
			{
				title.classList.remove('marquee')
				title.style.width = null
			}
		}
	})

	setTimeout(marquee_detect, detectSettings.interval)
}

marquee_detect()
*/

function marquee_detect()
{
	let detectSettings = marqueeSettings.detect
	/*

	for(let i = 0; i < _settings.length; i++)
	{
		let parts = _settings[i].parts
		let title = parts.title
		let titleInner = parts.titleInner
		// Remove all previous dupes in case we don't need to scroll anymore
		let filler = parts.title.querySelectorAll('.soundTitleInnerDupe')
		// Remove the marquee to check if the width without margins fits
		title.classList.remove('soundTitleMarquee')
		filler.forEach((ele) => {ele.remove()})

		// If the title's content goes outside its bounding box
		if(title.clientWidth < title.scrollWidth)
		{
			title.classList.add('soundTitleMarquee')
			// Add a duplicate of the track title so we can marquee
			let dupe = document.createElement('p')
			dupe.classList.add('soundTitleInnerDupe')
			dupe.classList.add('soundTitleInner')
			dupe.innerHTML = titleInner.innerHTML

			title.append(dupe)
		}
	}

	*/
	setTimeout(marquee_detect, detectSettings.interval)
}

marquee_detect()

//window.addEventListener('resize', (e) => {alert(e)})

function marquee_scroll()
{
	let marquees = document.querySelectorAll('.soundTitleMarquee')
	let scrollSettings = marqueeSettings.scroll
	for(let i = 0; i < marquees.length; i++)
	{
		let m = marquees[i]
		let child = m.children[0]
		let childStyle = getComputedStyle(child)
		m.scrollBy({left: scrollSettings.left, top: scrollSettings.top, behavior: scrollSettings.behavior})

		// How far the element is scrolled
		let titleX = m.scrollLeft

		// The width of the child, plus margin
		let childX = child.offsetWidth + parseInt(childStyle.marginLeft) + parseInt(childStyle.marginRight)

		// If the child is scrolled past the edge of the parent
		if(childX < titleX)
		{
			m.append(child)
			m.scrollLeft = 0
		}
	}
	setTimeout(marquee_scroll, scrollSettings.interval)
}

marquee_scroll()