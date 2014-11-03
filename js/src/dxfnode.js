/**
 * @author hfutrell
 */

 function DXFNode(code, data) {
 	this.code = code;
	this.data = data;
	this.children = [];
	this.first = [];
 }

DXFNode.prototype.children = null;
DXFNode.prototype.code = 0;
DXFNode.prototype.data = null;
DXFNode.prototype.first = null;

 DXFNode.prototype.addChild = function(child) {
 	this.children.push(child);
	if (!this.first[child.code]) {
		this.first[child.code] = child;
	}
 };

DXFNode.prototype.childOfCode = function(code) {
	return this.first[code];
};

DXFNode.prototype.childExistsForCode = function(code) {
	return this.first[code] ? true : false;
};

DXFNode.prototype.intValue = function() {
	return parseInt(this.data, 10);
};

DXFNode.prototype.doubleValue = function() {
	return parseFloat(this.data);
};

DXFNode.prototype.stringValue = function() {
	return this.data;
};
