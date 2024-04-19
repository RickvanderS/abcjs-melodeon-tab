// Load one mp3 file for one note.
// url = the base url for the soundfont
// instrument = the instrument name (e.g. "acoustic_grand_piano")
// name = the pitch name (e.g. "A3")
var soundsCache = require("./sounds-cache");

var getNote = function (url, instrument, name, audioContext) {
	if (!soundsCache[instrument]) soundsCache[instrument] = {};
	var instrumentCache = soundsCache[instrument];

	if (!instrumentCache[name])
		instrumentCache[name] = new Promise(function (resolve, reject) {
			//For melodeon, create the notes here instead of loading them from URL
			if (instrument.startsWith("melodeon_")) {
				genMelodeonNote(instrument, name, audioContext, resolve, reject);
				return;
			}
			
			var xhr = new XMLHttpRequest();
			let noteUrl = url + instrument + "-mp3/" + name + ".mp3";
			xhr.open("GET", noteUrl, true);
			xhr.responseType = "arraybuffer";
			xhr.onload = function () {
				if (xhr.status !== 200) {
					reject(Error("Can't load sound at " + noteUrl + ' status=' + xhr.status));
					return
				}
				var noteDecoded = function(audioBuffer) {
					resolve({instrument: instrument, name: name, status: "loaded", audioBuffer: audioBuffer})
				}
				var maybePromise = audioContext.decodeAudioData(xhr.response, noteDecoded, function () {
					reject(Error("Can't decode sound at " + noteUrl));
				});
				// In older browsers `BaseAudioContext.decodeAudio()` did not return a promise
				if (maybePromise && typeof maybePromise.catch === "function") maybePromise.catch(reject);
			};
			xhr.onerror = function () {
				reject(Error("Can't load sound at " + noteUrl));
			};
			xhr.send();
		})
			.catch(err => {
				console.error("Didn't load note", instrument, name, ":", err.message);
				throw err;
			});

	return instrumentCache[name];
};

function genMelodeonNote(instrument, name, audioContext, resolve, reject) {
	//Get user configuration from window global variables
	//TODO: Hack
	var Cents  = window.g_Cents;
	var FadeIn = window.g_FadeIn;
	if (typeof(Cents) == "undefined")
		Cents = 5;
	if (typeof(FadeIn) == "undefined")
		FadeIn = 10;
	
	//Get tone and octabe from the note name
	var Tone   = name.substr(0, name.length - 1);
	var Octave = name.substr(name.length - 1);
	var ToneIndex = 0;
	switch (Tone) {
		case "C":
			ToneIndex = 0;
			break;
		case "C#":
		case "Db":
			ToneIndex = 1;
			break;
		case "D":
			ToneIndex = 2;
			break;
		case "D#":
		case "Eb":
			ToneIndex = 3;
			break;
		case "E":
			ToneIndex = 4;
			break;
		case "F":
			ToneIndex = 5;
			break;
		case "F#":
		case "Gb":
			ToneIndex = 6;
			break;
		case "G":
			ToneIndex = 7;
			break;
		case "G#":
		case "Ab":
			ToneIndex = 8;
			break;
		case "A":
			ToneIndex = 9;
			break;
		case "A#":
		case "Bb":
			ToneIndex = 10;
			break;
		case "B":
			ToneIndex = 11;
			break;
		
	}
	
	//Lookup and calculate the frequency
	var aFreq4 = new Array(261.626, 277.183, 293.665, 311.127, 329.628, 349.228, 369.994, 391.995, 415.305, 440, 466.164, 493.883);
	var Frequency = aFreq4[ToneIndex];
	Frequency = Frequency / Math.pow(2, 4-Octave);
	
	//Configure the reeds based on the instrument selection
	var ReedCount  = 0;
	var Reed2Cents = 0;
	var Reed3Cents = 0;
	var Reed3Freq  = Frequency;
	var Reed4Freq  = Frequency;
	switch (instrument.replace("melodeon_", "")) {
		case "M":
			ReedCount = 1;
			break;
		case "MM+":
			ReedCount  = 2;
			Reed2Cents = +Cents;
			break;
		case "MM-":
			ReedCount  = 2;
			Reed2Cents = -Cents;
			break;
		case "LMM+":
			ReedCount  = 3;
			Reed2Cents = +Cents;
			Reed3Freq  = Frequency / 2;
			break;
		case "LMM-":
			ReedCount  = 3;
			Reed2Cents = -Cents;
			Reed3Freq  = Frequency / 2;
			break;
		case "MM-M+":
			ReedCount = 3;
			Reed2Cents = -Cents;
			Reed3Cents = +Cents;
			break;
		case "LMM+H":
			ReedCount  = 4;
			Reed2Cents = +Cents;
			Reed3Freq  = Frequency / 2;
			Reed4Freq  = Frequency * 2;
			break;
		case "LMM-H":
			ReedCount  = 4;
			Reed2Cents = -Cents;
			Reed3Freq  = Frequency / 2;
			Reed4Freq  = Frequency * 2;
			break;
		case "LMM-M+":
			ReedCount  = 4;
			Reed2Cents = -Cents;
			Reed3Cents = +Cents;
			Reed4Freq  = Frequency / 2;
			break;
		case "basschord":
			ReedCount = 1;
			break;
	}
	
	//Audio rendered to buffer
	var OfflineAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
	var offlineCtx = new OfflineAC(2, 10 * audioContext.sampleRate, audioContext.sampleRate);
	
	//Level the gain to the same volume, no matter the amount of reeds and harmonics
	const HarmonicCount = 5;
	var   GainSum = 0.0;
	for (let ReedIndex = 1; ReedIndex <= ReedCount; ++ReedIndex) {
		for (let HarmonicIndex = 1; HarmonicIndex <= HarmonicCount; ++HarmonicIndex) {
			let HarmGain = 1 / Math.pow(2, HarmonicIndex);
			GainSum += HarmGain;
		}
	}
	GainLimit = 1.0 / GainSum;
	
	//Further reduce the gain, webkit browser had clipping without this due to multiple notes being played at the same time (Firefox was ok)
	GainLimit = GainLimit / 16;
	console.log(GainLimit);
	
	//For every reed
	for (let ReedIndex = 1; ReedIndex <= ReedCount; ++ReedIndex) {
		let ReedFreq  = Frequency;
		let ReedCents = 0;
		switch (ReedIndex) {
			case 2:
				ReedCents = Reed2Cents;
				break;
			case 3:
				ReedFreq  = Reed3Freq;
				ReedCents = Reed3Cents;
				break;
			case 4:
				ReedFreq  = Reed4Freq;
				break;
		}
		
		//For all harmonics
		for (let HarmonicIndex = 1; HarmonicIndex <= HarmonicCount; ++HarmonicIndex) {
			let HarmFreq = ReedFreq * HarmonicIndex;
			let HarmGain = GainLimit / Math.pow(2, HarmonicIndex);
			
			//Create oscillator with frequency and detuning
			var Osc = new OscillatorNode(offlineCtx,
				{
					type     : "sine",
					detune   : ReedCents,
					frequency: HarmFreq,
				}
			);
			
			//Create fade in (fade out is handled later based on duration of the note)
			var Gain = new GainNode(offlineCtx,
				{
					gain: 0
				}
			);
			Gain.gain.setTargetAtTime(HarmGain, offlineCtx.currentTime, FadeIn / 1000);
			
			//Connect the graph
			Gain.connect(offlineCtx.destination);
			Osc.connect(Gain);
			Osc.start();
		}
	}
	
	//Render the note to an audioBuffer
	offlineCtx.startRendering()
	.then((renderedBuffer) => {
		resolve({instrument: instrument, name: name, status: "loaded", audioBuffer: renderedBuffer});
	})
}

module.exports = getNote;
