function germanNote(note) {
	switch (note) {
		case "B#": return "H#";
		case "B♯": return "H♯";
		case "B": return "H";
		case "Bb": return "B";
		case "B♭": return "B";
	}
	return note;
}

function translateChord(chordString, jazzchords, germanAlphabet) {
	//Define characters used for melodeon tablature annotation
	var aMelodeonAnnotation = new Array;
	aMelodeonAnnotation.push("<");
	aMelodeonAnnotation.push(">");
	aMelodeonAnnotation.push(".");
	aMelodeonAnnotation.push(":");
	aMelodeonAnnotation.push(";");

	var lines = chordString.split("\n");
	for (let i = 0; i < lines.length; i++) {
		let chord = lines[i];
		
		//Remove melodeon tablature push/pull and row annotation
		for (let e = 0; e < aMelodeonAnnotation.length; ++e) {
			let Index = chord.indexOf(aMelodeonAnnotation[e]);
			if (Index >= 0) {
				chord = chord.substring(0, Index) + chord.substring(Index+1);
			}
		}
		
		// If the chord isn't in a recognizable format then just skip it.
		let reg = chord.match(/^([ABCDEFG][♯♭]?)?([^\/]+)?(\/([ABCDEFG][#b♯♭]?))?/);
		if (!reg) {
			continue;
		}
		let baseChord = reg[1] || "";
		let modifier = reg[2] || "";
		let bassNote = reg[4] || "";
		if (germanAlphabet) {
			baseChord = germanNote(baseChord);
			bassNote = germanNote(bassNote);
		}
		// This puts markers in the pieces of the chord that are read by the svg creator.
		// After the main part of the chord (the letter, a sharp or flat, and "m") a marker is added. Before a slash a marker is added.
		const marker = jazzchords ? "\x03" : "";
		const bass = bassNote ? "/" + bassNote : "";
		lines[i] = [baseChord, modifier, bass].join(marker);
	}
	return lines.join("\n");
}

module.exports = translateChord;
