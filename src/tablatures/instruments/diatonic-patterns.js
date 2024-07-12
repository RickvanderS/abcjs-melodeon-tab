var StringPatterns = require('./string-patterns');
var TabNote = require('./tab-note');
var transposeChordName = require("../../parse/transpose-chord")
var allNotes = require('../../parse/all-notes');

function TransposeChordArray(aBassChords, TransposeHalfSteps) {
	for (let i = 0; i < aBassChords.length; ++i) {
		aBassChords[i] = transposeChordName(aBassChords[i], TransposeHalfSteps, true, true);
	}
}

function GetChordNotes(ChordName, ForceSharp) {
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
function FindCrossBassChords(aDirChords) {
	let aCrossChords = new Array();
	
	for (let i = 0; i < aDirChords.length; ++i) {
		//Skip minor chords
		if (aDirChords[i].indexOf("m") >= 0)
			continue;
		
		let CrossChordName = aDirChords[i] + "m7";
		
		//Get the notes for the potential Xm7 chord
		let aChordM7Notes = GetChordNotes(CrossChordName, true);
		
		//See if there is a chord with matching notes (except for the bass)
		for (let j = 0; j < aDirChords.length; ++j) {
			let aChordNotes = GetChordNotes(aDirChords[j], true);
			
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

function DecodeRowInfo(TuningString) {
	let Buttons = parseInt(TuningString.substring(0, 2));
	let Key     = TuningString.replace(/[0-9]/g, '');
	Key = Key.replaceAll("^", "");
	Key = Key.replaceAll(">", "");
	Key = Key.replaceAll("~", "");
	let Acc       = TuningString.includes("^");
	let Start     = TuningString.includes(">") ? 4 : 3;
	let Harmonica = TuningString.includes("~");
	
	aInvert = new Array();
	for (let i = TuningString.length - 1; i >= 0; --i) {
		if ('0' <= TuningString[i] && TuningString[i] <= '9')
			aInvert.push(TuningString[i]);
		else
			break;
	}
	
	return {
		Buttons   : Buttons,
		Key       : Key    ,
		Acc       : Acc    ,
		Start     : Start  ,
		Harmonica : Harmonica,
		aInvert   : aInvert
	}
}

function LoadRowD(aOutPush, aOutPull, RowInfo) {
	if (isNaN(RowInfo.Buttons))
		RowInfo.Buttons = 12;
	
	//Define D row
	aOutPush.push("^F,,"); // 1_
	aOutPull.push("A,,");
	aOutPush.push("A,,"); // 2_
	aOutPull.push("^C,");
	aOutPush.push("D,"); // 3_
	aOutPull.push("E,");
	aOutPush.push("^F,"); // 4_
	aOutPull.push("G,");
	aOutPush.push("A,"); // 5_
	aOutPull.push("B,");
	aOutPush.push("D"); // 6_
	aOutPull.push("^C");
	aOutPush.push("^F"); // 7_
	aOutPull.push("E");
	aOutPush.push("A"); // 8_
	aOutPull.push("G");
	aOutPush.push("d"); // 9_
	aOutPull.push("B");
	aOutPush.push("^f"); // 10_
	aOutPull.push("^c");
	aOutPush.push("a"); // 11_
	aOutPull.push("e");
	aOutPush.push("d'"); // 12_
	aOutPull.push("g");
	
	//Remove buttons not required
	while (aOutPush.length > RowInfo.Buttons) {
		aOutPush.splice(aOutPush.length-1, 1);
		aOutPull.splice(aOutPull.length-1, 1);
	}
	
	//Override accidental button
	if (RowInfo.Acc) {
		aOutPush[0] = "^G,"; // 0 or 1
		aOutPull[0] = "_B,";
	}
}

function LoadRowG(aOutPush, aOutPull, RowInfo) {
	if (isNaN(RowInfo.Buttons))
		RowInfo.Buttons = 11;
	
	//Define G row
	if (RowInfo.Buttons == 12 || RowInfo.Start == 4) {
		aOutPush.push("G,,"); // 0
		aOutPull.push("C,");
	}
	aOutPush.push("B,,"); // 1
	aOutPull.push("D," );
	aOutPush.push("D," ); // 2
	aOutPull.push("^F,");
	aOutPush.push("G," ); // 3
	aOutPull.push("A," );
	aOutPush.push("B," ); // 4
	aOutPull.push("C"  );
	aOutPush.push("D"  ); // 5
	aOutPull.push("E"  );
	aOutPush.push("G"  ); // 6
	aOutPull.push("^F" );
	aOutPush.push("B"  ); // 7
	aOutPull.push("A"  );
	aOutPush.push("d"  ); // 8
	aOutPull.push("c"  );
	aOutPush.push("g"  ); // 9
	aOutPull.push("e"  );
	aOutPush.push("b"  ); // 10
	aOutPull.push("^f" );
	aOutPush.push("d'" ); // 11
	aOutPull.push("a"  );
	
	//Remove buttons not required
	while (aOutPush.length > RowInfo.Buttons) {
		aOutPush.splice(aOutPush.length-1, 1);
		aOutPull.splice(aOutPull.length-1, 1);
	}
	
	//Override accidental button
	if (RowInfo.Acc) {
		aOutPush[0] = "^C"; // 0 or 1
		aOutPull[0] = "_E";
	}
}

function LoadRowC(aOutPush, aOutPull, RowInfo) {
	if (isNaN(RowInfo.Buttons))
		RowInfo.Buttons = 10;
	
	//Define C row
	if (RowInfo.Buttons == 11 || RowInfo.Start == 4) {
		aOutPush.push("C,"); // 0'
		aOutPull.push("F,");
	}
	aOutPush.push("E,"); // 1'
	aOutPull.push("G,");
	aOutPush.push("G,"); // 2'
	aOutPull.push("B,");
	aOutPush.push("C" ); // 3'
	aOutPull.push("D" );
	aOutPush.push("E" ); // 4'
	aOutPull.push("F" );
	aOutPush.push("G" ); // 5'
	aOutPull.push("A" );
	aOutPush.push("c" ); // 6'
	aOutPull.push("B" );
	aOutPush.push("e" ); // 7'
	aOutPull.push("d" );
	aOutPush.push("g" ); // 8'
	aOutPull.push("f" );
	aOutPush.push("c'"); // 9'
	aOutPull.push("a" );
	aOutPush.push("e'"); // 10'
	aOutPull.push("b" );
	
	//Remove buttons not required
	while (aOutPush.length > RowInfo.Buttons) {
		aOutPush.splice(aOutPush.length-1, 1);
		aOutPull.splice(aOutPull.length-1, 1);
	}
	
	//Override accidentals
	if (RowInfo.Acc) {
		aOutPush[0] = "_B"; // 0' or 1'
		aOutPull[0] = "^G";
	}
}

function DiatonicPatterns(plugin) {
  //Get tablature options
  this.showall = plugin._super.params.showall;
  if (this.showall == null)
    this.showall = false;
  this.showall_ignorechords = plugin._super.params.showall_ignorechords;
  if (this.showall_ignorechords === null)
    this.showall_ignorechords = false;
  this.Row2Marker = plugin._super.params.Row2Marker;
  if (this.Row2Marker == null)
    this.Row2Marker = "'";
  this.Row3Marker = plugin._super.params.Row3Marker;
  if (this.Row3Marker == null)
    this.Row3Marker = "\"";

	//Tablature style
	//0 hide
	//1 push/pull on one tab row
	//2 push and pull tab row
	//3 tab row per instrument row
	this.tabstyle = plugin._super.params.tabstyle;
	if (this.tabstyle == null)
		this.tabstyle = 2;

  this.changenoteheads = plugin._super.params.changenoteheads;
  if (this.changenoteheads == null)
    this.changenoteheads = false;

  //Set default tuning if not specified
  this.tuning = plugin._super.params.tuning;
  if (this.tuning == null) {
    this.tuning = new Array;
    this.tuning.push("G");
    this.tuning.push("C5");
    plugin.tuning = this.tuning;
  }
  
  //Set default chin accidentals of not specified
  this.startzero = plugin._super.params.startzero;
  if (this.startzero == null) {
    this.startzero = false;
    plugin.startzero = this.startzero;
  }
  
  //Define empty base rows (used for external access)
  this.BassRow1Push = new Array();
  this.BassRow1Pull = new Array();
  this.BassRow2Push = new Array();
  this.BassRow2Pull = new Array();
  this.BassRow3Push = new Array();
  this.BassRow3Pull = new Array();
  this.BassCrossPush = new Array();
  this.BassCrossPull = new Array();

  //Lookup melodeon notes
  let TransposeHalfSteps = 0;
  let Row1Info;
  let Row2Info;
  let Row3Info;
  this.push_chords = new Array;
  this.pull_chords = new Array;
  let push_row1 = new Array;
  let pull_row1 = new Array;
  let push_row2 = new Array;
  let pull_row2 = new Array;
  let push_row3 = new Array;
  let pull_row3 = new Array;
	if (this.tuning.length == 1) {
		Row1Info = DecodeRowInfo(this.tuning[0]);
		
		//1 row melodeon
		if (!Row1Info.Harmonica) {
			//For non-G figure out how to transpose
			if      (Row1Info.Key == "Bb" || Row1Info.Key == "A#")
				TransposeHalfSteps = -9;
			else if (Row1Info.Key == "B"                         )
				TransposeHalfSteps = -8;
			else if (Row1Info.Key == "C"                         )
				TransposeHalfSteps = -7;
			else if (Row1Info.Key == "Db" || Row1Info.Key == "C#")
				TransposeHalfSteps = -6;
			else if (Row1Info.Key == "D"                         )
				TransposeHalfSteps = -5;
			else if (Row1Info.Key == "Eb" || Row1Info.Key == "D#")
				TransposeHalfSteps = -4;
			else if (Row1Info.Key == "E"                         )
				TransposeHalfSteps = -3;
			else if (Row1Info.Key == "F"                         )
				TransposeHalfSteps = -2;
			else if (Row1Info.Key == "Gb" || Row1Info.Key == "F#")
				TransposeHalfSteps = -1;
			else if (Row1Info.Key == "G"                         )
				TransposeHalfSteps =  0;
			else if (Row1Info.Key == "Ab" || Row1Info.Key == "G#")
				TransposeHalfSteps =  1;
			else if (Row1Info.Key == "A"                         )
				TransposeHalfSteps =  2;
			else {
				console.error('1 row melodeon in key \'' + Row1Info.Key + '\' is not supported');
				return;
			}
			
			//Figure out the number of buttons
			let Row1Count = Row1Info.Buttons;
			if (isNaN(Row1Count))
				Row1Count = 10;
			let Mini = false;
			if (Row1Count != "") {
				var ButtonCount = Number(Row1Count);
				if (Row1Count == 10) {
				}
				else if (Row1Count == 7) {
					Mini = true;
				}
				else {
					console.error('1 row melodeon with tuning \'' + Row1Count + '\' buttons is not supported');
				}
			}
			
			//Define left hand chords for G melodeon with 4 base buttons
			this.BassRow1Push = new Array("G");
			this.BassRow1Pull = new Array("D");
			if (!Mini) {
				this.BassRow1Push.push("C");
				this.BassRow1Pull.push("C");
			}
			
			//Define right hand buttons for G melodeon
			if (!Mini) {
				push_row1.push("B,,"); // 1
				pull_row1.push("D," );
				push_row1.push("D," ); // 2
				pull_row1.push("^F,");
			}
			push_row1.push("G," ); // 3 (mini 1)
			pull_row1.push("A," );
			push_row1.push("B," ); // 4 (mini 2)
			pull_row1.push("C"  );
			push_row1.push("D"  ); // 5 (mini 3)
			pull_row1.push("E"  );
			push_row1.push("G"  ); // 6 (mini 4)
			pull_row1.push("^F" );
			push_row1.push("B"  ); // 7 (mini 5)
			pull_row1.push("A"  );
			push_row1.push("d"  ); // 8 (mini 6)
			pull_row1.push("c"  );
			if (!Mini) {
				push_row1.push("g"  ); // 9
				pull_row1.push("e"  );
				push_row1.push("b"  ); // 10
				pull_row1.push("^f" );
			}
			else {
				push_row1.push("^f"  ); // (mini 7)
				pull_row1.push("e"  );
			}
		}
		//1 row harmonica
		else {
			//For non-C figure out how to transpose
			if (Row1Info.Key == "G"                              )
				TransposeHalfSteps = -5;
			else if (Row1Info.Key == "Ab" || Row1Info.Key == "G#")
				TransposeHalfSteps = -4;
			else if (Row1Info.Key == "A"                         )
				TransposeHalfSteps = -3;
			else if (Row1Info.Key == "Bb" || Row1Info.Key == "A#")
				TransposeHalfSteps = -2;
			else if (Row1Info.Key == "B"                         )
				TransposeHalfSteps = -1;
			else if (Row1Info.Key == "C"                         )
				TransposeHalfSteps = 0;
			else if (Row1Info.Key == "Db" || Row1Info.Key == "C#")
				TransposeHalfSteps = 1;
			else if (Row1Info.Key == "D"                         )
				TransposeHalfSteps = 2;
			else if (Row1Info.Key == "Eb" || Row1Info.Key == "D#")
				TransposeHalfSteps = 3;
			else if (Row1Info.Key == "E"                         )
				TransposeHalfSteps = 4;
			else if (Row1Info.Key == "F"                         )
				TransposeHalfSteps = 5;
			else if (Row1Info.Key == "Gb" || Row1Info.Key == "F#")
				TransposeHalfSteps = 6;
			else {
				console.error('harmonica in key \'' + Row1Info.Key + '\' is not supported');
				return;
			}
			
			//C row
			push_row1.push("C"); // 1
			pull_row1.push("D");
			push_row1.push("E"); // 2
			pull_row1.push("G");
			push_row1.push("G"); // 3
			pull_row1.push("B");
			push_row1.push("c"); // 4
			pull_row1.push("d");
			push_row1.push("e"); // 5
			pull_row1.push("f");
			push_row1.push("g"); // 6
			pull_row1.push("a");
			push_row1.push("c'"); // 7
			pull_row1.push("b");
			push_row1.push("e'"); // 8
			pull_row1.push("d'");
			push_row1.push("g'"); // 9
			pull_row1.push("f'");
			push_row1.push("c''"); // 10
			pull_row1.push("a'");
			
			//C row half step bend
			push_row2.push(""); // 1'
			pull_row2.push("_D");
			push_row2.push(""); // 2'
			pull_row2.push("_G");
			push_row2.push(""); // 3'
			pull_row2.push("_B");
			push_row2.push(""); // 4'
			pull_row2.push("_d");
			push_row2.push(""); // 5'
			pull_row2.push("");
			push_row2.push(""); // 6'
			pull_row2.push("^a");
			push_row2.push(""); // 7'
			pull_row2.push("");
			push_row2.push("_e'"); // 8'
			pull_row2.push("");
			push_row2.push("_g'"); // 9'
			pull_row2.push("");
			push_row2.push("b'"); // 10'
			pull_row2.push("");
			
			//C row whole step bend
			push_row3.push(""); // 1"
			pull_row3.push("");
			push_row3.push(""); // 2"
			pull_row3.push("F");
			push_row3.push(""); // 3"
			pull_row3.push("A");
			push_row3.push(""); // 4"
			pull_row3.push("");
			push_row3.push(""); // 5"
			pull_row3.push("");
			push_row3.push(""); // 6"
			pull_row3.push("");
			push_row3.push(""); // 7"
			pull_row3.push("");
			push_row3.push(""); // 8"
			pull_row3.push("");
			push_row3.push(""); // 9"
			pull_row3.push("");
			push_row3.push("_b'"); // 10"
			pull_row3.push("");
			
			//C row 1.5 step bend
			//TODO: _A -> -3'''
		}
	}
	else if (this.tuning.length == 2 || this.tuning.length == 3) {
		//Decode row info strings
		Row1Info = DecodeRowInfo(this.tuning[0]);
		Row2Info = DecodeRowInfo(this.tuning[1]);
		if (this.tuning.length == 3)
			Row3Info = DecodeRowInfo(this.tuning[2]);
		
		//For non-G/C figure out how to transpose
		if      ((Row1Info.Key == "Eb" || Row1Info.Key == "D#") && (Row2Info.Key == "Ab" || Row2Info.Key == "G#")) //Very rare
			TransposeHalfSteps = -3;
		else if ((Row1Info.Key == "E"                         ) && (Row2Info.Key == "A"                         )) //Very rare
			TransposeHalfSteps = -3;
		else if ((Row1Info.Key == "F"                         ) && (Row2Info.Key == "Bb" || Row2Info.Key == "A#"))
			TransposeHalfSteps = -2;
		else if ((Row1Info.Key == "Gb" || Row1Info.Key == "F#") && (Row2Info.Key == "B"                         )) //Very rare
			TransposeHalfSteps = -1;
		else if ((Row1Info.Key == "G"                         ) && (Row2Info.Key == "C"                         )) //France, South America
			TransposeHalfSteps =  0;
		else if ((Row1Info.Key == "Ab" || Row1Info.Key == "G#") && (Row2Info.Key == "Db" || Row2Info.Key == "C#")) //Very rare
			TransposeHalfSteps =  1;
		else if ((Row1Info.Key == "A"                         ) && (Row2Info.Key == "D"                         )) //France
			TransposeHalfSteps =  2;
		else if ((Row1Info.Key == "Bb" || Row1Info.Key == "A#") && (Row2Info.Key == "Eb" || Row2Info.Key == "D#"))
			TransposeHalfSteps =  3;
		else if ((Row1Info.Key == "B"                         ) && (Row2Info.Key == "E"                         )) //Very rare
			TransposeHalfSteps =  4;
		else if ((Row1Info.Key == "C"                         ) && (Row2Info.Key == "F"                         )) //Netherlands, Germany
			TransposeHalfSteps =  5;
		else if ((Row1Info.Key == "Db" || Row1Info.Key == "C#") && (Row2Info.Key == "Gb" || Row2Info.Key == "F#")) //Very rare
			TransposeHalfSteps =  6;
		else if ((Row1Info.Key == "D"                         ) && (Row2Info.Key == "G"                         )) //England
			TransposeHalfSteps =  7;
		else {
			if (this.tuning.length == 2)
				console.error('2 row melodeon with row1 key \'' + Row1Info.Key + '\' and row2 key \'' + Row2Info.Key + '\' is not supported');
			else if (this.tuning.length == 3)
				console.error('3 row melodeon with row1 key \'' + Row1Info.Key + '\' and row2 key \'' + Row2Info.Key + '\' and row3 key \'' + Row3Info.Key + '\' is not supported');
			return;
		}
		
		//Define left hand chords for G/C melodeon with 8 base buttons
		this.BassRow1Push  = new Array("G", "C");
		this.BassRow1Pull  = new Array("D", "G");
		this.BassRow2Push  = new Array("E", "F");
		this.BassRow2Pull  = new Array("Am", "F");
		
		//Define right hand buttons for G/C melodeon
		LoadRowG(push_row1, pull_row1, Row1Info);
		LoadRowC(push_row2, pull_row2, Row2Info);
		
		//Lookup extra row3 by its special name
		if (this.tuning.length == 3) {
			let Row3Tuning = Row3Info.Key.toLowerCase();
			if (Row3Tuning == "hohner") {
				if (isNaN(Row3Info.Buttons))
					Row3Info.Buttons = 23; //Hohner Merlin
				
				//Define row 3
				push_row3.push("");
				pull_row3.push("");
				push_row3.push("");
				pull_row3.push("");
				push_row3.push("");
				pull_row3.push("");
				push_row3.push("_E"); //4"
				pull_row3.push("^C");
				push_row3.push("^G"); //5"
				pull_row3.push("_B");
				if (Row3Info.Buttons == 25) { //Hohner Galaad
					push_row3.push("_e"); //6"
					pull_row3.push("^c");
					push_row3.push("^g"); //7"
					pull_row3.push("_b");
					
					//Add bass chords
					this.BassRow1Push.splice(0, 0, "Ab");
					this.BassRow1Pull.splice(0, 0, "Bm");
					this.BassRow2Push.splice(0, 0, "Eb");
					this.BassRow2Pull.splice(0, 0, "Bb");
				}
			}
			else if (Row3Tuning == "club") {
				//Read the total number of melody buttons for the club layout
				if (isNaN(Row3Info.Buttons))
					Row3Info.Buttons = 33;
				if (Row3Info.Buttons != 33 && Row3Info.Buttons != 31 && Row3Info.Buttons != 30 && Row3Info.Buttons != 27 && Row3Info.Buttons != 25) {
					console.error('club layout with ' + Row3Info.Buttons + ' buttons is not supported');
					return;
				}
				
				if (Row3Info.Buttons != 25) {
					Row1Info.Buttons = 12;
					Row2Info.Buttons = 11;
					push_row1 = new Array();
					pull_row1 = new Array();
					push_row2 = new Array();
					pull_row2 = new Array();
					LoadRowG(push_row1, pull_row1, Row1Info);
					LoadRowC(push_row2, pull_row2, Row2Info);
				}
				
				//Update bass chords
				this.BassRow2Push[1] = "Bb";
				
				//Overwrite outside row
				if (Row3Info.Buttons == 33 || Row3Info.Buttons == 27) {
					push_row1[0] = "G,,"; // 0
					pull_row1[0] = "A,,";
				}
				else if (Row3Info.Buttons == 31 || Row3Info.Buttons == 30) {
					push_row1[0] = "^C,"; // 0
					pull_row1[0] = "_E,";
				}
				if (Row3Info.Buttons != 25) {
					push_row1[1]  = "B,,"; // 1
					pull_row1[1]  = "D,";
				}
				pull_row1[pull_row1.length-1] = "g";   //11
				
				//Overwrite middle row
				if (Row3Info.Buttons == 33 || Row3Info.Buttons == 27 || Row3Info.Buttons == 31 || Row3Info.Buttons == 30) {
					push_row2[0] = "C,"; // 0'
					pull_row2[0] = "F,";
				}
				if (Row3Info.Buttons != 25) {
					push_row2[1]  = "E,"; // 1'
					pull_row2[1]  = "G,";
				}
				if (Row3Info.Buttons != 25)
					pull_row2[5]  = "G";  // 5'
				else
					pull_row2[4]  = "G";  // 5'
				
				//Define inside row
				if (Row3Info.Buttons == 33) {
					push_row3.push("^C,"); //0"
					pull_row3.push("^D,");
				}
				else {
					push_row3.push(""); //0"
					pull_row3.push("");
				}
				if (Row3Info.Buttons == 33 || Row3Info.Buttons == 31) {
					push_row3.push("A,");  //1"
					pull_row3.push("_B,");
				}
				else {
					push_row3.push(""); //1"
					pull_row3.push("");	
				}
				if (Row3Info.Buttons == 33 || Row3Info.Buttons == 31 || Row3Info.Buttons == 30) {
					push_row3.push("_B,"); //2"
					pull_row3.push("^G,");
					push_row3.push("F");   //3"
					pull_row3.push("^C");
				}
				else {
					push_row3.push(""); //2"
					pull_row3.push("");
					push_row3.push(""); //3"
					pull_row3.push("");
				}
				push_row3.push("^C");  //4"
				pull_row3.push("_E");
				push_row3.push("_B");  //5"
				pull_row3.push("^G");
				push_row3.push("A");   //6"
				pull_row3.push("_B");
				push_row3.push("^c");  //7"
				pull_row3.push("_e");
				if (Row3Info.Buttons == 33 || Row3Info.Buttons == 31 || Row3Info.Buttons == 30) {
					push_row3.push("_b");  //8"
					pull_row3.push("^g");
				}
				if (Row3Info.Buttons == 33) {
					push_row3.push("a");   //9"
					pull_row3.push("_b");
				}
			}
			else if (Row3Tuning == "vanderaa") {
				//Add bass chords
				this.BassRow1Push.splice(0, 0, "G#");
				this.BassRow1Pull.splice(0, 0, "Bb");
				this.BassRow2Push.splice(0, 0, "B");
				this.BassRow2Pull.splice(0, 0, "F#");
				
				//TODO: Treble
				
			}
			else if (Row3Tuning == "saltarelle") {
				//Add bass chords
				this.BassRow1Push.splice(0, 0, "D");
				this.BassRow1Pull.splice(0, 0, "C");
				this.BassRow2Push.splice(0, 0, "Bm");
				this.BassRow2Pull.splice(0, 0, "Bb");
				
				//Reload rows with button 4 starts and the required number of buttons
				push_row1 = new Array();
				pull_row1 = new Array();
				push_row2 = new Array();
				pull_row2 = new Array();
				Row1Info.Start = 4;
				Row2Info.Start = 4;
				if (Row3Info.Buttons == 26) {
					Row1Info.Buttons = 11;
					Row2Info.Buttons = 10;
				}
				else if (Row3Info.Buttons == 27) {
					Row1Info.Buttons = 12;
					Row2Info.Buttons = 11;
				}
				else {
					console.error('saltarelle layout with ' + Row3Info.Buttons + ' buttons is not supported');
					return;
				}
				LoadRowG(push_row1, pull_row1, Row1Info);
				LoadRowC(push_row2, pull_row2, Row2Info);
				
				//Override button 1 of both rows
				push_row1[0] = "^C," ; // 1
				pull_row1[0] = "_E," ;
				push_row2[0] = "_B," ; // 1'
				pull_row2[0] = "_A," ;
				
				//Define the helper row
				push_row3.push(""); // 1"
				pull_row3.push("");
				push_row3.push(""); // 2"
				pull_row3.push("");
				push_row3.push("^C"); // 3"
				pull_row3.push("_E");
				push_row3.push("_B" ); // 4"
				pull_row3.push("_A");
				push_row3.push("F" ); // 5"
				pull_row3.push("_B" );
				push_row3.push("^c"); // 6"
				pull_row3.push("_e");
				if (Row3Info.Buttons == 26) {
					push_row3.push("_b" ); // 7"
					pull_row3.push("_a");
				}
			}
			else if (Row3Tuning == "castagnari") {
				//Add bass chords
				this.BassRow1Push.splice(0, 0, "Ab");
				this.BassRow1Pull.splice(0, 0, "Bm");
				this.BassRow2Push.splice(0, 0, "Eb");
				this.BassRow2Pull.splice(0, 0, "Bb");
				
				push_row3.push(""); // 0"
				pull_row3.push("");
				push_row3.push(""); // 1"
				pull_row3.push("");
				push_row3.push("^G"); // 2"
				pull_row3.push("_B");
				push_row3.push("_E"); // 3"
				pull_row3.push("^C");
				push_row3.push("^A"); // 4"
				pull_row3.push("G");
				push_row3.push("^g"); // 5"
				pull_row3.push("_b");
				push_row3.push("_e"); // 6"
				pull_row3.push("^c");
			}
			else if (Row3Tuning == "rick") {
				//Add bass chords
				this.BassRow1Push.push("A");
				this.BassRow1Pull.push("B");
				this.BassRow2Push.push("Eb");
				this.BassRow2Pull.push("Bb");
				
				push_row1[1] = "B,,"; // 1
				pull_row1[1] = "D,";
				
				push_row2[1] = "^G,"; // 1'
				pull_row2[1] = "_B,";
				
				push_row3.push(""); // 0"
				pull_row3.push("");
				push_row3.push(""); // 1"
				pull_row3.push("");
				push_row3.push(""); // 2"
				pull_row3.push("");
				push_row3.push(""); // 3"
				pull_row3.push("");
				push_row3.push("_E"); // 4"
				pull_row3.push("^C");
				push_row3.push("^G"); // 5"
				pull_row3.push("_B");
				push_row3.push("_e"); // 6"
				pull_row3.push("^c");
				push_row3.push("^g"); // 7"
				pull_row3.push("_b");
			}
			else {
				if      ((Row2Info.Key == "Eb" || Row2Info.Key == "D#") && (Row3Info.Key == "Ab" || Row3Info.Key == "G#")) //BbEbAb
				  TransposeHalfSteps = -3;
				else if ((Row2Info.Key == "E"                         ) && (Row3Info.Key == "A"                         )) //BEA
				  TransposeHalfSteps = -3;
				else if ((Row2Info.Key == "F"                         ) && (Row3Info.Key == "Bb" || Row3Info.Key == "A#")) //CFBb
				  TransposeHalfSteps = -2;
				else if ((Row2Info.Key == "Gb" || Row2Info.Key == "F#") && (Row3Info.Key == "B"                         )) //DbDbB
				  TransposeHalfSteps = -1;
				else if ((Row2Info.Key == "G"                         ) && (Row3Info.Key == "C"                         )) //DGC, does not exit
				  TransposeHalfSteps =  0;
				else if ((Row2Info.Key == "Ab" || Row2Info.Key == "G#") && (Row3Info.Key == "Db" || Row3Info.Key == "C#")) //EbAbDb
				  TransposeHalfSteps =  1;
				else if ((Row2Info.Key == "A"                         ) && (Row3Info.Key == "D"                         )) //EAD
				  TransposeHalfSteps =  2;
				else if ((Row2Info.Key == "Bb" || Row2Info.Key == "A#") && (Row3Info.Key == "Eb" || Row3Info.Key == "D#")) //FBbEb
				  TransposeHalfSteps =  3;
				else if ((Row2Info.Key == "B"                         ) && (Row3Info.Key == "E"                         )) //GbBE
				  TransposeHalfSteps =  4;
				else if ((Row2Info.Key == "C"                         ) && (Row3Info.Key == "F"                         )) //GCF
				  TransposeHalfSteps =  5;
				else if ((Row2Info.Key == "Db" || Row2Info.Key == "C#") && (Row3Info.Key == "Gb" || Row3Info.Key == "F#")) //AbDbGb
				  TransposeHalfSteps =  6;
				else if ((Row2Info.Key == "D"                         ) && (Row3Info.Key == "G"                         )) //ADG
				  TransposeHalfSteps =  7;
				else {
				  console.error(this.tuning.length + ' row melodeon with row1 key \'' + Row1Info.Key + '\' and row2 key \'' + Row2Info.Key + '\' and row3 key \'' + Row3Info.Key + '\' is not supported');
				  return;
				}
				
				//Row1 with 12 buttons is added before the other rows, define it as a D row here, event though DGC does not exist due to an octave rollover, it will be transposed below
				//Therefore the D row is one octave lower than a normal D row
				push_row1 = new Array();
				pull_row1 = new Array();
				push_row2 = new Array();
				pull_row2 = new Array();
				push_row3 = new Array();
				pull_row3 = new Array();
				Row1Info.Acc = true;
				Row2Info.Acc = true;
				Row3Info.Acc = true;
				let Remove1_1 = false;
				if (Row1Info.Buttons == 10 && Row2Info.Buttons == 11 && Row3Info.Buttons == 10) {
					Row1Info.Buttons = 11;
					Remove1_1 = true;
				}
				LoadRowD(push_row1, pull_row1, Row1Info);
				LoadRowG(push_row2, pull_row2, Row2Info);
				LoadRowC(push_row3, pull_row3, Row3Info);
				if (Remove1_1) {
					push_row1.splice(1, 1);
					pull_row1.splice(1, 1);
					push_row1.splice(0, 0, "");
					pull_row1.splice(0, 0, "");
				}
				
				//Add bass chords for DGC
				this.BassRow1Push.splice(0, 0, "D");
				this.BassRow1Pull.splice(0, 0, "A");
				this.BassRow2Push.splice(0, 0, "B");
				this.BassRow2Pull.splice(0, 0, "Em");
			}
		}
	}
	else {
		console.error('Melodeon with more than 3 rows are not supported');
		return;
	}
	
	//Handle button push/pull inversions for each row
	if (typeof Row1Info !== 'undefined') {
		for (let i = 0; i < Row1Info.aInvert.length; ++i) {
			let Index = Row1Info.aInvert[i] - 1;
			let Tmp = push_row1[Index];
			push_row1[Index] = pull_row1[Index];
			pull_row1[Index] = Tmp;
		}
	}
	if (typeof Row2Info !== 'undefined') {
		for (let i = 0; i < Row2Info.aInvert.length; ++i) {
			let Index = Row2Info.aInvert[i] - 1;
			let Tmp = push_row2[Index];
			push_row2[Index] = pull_row2[Index];
			pull_row2[Index] = Tmp;
		}
	}
	if (typeof Row3Info !== 'undefined') {
		for (let i = 0; i < Row3Info.aInvert.length; ++i) {
			let Index = Row3Info.aInvert[i] - 1;
			let Tmp = push_row3[Index];
			push_row3[Index] = pull_row3[Index];
			pull_row3[Index] = Tmp;
		}
	}
	
	//If not starting the numbering at 0, add empty buttons to the beginning of the arrays
	if (!this.startzero) {
		if (push_row1.length) {
			push_row1.splice(0, 0, "");
			pull_row1.splice(0, 0, "");
		}
		if (push_row2.length) {
			push_row2.splice(0, 0, "");
			pull_row2.splice(0, 0, "");
		}
		if (push_row3.length) {
			push_row3.splice(0, 0, "");
			pull_row3.splice(0, 0, "");
		}
	}
	
	//Transpose left hand bass chords if required
	if (TransposeHalfSteps != 0) {
		TransposeChordArray(this.BassRow1Push , TransposeHalfSteps);
		TransposeChordArray(this.BassRow1Pull , TransposeHalfSteps);
		TransposeChordArray(this.BassRow2Push , TransposeHalfSteps);
		TransposeChordArray(this.BassRow2Pull , TransposeHalfSteps);
		TransposeChordArray(this.BassRow3Push , TransposeHalfSteps);
		TransposeChordArray(this.BassRow3Pull , TransposeHalfSteps);
	}
	
	//Combine left hand into push and pull arrays
	this.push_chords = this.BassRow1Push.concat(this.BassRow2Push).concat(this.BassRow3Push).concat(this.BassCrossPush);
	this.pull_chords = this.BassRow1Pull.concat(this.BassRow2Pull).concat(this.BassRow3Pull).concat(this.BassCrossPull);
	
	//Calculate minor7 cross basses
	this.BassCrossPush = FindCrossBassChords(this.push_chords);
	this.BassCrossPull = FindCrossBassChords(this.pull_chords);
	
	//Add them to the push/pull arrays
	this.push_chords = this.push_chords.concat(this.BassCrossPush);
	this.pull_chords = this.pull_chords.concat(this.BassCrossPull);
	for (let i = 0; i < this.push_chords.length; ++i) {
		let pos = this.push_chords[i].search(" ");
		if (pos >= 0)
			this.push_chords[i] = this.push_chords[i].substr(0, pos);
	}
	for (let i = 0; i < this.pull_chords.length; ++i) {
		let pos = this.pull_chords[i].search(" ");
		if (pos >= 0)
			this.pull_chords[i] = this.pull_chords[i].substr(0, pos);
	}
	this.push_chords = [...new Set(this.push_chords)];
	this.pull_chords = [...new Set(this.pull_chords)];
  
  //Define right hand notes from the note names, transpose if required
  let TransposeLookup = CreateTransposeLookup();
  this.push_row1 = new Array;
  for (let i = 0; i < push_row1.length; ++i) {
    this.push_row1.push(TransposeNameToNote(push_row1[i], TransposeHalfSteps, TransposeLookup));
  }
  this.pull_row1 = new Array;
  for (let i = 0; i < pull_row1.length; ++i) {
    this.pull_row1.push(TransposeNameToNote(pull_row1[i], TransposeHalfSteps, TransposeLookup));
  }
  this.push_row2 = new Array;
  for (let i = 0; i < push_row2.length; ++i) {
    this.push_row2.push(TransposeNameToNote(push_row2[i], TransposeHalfSteps, TransposeLookup));
  }
  this.pull_row2 = new Array;
  for (let i = 0; i < pull_row2.length; ++i) {
    this.pull_row2.push(TransposeNameToNote(pull_row2[i], TransposeHalfSteps, TransposeLookup));
  }
  this.push_row3 = new Array;
  for (let i = 0; i < push_row3.length; ++i) {
    this.push_row3.push(TransposeNameToNote(push_row3[i], TransposeHalfSteps, TransposeLookup));
  }
  this.pull_row3 = new Array;
  for (let i = 0; i < pull_row3.length; ++i) {
    this.pull_row3.push(TransposeNameToNote(pull_row3[i], TransposeHalfSteps, TransposeLookup));
  }
  
  //console.log(this.push_row1);
  //console.log(this.pull_row1);
  //console.log(this.push_row2);
  //console.log(this.pull_row2);
  //console.log(this.push_row3);
  //console.log(this.pull_row3);
  
  let Row1HandPosCount = Math.ceil(this.push_row1.length);
  let Row2HandPosCount = Math.ceil(this.push_row2.length);
  let Row3HandPosCount = Math.ceil(this.push_row3.length);
  HandPosCount = Math.max(Row1HandPosCount, Row2HandPosCount, Row3HandPosCount);
  HandPosCount -= 3;
  
  this.HandPos = new Array;
  for (let h = 0; h < HandPosCount; ++h) {
	this.HandPos[h] = {};
	
	//Easy, prefer outer row, then fingers index, middle, ring, little
	this.HandPos[h].easy = new Array;
	for (let Row = 1; Row <= 3; ++Row) {
		for (let Finger = 0; Finger < 4; ++Finger) {
			if (Row == 1) {
				let Row1Index = h+Finger;
				if (0 <= Row1Index && Row1Index < this.push_row1.length) this.HandPos[h].easy.push((Row1Index).toString() + "$");
			}
			else if (Row == 2) {
				let Row2Index = h+Finger;
				if (0 <= Row2Index && Row2Index < this.push_row2.length) this.HandPos[h].easy.push((Row2Index).toString() + "'");
				
			}
			else if (Row == 3) {
				let Row3Index = h+Finger;
				if (0 <= Row3Index && Row3Index < this.push_row3.length) this.HandPos[h].easy.push((Row3Index).toString() + "\"");
			}
		}
	}
	
	//Hard finger stretch
	this.HandPos[h].hard = new Array;
	let aFinger = [-1, 4];
	for (let Row = 1; Row <= 3; ++Row) {
		for (let i = 0; i < aFinger.length; ++i) {
			let Finger = aFinger[i];
			if (Row == 1) {
				let Row1Index = h+Finger;
				if (0 <= Row1Index && Row1Index < this.push_row1.length) this.HandPos[h].hard.push((Row1Index).toString() + "$");
			}
			else if (Row == 2) {
				let Row2Index = h+Finger;
				if (0 <= Row2Index && Row2Index < this.push_row2.length) this.HandPos[h].hard.push((Row2Index).toString() + "'");
				
			}
			else if (Row == 3) {
				let Row3Index = h+Finger;
				if (0 <= Row3Index && Row3Index < this.push_row3.length) this.HandPos[h].hard.push((Row3Index).toString() + "\"");
			}		}
	}
  }
  this.HandPosIndex = -1; //Start with index finger at lowest position
  this.LastButton = "";
  
    
  //State variables
//  this.PrevBar       = true;
//  this.PrevPush      = true;
//  this.PrevRow       = 0;
//  this.PrevNumber    = 6;
//  this.FingerNumber1 = 0;
//  this.FingerNumber4 = 0;
  
  this.Scan   = false;
  this.BarIndex = -1;
  this.aBars    = new Array;
//  this.PrevChord = "";

  this.ChordPush = true;
  this.ChordPull = true;
  this.RowPrefer1 = -1;
  this.RowPrefer2 = -1;
  this.RowPrefer3 = -1;
  this.PrevPushButtons = new Array();
  this.PrevPullButtons = new Array();
  
  this.strings = {
    tabInfos          : function (plugin) {return ""},
    suppress          : function (plugin) {return false},
    accidentals       : {},
    measureAccidentals: {}
  };
}

function CreateTransposeLookup() {
	TransposeLookup = new Array();
	for (let i = 0; i < 7 * 8; ++i) {
		noteName = allNotes.noteName(i);
		TransposeLookup.push({SharpName: noteName, FlatName: noteName});
		
		note = allNotes.noteName(i).toLowerCase()[0];
		if (note == 'c' || note == 'd' || note == 'f' || note == 'g' || note == 'a') {
			NextNoteName = allNotes.noteName(i+1);
			TransposeLookup.push({SharpName: "^" + noteName, FlatName: "_" + NextNoteName});
		}
	}
	
	return TransposeLookup;
}

function TransposeNameToNote(noteName, TransposeHalfSteps, TransposeLookup) {
	if (noteName.length == 0)
		return "";
	
	for (let i = 0; i < TransposeLookup.length; ++i) {
		if (TransposeLookup[i].SharpName == noteName || TransposeLookup[i].FlatName == noteName)
			return TransposeLookup[i + TransposeHalfSteps];
	}
	
	//Error
	console.log("err");
	return {};
}

function noteToButton(noteName, LookupArray) {
	for (let i = 0; i < LookupArray.length; ++i) {
		if (LookupArray[i].SharpName == noteName || LookupArray[i].FlatName == noteName) {
			return (i).toString();
		}
	}
	
	return "";
}


DiatonicPatterns.prototype.noteToPushButtonRow1 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.push_row1);
	if (ButtonNumber.length > 0)
		ButtonNumber += "$";
	return ButtonNumber;
}

DiatonicPatterns.prototype.noteToPullButtonRow1 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.pull_row1);
	if (ButtonNumber.length > 0)
		ButtonNumber += "$";
	return ButtonNumber;
}

DiatonicPatterns.prototype.noteToPushButtonRow2 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.push_row2);
	if (ButtonNumber.length > 0)
		ButtonNumber += "'";
	return ButtonNumber;
}

DiatonicPatterns.prototype.noteToPullButtonRow2 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.pull_row2);
	if (ButtonNumber.length > 0)
		ButtonNumber += "'";
	return ButtonNumber;
}

DiatonicPatterns.prototype.noteToPushButtonRow3 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.push_row3);
	if (ButtonNumber.length > 0)
		ButtonNumber += "\"";
	return ButtonNumber;
}

DiatonicPatterns.prototype.noteToPullButtonRow3 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.pull_row3);
	if (ButtonNumber.length > 0)
		ButtonNumber += "\"";
	return ButtonNumber;
}

DiatonicPatterns.prototype.StartScan = function () {
	if (!this.Scan) {
		//Clear
		this.aBars = new Array;
		this.BarIndex = -1;
		this.Scan = true;
		this.MarkBar();
	}
	
}

function BarHasButtons(Bar) {
	for (let n = 0; n < Bar.notes.length; ++n) {
		if (Bar.notes[n].push1.length)
			return true;
		if (Bar.notes[n].push2.length)
			return true;
		if (Bar.notes[n].push3.length)
			return true;
		if (Bar.notes[n].pull1.length)
			return true;
		if (Bar.notes[n].pull2.length)
			return true;
		if (Bar.notes[n].pull3.length)
			return true;
	}
	
	return false;
}

function PrevNonEmptyBarIndex(aBars, Index) {
	for (var PrevIndex = Index - 1; PrevIndex >= 0; --PrevIndex) {
		if (BarHasButtons(aBars[PrevIndex]))
			return PrevIndex;
	}
	return -1;
}

function NextNonEmptyBarIndex(aBars, Index) {
	for (var NextIndex = Index + 1; NextIndex < aBars.length; ++NextIndex) {
		if (BarHasButtons(aBars[NextIndex]))
			return NextIndex;
	}
	return -1;
}

function FirstLast(Bar, Push) {
	let FirstRow    = -1;
	let FirstButton = -1;
	let LastRow     = -1;
	let LastButton  = -1;
	
	for (let n = 0; n < Bar.notes.length; ++n) {
		//Find row/button in the bar's direction
		var Row    = -1;
		var Button = -1;
		if (Push) {
			if (Bar.notes[n].push1 != '') {
				Row    = 1;
				Button = parseInt(Bar.notes[n].push1);
			}
			else if (Bar.notes[n].push2 != '') {
				Row    = 2;
				Button = parseInt(Bar.notes[n].push2);
			}
			else if (Bar.notes[n].push3 != '') {
				Row    = 3;
				Button = parseInt(Bar.notes[n].push3);
			}
		}
		else {
			if (Bar.notes[n].pull1 != '') {
				Row    = 1;
				Button = parseInt(Bar.notes[n].pull1);
			}
			else if (Bar.notes[n].pull2 != '') {
				Row    = 2;
				Button = parseInt(Bar.notes[n].pull2);
			}
			else if (Bar.notes[n].pull3 != '') {
				Row    = 3;
				Button = parseInt(Bar.notes[n].pull3);
			}
		}
		
		//If not found, try against bar direction
		if (Row < 0) {
			if (Bar.notes[n].push1 != '') {
				Row    = 1;
				Button = parseInt(Bar.notes[n].push1);
			}
			else if (Bar.notes[n].push2 != '') {
				Row    = 2;
				Button = parseInt(Bar.notes[n].push2);
			}
			else if (Bar.notes[n].push3 != '') {
				Row    = 3;
				Button = parseInt(Bar.notes[n].push3);
			}
			else if (Bar.notes[n].pull1 != '') {
				Row    = 1;
				Button = parseInt(Bar.notes[n].pull1);
			}
			else if (Bar.notes[n].pull2 != '') {
				Row    = 2;
				Button = parseInt(Bar.notes[n].pull2);
			}
			else if (Bar.notes[n].pull3 != '') {
				Row    = 3;
				Button = parseInt(Bar.notes[n].pull3);
			}
		}
		
		//If found
		if (Row > 0) {
			//Set first row/button if not already set
			if (FirstRow < 0) {
				FirstRow    = Row;
				FirstButton = Button;
			}
			
			//Update last row/button
			LastRow    = Row;
			LastButton = Button;
		}
	}
	
	return {
		FirstRow   : FirstRow   ,
		FirstButton: FirstButton,
		LastRow    : LastRow    ,
		LastButton : LastButton
	}
}

function ChosenBarNumbers(Bar, Push) {
	Low  = 100;
	High = 0;
	for (var NoteIndex = 0; NoteIndex < Bar.notes.length; ++NoteIndex) {
		var Num = -1;
		if (Push) {
			if (Bar.notes[NoteIndex].push1 != '')
				Num = parseInt(Bar.notes[NoteIndex].push1);
			else if (Bar.notes[NoteIndex].push2 != '')
				Num = parseInt(Bar.notes[NoteIndex].push2);
			else if (Bar.notes[NoteIndex].push3 != '')
				Num = parseInt(Bar.notes[NoteIndex].push3);
		}
		else {
			if (Bar.notes[NoteIndex].pull1 != '')
				Num = parseInt(Bar.notes[NoteIndex].pull1);
			else if (Bar.notes[NoteIndex].pull2 != '')
				Num = parseInt(Bar.notes[NoteIndex].pull2);
			else if (Bar.notes[NoteIndex].pull3 != '')
				Num = parseInt(Bar.notes[NoteIndex].pull3);
		}
		
		if (Num >= 0) {
			if (Num < Low)
				Low = Num;
			if (Num > High)
				High = Num;
		}
	}
	
	return {LowButton: Low, HighButton: High}
}

function BarChoose(aBars, BarIndex, NeedBoth, AllowPrev, AllowNext) {
	var BeforeLow    = -1;
	var BeforeHigh   = -1;
	var PrevLast     = -1;
	var PrevLastRow  = -1;
	var PrevBarIndex = PrevNonEmptyBarIndex(aBars, BarIndex);
	if (AllowPrev && PrevBarIndex >= 0 && aBars[PrevBarIndex].chosen) {
		var Ch = ChosenBarNumbers(aBars[PrevBarIndex], aBars[PrevBarIndex].push);
		BeforeLow  = Ch.LowButton;
		BeforeHigh = Ch.HighButton;
		
		var Ch = FirstLast(aBars[PrevBarIndex], aBars[PrevBarIndex].push);
		PrevLast = Ch.LastButton;
		PrevLastRow = Ch.LastRow;
	}
	
	var AfterLow     = -1;
	var AfterHigh    = -1;
	var NextFirst    = -1;
	var NextFirstRow = -1;
	var NextBarIndex = NextNonEmptyBarIndex(aBars, BarIndex);
	if (AllowNext && NextBarIndex >= 0 && aBars[NextBarIndex].chosen) {
		var Ch = ChosenBarNumbers(aBars[NextBarIndex], aBars[NextBarIndex].push);
		AfterLow  = Ch.LowButton;
		AfterHigh = Ch.HighButton;
		
		var Ch = FirstLast(aBars[NextBarIndex], aBars[NextBarIndex].push);
		NextFirst = Ch.FirstButton;
		NextFirstRow = Ch.FirstRow;
	}
	
	var Ch = ChosenBarNumbers(aBars[BarIndex], true);
	var PushLow  = Ch.LowButton;
	var PushHigh = Ch.HighButton;
	var Ch = ChosenBarNumbers(aBars[BarIndex], false);
	var PullLow  = Ch.LowButton;
	var PullHigh = Ch.HighButton;
	
	var Ch = FirstLast(aBars[BarIndex], true);
	var PushFirst = Ch.FirstButton;
	var PushFirstRow = Ch.FirstRow;
	var PushLast  = Ch.LastButton;
	var PushLastRow = Ch.LastRow;
	var Ch = FirstLast(aBars[BarIndex], false);
	var PullFirst = Ch.FirstButton;
	var PullFirstRow = Ch.FirstRow;
	var PullLast  = Ch.LastButton;
	var PullLastRow = Ch.LastRow;
	
	if (PrevLast >= 0 || NextFirst >= 0) {
		if (NeedBoth && (PrevLast < 0 || NextFirst < 0))
			return false;
		
		aBars[BarIndex].chosen = true;
		var PushDistance = 0;
		var PullDistance = 0;
		
		if (PrevLast != 0) {
			PushDistance += Math.abs(PushFirst - PrevLast);
			if (PushFirstRow != PrevLastRow)
				PushDistance += 0.5;
			
			PullDistance += Math.abs(PullFirst - PrevLast);
			if (PullFirstRow != PrevLastRow)
				PullDistance += 0.5;
		}
		else
			AllowPrev = false;
		if (NextFirst != 0) {
			PushDistance += Math.abs(PushLast - NextFirst);
			if (PushLastRow != NextFirstRow)
				PushDistance += 0.5;
			
			PullDistance += Math.abs(PullLast - NextFirst);
			if (PullLastRow != NextFirstRow)
				PullDistance += 0.5;
		}
		else
			AllowNext = false;
		
		if (PushDistance <= PullDistance)
			aBars[BarIndex].push = true;
		else
			aBars[BarIndex].push = false;
		
		return true;
	}
	
	return false;
	
	/*if (BeforeLow != 0 || AfterLow != 0) {
		BarsChosen++;
		this.aBars[BarIndex].chosen = true;
		var PushDistance = 0;
		var PullDistance = 0;
		
		if (BeforeLow != 0) {
			PushDistance += Math.abs(PushLow - BeforeLow) + Math.abs(PushHigh - BeforeHigh);
			PullDistance += Math.abs(PullLow - BeforeLow) + Math.abs(PullHigh - BeforeHigh);
		}
		if (AfterLow != 0) {
			PushDistance += Math.abs(PushLow - AfterLow) + Math.abs(PushHigh - AfterHigh);
			PullDistance += Math.abs(PullLow - AfterLow) + Math.abs(PullHigh - AfterHigh);
		}
		
		if (PushDistance <= PullDistance)
			this.aBars[BarIndex].push = true;
		else
			this.aBars[BarIndex].push = false;
	}*/
}

DiatonicPatterns.prototype.StartBuild = function () {
	this.strings.accidentals        = {};
	this.strings.measureAccidentals = {};
	
	if (this.Scan) {
		//console.log("bars:" + this.aBars.length);
		//console.log(this.aBars);
		
		//Count push/pull possibilities
		//TODO: Set left and right finger numbers
		for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
			for (var NoteIndex = 0; NoteIndex < this.aBars[BarIndex].notes.length; ++NoteIndex) {
				this.aBars[BarIndex].notecount++;
				if (this.aBars[BarIndex].notes[NoteIndex].push1 != '' || this.aBars[BarIndex].notes[NoteIndex].push2 != '' || this.aBars[BarIndex].notes[NoteIndex].push3 != '')
					this.aBars[BarIndex].pushcount++;
				if (this.aBars[BarIndex].notes[NoteIndex].pull1 != '' || this.aBars[BarIndex].notes[NoteIndex].pull2 != '' || this.aBars[BarIndex].notes[NoteIndex].pull3 != '')
					this.aBars[BarIndex].pullcount++;
			}
		}
		
		//Set bars to push or pull if we can do only push or only pull per bar
		var BarsChosen = 0;
		for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
			//Directly set it if only one possibility makes sense
			if (this.aBars[BarIndex].pushcount != this.aBars[BarIndex].pullcount) {
				if (this.aBars[BarIndex].pushcount == this.aBars[BarIndex].notecount) {
					this.aBars[BarIndex].chosen = true;
					this.aBars[BarIndex].push   = true;
					BarsChosen++;
				}
				else if (this.aBars[BarIndex].pullcount == this.aBars[BarIndex].notecount) {
					this.aBars[BarIndex].chosen = true;
					this.aBars[BarIndex].push   = false;
					BarsChosen++;
				}
			}
		}
		
		//If no bars are chosen, try to choose one with only push or only pull
		if (BarsChosen == 0) {
			for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
				if (this.aBars[BarIndex].notecount > 0) {
					if (this.aBars[BarIndex].pushcount == this.aBars[BarIndex].notecount) {
						this.aBars[BarIndex].chosen = true;
						this.aBars[BarIndex].push   = true;
						BarsChosen++;
						break;
					}
					else if (this.aBars[BarIndex].pullcount == this.aBars[BarIndex].notecount) {
						this.aBars[BarIndex].chosen = true;
						this.aBars[BarIndex].push   = false;
						BarsChosen++;
						break;
					}
				}
			}
			
			//If no bars are chosen, try to choose one
			if (BarsChosen == 0) {
				for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
					if (this.aBars[BarIndex].notecount > 0) {
						if (this.aBars[BarIndex].pushcount > this.aBars[BarIndex].pullcount) {
							this.aBars[BarIndex].chosen = true;
							this.aBars[BarIndex].push   = true;
							BarsChosen++;
							break;
						}
						else {
							this.aBars[BarIndex].chosen = true;
							this.aBars[BarIndex].push   = false;
							BarsChosen++;
							break;
						}
					}
				}
			}
		}
		
		//Set empty bars
		for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
			if (this.aBars[BarIndex].pushcount == 0 && this.aBars[BarIndex].pullcount == 0) {
				this.aBars[BarIndex].chosen = true;
				this.aBars[BarIndex].push   = true;
				BarsChosen++;
			}
		}
		
		//Choose all other bars
		while (BarsChosen < this.aBars.length) {
			//In between defined bars
			var AnyChosen = true;
			while (AnyChosen) {
				AnyChosen = false;
				for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
					if (this.aBars[BarIndex].chosen)
						continue;
					
					
					if (BarChoose(this.aBars, BarIndex, true, true, true)) {
						BarsChosen++;
						AnyChosen = true;
					}
				}
			}
			
			//Before defined bars
			if (AnyChosen == false) {
				for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
					if (this.aBars[BarIndex].chosen)
						continue;
					
					
					if (BarChoose(this.aBars, BarIndex, false, false, true)) {
						BarsChosen++;
						AnyChosen = true;
					}
				}
			}
			
			//After defined bars
			if (AnyChosen == false) {
				for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
					if (this.aBars[BarIndex].chosen)
						continue;
					
					
					if (BarChoose(this.aBars, BarIndex, false, true, false)) {
						BarsChosen++;
						AnyChosen = true;
					}
				}
			}
			
			//No progress was made
			if (AnyChosen == false) {
				console.warn('no bar direction progress');
				for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
					if (this.aBars[BarIndex].chosen)
						continue;
					
					//Set bar to push to prevent infinite loop
					this.aBars[BarIndex].chosen = true;
					this.aBars[BarIndex].push   = true;
					BarsChosen++;
					AnyChosen = true;
					break;
				}
			}
		}
		
		
		//Set bars to push or pull if we can do only push and only pull per bar
/*		for (var BarIndex = 0; BarIndex < this.aBars.length; ++BarIndex) {
			if (this.aBars[BarIndex].Chosen)
				continue;
			
			//TODO: Distance between first/last bar note detection
			if (this.aBars[BarIndex].pushcount == this.aBars[BarIndex].notecount && BarIndex != 2 && BarIndex != 3) {
				this.aBars[BarIndex].chosen = true;
				this.aBars[BarIndex].push   = true;
			}
			else if (this.aBars[BarIndex].pushcount == this.aBars[BarIndex].notecount) {
				this.aBars[BarIndex].chosen = true;
				this.aBars[BarIndex].push   = false;
			}
			
		}*/
		
		//TODO: Handle push and pull in a bar, minimize the number of direction changes
		
		
		this.HandPosIndex = -1; //Start with index finger at lowest position
		this.LastButton = "";
		
		
		
		//TODO: Run optimization algorithm
		this.BarIndex = 0;
	}
	this.Scan = false;
}

DiatonicPatterns.prototype.MarkBar = function () {
//	this.PrevBar = true;
	
	if (this.Scan) {
		this.aBars.push(
			{
				notes: new Array,
				notecount: 0,
				pushcount: 0,
				pullcount: 0,
				chosen: false,
				push  : false,
			}
		);
	}
	else {
		
	}
	this.BarIndex++;
}

function AppendButton(strButtons, Button) {
	//Append hair space if required
	if (strButtons.length > 0 && strButtons[strButtons.length-1] != "'" && strButtons[strButtons.length-1] != "\"")
		strButtons += "\u200A";
	
	//Append the button
	strButtons += Button;
	
	return strButtons;
}

function ChordReduce(Chord, MaxLength) {
	Chord = Chord.replace("♭", "b");
	
	//Keep removing character while longer then the maximum length
	while (Chord.length > MaxLength) {
		//Never remove flats or sharps
		if (Chord.slice(-1) == "b" || Chord.slice(-1) == "#")
			break;
		
		//Remove last character
		Chord = Chord.substr(0, Chord.length - 1);
	}
	
	return Chord;
}

function ChordMatch(Chord1, Chord2, MaxLength) {
	Chord1 = ChordReduce(Chord1, MaxLength);
	Chord2 = ChordReduce(Chord2, MaxLength);
	
	if (Chord1 == Chord2)
		return true;
	return false;
}

function ButtonStringToArrays(str) {
	str.replaceAll("\u200A", "");
	
	let strRow1 = "";
	let strRow2 = "";
	let strRow3 = "";
	
	let But = "";
	for (let i = 0; i < str.length; ++i) {
		if (str[i] == "$") {
			if (strRow1.length)
				strRow1 += "\u200A";
			strRow1 += But;
			But = "";
		}
		else if (str[i] == "'") {
			if (strRow2.length)
				strRow2 += "\u200A";
			strRow2 += But;
			But = "";
		}
		else if (str[i] == "\"") {
			if (strRow3.length)
				strRow3 += "\u200A";
			strRow3 += But;
			But = "";
		}
		else
			But += str[i];
	}
	
	return {
		strRow1: strRow1,
		strRow2: strRow2,
		strRow3: strRow3,
	};
}

DiatonicPatterns.prototype.notesToNumber = function (notes, graces, chord) {
	//Update chord push/pull on change
	if (chord && chord.length > 0) {
		let Chord = chord[0].name.trim();
		
		this.ChordPush = false;
		this.ChordPull = false;
		for (let MaxLength = 5; MaxLength >= 1; --MaxLength) {
			//Can the current chord be played in push?
			if (!Chord.includes("<")) {
				if (Chord.length == 0 || Chord.includes(">")) {
					this.ChordPush = true;
				}
				else {
					for (var i = 0; i < this.push_chords.length; i++) {
						if (ChordMatch(Chord, this.push_chords[i], MaxLength)) {
							this.ChordPush = true;
							break;
						}
					}
				}
			}

			//Can the current chord be played in pull?
			if (!Chord.includes(">")) {
				if (Chord.length == 0 || Chord.includes("<")) {
					this.ChordPull = true;
				}
				else {
					for (var i = 0; i < this.pull_chords.length; i++) {
						if (ChordMatch(Chord, this.pull_chords[i], MaxLength)) {
							this.ChordPull = true;
							break;
						}
					}
				}
			}
			
			//No need to continue of a match was found
			if (this.ChordPush || this.ChordPull)
				break;
		}

		//If chord is not recognized, assume both directions are possible
		if (!this.ChordPush && !this.ChordPull) {
			this.ChordPush = true;
			this.ChordPull = true;
		}

		//Check if row annotation is added to the chord
		this.RowPrefer1 = Chord.indexOf(".");
		this.RowPrefer2 = Chord.indexOf(":");
		this.RowPrefer3 = Chord.indexOf(",");
	}

	if (this.Scan) {
		if (this.aBars.length == 0)
			this.MarkBar();
	}

	//For all notes at this count
	let aNoteNames     = new Array();
	let PushButtons    = new Array();
	let PullButtons    = new Array();
	let strPush        = "";
	let strPull        = "";
	let aDiamandNotes  = new Array();
	let aTriangleNotes = new Array();
	for (var i = 0; notes && i < notes.length; ++i) {
		var TNote = new TabNote.TabNote(notes[i].name);
		TNote.checkKeyAccidentals(this.strings.accidentals, this.strings.measureAccidentals);
		if (TNote.isAltered || TNote.natural) {
			var acc;
			if (TNote.isFlat) {
				if (TNote.isDouble)
					acc = "__";
				else
					acc = "_";
			} else if (TNote.isSharp) {
				if (TNote.isDouble)
					acc = "^^";
				else
					acc = "^";
			} else if (TNote.natural)
				acc = "=";
			this.strings.measureAccidentals[TNote.name.toUpperCase()] = acc;
		}

		//Get the note name
		var noteName = TNote.emitNoAccidentals();
		if (TNote.acc > 0)
			noteName = "^" + noteName;
		else if (TNote.acc < 0)
			noteName = "_" + noteName;
		aNoteNames.push(noteName);
		
		//Run the tablature algorithm if not in 'show all' mode or node heads need to be changed
		if (!this.showall || this.changenoteheads) {
			//Get possibilities for the note on all rows in both directions
			let _push1 = this.noteToPushButtonRow1(noteName);
			let _push2 = this.noteToPushButtonRow2(noteName);
			let _push3 = this.noteToPushButtonRow3(noteName);
			let _pull1 = this.noteToPullButtonRow1(noteName);
			let _pull2 = this.noteToPullButtonRow2(noteName);
			let _pull3 = this.noteToPullButtonRow3(noteName);
			
			//If the cord cannot push and there is at least one possibility of pulling the note, do not allow pushing the note
			let ClearPush = false;
			if (!this.ChordPush && (_pull1.length != 0 || _pull2.length != 0 || _pull3.length != 0)) {
				ClearPush = true;
			}
			
			//If the cord cannot pull and there is at least one possibility of pushing the note, do not allow pulling the note
			var ClearPull = false;
			if (!this.ChordPull && (_push1.length != 0 || _push2.length != 0 || _push3.length != 0)) {
				ClearPull = true;
			}
			
			//Clear what is not allowed based on the chord
			if (ClearPush) {
				_push1 = "";
				_push2 = "";
				_push3 = "";
			}
			if (ClearPull) {
				_pull1 = "";
				_pull2 = "";
				_pull3 = "";
			}
			if (this.RowPrefer1 >= 0 && (_pull1 != "" || _push1 != "")) {
				if (this.RowPrefer2 < 0) {
					_push2 = "";
					_pull2 = "";
				}
				if (this.RowPrefer3 < 0) {
					_push3 = "";
					_pull3 = "";
				}
			}
			if (this.RowPrefer2 >= 0 && (_pull2 != "" || _push2 != "")) {
				if (this.RowPrefer1 < 0) {
					_push1 = "";
					_pull1 = "";
				}
				if (this.RowPrefer3 < 0) {
					_push3 = "";
					_pull3 = "";
				}
			}
			if (this.RowPrefer3 >= 0 && (_pull3 != "" || _push3 != "")) {
				if (this.RowPrefer1 < 0) {
					_push1 = "";
					_pull1 = "";
				}
				if (this.RowPrefer2 < 0) {
					_push2 = "";
					_pull2 = "";
				}
			}
			
			if (this.Scan) {
				//Add the possibilities to the bar
				this.aBars[this.BarIndex].notes.push(
				  {
					note : notes[i],
					push1: _push1,
					push2: _push2,
					push3: _push3,
					pull1: _pull1,
					pull2: _pull2,
					pull3: _pull3
				  }
				);
			}
			else if (this.aBars[this.BarIndex].chosen) {
				let Push   = this.aBars[this.BarIndex].push;
				let Button = '';
				let Hidden = false;
				
				if (notes[i].endTie) {
					//Choose a button that was used in the previous count
					Hidden = true;
					if (this.PrevPushButtons.indexOf(_push1) >= 0) {
						Push   = true;
						Button = _push1;
					}
					else if (this.PrevPushButtons.indexOf(_push2) >= 0) {
						Push   = true;
						Button = _push2;
					}
					else if (this.PrevPushButtons.indexOf(_push3) >= 0) {
						Push   = true;
						Button = _push3;
					}
					else if (this.PrevPullButtons.indexOf(_pull1) >= 0) {
						Push   = false;
						Button = _pull1;
					}
					else if (this.PrevPullButtons.indexOf(_pull2) >= 0) {
						Push   = false;
						Button = _pull2;
					}
					else if (this.PrevPullButtons.indexOf(_pull3) >= 0) {
						Push   = false;
						Button = _pull3;
					}
					else
						Hidden = false;
				}
				
				//If not a tie or tie had no result
				if (!Hidden) {
					//Choose push or pull, prefer chosen option in the bar, except when this is not possible
					
					if ( Push && _push1 == '' && _push2 == '' && _push3 == '')
						Push = false;
					if (!Push && _pull1 == '' && _pull2 == '' && _pull3 == '')
						Push = true;
					
					//Create array of buttons
					let aButtons = new Array;
					if (Push) {
						if (_push1 != '') aButtons.push(_push1);
						if (_push2 != '') aButtons.push(_push2);
						if (_push3 != '') aButtons.push(_push3);
					}
					else {
						if (_pull1 != '') aButtons.push(_pull1);
						if (_pull2 != '') aButtons.push(_pull2);
						if (_pull3 != '') aButtons.push(_pull3);
					}
					
					let aRowOrder = new Array;
					if (this.RowPrefer1 >= 0) aRowOrder.push(this.RowPrefer1);
					if (this.RowPrefer2 >= 0) aRowOrder.push(this.RowPrefer2);
					if (this.RowPrefer3 >= 0) aRowOrder.push(this.RowPrefer3);
					aRowOrder.sort(function(a, b){return a - b});
					for (let i = 0; i < aRowOrder.length; ++i) {
						if (aRowOrder[i] == this.RowPrefer1)
							aRowOrder[i] = 1;
						if (aRowOrder[i] == this.RowPrefer2)
							aRowOrder[i] = 2;
						if (aRowOrder[i] == this.RowPrefer3)
							aRowOrder[i] = 3;
					}
					
					//Any
					aRowOrder.push(0);
					
					let Found = false;
					
					//If no hand position defined yet and a button was found
					if (this.HandPosIndex < 0 && aButtons.length) {
						Button = aButtons[0];

						
						for (let RowOrder = 0; RowOrder < aRowOrder.length; ++RowOrder) {
							let RequireRow = aRowOrder[RowOrder];
							
							//Search all hand positions
							for (let HandPosIndex = 0; HandPosIndex < this.HandPos.length && !Found; ++HandPosIndex) {
								for (let f = 0; f < this.HandPos[HandPosIndex].easy.length; ++f) {
									//Search all buttons
									for (let i = 0; i < aButtons.length; ++i) {
										let Row = 1;
										if (aButtons[i][aButtons[i].length - 1] == "'")
											Row = 2;
										else if (aButtons[i][aButtons[i].length - 1] == "\"")
											Row = 3;
										
										//If button match on the required row
										if ((RequireRow == 0 || Row == RequireRow) && aButtons[i] == this.HandPos[HandPosIndex].easy[f]) {
											this.HandPosIndex = HandPosIndex;
											Button = aButtons[i];
											Found  = true;
											break;
										}
									}
								}
							}
						}
						
						
						
						
						
						
					}
					else {	
						for (let RowOrder = 0; RowOrder < aRowOrder.length; ++RowOrder) {
							let RequireRow = aRowOrder[RowOrder];
							
							for (let HandPosMove = 0; HandPosMove < this.HandPos.length && !Found; ++HandPosMove) {
								for (let MinPlus = -1; MinPlus <= 1 && !Found; MinPlus += 2) {
									let HandPosIndex = this.HandPosIndex + HandPosMove * MinPlus;
									if (HandPosIndex < 0 || HandPosIndex >= this.HandPos.length)
										continue;
									
									let aHandPosButtons = new Array;
									
									//Search from easy to hard in this hand position
									for (let f = 0; f < this.HandPos[HandPosIndex].easy.length; ++f) {
										for (let b = 0; b < aButtons.length; ++b) {
											let Row = 1;
											if (aButtons[b][aButtons[b].length - 1] == "'")
												Row = 2;
											else if (aButtons[b][aButtons[b].length - 1] == "\"")
												Row = 3;
											
											if ((RequireRow == 0 || RequireRow == Row) && this.HandPos[HandPosIndex].easy[f] == aButtons[b]) {
												//Set the new hand position
												
												aHandPosButtons.push(aButtons[b]);
												
											}
										}
									}
									
									if (aHandPosButtons.length) {
										this.HandPosIndex = HandPosIndex;

										//Find same as last button
										if (!Found) {
											for (let i = 0; i < aHandPosButtons.length; ++i) {
												if (this.LastButton == aHandPosButtons[i]) {
													Button = aHandPosButtons[i];
													Found  = true;
													break;
												}
											}
										}
										
										//Find same row as last button
										if (!Found) {
											let LastRow = 1;
											if (this.LastButton[this.LastButton.length - 1] == "'")
												LastRow = 2;
											else if (this.LastButton[this.LastButton.length - 1] == "\"")
												LastRow = 3;
											
											for (let i = 0; i < aHandPosButtons.length; ++i) {
												let Row = 1;
												if (aHandPosButtons[i][aHandPosButtons[i].length - 1] == "'")
													Row = 2;
												else if (aHandPosButtons[i][aHandPosButtons[i].length - 1] == "\"")
													Row = 3;

												if (LastRow == Row) {
													Button = aHandPosButtons[i];
													Found  = true;
													break;
												}
											}
										}
										
										//Find same number as last button
										if (!Found) {
											for (let i = 0; i < aHandPosButtons.length; ++i) {
												//TODO: 10 / 1 risk
												if (this.LastButton.substring(0, 1) == aHandPosButtons[i].substring(0, 1)) {
													Button = aHandPosButtons[i];
													Found  = true;
													break;
												}
											}
										}
										
										//Pick easiest
										if (!Found) {
											Button = aHandPosButtons[0];
											Found  = true;
										}
										
										this.LastButton = Button;
									}
								}
							}
						}
					}
				}
				
				//If a button was found
				if (Button.length) {
					//Add it to previous count buttons
					if (Push)
						PushButtons.push(Button);
					else
						PullButtons.push(Button);
					
					//Add it to tablature push or pull
					if (!Hidden) {
						if (Push)
							strPush = AppendButton(strPush, Button);
						else
							strPull = AppendButton(strPull, Button);
					}
					
					//Only when the note head change option is enabled
					if (this.changenoteheads) {
						//Row2 gets diamands, row3 gets triangles
						if (Button.search("'") >= 0)
							aDiamandNotes.push(notes[i]);
						else if (Button.search("\"") >= 0)
							aTriangleNotes.push(notes[i]);
					}
				}
			}
		}
	}

	
	//If in show all mode
	if (this.showall) {
		//Clear results of the tablature algorithm (the algorithm runs anyway if changing of note heads is required)
		strPush = "";
		strPull = "";
		
		//For all notes at this count
		for (var i = 0; i < aNoteNames.length; ++i) {
			let noteName = aNoteNames[i];
		
			//Get possibilities for the note on all rows in both directions
			let _push1 = this.noteToPushButtonRow1(noteName);
			let _push2 = this.noteToPushButtonRow2(noteName);
			let _push3 = this.noteToPushButtonRow3(noteName);
			let _pull1 = this.noteToPullButtonRow1(noteName);
			let _pull2 = this.noteToPullButtonRow2(noteName);
			let _pull3 = this.noteToPullButtonRow3(noteName);
			let NotePush = _push1.length != 0 || _push2.length != 0 || _push3.length != 0;
			let NotePull = _pull1.length != 0 || _pull2.length != 0 || _pull3.length != 0;
		
			//Get user specified row preference
			let AllowRow1 = this.RowPrefer1 >= 0 || this.showall_ignorechords;
			let AllowRow2 = this.RowPrefer2 >= 0 || this.showall_ignorechords;
			let AllowRow3 = this.RowPrefer3 >= 0 || this.showall_ignorechords;
			
			//Check for rows with no possibilities
			if ((this.ChordPush && this.ChordPull) || this.showall_ignorechords) {
				if (_push1.length == 0 && _pull1.length == 0) AllowRow1 = false;
				if (_push2.length == 0 && _pull2.length == 0) AllowRow2 = false;
				if (_push3.length == 0 && _pull3.length == 0) AllowRow3 = false;
			}
			else if (this.ChordPush || (NotePush && !NotePull)) {
				if (_push1.length == 0) AllowRow1 = false;
				if (_push2.length == 0) AllowRow2 = false;
				if (_push3.length == 0) AllowRow3 = false;
			}
			else if (this.ChordPull || (NotePull && !NotePush)) {
				if (_pull1.length == 0) AllowRow1 = false;
				if (_pull2.length == 0) AllowRow2 = false;
				if (_pull3.length == 0) AllowRow3 = false;
			}
			
			//Allow all rows if no possibilities remain
			if (!AllowRow1 && !AllowRow2 && !AllowRow3) {
				AllowRow1 = true;
				AllowRow2 = true;
				AllowRow3 = true;
			}
			
			//Check push/pull allowed and possible
			let AllowPush = this.ChordPush || this.showall_ignorechords;
			if ((!AllowRow1 || _push1.length == 0) && (!AllowRow2 || _push2.length == 0) && (!AllowRow3 || _push3.length == 0))
				AllowPush = false;
			let AllowPull = this.ChordPull || this.showall_ignorechords;
			if ((!AllowRow1 || _pull1.length == 0) && (!AllowRow2 || _pull2.length == 0) && (!AllowRow3 || _pull3.length == 0))
				AllowPull = false;
			if (!AllowPush && !AllowPull) {
				AllowPush = true;
				AllowPull = true;
			}
			
			//Set push buttons
			if (AllowPush) {
				if (AllowRow1 && _push1.length) strPush = AppendButton(strPush, _push1);
				if (AllowRow2 && _push2.length) strPush = AppendButton(strPush, _push2);
				if (AllowRow3 && _push3.length) strPush = AppendButton(strPush, _push3);
			}
			
			//Set pull buttons
			if (AllowPull) {
				if (AllowRow1 && _pull1.length) strPull = AppendButton(strPull, _pull1);
				if (AllowRow2 && _pull2.length) strPull = AppendButton(strPull, _pull2);
				if (AllowRow3 && _pull3.length) strPull = AppendButton(strPull, _pull3);
			}
		}
	}
	
	this.PrevPushButtons = PushButtons;
	this.PrevPullButtons = PullButtons;

	//Create return value with push and pull element
	var error     = null; 
	var retNotes  = new Array;
	var retGraces = null;
	//Single tab line
	if (this.tabstyle == 1) {
		strBoth = "";
		if (strPush.length) {
			strPush = strPush.replaceAll("$" , "");
			strPush = strPush.replaceAll("'" , this.Row2Marker);
			strPush = strPush.replaceAll("\"", this.Row3Marker);
			strBoth = strPush;
		}
		if (strPull.length) {
			strPull = "-" + strPull;
			strPull = strPull.replaceAll("$" , "");
			strPull = strPull.replaceAll("'" , this.Row2Marker);
			strPull = strPull.replaceAll("\"", this.Row3Marker);
			strBoth += strPull;
		}

		var note = new TabNote.TabNote("");
		var number = {
			num : strBoth,
			str : 1,
			note: note
		};
		retNotes.push(number);
	}
	//Tab line for push and pull
	else if (this.tabstyle == 2) {
		if (strPush.length) {
			strPush = strPush.replaceAll("$" , "");
			strPush = strPush.replaceAll("'" , this.Row2Marker);
			strPush = strPush.replaceAll("\"", this.Row3Marker);

			var note = new TabNote.TabNote("");
			var number = {
				num : strPush,
				str : 2, //Push line (top)
				note: note
			};
			retNotes.push(number);
		}
		if (strPull.length) {
			strPull = strPull.replaceAll("$" , "");
			strPull = strPull.replaceAll("'" , this.Row2Marker);
			strPull = strPull.replaceAll("\"", this.Row3Marker);

			var note = new TabNote.TabNote("");
			var number = {
				num : strPull,
				str : 1, //Pull line (bottom)
				note: note
			};
			retNotes.push(number);
		}
	}
	//Tab line per instrument row
	else if (this.tabstyle == 3) {
		var Strings = ButtonStringToArrays("");
		if (strPush.length) {
			var PushStrings = ButtonStringToArrays(strPush);
			Strings.strRow1 = PushStrings.strRow1;
			Strings.strRow2 = PushStrings.strRow2;
			Strings.strRow3 = PushStrings.strRow3;
		}
		
		if (strPull.length) {
			var PullStrings = ButtonStringToArrays(strPull);
			if (PullStrings.strRow1.length)
				Strings.strRow1 = "-" + PullStrings.strRow1;
			if (PullStrings.strRow2.length)
				Strings.strRow2 = "-" + PullStrings.strRow2;
			if (PullStrings.strRow3.length)
				Strings.strRow3 = "-" + PullStrings.strRow3;
			
			
		}
		
		var note = new TabNote.TabNote("");
		if (Strings.strRow1.length) {
			var number = {
				num : Strings.strRow1,
				str : 1,
				note: note
			};
			retNotes.push(number);
		}
		if (Strings.strRow2.length) {
			var number = {
				num : Strings.strRow2,
				str : 2,
				note: note
			};
			retNotes.push(number);
		}
		if (Strings.strRow3.length) {
			var number = {
				num : Strings.strRow3,
				str : 3,
				note: note
			};
			retNotes.push(number);
		}
	}

	//Create returns values for note head changes
	for (let i = 0; i < aDiamandNotes.length; ++i) {
		var note = new TabNote.TabNote("");
		note.pitch = aDiamandNotes[i].pitch;
		var number = {
			num : "",
			str : -10, //Diamand indicator
			note: note
		};
		retNotes.push(number);
	}
	for (let i = 0; i < aTriangleNotes.length; ++i) {
		var note = new TabNote.TabNote("");
		note.pitch = aTriangleNotes[i].pitch;
		var number = {
			num : "",
			str : -20, //Triangle indicator
			note: note
		};
		retNotes.push(number);
	}
	
	return {
		notes : retNotes,
		graces: retGraces,
		error : error
	};
};

DiatonicPatterns.prototype.stringToPitch = function (stringNumber) {
  if (stringNumber == 3)
    return 19.7;
  else if (stringNumber == 2)
    return 14.7;
  else
    return 9.7;
};

module.exports = DiatonicPatterns;
