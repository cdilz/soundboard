# soundboard
Allows assigning buttons to audio files and playing them when pressed.

Following is a breakdown of what each UI element does.

# Title Bar
![title bar](/documentation/readme/titlebar.png)
|Button|Usage|
|---|---|
| ![add song](/documentation/readme/titlebar/add.png) | Brings up a file prompt to add songs. Adding multiple is possible. While you can add non-songs this will cause issue, but it designed that way in case I missed an extension in the file prompt. |
| ![minimize](/documentation/readme/titlebar/minimize.png) | Minimizes the window on Windows. Unsure on Linux and Macintosh. |
| ![maximize](/documentation/readme/titlebar/maximize.png) | Maximizes the window on Windows. Unsure on Linux and Macintosh. |
| ![close](/documentation/readme/titlebar/close.png) | Close the window on Windows. Unsure on Linux and Macintosh. |

# Sound File
![sound file](/documentation/readme/sound.png)
|Button|Usage|
|---|---|
| ![play sound](/documentation/readme/sound/play.png) | Plays the sound manually. Swaps to the pause button on use, even if using a key combo. |
| ![pause sound](/documentation/readme/sound/pause.png) | Pauses the sound manually. Swaps to the play button on use, even if using a key combo. |
| ![mute sound](/documentation/readme/sound/mute.png) | Mutes the sound. Clicking it will swap it to the unmute button.|
| ![unmute sound](/documentation/readme/sound/unmute.png) | Unmutes the sound. Clicking it or the volume bar will swap it to the mute button.|
| ![volume](/documentation/readme/sound/volume.png) | Click/slide anywhere to adjust volume. Unmutes on click. |
| ![delete sound](/documentation/readme/sound/delete.png) | Click to show a prompt that allows you to delete this sound. |
| ![key](/documentation/readme/sound/key.png) ![key set](/documentation/readme/sound/key_set.png) | Click this to assign a key to this sound. Included in this example is a key set to  "D". You should be able to use any key that is a single character long. The numpad number keys can't be used with shift, though, as this will attempt to use the alternative key for that and those won't work.<br/><br/>Pressing escape will cancel this process.<br/><br/> Pressing backaspace or delete will reset the key. |
| ![hold unlit](/documentation/readme/sound/hold_unlit.png) ![hold lit](/documentation/readme/sound/hold_lit.png) | Click this to toggle if you need to hold the button down to play the sound. |
| ![shift unlit](/documentation/readme/sound/shift_unlit.png) ![shift lit](/documentation/readme/sound/shift_lit.png) | If this is lit, you need to hold shift in order to play the sound. |
| ![control unlit](/documentation/readme/sound/control_unlit.png) ![control lit](/documentation/readme/sound/control_lit.png) | If this is lit, you need to hold control (I think this is cmd on Mac) in order to play the sound. |
| ![alt unlit](/documentation/readme/sound/alt_unlit.png) ![alt lit](/documentation/readme/sound/alt_lit.png) | If this is lit, you need to hold alt in order to play the sound. |
| ![loop unlit](/documentation/readme/sound/loop_unlit.png) ![loop lit](/documentation/readme/sound/loop_lit.png) | Toggles between restarting the sound in a playing state when it is done. |
| ![return unlit](/documentation/readme/sound/return_unlit.png) ![return lit](/documentation/readme/sound/return_lit.png) | Toggles between returning to the start of the sound and staying paused when playing stops. This includes if you pause the sound by, for example, letting go of the key while hold is toggled on. |
| ![seek bar](/documentation/readme/sound/seek_bar.png) | This is the progress of the sound. Clicking or dragging in here will seek to that point in the sound file. |
| ![grip](/documentation/readme/sound/grip.png) | This is a grip there are two of them and they start at the start and end of the seek bar. You can grab and drag this to force the sound to start and end at different points in the song. |