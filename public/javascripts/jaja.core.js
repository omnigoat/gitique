


var jaja = (function($, undefined) {
  
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
			var lbound = opt_bounds ? opt_bounds[0] : 0;
			var ubound = opt_bounds ? opt_bounds[1] : range.length;
			var r = null;

			while (ubound - lbound > 1)
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
  



  
  return jaja;
  
})(jQuery);



