var StringPatterns = require('../string-patterns');
var TabNote = require('../tab-note');

function HarmonicaPatterns(plugin) {
  this.tuning = plugin._super.params.tuning;
  this.measureAccidentals = {}
  
  if (!this.tuning) {
    this.tuning = ['C'];
  }

  plugin.tuning = this.tuning;
  this.strings = new StringPatterns(plugin);
}

//Lookup individual notes
function noteToHole(noteName, tuning) {
	if (tuning == "C") {
		//Octave 4
		if (noteName == 'C')
			return '1';
		if (noteName == '^C' || noteName == '_D')
			return '-1\'';
		if (noteName == 'D')
			return '-1';
		if (noteName == '^D' || noteName == '_E')
			return '';
		if (noteName == 'E')
			return '2';
		if (noteName == 'F')
			return '-2\'\'';
		if (noteName == '^F' || noteName == '_G')
			return '-2\'';
		if (noteName == 'G')
			return '3'; //Or '-2'
		if (noteName == '^G' || noteName == '_A')
			return '-3\'\'\'';
		if (noteName == 'A')
			return '-3\'\'';
		if (noteName == '^A' || noteName == '_B')
			return '-3\'';
		if (noteName == 'B')
			return '-3';
		
		//Octave 5
		if (noteName == 'c')
			return '4';
		if (noteName == '^c' || noteName == '_d')
			return '-4\'';
		if (noteName == 'd')
			return '-4';
		if (noteName == '^d' || noteName == '_e')
			return '';
		if (noteName == 'e')
			return '5';
		if (noteName == 'f')
			return '-5';
		if (noteName == '^f' || noteName == '_g')
			return '';
		if (noteName == 'g')
			return '6';
		if (noteName == '^g' || noteName == '_a')
			return '';
		if (noteName == 'a')
			return '-6';
		if (noteName == '^a' || noteName == '_b')
			return '-6\'';
		if (noteName == 'b')
			return '-7';
		
		//Octave 6
		if (noteName == 'c\'')
			return '7';
		if (noteName == '^c\'' || noteName == '_d\'')
			return '';
		if (noteName == 'd\'')
			return '-8';
		if (noteName == '^d\'' || noteName == '_e\'')
			return '8\'';
		if (noteName == 'e\'')
			return '8';
		if (noteName == 'f\'')
			return '-9';
		if (noteName == '^f\'' || noteName == '_g\'')
			return '9\'';
		if (noteName == 'g\'')
			return '9';
		if (noteName == '^g\'' || noteName == '_a\'')
			return '';
		if (noteName == 'a\'')
			return '-10';
		if (noteName == '^a\'' || noteName == '_b\'')
			return '10\'\'';
		if (noteName == 'b\'')
			return '10\'';
		
		//Octave 7
		if (noteName == 'c\'\'')
			return '10';
	}
	else {
		//TODO: Different tunings
	}
	
	return '';
}

HarmonicaPatterns.prototype.StartScan = function () {
	
}

HarmonicaPatterns.prototype.StartBuild = function () {
	
}

HarmonicaPatterns.prototype.MarkBar = function () {
	
}

HarmonicaPatterns.prototype.notesToNumber = function (notes, graces) {
  var error     = null; 
  var retNotes  = new Array;
  var retGraces = null;
  
  var tuning = this.tuning;
  
  for (var i = 0; i < notes.length; ++i) {
    var TNote = new TabNote.TabNote(notes[i].name);
    TNote.checkKeyAccidentals(this.accidentals, this.measureAccidentals);
    var noteName = TNote.emitNoAccidentals();
    if (TNote.acc > 0)
      noteName = "^" + noteName;
    else if (TNote.acc < 0)
      noteName = "_" + noteName;
  
    var hole = noteToHole(noteName, tuning);
    
	if (hole != '') {
		var stringNumber = -0.7;
		var note = new TabNote.TabNote(notes[0].name);
		var number = {
			  num: hole,
			  str: stringNumber,
			  note: note
		}
	
		retNotes.push(number);
		
		//Only one note at a time supported
		break;
	}
  }
  
  return {
    notes: retNotes,
    graces: retGraces,
    error: error
  };
};

HarmonicaPatterns.prototype.stringToPitch = function (stringNumber) {
  return 9.7;
  //var converter = this.strings;
  //return converter.stringToPitch(stringNumber);
};

module.exports = HarmonicaPatterns;
