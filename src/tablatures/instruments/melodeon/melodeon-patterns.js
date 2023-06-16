var StringPatterns = require('../string-patterns');
var TabNote = require('../tab-note');

function MelodeonPatterns(plugin) {
  this.tuning = plugin._super.params.tuning;
  this.measureAccidentals = {}
  
  this.PrevBar       = true;
  this.PrevPush      = true;
  this.PrevRow       = 0;
  this.PrevNumber    = 6;
  this.FingerNumber1 = 0;
  this.FingerNumber4 = 0;
  
	this.Scan   = false;
	this.BarIndex = -1;
	this.aBars    = new Array;
  
  if (!this.tuning) {
    this.tuning = ['CF'];
  }
  
  this.PrevChord = "";

  plugin.tuning = this.tuning;
  
  this.push_chords = new Array;
  this.pull_chords = new Array;
  if (this.tuning.includes('C')) {
    this.push_chords.push("C");
    this.pull_chords.push("G");
    this.pull_chords.push("Gm");
    this.pull_chords.push("Gm7");
    this.push_chords.push("A");
    this.push_chords.push("Am");
    this.push_chords.push("Am7");
    this.pull_chords.push("Dm");
  }
  if (this.tuning.includes('F') || this.tuning.includes('F5')) {
    this.push_chords.push("F");
    this.pull_chords.push("C");
    this.push_chords.push("B♭");
    this.pull_chords.push("B♭");
  }
  
  
  this.strings = new StringPatterns(plugin);
}

function noteToPushButtonRow1(noteName, rowtuning) {
console.log("conv " + noteName);
  
  if (rowtuning == "C") {
    //Octave 3
    if (noteName == "G,")
      return "2";
    
    //Octave 4
    if (noteName == "C")
      return "3";
    if (noteName == "E")
      return "4";
    if (noteName == "^F" || noteName == "_G")
      return "1";
    if (noteName == "G")
      return "5";
    
    //Octave 5
    if (noteName == "c")
      return "6";
    if (noteName == "e")
      return "7";
    if (noteName == "g")
      return "8";
    
    //Octave 6
    if (noteName == "c'")
      return "9";
    if (noteName == "e'")
      return "10";
    if (noteName == "g'")
      return "11";
  }
  else if (rowtuning == "G") {
    //TODO:
  }
  else if (rowtuning == "A") {
    //TODO:
  }
  
  return "";
}

function noteToPullButtonRow1(noteName, rowtuning) {
  if (rowtuning == "C") {
    //Octave 3
    if (noteName == "B,")
      return "2";
    
    //Octave 4
    if (noteName == "D")
      return "3";
    if (noteName == "F")
      return "4";
    if (noteName == "^G" || noteName == "_A")
      return "1";
    if (noteName == "A")
      return "5";
    if (noteName == "B")
      return "6";
    
    //Octave 5
    if (noteName == "d")
      return "7";
    if (noteName == "f")
      return "8";
    if (noteName == "a")
      return "9";
    if (noteName == "b")
      return "10";
    
    //Octave 6
    if (noteName == "d'")
      return "11";
  }
  else if (rowtuning == "G") {
    //TODO:
  }
  else if (rowtuning == "A") {
    //TODO:
  }

  return "";
}

function noteToPushButtonRow2(noteName, rowtuning) {
  if (rowtuning == "F5") {
    //Octave 4
    if (noteName == "C")
      return "2'";
    if (noteName == "F")
      return "3'";
    if (noteName == "A")
      return "4'";
    if (noteName == "d")
      return "5'";
    
    //Octave 5
    if (noteName == "^d" || noteName == "_e")
      return "1'";
    if (noteName == "f")
      return "6'";
    if (noteName == "a")
      return "7'";
    if (noteName == "c'")
      return "8'";
    
    //Octave 6
    if (noteName == "f'")
      return "9'";
    if (noteName == "a'")
      return "10'";
  }
  else if (rowtuning == "C") {
    //TODO:
  }
  else if (rowtuning == "D") {
    //TODO:
  }
  
  return "";
}

function noteToPullButtonRow2(noteName, rowtuning) {
  if (rowtuning == "F5") {
    //Octave 3
    if (noteName == "E")
      return "2'";
    
    //Octave 4
    if (noteName == "G")
      return "3'";
    if (noteName == "^A" || noteName == "_B")
      return "4'";
    if (noteName == "c")
      return "5'";
    if (noteName == "^c" || noteName == "_d")
      return "1'";
    if (noteName == "e")
      return "6'";
    
    //Octave 5
    if (noteName == "g")
      return "7'";
    if (noteName == "^a" || noteName == "_b")
      return "8'";
    
    //Octave 6
    if (noteName == "d'")
      return "9'";
    if (noteName == "e'")
      return "10'";
  }
  else if (rowtuning == "C") {
    //TODO:
  }
  else if (rowtuning == "D") {
    //TODO:
  }
  
  return "";
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
  var rowtuning1 = '';
  if (this.tuning.length >= 1)
     rowtuning1 = this.tuning[0];
  var rowtuning2 = '';
  if (this.tuning.length >= 2)
    rowtuning2 = this.tuning[1];
  
  retNotes = [];
  for (var i = 0; i < notes.length; i++) {
    //Obtain all possible ways to play this note
    var push1 = noteToPushButtonRow1(notes[i], rowtuning1);
    var push2 = noteToPushButtonRow2(notes[i], rowtuning2);
    var pull1 = noteToPullButtonRow1(notes[i], rowtuning1);
    var pull2 = noteToPullButtonRow2(notes[i], rowtuning2);
    
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
      var stringNumber = Push ? 0.3 : 1.0;
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
		
	}
	this.Scan = true;
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
		console.log("bars:" + this.aBars.length);
		
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
    this.PrevChord = chord[0].name;

  can_push = this.push_chords.includes(this.PrevChord);
  can_pull = this.pull_chords.includes(this.PrevChord);
  if (!can_push && !can_pull) {
    can_push = true;
    can_pull = true;
  }


   
  var rowtuning1 = '';
  if (this.tuning.length >= 1)
     rowtuning1 = this.tuning[0];
  var rowtuning2 = '';
  if (this.tuning.length >= 2)
    rowtuning2 = this.tuning[1];
  
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
		
		_push1 = noteToPushButtonRow1(noteName, rowtuning1);
		_push2 = noteToPushButtonRow2(noteName, rowtuning2);
		_pull1 = noteToPullButtonRow1(noteName, rowtuning1);
		_pull2 = noteToPullButtonRow2(noteName, rowtuning2);
		
		if (!can_push) {
			_push1 = "";
			_push2 = "";
		}
		if (!can_pull) {
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
		
		push1 = noteToPushButtonRow1(noteName, rowtuning1);
		push2 = noteToPushButtonRow2(noteName, rowtuning2);
		pull1 = noteToPullButtonRow1(noteName, rowtuning1);
		pull2 = noteToPullButtonRow2(noteName, rowtuning2);
		
		if (!can_push) {
			push1 = "";
			push2 = "";
		}
		if (!can_pull) {
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
      var stringNumber = Push ? 0.3 : 1.0;
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
  var converter = this.strings;
  return converter.stringToPitch(stringNumber);
};

module.exports = MelodeonPatterns;
