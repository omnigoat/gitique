


var jaja = (function($, undefined) {
	
	//=====================================================================
	// add funcitonality to jQuery
	//=====================================================================
	$.fn.swap = function(b) {
		b = jQuery(b)[0];
		var a = this[0];

		var t = a.parentNode.insertBefore(document.createTextNode(''), a);
		b.parentNode.insertBefore(a, b);
		t.parentNode.insertBefore(b, t);
		t.parentNode.removeChild(t);

		return this;
	};

	var jaja = {};


	// get scrollbar width
	$(function() {
		var scr = null;
		var inn = null;
		var wNoScroll = 0;
		var wScroll = 0;

		// Outer scrolling div
		scr = document.createElement('div');
		scr.style.position = 'absolute';
		scr.style.top = '-1000px';
		scr.style.left = '-1000px';
		scr.style.width = '100px';
		scr.style.height = '50px';
		// Start with no scrollbar
		scr.style.overflow = 'hidden';

		// Inner content div
		inn = document.createElement('div');
		inn.style.width = '100%';
		inn.style.height = '200px';

		// Put the inner div in the scrolling div
		scr.appendChild(inn);
		// Append the scrolling div to the doc
		document.body.appendChild(scr);

		// Width of the inner div sans scrollbar
		wNoScroll = inn.offsetWidth;
		// Add the scrollbar
		scr.style.overflow = 'auto';
		// Width of the inner div width scrollbar
		wScroll = inn.offsetWidth;

		// Remove the scrolling div from the doc
		document.body.removeChild(document.body.lastChild);

		// Pixel width of the scroller
		jaja.page = {scrollbar_width: wNoScroll - wScroll};
	});


	

	Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};

	

	$.extend(jaja, {
		zip: function(lhs, rhs) {
			var result = [];
			
			$.each(lhs, function(i, x) {
				if (rhs[i] === undefined) { return false; }
				result.push([x, rhs[i]]);
			});

			return result;
		},

		fold: function(xs, f, init) {
			for (var i = 0, z = xs.length; i != z; ++i) {
				init = f(init, xs[i]);
			}
			return init;
		},
		
		map: function(xs, f) {
			var ys = [];
			for (var i = 0, z = xs.length; i != z; ++i) {
				ys.push(f(xs[i]));
			}
			return ys;
		},
		
		filter: function(xs, f) {
			var ys = [];
			for (var i = 0, z = xs.length; i != z; ++i) {
				if (f(xs[i])) {
					ys.push(xs[i]);
				}
			}
			return ys;
		},

		arrays_equal: function(lhs, rhs) {
			var temp = new Array();
			
			// make sure it's an array, make sure lengths are same
			if ( !lhs[0] || !rhs[0] || lhs.length != rhs.length ) {
				return false;
			}
			
			for (var i = 0, ie = lhs.length; i != ie; ++i) {
				// false if they're not the same type
				var lhse = lhs[i], rhse = rhs[i], lhst = typeof lhse;
				if (lhst !== (typeof rhse)) {
					return false;
				}

				if (lhst === "object") {
					// if they're arrays, recurse!
					if ("length" in lhse && lhse[0] && "length" in rhse && rhse[0]) {
						if (!this.arrays_equal(lhse, rhse)) {
							return false;
						}
					}
					// otherwise... okay?
					else {
						//return false;
					}
				}
				else {
					if (lhse != rhse) {
						return false;
					}
				}
			}

			return true;
		},

		// splits a jquery object consisting of multiple objects into an array of jquery objects,
		// each object containing a single object. if that makes sense.
		jquery_split: function($o) {
			return jaja.map($.makeArray($o), function(x) {return $(x);});
		},


		default_predicate: function(lhs, rhs) {
			return (lhs < rhs) ? -1 : (rhs < lhs) ? 1 : 0;
		},

		//=====================================================================
		// binary search! :D
		//=====================================================================
		binary_search: function(range, pred, opt_bounds)
		{
			pred = pred || jaja.default_predicate;
			var lbound = opt_bounds ? opt_bounds[0] : 0;
			var ubound = opt_bounds ? opt_bounds[1] : range.length;
			var r = null;

			while (ubound - lbound > 0)
			{
				var middle = (ubound + lbound) >> 1;
				
				r = pred(range[middle]);

				if (r == 0) {
					break;
				}
				else if (r < 0) {
					lbound = middle;
				}
				else if (r > 0) {
					ubound = middle;
				}
			}

			return {found: r == 0, value: middle};
		},

		binary_search_for: function(range, element, pred, opt_bounds) {
			return jaja.binary_search(range, function(x) {
				return pred(x, element);
			}, opt_bounds);
		},


		has_duplicates: function(sorted_array)
		{
			for (var i = 0, ie = sorted_array.length; i != ie; ++i) {
				if (sorted_array[i+1] === undefined) break;
				if (sorted_array[i] === sorted_array[i+1]) {
					return true;
				}
			}
			return false;
		},




	});

	if (Array.prototype.swap === undefined) {
		Array.prototype.swap = function(lhs, rhs) {
		    var t = this[lhs];
		    this[lhs] = this[rhs];
		    this[rhs] = t;
		    return this;
		};
	}
	else {
		console.error("Array.prototype.swap is alrady defined");
	}

	if (Array.prototype.unique === undefined) {
		Array.prototype.unique = function() {
		    var o = {}, i, l = this.length, r = [];
		    for(i = 0; i < l; i += 1) o[this[i]] = this[i];
		    for(i in o) r.push(o[i]);
		    return r;
		};
	}
	else {
		console.error("Array.prototype.unique is alrady defined");
	}
	
	if (Function.prototype.partial === undefined)
	{
		Function.prototype.partial = function()
		{
			var fn = this, args = Array.prototype.slice.call(arguments);
			//console.log(fn + ": " + fn.length);
			return function()
			{
				var arg = 0;
				for ( var i = 0, il = fn.length, j = 0, jl = arguments.length; i != il && j != jl; ++i) {
					if ( args[i] === undefined )
						args[i] = arguments[j++];
				}
				return fn.apply(this, args);
			};
		};
	}
	
	jaja.ui = {};
	jaja.page = {
		mousedown_position: {x: 0, y: 0},
		mouseup_position: {x: 0, y: 0}
	};
	
	$(window)
		.mousedown(function(event){
			jaja.page.mousedown_position = {x: event.pageX, y: event.pageY};
		})
		.mouseup(function(event){
			jaja.page.mouseup_position = {x: event.pageX, y: event.pageY};
		})
		;
	



	
	return jaja;
	
})(jQuery);



