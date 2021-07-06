class Key_Press
{
	static clear()
	{
		Key_Press.keys = []
		Key_Press.latest = ''
		Key_Press.ctrl = false
		Key_Press.alt = false
		Key_Press.shift = false
		Key_Press.is_key_pressed = false
	}

	static find_key(key)
	{
		for(let i = 0; i < Key_Press.keys.length; i++)
		{
			if(Key_Press.keys[i] == key)
			{
				return true
			}
		}
		return false
	}

	static key_down(e)
	{
		Key_Press.ctrl = e.ctrlKey
		Key_Press.alt = e.altKey
		Key_Press.shift = e.shiftKey
		let key = e.key.toUpperCase()

		// Don't register a key if it's longer than 1 character.
		// This prevents the modifier keys from showing up.
		if(key.length == 1)
		{
			Key_Press.keys.push(key)
			Key_Press.latest = key
			Key_Press.is_key_pressed = true
		}
	}

	static key_up(e)
	{
		Key_Press.ctrl = e.ctrlKey
		Key_Press.alt = e.altKey
		Key_Press.shift = e.shiftKey

		let key = e.key.toUpperCase()
		Key_Press.keys = Key_Press.keys.filter((element) =>
		{
			return element != key
		})

		if(key.length == 1)
		{
			if(Key_Press.keys.length == 0)
			{
				Key_Press.is_key_pressed = false
			}
			else
			{
				Key_Press.latest = Key_Press.keys[Key_Press.keys.length - 1]
			}
		}
		// If the key length is not 1 and there are no other keys pressed, we want to set it to a non-pressed state
		else if(Key_Press.keys.length == 0)
		{
			Key_Press.is_key_pressed = false
			Key_Press.latest = ''
		}
	}

	static is_pressed(key, ctrl, alt, shift)
	{
		let hasCtrl = ctrl == Key_Press.ctrl
		let hasAlt = alt == Key_Press.alt
		let hasShift = shift == Key_Press.shift
		let hasKey = false

		if(key instanceof Array)
		{
			// If the incoming key array is empty, then check if we want any keys pressed
			if(key.length == 0)
			{
				hasKey = key.length == Key_Press.keys.length
			}
			else
			{
				let innerHasKey =  true
				for(let i = 0; i < key.length; i++)
				{
					innerHasKey = innerHasKey && Key_Press.find_key(key[i])
				}
			}
		}
		else
		{
			hasKey = Key_Press.find_key(key)
		}

		return hasAlt && hasCtrl && hasShift && hasKey
	}
}

Key_Press.clear()

document.addEventListener('keydown', Key_Press.key_down)
document.addEventListener('keyup', Key_Press.key_up)