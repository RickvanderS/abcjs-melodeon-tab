/*
Emit tab for Harmonica staff
*/
var HarmonicaTablature = require('./harmonica-tablature');
var TabCommon = require('../../tab-common');
var TabRenderer = require('../../tab-renderer');
var HarmonicaPatterns = require('./harmonica-patterns');

/**
* upon init mainly store provided instances for later usage
* @param {*} abcTune  the parsed tune AST tree
*  @param {*} tuneNumber  the parsed tune AST tree
* @param {*} params  complementary args provided to Tablature Plugin
*/
Plugin.prototype.init = function (abcTune, tuneNumber, params) {
  var _super = new TabCommon(abcTune, tuneNumber, params);
  this._super = _super;
  this.abcTune = abcTune;
  this.linePitch = 8;
  this.nbLines = 1;
  this.isTabBig = false;
  this.capo = params.capo;
  this.transpose = params.visualTranspose;
  this.tablature = new HarmonicaTablature(this.nbLines,
    this.linePitch);

  var semantics = new HarmonicaPatterns(this);
  this.semantics = semantics;
};

Plugin.prototype.scan = function (renderer, line, staffIndex) {

}

Plugin.prototype.render = function (renderer, line, staffIndex) {
  if (this._super.inError) return;
  if (this.tablature.bypass(line)) return;
  var rndrer = new TabRenderer(this, renderer, line, staffIndex);
  rndrer.doLayout();
};

function Plugin() {}

//
// Tablature plugin definition
//
var AbcHarmonicaTab = function () {
  return { name: 'HarmonicaTab', tablature: Plugin };
};


module.exports = AbcHarmonicaTab;