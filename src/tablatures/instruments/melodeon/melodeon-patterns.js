var StringPatterns = require('../string-patterns');
var TabNote = require('../tab-note');
var transposeChordName = require("../../../parse/transpose-chord")
var allNotes = require('../../../parse/all-notes');

function MelodeonPatterns(plugin) {
  //Get tablature options
  this.showall = plugin._super.params.showall;
  if (this.showall == null)
    this.showall = false;
  this.showall_ignorechords = plugin._super.params.showall_ignorechords;
  if (this.showall_ignorechords === null) {
    this.showall_ignorechords = false;
  }
  this.Row2Marker = plugin._super.params.Row2Marker;
  if (this.Row2Marker == null)
    this.Row2Marker = "'";
  this.Row3Marker = plugin._super.params.Row3Marker;
  if (this.Row3Marker == null)
    this.Row3Marker = "\"";

  //Set default tuning if not specified
  this.tuning = plugin._super.params.tuning;
  if (this.tuning == null) {
    this.tuning = new Array;
    this.tuning.push("G");
    this.tuning.push("C5");
    plugin.tuning = this.tuning;
  }
  
  //Set default chin accidentals of not specified
  this.chinacc = plugin._super.params.chinacc;
  if (this.chinacc == null) {
    this.chinacc = true;
    plugin.chinacc = this.chinacc;
  }

  //Lookup melodeon notes
  let TransposeHalfSteps = 0;
  let Row1Invert = "";
  let Row2Invert = "";
  let Row3Invert = "";
  this.push_chords = new Array;
  this.pull_chords = new Array;
  this.OffsetRow2 = 0;
  this.OffsetRow3 = 3;
  let push_row1 = new Array;
  let pull_row1 = new Array;
  let push_row2 = new Array;
  let pull_row2 = new Array;
  let push_row3 = new Array;
  let pull_row3 = new Array;
  if (this.tuning.length == 1) {
    //For non-G figure out how to transpose
    let Row1Tuning = this.tuning[0].replace(/[0-9]/g, '');
    if      (Row1Tuning == "Bb" || Row1Tuning == "A#")
      TransposeHalfSteps = -9;
    else if (Row1Tuning == "B"                       )
      TransposeHalfSteps = -8;
    else if (Row1Tuning == "C"                       )
      TransposeHalfSteps = -7;
    else if (Row1Tuning == "Db" || Row1Tuning == "C#")
      TransposeHalfSteps = -6;
    else if (Row1Tuning == "D"                       )
      TransposeHalfSteps = -5;
    else if (Row1Tuning == "Eb" || Row1Tuning == "D#")
      TransposeHalfSteps = -4;
    else if (Row1Tuning == "E"                       )
      TransposeHalfSteps = -3;
    else if (Row1Tuning == "F"                       )
      TransposeHalfSteps = -2;
    else if (Row1Tuning == "Gb" || Row1Tuning == "F#")
      TransposeHalfSteps = -1;
    else if (Row1Tuning == "G"                       )
      TransposeHalfSteps =  0;
    else if (Row1Tuning == "Ab" || Row1Tuning == "G#")
      TransposeHalfSteps =  1;
    else if (Row1Tuning == "A"                       )
      TransposeHalfSteps =  2;
    else {
      console.error('1 row melodeon with tuning \'' + Row1Tuning + '\' is not supported');
      return;
    }
    
    //Figure out the number of buttons
    let Row1Count = this.tuning[0].substring(Row1Tuning.length);
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
    this.push_chords.push("G"); // G push
    this.pull_chords.push("D"); // D
    if (!Mini) {
      this.push_chords.push("C"); // C push
      this.pull_chords.push("C"); // C pull
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
  else if (this.tuning.length == 2 || this.tuning.length == 3) {
    //For non-G/C figure out how to transpose
    let Row1Tuning = this.tuning[0].replace(/[0-9]/g, '');
    let Row2Tuning = this.tuning[1].replace(/[0-9]/g, '');
    Row1Invert = this.tuning[0].substring(Row1Tuning.length);
    Row2Invert = this.tuning[1].substring(Row1Tuning.length);
    if      ((Row1Tuning == "Eb" || Row1Tuning == "D#") && (Row2Tuning == "Ab" || Row2Tuning == "G#")) //Very rare
      TransposeHalfSteps = -3;
    else if ((Row1Tuning == "E"                       ) && (Row2Tuning == "A"                       )) //Very rare
      TransposeHalfSteps = -3;
    else if ((Row1Tuning == "F"                       ) && (Row2Tuning == "Bb" || Row2Tuning == "A#"))
      TransposeHalfSteps = -2;
    else if ((Row1Tuning == "Gb" || Row1Tuning == "F#") && (Row2Tuning == "B"                       )) //Very rare
      TransposeHalfSteps = -1;
    else if ((Row1Tuning == "G"                       ) && (Row2Tuning == "C"                       )) //France, South America
      TransposeHalfSteps =  0;
    else if ((Row1Tuning == "Ab" || Row1Tuning == "G#") && (Row2Tuning == "Db" || Row2Tuning == "C#")) //Very rare
      TransposeHalfSteps =  1;
    else if ((Row1Tuning == "A"                       ) && (Row2Tuning == "D"                       )) //France
      TransposeHalfSteps =  2;
    else if ((Row1Tuning == "Bb" || Row1Tuning == "A#") && (Row2Tuning == "Eb" || Row2Tuning == "D#"))
      TransposeHalfSteps =  3;
    else if ((Row1Tuning == "B"                       ) && (Row2Tuning == "E"                       )) //Very rare
      TransposeHalfSteps =  4;
    else if ((Row1Tuning == "C"                       ) && (Row2Tuning == "F"                       )) //Netherlands, Germany
      TransposeHalfSteps =  5;
    else if ((Row1Tuning == "Db" || Row1Tuning == "C#") && (Row2Tuning == "Gb" || Row2Tuning == "F#")) //Very rare
      TransposeHalfSteps =  6;
    else if ((Row1Tuning == "D"                       ) && (Row2Tuning == "G"                       )) //England
      TransposeHalfSteps =  7;
    else {
      console.error(tuning.length.toString() + ' row melodeon with row1 tuning \'' + Row1Tuning + '\' and row2 tuning \'' + Row2Tuning + '\' is not supported');
      return;
    }
    
    //Define left hand chords for G/C melodeon with 8 base buttons
    this.push_chords.push("G"); // G push
    this.pull_chords.push("D"); // D / Dm7
    this.push_chords.push("E"); // E / Em7
    this.pull_chords.push("A"); // Am
    this.push_chords.push("C");
    this.pull_chords.push("G"); // G pull
    this.push_chords.push("F"); // F push
    this.pull_chords.push("F"); // F pull
    
    //Define right hand buttons for G/C melodeon
    if (this.chinacc) {
      push_row1.push("^C" ); // 1
      pull_row1.push("_E" );
    }
    else {
      push_row1.push("B,,"); // 1
      pull_row1.push("D," );
    }
    push_row1.push("D," ); // 2
    pull_row1.push("^F,");
    push_row1.push("G," ); // 3
    pull_row1.push("A," );
    push_row1.push("B," ); // 4
    pull_row1.push("C"  );
    push_row1.push("D"  ); // 5
    pull_row1.push("E"  );
    push_row1.push("G"  ); // 6
    pull_row1.push("^F" );
    push_row1.push("B"  ); // 7
    pull_row1.push("A"  );
    push_row1.push("d"  ); // 8
    pull_row1.push("c"  );
    push_row1.push("g"  ); // 9
    pull_row1.push("e"  );
    push_row1.push("b"  ); // 10
    pull_row1.push("^f" );
    push_row1.push("d'" ); // 11
    pull_row1.push("a"  );

    if (this.chinacc) {
      push_row2.push("_B"); // 1'
      pull_row2.push("^G");
    }
    else {
      push_row2.push("E,"); // 1'
      pull_row2.push("G,");
    }
    push_row2.push("G,"); // 2'
    pull_row2.push("B,");
    push_row2.push("C" ); // 3'
    pull_row2.push("D" );
    push_row2.push("E" ); // 4'
    pull_row2.push("F" );
    push_row2.push("G" ); // 5'
    pull_row2.push("A" );
    push_row2.push("c" ); // 6'
    pull_row2.push("B" );
    push_row2.push("e" ); // 7'
    pull_row2.push("d" );
    push_row2.push("g" ); // 8'
    pull_row2.push("f" );
    push_row2.push("c'"); // 9'
    pull_row2.push("a" );
    push_row2.push("e'"); // 10'
    pull_row2.push("b" );
    
    //Lookup extra row3
    if (this.tuning.length == 3) {
      let Row3Tuning = this.tuning[2].replace(/[0-9]/g, '').toLowerCase();
      if (false && Row3Tuning == "vanderaa") {
 
      }
      else if (false && Row3Tuning == "saltarelle") {
        this.push_chords.push("D");
        this.pull_chords.push("C");
        this.push_chords.push("B");
        this.pull_chords.push("Bb"); //TODO: Check if this works

        //TODO: this has button 4 start on row 1/2
        /*
        push_row3.push("^g"); // 1"
        pull_row3.push("_b");
        push_row3.push("f'" ); // 2"
        pull_row3.push("_e'");

        push_row3.push("c'" ); // 3" TODO: which octave?
        pull_row3.push("f'" );

        push_row3.push("^g'"); // 4"
        pull_row3.push("_b'");
        push_row3.push("f''" ); // 5"
        pull_row3.push("_e''");*/
      }
      else if (false && Row3Tuning == "castagnari") {
        this.push_chords.push("Ab"); //TODO: Check if this works
        this.pull_chords.push("B");
        this.push_chords.push("Eb"); //TODO: Check if this works
        this.pull_chords.push("Bb"); //TODO: Check if this works
        
        push_row3.push("^G"); // 1"
        pull_row3.push("_B");
        push_row3.push("_E"); // 2"
        pull_row3.push("^C");

        push_row3.push("^A"); // 3" TODO: which octave?
        pull_row3.push("G");

        push_row3.push("^g"); // 4"
        pull_row3.push("_b");
        push_row3.push("_e"); // 5"
        pull_row3.push("^c");
      }
      else {
        console.error('Melodeon row3 \'' + Row3Tuning + '\' not supported');
        return;
      }
    }
  }
  else if (this.tuning.length == 3) {
    console.error('3 row melodeons are not supported');
    return;
  }
  else {
    console.error('Too many melodeon rows defined');
    return;
  }

  //Transpose left hand chords if required
  if (TransposeHalfSteps != 0) {
    for (let i = 0; i < this.push_chords.length; ++i) {
      this.push_chords[i] = transposeChordName(this.push_chords[i], TransposeHalfSteps, true, true);
    }
    for (let i = 0; i < this.pull_chords.length; ++i) {
      this.pull_chords[i] = transposeChordName(this.pull_chords[i], TransposeHalfSteps, true, true);
    }
  }
  
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
  
  //Handle button push/pull inversions for each row
  for (let i = this.push_row1.length; i >= 1; --i) {
    let Pos = Row1Invert.search(i.toString());
    if (Pos >= 0) {
      let Tmp = this.push_row1[i-1];
      this.push_row1[i-1] = this.pull_row1[i-1];
      this.pull_row1[i-1] = Tmp;
      Row1Invert = Row1Invert.substr(0, Pos) + Row1Invert.substr(Pos + i.toString().length);
    }
  }
  for (let i = this.push_row2.length; i >= 1; --i) {
    let Pos = Row2Invert.search(i.toString());
    if (Pos >= 0) {
      let Tmp = this.push_row2[i-1];
      this.push_row2[i-1] = this.pull_row2[i-1];
      this.pull_row2[i-1] = Tmp;
      Row2Invert = Row2Invert.substr(0, Pos) + Row2Invert.substr(Pos + i.toString().length);
    }
  }
  
  //console.log(this.push_row1);
  //console.log(this.pull_row1);
  //console.log(this.push_row2);
  //console.log(this.pull_row2);
  //console.log(this.push_row3);
  //console.log(this.pull_row3);
  
  let Row1HandPosCount = Math.ceil(                  this.push_row1.length);
  let Row2HandPosCount = Math.ceil(this.OffsetRow2 + this.push_row2.length);
  let Row3HandPosCount = Math.ceil(this.OffsetRow3 + this.push_row3.length);
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
				if (0 <= Row1Index && Row1Index < this.push_row1.length) this.HandPos[h].easy.push((Row1Index+1                ).toString());
			}
			else if (Row == 2) {
				let Row2Index = h+Finger - this.OffsetRow2;
				if (0 <= Row2Index && Row2Index < this.push_row2.length) this.HandPos[h].easy.push((Row2Index+1+this.OffsetRow2).toString() + "'");
				
			}
			else if (Row == 3) {
				let Row3Index = h+Finger - this.OffsetRow3;
				if (0 <= Row3Index && Row3Index < this.push_row3.length) this.HandPos[h].easy.push((Row3Index+1+this.OffsetRow3).toString() + "\"");
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
				if (0 <= Row1Index && Row1Index < this.push_row1.length) this.HandPos[h].hard.push((Row1Index+1                ).toString());
			}
			else if (Row == 2) {
				let Row2Index = h+Finger - this.OffsetRow2;
				if (0 <= Row2Index && Row2Index < this.push_row2.length) this.HandPos[h].hard.push((Row2Index+1+this.OffsetRow2).toString() + "'");
				
			}
			else if (Row == 3) {
				let Row3Index = h+Finger - this.OffsetRow3;
				if (0 <= Row3Index && Row3Index < this.push_row3.length) this.HandPos[h].hard.push((Row3Index+1+this.OffsetRow3).toString() + "\"");
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
  
  this.strings = {
    tabInfos          : function (plugin) {return ""},
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
			return (i+1).toString();
		}
	}
	
	return "";
}


MelodeonPatterns.prototype.noteToPushButtonRow1 = function(noteName) {
	return noteToButton(noteName, this.push_row1);
}

MelodeonPatterns.prototype.noteToPullButtonRow1 = function(noteName) {
	return noteToButton(noteName, this.pull_row1);
}

MelodeonPatterns.prototype.noteToPushButtonRow2 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.push_row2);
	if (ButtonNumber.length > 0)
		ButtonNumber += "'";
	return ButtonNumber;
}

MelodeonPatterns.prototype.noteToPullButtonRow2 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.pull_row2);
	if (ButtonNumber.length > 0)
		ButtonNumber += "'";
	return ButtonNumber;
}

MelodeonPatterns.prototype.noteToPushButtonRow3 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.push_row3);
	if (ButtonNumber.length > 0)
		ButtonNumber += "\"";
	return ButtonNumber;
}

MelodeonPatterns.prototype.noteToPullButtonRow3 = function(noteName) {
	let ButtonNumber = noteToButton(noteName, this.pull_row3);
	if (ButtonNumber.length > 0)
		ButtonNumber += "\"";
	return ButtonNumber;
}

MelodeonPatterns.prototype.StartScan = function () {
	if (!this.Scan) {
		//Clear
		this.aBars = new Array;
		this.BarIndex = -1;
		this.Scan = true;
		this.MarkBar();
	}
	
}

function PrevNonEmptyBarIndex(aBars, Index) {
	for (var PrevIndex = Index - 1; PrevIndex >= 0; --PrevIndex) {
		if (aBars[PrevIndex].notes.length > 0)
			return PrevIndex;
	}
	return -1;
}

function NextNonEmptyBarIndex(aBars, Index) {
	for (var NextIndex = Index + 1; NextIndex < aBars.length; ++NextIndex) {
		if (aBars[NextIndex].notes.length > 0)
			return NextIndex;
	}
	return -1;
}

function FirstLast(Bar, Push) {
	if (Push) {
		if (Bar.notes[0].push1 != '') {
			FirstR = 1;
			First    = parseInt(Bar.notes[0].push1);
		}
		else {
			FirstR = 2;
			First    = parseInt(Bar.notes[0].push2);
		}
	}
	else {
		if (Bar.notes[0].pull1 != '') {
			FirstR = 1;
			First = parseInt(Bar.notes[0].pull1);
		}
		else {
			FirstR = 2;
			First = parseInt(Bar.notes[0].pull2);
		}
	}
	
	if (Push) {
		if (Bar.notes[Bar.notes.length - 1].push1 != '') {
			LastR = 1;
			Last = parseInt(Bar.notes[Bar.notes.length - 1].push1);
		}
		else {
			LastR = 2;
			Last = parseInt(Bar.notes[Bar.notes.length - 1].push2);
		}
	}
	else {
		if (Bar.notes[Bar.notes.length - 1].pull1 != '') {
			LastR = 1;
			Last = parseInt(Bar.notes[Bar.notes.length - 1].pull1);
		}
		else {
			LastR = 2;
			Last = parseInt(Bar.notes[Bar.notes.length - 1].pull2);
		}
	}
	
	return {
		FirstRow: FirstR,
		FirstButton: First,
		LastRow: LastR,
		LastButton: Last
	}
}

function ChosenBarNumbers(Bar, Push) {
	Low  = 100;
	High = 0;
	for (var NoteIndex = 0; NoteIndex < Bar.notes.length; ++NoteIndex) {
		var Num = 0;
		if (Push) {
			if (Bar.notes[NoteIndex].push1 != '')
				Num = parseInt(Bar.notes[NoteIndex].push1);
			else
				Num = parseInt(Bar.notes[NoteIndex].push2);
		}
		else {
			if (Bar.notes[NoteIndex].pull1 != '')
				Num = parseInt(Bar.notes[NoteIndex].pull1);
			else
				Num = parseInt(Bar.notes[NoteIndex].pull2);
		}
		
		if (Num != 0) {
			if (Num < Low)
				Low = Num;
			if (Num > High)
				High = Num;
		}
	}
	
	return {LowButton: Low, HighButton: High}
}

function BarChoose(aBars, BarIndex, NeedBoth, AllowPrev, AllowNext) {
	var BeforeLow    = 0;
	var BeforeHigh   = 0;
	var PrevLast     = 0;
	var PrevLastRow  = 0;
	var PrevBarIndex = PrevNonEmptyBarIndex(aBars, BarIndex);
	if (AllowPrev && PrevBarIndex >= 0 && aBars[PrevBarIndex].chosen) {
		var Ch = ChosenBarNumbers(aBars[PrevBarIndex], aBars[PrevBarIndex].push);
		BeforeLow  = Ch.LowButton;
		BeforeHigh = Ch.HighButton;
		
		var Ch = FirstLast(aBars[PrevBarIndex], aBars[PrevBarIndex].push);
		PrevLast = Ch.LastButton;
		PrevLastRow = Ch.LastRow;
	}
	
	var AfterLow     = 0;
	var AfterHigh    = 0;
	var NextFirst    = 0;
	var NextFirstRow = 0;
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
	
	if (PrevLast != 0 || NextFirst != 0) {
		if (NeedBoth && (PrevLast == 0 || NextFirst == 0))
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

MelodeonPatterns.prototype.StartBuild = function () {
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
				if (this.aBars[BarIndex].notes[NoteIndex].push1 != '' || this.aBars[BarIndex].notes[NoteIndex].push2 != '')
					this.aBars[BarIndex].pushcount++;
				if (this.aBars[BarIndex].notes[NoteIndex].pull1 != '' || this.aBars[BarIndex].notes[NoteIndex].pull2 != '')
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

MelodeonPatterns.prototype.MarkBar = function () {
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

MelodeonPatterns.prototype.notesToNumber = function (notes, graces, chord) {
  //Update chord push/pull on change
  if (chord && chord.length > 0) {
    let Chord = chord[0].name.trim();
  
    //Can the current chord be played in push?
    this.ChordPush = false;
    if (!Chord.includes("<")) {
      if (Chord.length == 0 || Chord.includes(">"))
        this.ChordPush = true;
      for (var i = 0; i < this.push_chords.length; i++) {
        if (this.push_chords[i].startsWith(Chord[0])) //TODO: Does not work be Bb, F# etc.
          this.ChordPush = true;
      }
    }
    
    //Can the current chord be played in pull?
    this.ChordPull = false;
    if (!Chord.includes(">")) {
      if (Chord.length == 0 || Chord.includes("<"))
        this.ChordPull = true;
      for (var i = 0; i < this.pull_chords.length; i++) {
        if (this.pull_chords[i].startsWith(Chord[0])) //TODO: Does not work be Bb, F# etc.
          this.ChordPull = true;
      }
    }
    
    //If chord is not recognized, assume both directions are possible
    if (!this.ChordPush && !this.ChordPull) {
      this.ChordPush = true;
      this.ChordPull = true;
    }
    
    //Check if row annotation is added to the chord
    this.RowPrefer1 = Chord.indexOf(".");
	this.RowPrefer2 = Chord.indexOf(":");
	this.RowPrefer3 = Chord.indexOf(";");
  }
   
  if (this.Scan) {
	  if (this.aBars.length == 0)
		  this.MarkBar();
  }
  
  //For all notes at this count
  let strPush = "";
  let strPull = "";
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

    //Ignore end of tie, don't show numbers that are already pressed
    //TODO: Only if tie from same button
    if (notes[i].endTie)
      continue;
  
    //Get the note name
	var noteName = TNote.emitNoAccidentals();
	if (TNote.acc > 0)
	  noteName = "^" + noteName;
	else if (TNote.acc < 0)
	  noteName = "_" + noteName;
	
	//Get possibilities for the note on all rows in both directions
	let _push1 = this.noteToPushButtonRow1(noteName);
	let _push2 = this.noteToPushButtonRow2(noteName);
	let _push3 = this.noteToPushButtonRow3(noteName);
	let _pull1 = this.noteToPullButtonRow1(noteName);
	let _pull2 = this.noteToPullButtonRow2(noteName);
	let _pull3 = this.noteToPullButtonRow3(noteName);
	
	if (this.showall) {
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
		else if (this.ChordPush) {
			if (_push1.length == 0) AllowRow1 = false;
			if (_push2.length == 0) AllowRow2 = false;
			if (_push3.length == 0) AllowRow3 = false;
		}
		else if (this.ChordPull) {
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
	else {
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
			//Choose push or pull, prefer chosen option in the bar, except when this is not possible
			let Push = this.aBars[this.BarIndex].push;
			if ( Push && _push1 == '' && _push2 == '' && _push3 == '')
				Push = false;
			if (!Push && _pull1 == '' && _pull2 == '' && _pull3 == '')
				Push = true;
			
			//Create array of buttons
			let aButtons = new Array;
			if (Push) {
				if (_push1 != '') aButtons.push(_push1);
				if (_push2 != '') aButtons.push(_push2);
				if (_push3 != '') aButtons.push(_push2);
			}
			else {
				if (_pull1 != '') aButtons.push(_pull1);
				if (_pull2 != '') aButtons.push(_pull2);
				if (_pull3 != '') aButtons.push(_pull2);
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
			
			let Button = '';
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
			
			//If a button was found
			if (Button.length) {
				//Add it to push or pull
				if (Push)
					strPush = AppendButton(strPush, Button);
				else
					strPull = AppendButton(strPull, Button);
			}
		}
	}
  }
  
  //Create return value with push and pull element (normally only one of the two)
  var error     = null; 
  var retNotes  = new Array;
  var retGraces = null;
  if (strPush.length) {
	strPush = strPush.replace("'" , this.Row2Marker);
	strPush = strPush.replace("\"", this.Row3Marker);

    var note = new TabNote.TabNote("");
    var number = {
      num : strPush,
      str : -1, //Top row
      note: note
    };
    retNotes.push(number);
  }
  if (strPull.length) {
	strPull = strPull.replace("'" , this.Row2Marker);
	strPull = strPull.replace("\"", this.Row3Marker);

    var note = new TabNote.TabNote("");
    var number = {
      num : strPull,
      str : 1, //Bottom row
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

MelodeonPatterns.prototype.stringToPitch = function (stringNumber) {
  if (stringNumber < 1)
    return 14.7;
  else
    return 9.7;
};

module.exports = MelodeonPatterns;
