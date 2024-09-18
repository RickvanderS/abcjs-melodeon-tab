/*
Emit tab for Diatonic staff
*/
var DiatonicTablature = require('./diatonic-tablature');
var TabCommon = require('../tab-common');
var TabRenderer = require('../tab-renderer');
var DiatonicPatterns = require('./diatonic-patterns');
var AbsoluteElement = require('../../write/creation/elements/absolute-element');
var RelativeElement = require('../../write/creation/elements/relative-element');

/**
* upon init mainly store provided instances for later usage
* @param {*} abcTune  the parsed tune AST tree
*  @param {*} tuneNumber  the parsed tune AST tree
* @param {*} params  complementary args provided to Tablature Plugin
*/
Plugin.prototype.init = function (abcTune, tuneNumber, params) {
	//Set default tablature style if not specified
	//0 hide
	//1 push/pull on one tab row
	//2 push and pull tab row
	//3 tab row per instrument row
	if (typeof(params.tabstyle) == 'undefined')
		params.tabstyle = 2;
	
	//Determine the number of rows in the tab from the style
	if (params.tabstyle == 0) //No tab
		this.nbLines = 0;
	else if (params.tabstyle < 3) //One tab row or two tab rows
		this.nbLines = params.tabstyle + 1;
	else //Tab row per instrument row
		this.nbLines = params.tuning.length + 1;
		
	//Based on the number of rows, decide if small or large icon needs to be displayed
	this.isTabBig = false;
	if (this.nbLines > 3)
		this.isTabBig = true;

	var _super = new TabCommon(abcTune, tuneNumber, params);
	this._super = _super;

	this.abcTune = abcTune;
	this.linePitch = 5;

	this.transpose = params.visualTranspose;
	this.tablature = new DiatonicTablature(this.nbLines, this.linePitch);

	var semantics = new DiatonicPatterns(this);
	this.semantics = semantics;
};

function TuningStrip(RowTuning) {
	RowTuning = RowTuning.replace(/[^A-Za-z]/g, '');
	if (RowTuning.length > 2)
		RowTuning = "♯";
	return RowTuning;
}

Plugin.prototype.buildTabAbsolute = function (absX, relX) {
  var tabIcon = 'tab.tiny';
  var tabYPos = 10;
  if (this.isTabBig) {
    tabIcon = 'tab.big';
    tabYPos = 12.5;
  }
  var element = {
    el_type: "tab",
    icon: tabIcon,
    Ypos: tabYPos
  };
  var tabAbsolute = new AbsoluteElement(element, 0, 0, "symbol", 0);
  tabAbsolute.x = absX;
  
	if (this._super.params.tabstyle > 0) {
		//Set the tab icon
		var tabRelative = new RelativeElement(tabIcon, 0, 0, 7.5, "tab");
		tabRelative.x = relX;
		tabAbsolute.children.push(tabRelative);

		if (tabAbsolute.abcelem.el_type == 'tab') {
			tabRelative.pitch = tabYPos;
		}

		//For push/pull row style, set the push pull icons
		if (this._super.params.tabstyle == 2) {
			var Xadjust = 20;
			var Y       = 7.5
			
			tabIcon = 'tab.pull';
			var tabRelativeRow1 = new RelativeElement(tabIcon, 0, 0, Y, "tab");
			tabRelativeRow1.x = relX + Xadjust;
			tabAbsolute.children.push(tabRelativeRow1);

			tabIcon = 'tab.push';
			Y += this.linePitch;
			var tabRelativeRow2 = new RelativeElement(tabIcon, 0, 0, Y, "tab");
			tabRelativeRow2.x = relX + Xadjust + 8.014;
			tabAbsolute.children.push(tabRelativeRow2);
		}
		//For tab row per instrument row style, set the row keys
		else if (this._super.params.tabstyle == 3) {
			var Xadjust = 25;
			if (this.isTabBig)
				Xadjust += 5;
			  var opt = {
				type: 'tabNumber'
			  };
			var Y = 10;
			
			//TODO:
			if (this._super.params.tuning.length >= 1) {
				var str1 = TuningStrip(this._super.params.tuning[0]);
				str1 = str1.replaceAll("b", "♭");
				var tabRelativeRow1 = new RelativeElement(str1, 0, 0, Y, opt);
				tabRelativeRow1.x = relX + Xadjust;
				tabAbsolute.children.push(tabRelativeRow1);
			}
			
			if (this._super.params.tuning.length >= 2) {
				Y += this.linePitch;
				var str2 = TuningStrip(this._super.params.tuning[1]);
				str2 = str2.replaceAll("b", "♭");
				var tabRelativeRow2 = new RelativeElement(str2, 0, 0, Y, opt);
				tabRelativeRow2.x = relX + Xadjust;
				tabAbsolute.children.push(tabRelativeRow2);
			}
			
			if (this._super.params.tuning.length >= 3) {
				Y += this.linePitch;
				var str3 = TuningStrip(this._super.params.tuning[2]);
				str3 = str3.replaceAll("b", "♭");
				var tabRelativeRow3 = new RelativeElement(str3, 0, 0, Y, opt);
				tabRelativeRow3.x = relX + Xadjust;
				tabAbsolute.children.push(tabRelativeRow3);
			}
		}
	}

	return tabAbsolute;
}

Plugin.prototype.scan = function (renderer, line, staffIndex) {
  if (this._super.inError) return;
  if (this.tablature.bypass(line)) return;
  var rndrer = new TabRenderer(this, renderer, line, staffIndex);
  rndrer.doScan();
};

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
var AbcDiatonicTab = function () {
  return { name: 'DiatonicTab', tablature: Plugin };
};


module.exports = AbcDiatonicTab;