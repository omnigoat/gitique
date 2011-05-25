
//=====================================================================
// 
//=====================================================================
(function(undefined) {

	$.extend(jaja, {
		set: function(init_list, predicate) {
			return new jaja.set.init(init_list, predicate);
		}
	});

	$.extend(jaja.set, {
		default_predicate: function(lhs, rhs) {
			return (lhs < rhs) ? -1 : (rhs < lhs) ? 1 : 0;
		},

		init: function(init_list, predicate)
		{
			// initialise object
			$.extend(this, jaja.set);
			predicate = predicate || this.default_predicate;
			this._data = init_list;
			this._predicate = function(lhs, rhs) {
				return predicate(lhs, rhs) ? -1 : predicate(rhs, lhs) ? 1 : 0;
			};

			// sort based upon predicate
			this._data.sort(predicate);
			// reject if duplicates exist
			if (jaja.has_duplicates(this._data)) {
				return false;
			}

			this.length = this._data.length;
			return this;
		},

		add: function(element)
		{
			if (jaja.binary_search_for(this._data, element, this._predicate).found) {
				return false;
			}
			else {
				this._data.push(element);
				this._data.sort(this._predicate);
				++this.length;
				return true;
			}
		},

		index: function(element) {
			var result = jaja.binary_search_for(this._data, element, this._predicate);
			if (!result.found) {
				return undefined;
			}
			else {
				return result.value;
			}
		},

		remove: function(index) {
			this._data.remove(index);
			--this.length;
		},

		sort: function() {
			this._data.sort(this._predicate);
		},

		get: function(index) {
			return this._data[index];
		},

		each: function(fn) {
			$.each(this._data, fn);
		}

	});
	
}());

