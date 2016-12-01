var Pattern = Base.extend({
	_class: 'Pattern',
	initialize: function Pattern(item, dontCenter) {
		// Define this Pattern's unique id.
		this._id = Pattern._id = (Pattern._id || 0) + 1;
		item.remove();
		if(item._class == 'Raster') {
			this.item = item;
			this.raster = item;
		} else if (item) {
			this.item = item.clone(false);
			this.raster = this.item.rasterize();
		} else {
			this.raster = new Raster();
		}
	},

	_serialize: function(options, dictionary) {
		return dictionary.add(this, function() {
			return Base.serialize([this._class, this._definition],
					options, false, dictionary);
		});
	},
	/**
	 * Called by various setters whenever a gradient value changes
	 */
	_changed: function() {
		// Loop through the gradient-colors that use this gradient and notify
		// them, so they can notify the items they belong to.
		for (var i = 0, l = this._owners && this._owners.length; i < l; i++)
			this._owners[i]._changed();
	},

	/**
	 * Called by Color#setPattern()
	 * This is required to pass on _changed() notifications to the _owners.
	 */
	_addOwner: function(color) {
		if (!this._owners)
			this._owners = [];
		this._owners.push(color);
	},

	/**
	 * Called by Color whenever this gradient stops being used.
	 */
	_removeOwner: function(color) {
		var index = this._owners ? this._owners.indexOf(color) : -1;
		if (index != -1) {
			this._owners.splice(index, 1);
			if (this._owners.length === 0)
				delete this._owners;
		}
	},

	/**
	 * @return {Gradient} a copy of the gradient
	 */
	clone: function() {
		return new Pattern(this.item);
	}
});