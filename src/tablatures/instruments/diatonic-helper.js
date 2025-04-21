var transposeChordName = require("../../parse/transpose-chord")
var allNotes = require('../../parse/all-notes');

/// C'tor
function DiatonicHelper() {
	this.TransposeLookup = this.CreateTransposeLookup();
}

/// Create and return lookup table for note transposition
DiatonicHelper.prototype.CreateTransposeLookup = function() {
	let TransposeLookup = new Array();
	for (let i = 0; i < 7 * 8; ++i) {
		noteName = allNotes.noteName(i);
		TransposeLookup.push(noteName);
		
		note = allNotes.noteName(i).toLowerCase()[0];
		if (note == 'c' || note == 'd' || note == 'f' || note == 'g' || note == 'a') {
			NextNoteName = allNotes.noteName(i+1);
			TransposeLookup.push("^" + noteName);
		}
	}
	return TransposeLookup;
}

/// Transpose specified note by the specified number of half steps
DiatonicHelper.prototype.TransposeNote = function(noteName, TransposeHalfSteps) {
	//Empty in empty out
	if (noteName.length == 0)
		return "";
	
	//Normalize the name for the lookup
	noteName = this.NoteNameNormalize(noteName);
	
	//No lookup required if there is nothing to transpose
	if (TransposeHalfSteps == 0)
		return noteName;
	
	//Lookup the note in the table
	let FoundIndex;
	for (let i = 0; i < this.TransposeLookup.length; ++i) {
		if (this.TransposeLookup[i] == noteName)
			FoundIndex = i;
	}
	
	//Transpose it
	let TransposeIndex = FoundIndex + TransposeHalfSteps;
	if (0 <= TransposeIndex && TransposeIndex <= this.TransposeLookup.length)
		return this.TransposeLookup[TransposeIndex];
	
	console.log("Transpose error");
	return "";
}

/// Normalize note octave notation and make it natural or sharp, but not flat
DiatonicHelper.prototype.NoteNameNormalize = function(NoteName) {
	//Check lowercase high note
	if (NoteName == NoteName.toLowerCase()) {
		//Convert to upper case note if it has a lower octave symbol
		let LowerIndex = NoteName.indexOf(",");
		if (LowerIndex >= 0) {
			NoteName = NoteName.slice(0, LowerIndex) + NoteName.slice(LowerIndex + 1, NoteName.length);
			NoteName = NoteName.toUpperCase();
		}
	}
	//Check uppercase low note
	else if (NoteName == NoteName.toUpperCase()) {
		//Convert to lower case note if it has a higher octave symbol
		let HigherIndex = NoteName.indexOf("'");
		if (HigherIndex >= 0) {
			NoteName = NoteName.slice(0, HigherIndex) + NoteName.slice(HigherIndex + 1, NoteName.length);
			NoteName = NoteName.toLowerCase();
		}
	}
	
	//Normalize to natural of single #
	let DoubleSharpIndex = NoteName.indexOf("^^");
	let DoubleFlatIndex  = NoteName.indexOf("__");
	let FlatIndex        = NoteName.indexOf("_");
	let TransposeHalfSteps = 0;
	if (DoubleSharpIndex >= 0) {
		NoteName = NoteName.slice(DoubleSharpIndex + 2);
		TransposeHalfSteps = 2;
	}
	else if (DoubleFlatIndex >= 0) {
		NoteName = NoteName.slice(DoubleFlatIndex + 2);
		TransposeHalfSteps = -2;
	}
	else if (FlatIndex >= 0) {
		NoteName = NoteName.slice(FlatIndex + 1);
		TransposeHalfSteps = -1;
	}
	
	//Transpose by the number of steps
	if (TransposeHalfSteps != 0)
		NoteName = this.TransposeNote(NoteName, TransposeHalfSteps);
	
	return NoteName;
}

DiatonicHelper.prototype.TransposeConditional = function(Row, Note, TransposeHalfSteps) {
	Note = Note.replace(",", "");
	Note = Note.replace("'", "");
	Note = Note.toLowerCase();
	for (let i = 0; i < Row.length; ++i) {
		let Tmp = Row[i];
		Tmp = Tmp.replace(",", "");
		Tmp = Tmp.replace("'", "");
		Tmp = Tmp.toLowerCase();
		
		if (Note == Tmp) {
			let Tmp2 = this.TransposeNote(Row[i], TransposeHalfSteps);
			Row[i] = Tmp2;
		}
	}
}

DiatonicHelper.prototype.TransposeChordArray = function(aBassChords, TransposeHalfSteps) {
	for (let i = 0; i < aBassChords.length; ++i) {
		aBassChords[i] = transposeChordName(aBassChords[i], TransposeHalfSteps, true, true);
	}
}

DiatonicHelper.prototype.GetChordNotes = function(ChordName, ForceSharp) {
	let aAllSharp = new Array();
	aAllSharp.push( "C,,");
	aAllSharp.push("^C,,");
	aAllSharp.push( "D,,");
	aAllSharp.push("^D,,");
	aAllSharp.push( "E,,");
	aAllSharp.push( "F,,");
	aAllSharp.push("^F,,");
	aAllSharp.push( "G,,");
	aAllSharp.push("^G,,");
	aAllSharp.push( "A,,");
	aAllSharp.push("^A,,");
	aAllSharp.push( "B,,");
	aAllSharp.push( "C,");
	aAllSharp.push("^C,");
	aAllSharp.push( "D,");
	aAllSharp.push("^D,");
	aAllSharp.push( "E,");
	aAllSharp.push( "F,");
	aAllSharp.push("^F,");
	aAllSharp.push( "G,");
	aAllSharp.push("^G,");
	aAllSharp.push( "A,");
	aAllSharp.push("^A,");
	aAllSharp.push( "B,");
	let aAllFlat = new Array();
	aAllFlat.push( "C,,");
	aAllFlat.push("_D,,");
	aAllFlat.push( "D,,");
	aAllFlat.push("_E,,");
	aAllFlat.push( "E,,");
	aAllFlat.push( "F,,");
	aAllFlat.push("_G,,");
	aAllFlat.push( "G,,");
	aAllFlat.push("_A,,");
	aAllFlat.push( "A,,");
	aAllFlat.push("_B,,");
	aAllFlat.push( "B,,");
	aAllFlat.push( "C,");
	aAllFlat.push("_D,");
	aAllFlat.push( "D,");
	aAllFlat.push("_E,");
	aAllFlat.push( "E,");
	aAllFlat.push( "F,");
	aAllFlat.push("_G,");
	aAllFlat.push( "G,");
	aAllFlat.push("_A,");
	aAllFlat.push( "A,");
	aAllFlat.push("_B,");
	aAllFlat.push( "B,");
	
	let BassSearch = ChordName[0];
	if (ChordName.length > 1) {
		if (ChordName[1] == "#")
			BassSearch = "^" + BassSearch[0];
		else if (ChordName[1] == "b")
			BassSearch = "_" + BassSearch[0];
	}
	
	let UseFlat = false;
	let BassIndex = 0;
	for (; BassIndex < aAllSharp.length; ++BassIndex) {
		if (aAllSharp[BassIndex].startsWith(BassSearch))
			break;
		else if (aAllFlat[BassIndex].startsWith(BassSearch)) {
			UseFlat = true;
			break;
		}
	}
	if (ChordName[0] == "G")
		UseFlat = true;
	
	if (ForceSharp)
		UseFlat = false;
	
	if (BassIndex >= aAllSharp.length)
		return "";
	
	
	let aChordNotes = new Array();
	//Major chord
	let Index1 = BassIndex + 0;
	let Index2 = BassIndex + 4;
	let Index3 = BassIndex + 7;
	//Minor chord
	if (ChordName.indexOf("m") >= 0)
		Index2 = BassIndex + 3;
	
	if (!UseFlat) {
		aChordNotes.push(aAllSharp[Index1]);
		aChordNotes.push(aAllSharp[Index2]);
		aChordNotes.push(aAllSharp[Index3]);
	}
	else {
		aChordNotes.push(aAllFlat[Index1]);
		aChordNotes.push(aAllFlat[Index2]);
		aChordNotes.push(aAllFlat[Index3]);
	}
	
	if (ChordName.indexOf("m7") >= 0) {
		let Index4 = BassIndex + 10;
		if (!UseFlat)
			aChordNotes.push(aAllSharp[Index4]);
		else
			aChordNotes.push(aAllFlat[Index4]);
	}
	
	return aChordNotes;
}

/// Return Xm7 cross-bass chords for chords in the same direction
DiatonicHelper.prototype.FindCrossBassChords = function(aDirChords) {
	let aCrossChords = new Array();
	
	for (let i = 0; i < aDirChords.length; ++i) {
		//Skip minor chords, they are already minor, so no need for a m7
		if (aDirChords[i].indexOf("m") >= 0)
			continue;
		
		let CrossChordName = aDirChords[i] + "m7";
		
		//Get the notes for the potential Xm7 chord
		let aChordM7Notes = this.GetChordNotes(CrossChordName, true);
		
		//See if there is a chord with matching notes (except for the bass)
		for (let j = 0; j < aDirChords.length; ++j) {
			let aChordNotes = this.GetChordNotes(aDirChords[j], true);
			
			let Match = true;
			for (n = 1; n < aChordM7Notes.length; ++n) {
				let len = aChordM7Notes[n].length;
				if (aChordNotes[n-1].length < len)
					len = aChordNotes[n-1].length;
				
				if (aChordM7Notes[n].substr(0, len) != aChordNotes[n-1].substr(0, len)) {
					Match = false;
					break;
				}
			}
			
			if (Match)
				aCrossChords.push(CrossChordName + " " + aDirChords[j]);
		}
	}
	
	//Remove duplicates
	aCrossChords = aCrossChords.filter(function(elem, index, self) {
	return index === self.indexOf(elem);
	})
	
	return aCrossChords;
}

module.exports = DiatonicHelper;