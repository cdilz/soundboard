let _keypress =
{
	 alt: false
	,ctrl: false
	,shift: false
	,keys: []
	,latest: ''
	,isKeyPressed: false
}

let _findKey = (key) =>
{
	for(let i = 0; i < _keypress.keys.length; i++)
	{
		if(_keypress.keys[i] == key)
		{
			return true
		}
	}
	return false
}

class keypress
{
	static get settings()	{return _keypress}
	static get alt() {return _keypress.alt}
	static get ctrl() {return _keypress.ctrl}
	static get shift() {return _keypress.shift}
	static get keys() {return _keypress.keys}
	static get latest() {return _keypress.latest}
	static get isKeyPressed() {return _keypress.isKeyPressed}

	static keydown(e)
	{
		_keypress.ctrl = e.ctrlKey
		_keypress.alt = e.altKey
		_keypress.shift = e.shiftKey

		// Don't register a key if it's longer than 1 character.
		// This prevents the modifier keys from showing up.
		if(e.key.length == 1)
		{
			_keypress.keys.push(e.key)
			_keypress.latest = e.key
			_keypress.isKeyPressed = true
		}
	}

	static keyup(e)
	{
		_keypress.ctrl = e.ctrlKey
		_keypress.alt = e.altKey
		_keypress.shift = e.shiftKey
		if(e.key.length == 1)
		{
			let key = e.key
			_keypress.keys = _keypress.keys.filter((element) =>
			{
				return element != key
			})
			if(_keypress.keys.length == 0)
			{
				_keypress.isKeyPressed = false
			}
			else
			{
				_keypress.latest = _keypress.keys[_keypress.keys.length - 1]
			}
		}
	}

	static isPressed(alt, ctrl, shift, key)
	{
		let hasAlt = alt == _keypress.alt
		let hasCtrl = ctrl == _keypress.ctrl
		let hasShift = shift == _keypress.shift
		let hasKey = false

		if(key instanceof Array)
		{
			// If the incoming key array is empty, then check if we want any keys pressed
			if(key.length == 0)
			{
				hasKey = key.length == _keypress.keys.length
			}
			else
			{
				let innerHasKey =  true
				for(let i = 0; i < key.length; i++)
				{
					innerHasKey = innerHasKey && _findKey(key[i])
				}
			}
		}
		else
		{
			hasKey = _findKey(key)
		}

		return hasAlt && hasCtrl && hasShift && hasKey
	}
}

document.addEventListener('keydown', keypress.keydown)
document.addEventListener('keyup', keypress.keyup)