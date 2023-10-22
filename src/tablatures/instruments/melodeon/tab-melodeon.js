/*
Emit tab for Melodeon staff
*/
var MelodeonTablature = require('./melodeon-tablature');
var TabCommon = require('../../tab-common');
var TabRenderer = require('../../tab-renderer');
var MelodeonPatterns = require('./melodeon-patterns');
var AbsoluteElement = require('../../../write/creation/elements/absolute-element');
var RelativeElement = require('../../../write/creation/elements/relative-element');

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
  this.linePitch = 5;
  this.nbLines = 3;
  this.isTabBig = false;
  this.chinacc = params.chinacc;
  this.transpose = params.visualTranspose;
  this.tablature = new MelodeonTablature(this.nbLines,
    this.linePitch);

  var semantics = new MelodeonPatterns(this);
  this.semantics = semantics;
};

Plugin.prototype.buildTabAbsolute = function (absX, relX) {
  var tabIcon = 'tab.tiny';
  var tabYPos = 10;
  if (this.isTabBig) {
    tabIcon = 'tab.big';
    tabYPos = 10;
  }
  var element = {
    el_type: "tab",
    icon: tabIcon,
    Ypos: tabYPos
  };
  var tabAbsolute = new AbsoluteElement(element, 0, 0, "symbol", 0);
  tabAbsolute.x = absX;

  var tabRelative = new RelativeElement(tabIcon, 0, 0, 7.5, "tab");
  tabRelative.x = relX;
  tabAbsolute.children.push(tabRelative);

  tabIcon = 'tab.pull';
  var tabRelative2 = new RelativeElement(tabIcon, 0, 0, 7.5, "tab");
  tabRelative2.x = relX + 20;
  tabAbsolute.children.push(tabRelative2);
  
  tabIcon = 'tab.push';
  var tabRelative3 = new RelativeElement(tabIcon, 0, 0, 12.5, "tab");
  tabRelative3.x = relX + 20 + 8.014;
  tabAbsolute.children.push(tabRelative3);

  if (tabAbsolute.abcelem.el_type == 'tab') {
    tabRelative.pitch = tabYPos;
  }
  return tabAbsolute;
}

Plugin.prototype.scan = function (renderer, line, staffIndex) {
  if (this._super.inError) return;
  if (this.tablature.bypass(line)) return;
  var rndrer = new TabRenderer(this, renderer, line, staffIndex);
  rndrer.doScan();
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
var AbcMelodeonTab = function () {
  return { name: 'MelodeonTab', tablature: Plugin };
};


module.exports = AbcMelodeonTab;