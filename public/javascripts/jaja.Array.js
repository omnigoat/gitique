



(function(undefined){
	$.extend(jaja, {
		Array: function(init_list) {
			return new jaja.Array.init(init_list);
		}
	});

	function relegate_raw_functions(instance, functions)
	{
		console.dir(instance);
		for (x in instance) {
			console.log("relegating", x);
			instance["_" + x] = instance[x];
			instance[x] = undefined;
		}
	}

	$.extend(jaja.Array, {
		init: function(init_list) {
			$.extend(this, jaja.Array);
			if (init_list !== undefined) {
				for (var i = 0, ie = init_list.length; i != ie; ++i)
					this[i] = init_list[i];
				this.length = init_list.length;
			}

			return this;
		},

		push_back: function(elem) {
			Array.prototype.push.apply(this, [elem]);
		},

		pop_back: function() {
			return Array.prototype.pop.apply(this);
		},

		push_front: function(elem) {
			Array.prototype.unshift.apply(this, [elem]);
		},

		pop_front: function() {
			return Array.prototype.shift.apply(this);
		},

		append: function(array) {
			return this.insert(0, array);
		},

		prepend: function(array) {
			return this.insert(this.length, array);
		},

		insert: function(index, elements)
		{
			var elements_length = elements.length,
			    i = this.length - 1,
			    ie = index - 1,
			    j = elements_length - 1,
			    je = -1
			    ;
			
			for (; i != ie; --i) {
				this[i + elements_length] = this[i];
			}

			for (i = index + j; j != je; --i, --j) {
				this[i] = elements[j];
			}

			this.length += elements_length;
			return this;
		},

		swap: function(lhs, rhs) {
			var t = this[lhs];
			this[lhs] = this[rhs];
			this[rhs] = t;
			return this;
		},

		// requires both us and them to be sorted
		has_subset: function(rhs, pred)
		{
			pred = pred || jaja.default_predicate;
			for (var i = 0, ie = rhs.length, j = 0, je = this.length, result = undefined; i != ie; ++i, ++j) {
				while (j != je && (result = pred(rhs[i], this[j])) > 0)
					++j;
				if (result !== 0) {
					return false;
				}
			}
			return true;
		},

		sort: function(pred) {
			Array.prototype.sort.apply(this, [pred || jaja.default_predicate]);
		},

		stable_sort: function()
		{
			//=====================================================================
			// stable_sort actually begins here!
			//=====================================================================
			var from, to, pred;
			if (arguments.length <= 1) {
				from = 0;
				to = this.length;
				pred = arguments[0] || jaja.default_predicate;
			}
			else if (arguments.length <= 3) {
				from = arguments[0];
				to = arguments[1];
				pred = arguments[2] || jaja.default_predicate;
			}

			if (to - from < 12) {
				this._insert_sort(from, to, pred);
				return;
			}

			var middle = (from + to) / 2;
			this.stable_sort(from, middle);
			this.stable_sort(middle, to);
			this._merge(from, middle, to, middle - from, to - middle, pred);
			return this;
		},


		each: function(fn) {
			if (Array.prototype.forEach)
				return Array.prototype.forEach.apply(this, [fn]);
			else {
				var i = 0, ie = this.length, result = true;
				while (i != ie && (result = fn(this[i])))
					++i;
				return result;
			}
		},

		foldr: function()
		{
			
		},

		map: function(fn)
		{
			for (var i = 0, ie = this.length; i != ie; ++i)
				this[i] = fn(this[i]);
			return this;
		},

		mapped: function(fn)
		{
			var result = jaja.Array();
			this.each(function(e) {
				result.push_back( fn(e) );
			});
			return result;
		},

		filter: function(pred, callback_object)
		{
			if (this.length == 0)
				return this;
			
			// filter elements, moving them "up" in the array steadily
			var offset = 0;
			for (var i = 0, ie = this.length; i != ie; ++i) {
				if (pred.apply(callback_object, [this[i]])) {
					if (offset > 0) {
						this[i - offset] = this[i];
					}
				}
				else {
					++offset;
				}
			}

			// delete unused elements at the end
			for (var i = this.length - offset, ie = this.length; i != ie; ++i) {
				delete this[i];
			}

			// adjust length
			this.length -= offset;

			// and breathe.
			return this;
		},


		filtered: function(pred, callback_object)
		{
			callback_object = callback_object || this;
			if (Array.prototype.filter !== undefined) {
				return Array.prototype.filter.apply(callback_object, [pred]);
			}

			var result = jaja.Array();
			for (var i = 0, ie = this.length; i != ie; ++i) {
				if (pred.apply(callback_object, [this[i]]))
					result.push_back(this[i]);
			}
			return result;
		},



		reverse: function() {
			var from, to;
			if (arguments.length == 0) {
				from = 0;
				to = this.length;
			}
			else if (arguments.length == 2) {
				from = arguments[0];
				to = arguments[1];
			}
			else {
				console.error("incorrect arguments to jaja.Array.reverse");
			}

			while (from < to) {
				this.swap(from++, --to);
			}
		},

		splice: function() {
			console.error("jaja.Array.splice should not be used. it is defined for introspection purposes only");
		},

















		_rotate: function(from, mid, to)
		{
			if (from == mid || mid == to) return;
			var n = this._gcd(to - from, mid - from);
			while (n-- !== 0)
			{
				var val = this[from + n],
				    shift = mid - from,
				    p1 = from + n,
				    p2 = from + n + shift
				    ;
				
				while (p2 != from + n) {
					this[p1] = this[p2];
					p1 = p2;
					if (to - p2 > shift)
						p2 += shift;
					else
						p2 = from + shift - to + p2;
				}

				this[p1] = val;
			}
		},

		_gcd: function(m, n) {
			while (n != 0) {
				var t = m % n;
				m = n;
				n = t;
			}
			return m;
		},

		_lower: function(from, to, v, pred)
		{
			var length = to - from;
			while (length > 0) {
				var half = Math.floor(length / 2),
				    mid = from + half;
				if ( pred(this[mid], this[v]) < 0 ) {
					from = mid + 1;
					length = length - half - 1;
				}
				else {
					length = half;
				}
			}
			return from;
		},

		_upper: function(from, to, v, pred)
		{
			var length = to - from;
			while (length > 0) {
				var half = Math.floor(length / 2),
				    mid = from + half;
				if ( pred(this[v], this[mid]) < 0 ) {
					length = half;
				}
				else {
					from = mid + 1;
					length = length - half - 1;
				}
			}
			return from;
		},

		_insert_sort: function(from, to, pred)
		{
			if (to <= from + 1) return;

			for (var i = from + 1; i < to; ++i) {
				for (var j = i; j > from; --j) {
					if ( pred(this[j], this[j - 1]) < 0 ) {
						this.swap(j, j - 1);
					}
					else {
						break;
					}
				}
			}
		},



		_merge: function(from, pivot, to, length1, length2, pred)
		{
			if (length1 == 0 || length2 == 0)
				return;
			if (length1 + length2 == 2) {
				if (pred(this[pivot], this[from]) < 0)
					this.swap(pivot, from);
				return;
			}
			var first_cut, second_cut, length11, length22;
			if (length1 > length2) {
				length11 = Math.floor(length1 / 2);
				first_cut = from + length11;
				second_cut = this._lower(pivot, to, first_cut, pred);
				length22 = second_cut - pivot;
			}
			else {
				length22 = Math.floor(length2 / 2);
				second_cut = pivot + length22;
				first_cut = this._upper(from, pivot, second_cut, pred);
				length11 = first_cut - from;
			}

			this._rotate(first_cut, pivot, second_cut);
			var new_mid = first_cut + length22;
			this._merge(from, first_cut, new_mid, length11, length22, pred); 
			this._merge(new_mid, second_cut, to, length1 - length11, length2 - length22, pred);
		}


	});

})();






