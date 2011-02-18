

;(function(jaja, $, undefined) {
  
	// Array Remove - By John Resig (MIT Licensed)
	Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};

	

  $.extend(jaja, {
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

	// binary search! :D
	binary_search: function(range, pred, opt_bounds)
	{
		var l = opt_bounds ? opt_bounds[0] : 0;
		var u = opt_bounds ? opt_bounds[1] : range.length;
		
		while (u - l > 1)
		{
			var m = (u + l) >> 1;
			var r = pred(range[m]);
			if (r == -1) {
				l = m;
			}
			else if (r == 1) {
				u = m;
			}
			else {
				return {found: true, value: m};
			}
		}

		return {found: false, value: m};
	},
	});
	
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
  
  
  
})(window.jaja = window.jaja || {}, jQuery);



