// Version 0.1 by Adam A. Siwy

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const noteFrequencies = {
    60: 'C4', 61: 'C#4', 62: 'D4', 63: 'D#4', 64: 'E4',
    65: 'F4', 66: 'F#4', 67: 'G4', 68: 'G#4', 69: 'A4',
    70: 'A#4', 71: 'B4', 72: 'C5', 73: 'C#5', 74: 'D5',
    75: 'D#5', 76: 'E5'
};

const frequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
    'D#5': 622.25, 'E5': 659.25
};

const keyBindings = {
    'a': 60, 'w': 61, 's': 62, 'e': 63, 'd': 64, 'f': 65,
    't': 66, 'g': 67, 'z': 68, 'h': 69, 'u': 70, 'j': 71,
    'k': 72, 'o': 73, 'l': 74, 'p': 75, 'ö': 76
};

let currentOscillators = {};
let currentOscillators2 = {};

const waveforms = ['sine', 'square', 'sawtooth', 'triangle'];
let currentWaveformIndex = 0;
let currentWaveformIndex2 = 0;
let osc2Enabled = false;
let detuneValue = 0;

const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.fftSize;
const dataArray = new Uint8Array(bufferLength);

const canvas = document.getElementById('oscilloscope');
const canvasCtx = canvas.getContext('2d');

document.getElementById('toggle-waveform').addEventListener('click', () => {
    currentWaveformIndex = (currentWaveformIndex + 1) % waveforms.length;
    document.getElementById('waveform-label').innerText = `Current Waveform OSC1: ${waveforms[currentWaveformIndex]}`;
});

document.getElementById('toggle-osc2').addEventListener('click', () => {
    osc2Enabled = !osc2Enabled;
    document.getElementById('toggle-osc2').innerText = osc2Enabled ? 'OSC2 Deaktivieren' : 'OSC2 Aktivieren';
    document.getElementById('toggle-waveform-osc2').style.display = osc2Enabled ? 'inline' : 'none';
    document.getElementById('waveform-label-osc2').style.display = osc2Enabled ? 'inline' : 'none';
    document.getElementById('detune-osc2').style.display = osc2Enabled ? 'inline' : 'none';
    document.getElementById('detune-value').style.display = osc2Enabled ? 'inline' : 'none';
});

document.getElementById('toggle-waveform-osc2').addEventListener('click', () => {
    currentWaveformIndex2 = (currentWaveformIndex2 + 1) % waveforms.length;
    document.getElementById('waveform-label-osc2').innerText = `Current Waveform OSC2: ${waveforms[currentWaveformIndex2]}`;
});

document.getElementById('detune-osc2').addEventListener('input', (event) => {
    detuneValue = parseInt(event.target.value);
    document.getElementById('detune-value').innerText = `Detune OSC2: ${detuneValue} cents`;

    // Update detune value for currently active oscillators
    if (osc2Enabled) {
        for (let osc in currentOscillators2) {
            currentOscillators2[osc].detune.setValueAtTime(detuneValue, audioContext.currentTime);
        }
    }
});

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('mousedown', () => {
        const note = key.dataset.note;
        const midiNumber = getMIDINumber(note);
        startNoteFromMouse(midiNumber);
    });
    key.addEventListener('mouseup', stopNoteFromMouse);
    key.addEventListener('mouseleave', stopNoteFromMouse);
});

document.addEventListener('keydown', (event) => {
    if (keyBindings[event.key]) {
        startNoteFromKeyboard(keyBindings[event.key]);
    }
});

document.addEventListener('keyup', (event) => {
    if (keyBindings[event.key]) {
        stopNoteFromKeyboard(keyBindings[event.key]);
    }
});

function startNoteFromMouse(midiNumber) {
    startNote(midiNumber);
    highlightKey(midiNumber);
}

function stopNoteFromMouse() {
    stopAllNotes();
    unhighlightAllKeys();
}

function startNoteFromKeyboard(midiNumber) {
    startNote(midiNumber);
    highlightKey(midiNumber);
}

function stopNoteFromKeyboard(midiNumber) {
    stopNote(midiNumber);
    unhighlightKey(midiNumber);
}

function startNote(midiNumber) {
    if (currentOscillators[midiNumber]) return;

    const note = noteFrequencies[midiNumber];
    const frequency = frequencies[note];
    if (!frequency) return; // Guard clause to ensure frequency is valid

    const oscillator = audioContext.createOscillator();
    oscillator.type = waveforms[currentWaveformIndex];
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.connect(analyser); // Connect gainNode to analyser

    oscillator.start();
    currentOscillators[midiNumber] = oscillator;

    if (osc2Enabled) {
        const oscillator2 = audioContext.createOscillator();
        oscillator2.type = waveforms[currentWaveformIndex2];
        oscillator2.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator2.detune.setValueAtTime(detuneValue, audioContext.currentTime); // Detune

        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        gainNode2.connect(analyser); // Connect gainNode2 to analyser

        oscillator2.start();
        currentOscillators2[midiNumber] = oscillator2;
    }
}

function stopNote(midiNumber) {
    if (currentOscillators[midiNumber]) {
        currentOscillators[midiNumber].stop();
        delete currentOscillators[midiNumber];
    }
    if (osc2Enabled && currentOscillators2[midiNumber]) {
        currentOscillators2[midiNumber].stop();
        delete currentOscillators2[midiNumber];
    }
}

function stopAllNotes() {
    for (let midiNumber in currentOscillators) {
        currentOscillators[midiNumber].stop();
        delete currentOscillators[midiNumber];
    }
    if (osc2Enabled) {
        for (let midiNumber in currentOscillators2) {
            currentOscillators2[midiNumber].stop();
            delete currentOscillators2[midiNumber];
        }
    }
}

function highlightKey(midiNumber) {
    const note = noteFrequencies[midiNumber];
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if (key) {
        key.classList.add('highlight');
    }
}

function unhighlightKey(midiNumber) {
    const note = noteFrequencies[midiNumber];
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if (key) {
        key.classList.remove('highlight');
    }
}

function unhighlightAllKeys() {
    document.querySelectorAll('.key.highlight').forEach(key => {
        key.classList.remove('highlight');
    });
}

function getMIDINumber(noteName) {
    return parseInt(Object.keys(noteFrequencies).find(key => noteFrequencies[key] === noteName));
}

// MIDI integration
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    console.log("Web MIDI API is not supported in this browser.");
}

function onMIDISuccess(midiAccess) {
    const inputs = midiAccess.inputs.values();

    for (let input of inputs) {
        input.onmidimessage = handleMIDIMessage;
        console.log(`MIDI-Gerät angeschlossen: ${input.name}`);
        displayMessage(`MIDI-Gerät angeschlossen: ${input.name}`);
    }

    midiAccess.onstatechange = (event) => {
        const port = event.port;
        if (port.type === "input" && port.state === "connected") {
            console.log(`MIDI-Gerät verbunden: ${port.name}`);
            displayMessage(`MIDI-Gerät verbunden: ${port.name}`);
        } else if (port.type === "input" && port.state === "disconnected") {
            console.log(`MIDI-Gerät getrennt: ${port.name}`);
            displayMessage(`MIDI-Gerät getrennt: ${port.name}`);
        }
    };
}

function onMIDIFailure() {
    console.log("Zugriff auf MIDI-Geräte fehlgeschlagen.");
    displayMessage("Zugriff auf MIDI-Geräte fehlgeschlagen.");
}

function handleMIDIMessage(event) {
    const [command, note, velocity] = event.data;

    if (command === 144 && velocity > 0) { // Note on
        startNoteFromKeyboard(note);
        highlightKey(note);
        console.log(`Note on: ${note} (Velocity: ${velocity})`);
        displayMessage(`Note on: ${note} (Velocity: ${velocity})`);
    } else if (command === 128 || (command === 144 && velocity === 0)) { // Note off
        stopNoteFromKeyboard(note);
        unhighlightKey(note);
        console.log(`Note off: ${note}`);
        displayMessage(`Note off: ${note}`);
    } else {
        console.log(`Unbekannter MIDI-Befehl: ${command}`);
        displayMessage(`Unbekannter MIDI-Befehl: ${command}`);
    }
}

function displayMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = v * canvas.height / 2;

        if(i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

draw();
