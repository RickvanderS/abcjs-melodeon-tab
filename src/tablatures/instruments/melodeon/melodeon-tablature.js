
/**
 * Layout tablature informations for draw
 * @param {*} numLines 
 * @param {*} lineSpace 
 */

function MelodeonTablature(numLines, lineSpace) {
  this.numLines = numLines;
  this.lineSpace = lineSpace;
  this.verticalSize = this.numLines * this.lineSpace;
  var pitch = 5;
  this.bar = {
    pitch: pitch,
    pitch2: lineSpace * numLines,
    height: 5,
  };
}

/**
 * return true if current line should not produce a tab
 * @param {} line 
 */
MelodeonTablature.prototype.bypass = function (line) {
  var voices = line.staffGroup.voices;
  if (voices.length > 0) {
    if (voices[0].isPercussion) return true;
  }
  return false;
};  


MelodeonTablature.prototype.setRelative = function (child, relative, first) {
  switch (child.type) {
    case 'bar':
      relative.pitch = this.bar.pitch;
      relative.pitch2 = this.bar.pitch2;
      relative.height = this.height;
      break;
    case 'symbol':
      if (child.name == 'dots.dot') {
		//Change distance between the dots based on the number of tab rows
		var Div;
		var Mult1;
		var Mult2;
		if (this.numLines == 2) {
			Div   = 4;
			Mult1 = 1;
			Mult2 = 3;
		}
		else if (this.numLines == 3) {
			Div   = 8;
			Mult1 = 3;
			Mult2 = 5;
		}
		else {
			Div   = 10;
			Mult1 = 4;
			Mult2 = 6;
		}
		
        if (first) {
          relative.pitch = this.bar.pitch + (this.bar.pitch2 - this.bar.pitch) / Div * Mult1;
          return false;
        } else {
          relative.pitch = this.bar.pitch + (this.bar.pitch2 - this.bar.pitch) / Div * Mult2;
          return true;
        }
      }
      break;
  }
  return first;
};

module.exports = MelodeonTablature;