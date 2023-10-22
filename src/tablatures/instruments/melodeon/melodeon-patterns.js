var StringPatterns = require('../string-patterns');
var TabNote = require('../tab-note');
var transposeChordName = require("../../../parse/transpose-chord")
var allNotes = require('../../../parse/all-notes');

function MelodeonPatterns(plugin) {
  this.measureAccidentals = {}
  
  //Set default tuning if not specified
  this.tuning = plugin._super.params.tuning;
  if (!this.tuning) {
    this.tuning = new Array;
    this.tuning.push("G");
    this.tuning.push("C5");
    plugin.tuning = this.tuning;
  }
  
  //Set default chin accidentals of not specified
  this.chinacc = plugin._super.params.chinacc;
  if (!this.chinacc === null) {
    this.chinacc = true;
    plugin.chinacc = this.chinacc;
  }

  //Lookup melodeon notes
  let TransposeHalfSteps = 0;
  this.push_chords = new Array;
  this.pull_chords = new Array;
  let push_row1 = new Array;
  let pull_row1 = new Array;
  let push_row2 = new Array;
  let pull_row2 = new Array;
  if (this.tuning.length == 1) {
    //For non-G figure out how to transpose
    if      (this.tuning[0].substring(0, 2) == "Bb" || this.tuning[0].substring(0, 2) == "A#")
      TransposeHalfSteps = -9;
    else if (this.tuning[0].substring(0, 1) == "B"                                           )
      TransposeHalfSteps = -8;
    else if (this.tuning[0].substring(0, 1) == "C"                                           )
      TransposeHalfSteps = -7;
    else if (this.tuning[0].substring(0, 2) == "Db" || this.tuning[0].substring(0, 2) == "C#")
      TransposeHalfSteps = -6;
    else if (this.tuning[0].substring(0, 1) == "D"                                           )
      TransposeHalfSteps = -5;
    else if (this.tuning[0].substring(0, 2) == "Eb" || this.tuning[0].substring(0, 2) == "D#")
      TransposeHalfSteps = -4;
    else if (this.tuning[0].substring(0, 1) == "E"                                           )
      TransposeHalfSteps = -3;
    else if (this.tuning[0].substring(0, 1) == "F"                                           )
      TransposeHalfSteps = -2;
    else if (this.tuning[0].substring(0, 2) == "Gb" || this.tuning[0].substring(0, 2) == "F#")
      TransposeHalfSteps = -1;
    else if (this.tuning[0].substring(0, 1) == "G"                                           )
      TransposeHalfSteps =  0;
    else if (this.tuning[0].substring(0, 2) == "Ab" || this.tuning[0].substring(0, 2) == "G#")
      TransposeHalfSteps =  1;
    else if (this.tuning[0].substring(0, 1) == "A"                                           )
      TransposeHalfSteps =  2;
    else {
      console.error('1 row melodeon with tuning \'' + this.tuning[0] + '\' is not supported');
      return;
    }
    
    //Define left hand chords for G melodeon with 4 base buttons
    this.push_chords.push("G"); // G push
    this.pull_chords.push("D"); // D
    this.push_chords.push("C"); // C push
    this.pull_chords.push("C"); // C pull
    
    //Define right hand buttons for G melodeon
    push_row1.push("B,,"); // 1
    pull_row1.push("D," );
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
  }
  else if (this.tuning.length == 2) {
    //For non-GC figure out how to transpose
    if      ((this.tuning[0].substring(0, 2) == "Eb" || this.tuning[0].substring(0, 2) == "D#") && (this.tuning[1].substring(0, 2) == "Ab" || this.tuning[1].substring(0, 2) == "G#")) //Very rare
      TransposeHalfSteps = -3;
    else if ((this.tuning[0].substring(0, 1) == "E"                                           ) && (this.tuning[1].substring(0, 1) == "A"                                           )) //Very rare
      TransposeHalfSteps = -3;
    else if ((this.tuning[0].substring(0, 1) == "F"                                           ) && (this.tuning[1].substring(0, 2) == "Bb" || this.tuning[1].substring(0, 2) == "A#"))
      TransposeHalfSteps = -2;
    else if ((this.tuning[0].substring(0, 2) == "Gb" || this.tuning[0].substring(0, 2) == "F#") && (this.tuning[1].substring(0, 1) == "B"                                           )) //Very rare
      TransposeHalfSteps = -1;
    else if ((this.tuning[0].substring(0, 1) == "G"                                           ) && (this.tuning[1].substring(0, 1) == "C"                                           )) //France, South America
      TransposeHalfSteps =  0;
    else if ((this.tuning[0].substring(0, 2) == "Ab" || this.tuning[0].substring(0, 2) == "G#") && (this.tuning[1].substring(0, 2) == "Db" || this.tuning[1].substring(0, 2) == "C#")) //Very rare
      TransposeHalfSteps =  1;
    else if ((this.tuning[0].substring(0, 1) == "A"                                           ) && (this.tuning[1].substring(0, 1) == "D"                                           )) //France
      TransposeHalfSteps =  2;
    else if ((this.tuning[0].substring(0, 2) == "Bb" || this.tuning[0].substring(0, 2) == "A#") && (this.tuning[1].substring(0, 2) == "Eb" || this.tuning[1].substring(0, 2) == "D#"))
      TransposeHalfSteps =  3;
    else if ((this.tuning[0].substring(0, 1) == "B"                                           ) && (this.tuning[1].substring(0, 1) == "E"                                           )) //Very rare
      TransposeHalfSteps =  4;
    else if ((this.tuning[0].substring(0, 1) == "C"                                           ) && (this.tuning[1].substring(0, 1) == "F"                                           )) //Netherlands, Germany
      TransposeHalfSteps =  5;
    else if ((this.tuning[0].substring(0, 2) == "Db" || this.tuning[0].substring(0, 2) == "C#") && (this.tuning[1].substring(0, 2) == "Gb" || this.tuning[1].substring(0, 2) == "F#")) //Very rare
      TransposeHalfSteps =  6;
    else if ((this.tuning[0].substring(0, 1) == "D"                                           ) && (this.tuning[1].substring(0, 1) == "G"                                           )) //England
      TransposeHalfSteps =  7;
    else {
      console.error('2 row melodeon with row1 tuning \'' + this.tuning[0] + '\' and row2 tuning \'' + this.tuning[1] + '\' is not supported');
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
  
  //Handle button push/pull inversions for each row
  let TuneRow1 = this.tuning[0];
  for (let i = this.push_row1.length; i >= 1; --i) {
    let Pos = TuneRow1.search(i.toString());
    if (Pos >= 0) {
      let Tmp = this.push_row1[i-1];
      this.push_row1[i-1] = this.pull_row1[i-1];
      this.pull_row1[i-1] = Tmp;
      TuneRow1 = TuneRow1.substr(0, Pos) + TuneRow1.substr(Pos + i.toString().length);
    }
  }
  let TuneRow2 = this.tuning[1];
  for (let i = this.push_row2.length; i >= 1; --i) {
    let Pos = TuneRow2.search(i.toString());
    if (Pos >= 0) {
      let Tmp = this.push_row2[i-1];
      this.push_row2[i-1] = this.pull_row2[i-1];
      this.pull_row2[i-1] = Tmp;
      TuneRow2 = TuneRow2.substr(0, Pos) + TuneRow2.substr(Pos + i.toString().length);
    }
  }
  
  //console.log(this.push_row1);
  //console.log(this.pull_row1);
  //console.log(this.push_row2);
  //console.log(this.pull_row2);
  
  //State variables
  this.PrevBar       = true;
  this.PrevPush      = true;
  this.PrevRow       = 0;
  this.PrevNumber    = 6;
  this.FingerNumber1 = 0;
  this.FingerNumber4 = 0;
  
  this.Scan   = false;
  this.BarIndex = -1;
  this.aBars    = new Array;
  this.PrevChord = "";
  
  this.strings = {
    accidentals: new Array,
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

MelodeonPatterns.prototype.FingerMove = function (ButtonNumber) {
  if (this.FingerNumber1 == 0 || this.FingerNumber4 == 0)
    return 0;
  if (ButtonNumber > this.FingerNumber1 + 3)
    return ButtonNumber - (this.FingerNumber1 + 3);
  if (ButtonNumber < this.FingerNumber4 - 3)
    return (this.FingerNumber4 - 3) - ButtonNumber;
  return 0;
}

MelodeonPatterns.prototype.notesToNumber2 = function (notes) {
  retNotes = [];
  for (var i = 0; i < notes.length; i++) {
    //Obtain all possible ways to play this note
    var push1 = this.noteToPushButtonRow1(notes[i]);
    var push2 = this.noteToPushButtonRow2(notes[i]);
    var pull1 = this.noteToPullButtonRow1(notes[i]);
    var pull2 = this.noteToPullButtonRow2(notes[i]);
    
    //Parse button numbers
    var Push1Number = push1 != "" ? Math.abs(parseInt(push1)) : 10000;
    var Push2Number = push2 != "" ? Math.abs(parseInt(push2)) : 10000;
    var Pull1Number = pull1 != "" ? Math.abs(parseInt(pull1)) : 10000;
    var Pull2Number = pull2 != "" ? Math.abs(parseInt(pull2)) : 10000;

    //Calculate distance from previous button
    var Push1Dist = Math.abs(Push1Number - this.PrevNumber);
    var Push2Dist = Math.abs(Push2Number - this.PrevNumber);
    var Pull1Dist = Math.abs(Pull1Number - this.PrevNumber);
    var Pull2Dist = Math.abs(Pull2Number - this.PrevNumber);
  
    //Really don't like having to move hand position
    var FingerMovePenalty = 3;
    if (this.FingerNumber1 != 0 && this.FingerNumber4 != 0) {
      var FingerMovePush1 = this.FingerMove(Push1Number);
      var FingerMovePush2 = this.FingerMove(Push2Number);
      var FingerMovePull1 = this.FingerMove(Pull1Number);
      var FingerMovePull2 = this.FingerMove(Pull2Number);
      Push1Dist += FingerMovePush1 * FingerMovePenalty;
      Push2Dist += FingerMovePush2 * FingerMovePenalty;
      Pull1Dist += FingerMovePull1 * FingerMovePenalty;
      Pull2Dist += FingerMovePull2 * FingerMovePenalty;
    }
    
    //Prefer not to change rows
    var RowChangePenalty = 0;
    if (this.PrevRow != 0) {
      if (this.PrevRow != 1) {
        Push1Dist += RowChangePenalty;
        Pull1Dist += RowChangePenalty;
      }
      if (this.PrevRow != 2) {
        Push2Dist += RowChangePenalty;
        Pull2Dist += RowChangePenalty;
      }
    }
    
    if (!this.PrevBar) {
      //Prefer not to change direction
      var DirChangePenalty = 10;
      if (this.PrevPush == false) {
        Push1Dist += DirChangePenalty;
        Push2Dist += DirChangePenalty;
      }
      else {
        Pull1Dist += DirChangePenalty;
        Pull2Dist += DirChangePenalty;
      }
    }
    else {
      //Like changing directions at bars
      var DirChangeBonus = 5;
      if (this.PrevPush == false) {
        Push1Dist -= DirChangeBonus;
        Push2Dist -= DirChangeBonus;
      }
      else {
        Pull1Dist -= DirChangeBonus;
        Pull2Dist -= DirChangeBonus;
      }
    }

    //Choose the easiest option
    var Push   = true;
    var Row    = 0;
    var Button = '';
    if (Push1Dist <= Push2Dist && Push1Dist <= Pull1Dist && Push1Dist <= Pull2Dist) {
      Push   = true;
      Row    = 1;
      Button = push1;
    }
    else if (Push2Dist <= Push1Dist && Push2Dist <= Pull1Dist && Push2Dist <= Pull2Dist) {
      Push   = true;
      Row    = 2;
      Button = push2;
    }
    else if (Pull1Dist <= Push1Dist && Pull1Dist <= Push2Dist && Pull1Dist <= Pull2Dist) {
      Push   = false;
      Row    = 1;
      Button = pull1;
    }
    else if (Pull2Dist <= Push1Dist && Pull2Dist <= Push2Dist && Pull2Dist <= Pull1Dist) {
      Push   = false;
      Row    = 2;
      Button = pull2;
    }
    
    //If a way was found add it
    if (Button != '') {
      //Add the tab note
      var stringNumber = Push ? -1 : 1;
      var note = new TabNote.TabNote(notes[0].name);
      var number = {
        num: Button,
        str: stringNumber,
        note: note
      };
      retNotes.push(number);
      
      //Set previous direction, row and button number
      ButtonNumber = parseInt(Button);
      this.PrevPush   = Push;
      this.PrevRow    = Row;
      this.PrevNumber = ButtonNumber;
      this.PrevBar    = false;
      
      //Update hand position
      if (this.FingerNumber4 == 0 || ButtonNumber > this.FingerNumber4) {
        this.FingerNumber4 = ButtonNumber;
        if (this.FingerNumber1 != 0 && this.FingerNumber1 < this.FingerNumber4 - 3)
          this.FingerNumber1 = this.FingerNumber4 - 3;
      }
      if (this.FingerNumber1 == 0 || ButtonNumber < this.FingerNumber1) {
        this.FingerNumber1 = ButtonNumber;
        if (this.FingerNumber4 != 0 && this.FingerNumber4 >  this.FingerNumber1 + 3)
          this.FingerNumber4 = this.FingerNumber1 + 3;
      }
      
      //Only one note at a time supported
      break;
    }
  }

  return retNotes;
};

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
	if (this.Scan) {
		//console.log("bars:" + this.aBars.length);
		
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
		
		
		
		//TODO: Run optimization algorithm
		this.BarIndex = 0;
	}
	this.Scan = false;
}

MelodeonPatterns.prototype.MarkBar = function () {
	this.PrevBar = true;
	
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

MelodeonPatterns.prototype.notesToNumber = function (notes, graces, chord) {
  var error     = null; 
  var retNotes  = new Array;
  var retGraces = null;
  
  if (chord && chord.length > 0)
    this.PrevChord = chord[0].name.trim();
  
  can_push = false;
  if (!this.PrevChord.endsWith("<")) {
    if (this.PrevChord.length == 0 || this.PrevChord == ">")
      can_push = true;
    for (var i = 0; i < this.push_chords.length; i++) {
      if (this.push_chords[i].startsWith(this.PrevChord[0]))
        can_push = true;
    }
  }
  
  can_pull = false;
  if (!this.PrevChord.endsWith(">")) {
    if (this.PrevChord.length == 0 || this.PrevChord == "<")
      can_pull = true;
    for (var i = 0; i < this.pull_chords.length; i++) {
      if (this.pull_chords[i].startsWith(this.PrevChord[0]))
        can_pull = true;
    }
  }
  
  if (!can_push && !can_pull) {
    can_push = true;
    can_pull = true;
  }
   
  if (this.Scan) {
	  if (this.aBars.length == 0)
		  this.MarkBar();
	  
	  for (var i = 0; i < notes.length; ++i) {
		  var TNote = new TabNote.TabNote(notes[i].name);
		  TNote.checkKeyAccidentals(this.strings.accidentals, this.measureAccidentals);
		  var noteName = TNote.emitNoAccidentals();
		if (TNote.acc > 0)
		    noteName = "^" + noteName;
		else if (TNote.acc < 0)
		    noteName = "_" + noteName;
		
		_push1 = this.noteToPushButtonRow1(noteName);
		_push2 = this.noteToPushButtonRow2(noteName);
		_pull1 = this.noteToPullButtonRow1(noteName);
		_pull2 = this.noteToPullButtonRow2(noteName);
		
		var ClearPush = false;
		if (!can_push && (_pull1.length != 0 || _pull2.length != 0)) {
			ClearPush = true;
		}
		var ClearPull = false;
		if (!can_pull && (_push1.length != 0 || _push2.length != 0)) {
			ClearPull = true;
		}
		
		if (ClearPush) {
			_push1 = "";
			_push2 = "";
		}
		if (ClearPull) {
			_pull1 = "";
			_pull2 = "";
		}


		  
		  this.aBars[this.BarIndex].notes.push(
			  {
				note : notes[i],
				push1: _push1,
				push2: _push2,
				pull1: _pull1,
				pull2: _pull2
			  }
		  );
	  }
  }
  else {
	if (this.aBars[this.BarIndex].chosen) {
		var TNote = new TabNote.TabNote(notes[0].name);
		TNote.checkKeyAccidentals(this.strings.accidentals, this.measureAccidentals);
		var noteName = TNote.emitNoAccidentals();
		if (TNote.acc > 0)
		    noteName = "^" + noteName;
		else if (TNote.acc < 0)
		    noteName = "_" + noteName;
		
		push1 = this.noteToPushButtonRow1(noteName);
		push2 = this.noteToPushButtonRow2(noteName);
		pull1 = this.noteToPullButtonRow1(noteName);
		pull2 = this.noteToPullButtonRow2(noteName);
		
		var ClearPush = false;
		if (!can_push && (pull1.length != 0 || pull2.length != 0)) {
			ClearPush = true;
		}
		var ClearPull = false;
		if (!can_pull && (push1.length != 0 || push2.length != 0)) {
			ClearPull = true;
		}
		
		if (ClearPush) {
			push1 = "";
			push2 = "";
		}
		if (ClearPull) {
			pull1 = "";
			pull2 = "";
		}

		//Choose push or pull, prefer chosen option in the bar, except when this is not possible
		Push   = this.aBars[this.BarIndex].push;
		if (Push && push1 == '' && push2 == '')
			Push = false;
		if (!Push && pull1 == '' && pull2 == '')
			Push = true;
		
		//Choose the button
		Button = '';
		if (Push) {
			if (push1 != '')
				Button = push1;
			else
				Button = push2;
		}
		else {
			if (pull1 != '')
				Button = pull1;
			else
				Button = pull2;
		}
		
      //Add the tab note
      var stringNumber = Push ? -1 : 1;
      var note = new TabNote.TabNote(notes[0].name);
      var number = {
        num: Button,
        str: stringNumber,
        note: note
      };
      retNotes.push(number);
		
	}
	  
	  
	  
	  
	  
  }
  
  
  return {
    notes: retNotes,
    graces: retGraces,
    error: error
  };
};

MelodeonPatterns.prototype.stringToPitch = function (stringNumber) {
  if (stringNumber < 1)
    return 14.7;
  else
    return 9.7;
};

module.exports = MelodeonPatterns;
