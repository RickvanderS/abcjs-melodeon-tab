
var DiatonicTablature = require('./diatonic-tablature');
var tabRenderer = require('../render/tab-renderer');
var DiatonicPatterns = require('./diatonic-patterns');
var AbsoluteElement = require('../../write/creation/elements/absolute-element');
var RelativeElement = require('../../write/creation/elements/relative-element');

/**
 * upon init mainly store provided instances for later usage
 * @param {*} abcTune  the parsed tune AST tree
 * @param {*} tuneNumber  the parsed tune AST tree
 * @param {*} params  complementary args provided to Tablature Plugin
*/
Plugin.prototype.init = function (abcTune, tuneNumber, params, tabSettings) {
	//Set default tablature style if not specified
	//0 hide
	//1 push/pull on one tab row
	//2 push and pull tab row
	//3 tab row per instrument row
	if (typeof(params.tabstyle) == 'undefined')
		params.tabstyle = 2;
	
	//Determine the number of rows in the tab from the style
	var nbLines = 0;
	if (params.tabstyle == 0) //No tab
		nbLines = 0;
	else if (params.tabstyle < 3) //One tab row or two tab rows
		nbLines = params.tabstyle + 1;
	else //Tab row per instrument row
		nbLines = params.tuning.length + 1;
		
	//Based on the number of rows, decide if small or large icon needs to be displayed
	var isTabBig = false;
	if (nbLines > 3)
		isTabBig = true;

	this.tune = abcTune;
	this.params = params;
	this.tuneNumber = tuneNumber;
	this.inError = false;
	this.abcTune = abcTune;
	this.linePitch = 5;
	this.nbLines = nbLines;
	this.isTabBig = isTabBig;
	this.tabSymbolOffset = tabSettings.tabSymbolOffset;
	this.transpose = params.visualTranspose;
	this.hideTabSymbol = params.hideTabSymbol;
	this.tablature = new DiatonicTablature(this.nbLines, this.linePitch);
	var tuning = params.tuning;
	if (!tuning) {
		tuning = tabSettings.defaultTuning;
	}
	this.tuning = tuning;
	this.semantics = new DiatonicPatterns(this);
};

function TuningRowDisplayName(RowTuning) {
	RowTuning = RowTuning.replace(/[^A-Za-z#]/g, '');
	RowTuning = RowTuning.replaceAll("b", "♭");
	if (RowTuning.length > 2)
		RowTuning = "♯";
	return RowTuning;
}

function CreateRowLabelRelativeElement(RowTuning, isTabBig, relX, Y) {
	var Xadjust = 25;
	if (isTabBig)
		Xadjust += 5;
	var opt = {
		type: 'tabNumber'
	};
	
	var RowLabel = TuningRowDisplayName(RowTuning);
	var tabRelativeRowLabel = new RelativeElement(RowLabel, 0, 0, Y, opt);
	if (RowLabel.length > 1)
		Xadjust += 4;
	tabRelativeRowLabel.x = relX + Xadjust;
	return tabRelativeRowLabel;
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

	if (this.params.tabstyle > 0) {
		//Set the tab icon
		var tabRelative = new RelativeElement(tabIcon, 0, 0, 7.5, "tab");
		tabRelative.x = relX;
		tabAbsolute.children.push(tabRelative);

		if (tabAbsolute.abcelem.el_type == 'tab') {
			tabRelative.pitch = tabYPos;
		}

		//For push/pull row style, set the push pull icons
		if (this.params.tabstyle == 2) {
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
		else if (this.params.tabstyle == 3) {
			//Create row labels for all rows
			let StartIndex = tabAbsolute.children.length;
			let MoveLeft   = false;
			let Y          = 10;
			for (let RowIndex = 0; RowIndex < this.params.tuning.length; ++RowIndex) {
				let RelativeElement = CreateRowLabelRelativeElement(this.params.tuning[RowIndex], this.isTabBig, relX, Y);
				if (RelativeElement.name.length > 1)
					MoveLeft = true;
				tabAbsolute.children.push(RelativeElement);
				Y += this.linePitch;
			}
			
			if (MoveLeft) {
				let AdjustX = 4;
				if (this.isTabBig)
					AdjustX = 6;
				for (let i = StartIndex; i < tabAbsolute.children.length; ++i)
					tabAbsolute.children[i].x -= AdjustX;
			}
		}
	}

	return tabAbsolute;
}

Plugin.prototype.scan = function (renderer, line, staffIndex) {
	//console.log("SCAN AbcStringTab Plugin.render")
	if (this.inError) return;
	if (this.tablature.bypass(line)) return;
	tabRenderer(this, renderer, line, staffIndex, true);
};

Plugin.prototype.render = function (renderer, line, staffIndex) {
	//console.log("RENDER AbcStringTab Plugin.render")
	if (this.inError) return;
	if (this.tablature.bypass(line)) return;
	tabRenderer(this, renderer, line, staffIndex);
};

function Plugin() { }

//
// Tablature plugin definition
//
var AbcDiatonicTab = function () {
	return { name: 'DiatonicTab', tablature: Plugin };
};

module.exports = AbcDiatonicTab;
