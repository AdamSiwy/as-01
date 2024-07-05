# AS-01
Virtual AS-01 Synthesizer

Der AS-01 ist ein polyphoner virtueller Synthesizer, den Du direkt über dein Browserfenster spielen kannst. Die zwei Oscillatoren können zwischen den Typen:
* 'sine'
* 'square'
* 'sawtooth'
* 'triangle'
geschaltet werden.
  
![grafik](https://github.com/AdamSiwy/as-01/assets/30761117/d62a3ba6-6dec-46bc-8588-aa82fa8f18f8)

## 3 Spielarten
Maus
Klicke auf das virtuelle Keyboard. Mit der Maus kannst du monophon und mit dem Touchscreen polyphon spielen.
Tastatur
Benutze die Tastatur: A-S-D-F-G-H-J-K-L-Ö - you get it.
MIDI-Device
Schließe ein MIDI-Device an, gewähre Zugriff im Browser und spiel' los.

## Hintergrund
Der *AS-01* ist ein experimenteller Synthesizer, um mit den Webtechnologien createOscillator (https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createOscillator), Tastatureingabe (keydown-event), MIDIMessageEvent (https://developer.mozilla.org/en-US/docs/Web/API/MIDIMessageEvent/MIDIMessageEvent) sowie Canvas Annimationen (https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) zu experimentieren.

## Version 0.1.0
*2 Oscillatoren OSC1 & OSC2
*1 Detuner für OSC2
*Auswahl zwischen vier Wave-Formen
*Tastatureingabe
*MIDI-Device Eingabe
*Oktave C4 bis E5
