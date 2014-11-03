/**
 * @author hfutrell
 */

function DXFParser(s) {
		
	var startTime = (new Date).getTime();

	this.blocks = [];
	this.layers = [];
	this.tables = [];
	this.nodeStack = [];
	this.paperspaceViewport = null;
	this.rootEntity = null;
	this.isEOF = false;
	this.currentNode = null;
	
	this.lines = s.split('\n');
	this.currentLineNumber = 0;
	this.getNextRecord();
	
	while(true) {
		if ( this.isEOF ) {
			break;	
		}
		else if ( this.checkRecord(0, "SECTION")) {
			this.parseSection();
		}
		else if ( this.checkRecord(0, "EOF")) {
			console.log("EOF");
			this.eatRecord(0,"EOF");
			break;	
		}
		else {
			this.getNextRecord();
		}
	}	
	
	var endTime = (new Date).getTime();
	console.log("took " + (endTime - startTime) + "ms to parse DXF");

}

DXFParser.prototype.blocks = null;
DXFParser.prototype.layers = null;
DXFParser.prototype.tables = null;
DXFParser.prototype.nodeStack = null;
DXFParser.prototype.paperspaceViewport = null;
DXFParser.prototype.rootEntity = null; 
DXFParser.prototype.isEOF = true;
DXFParser.prototype.lines = null;
DXFParser.prototype.currentLineNumber = 0;
DXFParser.prototype.currentNode = null;
 
DXFParser.prototype.popNode = function() {
 	this.nodeStack.pop();
	this.currentNode = this.nodeStack.length > 0 ? this.nodeStack[this.nodeStack.length-1] : null;
 };

 DXFParser.prototype.pushNode = function(node) {
 	var cNode = this.currentNode;
	if ( cNode ) {
		cNode.addChild(node);
	}
	else {
		console.log("no current node");
	}
	this.nodeStack.push(node);
	this.currentNode = node;
 };
 
 DXFParser.fastTrim = function(str){
     var start = 0;
	 var end = str.length;
	 for (var i = 0; i < str.length; i++) {
         if (str.charAt(i) !== ' ' && str.charAt(i) !== '\t') {
             start = i;
             break;
         }
     }
     for (i = str.length- 1; i >= 0; i--) {
         if (str.charAt(i) !== '\n' && str.charAt(i) !== '\r') {
             end = i+1;
             break;
         }
     }
	 str = str.substring(start, end);
     return str.length > 0 ? str : '';
 }

 DXFParser.prototype.getNextRecord = function(){
     if (this.currentLineNumber + 2 >= this.lines.length) {
         this.isEOF = true;
         return false;
     }
     this.currentGroupCode = parseInt(this.lines[this.currentLineNumber], 10);
     this.currentData = this.lines[this.currentLineNumber + 1];
     this.currentData = DXFParser.fastTrim(this.currentData);
     this.currentLineNumber += 2;
     return true;
 };

 DXFParser.prototype.checkRecord = function(code, data) {
	if (code !== null && code !== this.currentGroupCode ) {
		return false;
	}
	if (data !== null && data !== this.currentData ) {
		return false;
	}
	return true;
};

DXFParser.prototype.eatRecord = function(code, data) {
	if (this.checkRecord(code, data) === false) {
		console.log("Parse error: expected code = "+this.code+", data = "+this.data);
		console.log("Got code = "+this.currentGroupCode+"data="+this.currentData);
	}
	this.getNextRecord();
};

DXFParser.prototype.parseProperty = function() {
	this.currentNode.addChild(new DXFNode(this.currentGroupCode, this.currentData));
	this.getNextRecord();
};

DXFParser.prototype.parseEntity = function() {
	
	var node = new DXFNode( this.currentGroupCode, this.currentData );
	this.pushNode(node);
	
	this.eatRecord(0, null);
	
	var entitiesFollow = false;
	
	while(true) {
		if ( this.checkRecord(66, null) ) {
			entitiesFollow = true;
		}
		if ( this.currentGroupCode === 0 ) {
			if ( this.currentData === "SEQEND") {
				entitiesFollow = false;
			}
			if ( entitiesFollow === true ) {
				this.parseEntity();
			}
			else {
				break;
			}
		}
		else {
			this.parseProperty();
		}
	}
	
	if ( node.stringValue() === "LAYER" ) {
		if ( node.childExistsForCode(2) ) {
			this.layers[node.childOfCode(2).stringValue()] = node;
		}
	}
	if ( node.stringValue() === "VIEWPORT") {
		if (node.childExistsForCode(69) && node.childOfCode(69).intValue() === 1) {
			this.paperspaceViewport = node;
		}
	}
	this.popNode();
		
};

DXFParser.prototype.parseBlock = function() {
	
	var node = new DXFNode( this.currentGroupID, this.currentData );
	this.pushNode(node);
		
	this.eatRecord(0,"BLOCK");
	while(true) {
		if (this.checkRecord(0,"ENDBLK")) {
			this.eatRecord(0,"ENDBLK");
			break;
		}
		else if ( this.currentGroupCode === 0) {
			this.parseEntity();
		}
		else {
			this.parseProperty();
		}
	}
	
	this.popNode();
	
	var child = node.childOfCode(2);
	if (child) {
		var name = child.stringValue();
		this.blocks[name] = node;
	}
	
};

DXFParser.prototype.parseEntities = function() {
	console.log("Parse Entities");
	this.eatRecord(2, "ENTITIES");
	this.rootEntity = this.currentNode;
	while(true) {
		if ( this.checkRecord(0,"ENDSEC")) {
			this.eatRecord(0,"ENDSEC");
			break;
		}
		else {
			this.parseEntity();
		}
	}
};

DXFParser.prototype.parseBlocks = function() {
	this.eatRecord(2,"BLOCKS");
	while(true) {
		if ( this.checkRecord(0,"BLOCK")) {
			this.parseBlock();
		}
		else if (this.checkRecord(0,"ENDSEC")) {
			break;
		}
		else {
			this.getNextRecord();
		}
	}
};

DXFParser.prototype.parseTable = function() {
	var node = new DXFNode(0, this.currentData );
	this.pushNode(node);
	this.eatRecord(0,"TABLE");
	while(true) {
		if ( this.checkRecord(0,"ENDTAB")) {
			break;	
		}
		else if ( this.checkRecord(0, null)) {
			this.parseEntity();
		}
		else if ( this.checkRecord( null, null )) {
			this.parseProperty();
		}
	}
	this.eatRecord(0,"ENDTAB");
	
	if ( node.childExistsForCode(2)) {
		var key = node.childOfCode(2).stringValue();
		this.tables[key] = node;
	}
	this.popNode(node);
};

DXFParser.prototype.parseTables = function() {
	this.eatRecord(2,"TABLES");
	while(true) {
		if (this.checkRecord(0, "TABLE")) {
			this.parseTable();
		}
		else if (this.checkRecord(0, "ENDSEC")) {
			break;
		}
		else {
			this.getNextRecord();
		}
	}
};

DXFParser.prototype.parseSection = function() {
	console.log("parse section");
	var node = new DXFNode(this.currentGroupCode, this.currentData );
	this.pushNode(node);
	this.eatRecord(0,"SECTION");
	while(true) {
		if ( this.checkRecord(2,"TABLES")) {
			this.parseTables();
			break;
		}
		else if ( this.checkRecord(2,"BLOCKS")) {
			this.parseBlocks();
			break;
		}
		else if ( this.checkRecord(2,"ENTITIES")) {
			this.parseEntities();
			break;
		}
		else if ( this.checkRecord(0, "ENDSEC")) {
			this.eatRecord(0, "ENDSEC");
			break;
		}
		else if ( this.checkRecord(0,"EOF")) {
			break;
		}
		else if (this.isEOF) {
			break;
		}
		else {
			// ignore the record
			this.getNextRecord();
		}
	}
	this.popNode();
};

DXFParser.prototype.getFirstActiveViewPort = function() {
	if ( this.tables ) {
		var viewportTable = this.tables.VPORT;
		if (viewportTable) {
			var i;
			for (i=0; i<viewportTable.children.length; i++) {
				var node = viewportTable.children[i];
				if ( node.childExistsForCode(2)) {
					if ( node.childOfCode(2).stringValue() === "*ACTIVE") {
						return node;
					}
				}
			}
		}
	}
	return null;
};

DXFParser.prototype.getBlock = function(s) {
	return this.blocks[s];
};

DXFParser.prototype.getLayer = function(s) {
	return this.layers[s];
};
