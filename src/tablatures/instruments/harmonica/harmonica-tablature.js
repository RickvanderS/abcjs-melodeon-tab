
/**
 * Layout tablature informations for draw
 * @param {*} numLines 
 * @param {*} lineSpace 
 */

function HarmonicaTablature(numLines, lineSpace) {
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
HarmonicaTablature.prototype.bypass = function (line) {
  var voices = line.staffGroup.voices;
  if (voices.length > 0) {
    if (voices[0].isPercussion) return true;
  }
  return false;
};  


HarmonicaTablature.prototype.setRelative = function (child, relative, first) {
  switch (child.type) {
    case 'bar':
      relative.pitch = this.bar.pitch;
      relative.pitch2 = this.bar.pitch2;
      relative.height = this.height;
      break;
    case 'symbol':
      if (child.name == 'dots.dot') {
        if (first) {
          relative.pitch = this.bar.pitch + (this.bar.pitch2 - this.bar.pitch) / 4 * 1;
          return false;
        } else {
          relative.pitch = this.bar.pitch + (this.bar.pitch2 - this.bar.pitch) / 4 * 3;
          return true;
        }
      }
      break;
  }
  return first;
};

module.exports = HarmonicaTablature;