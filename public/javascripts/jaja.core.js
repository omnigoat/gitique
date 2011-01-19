

;(function(jaja, $, undefined) {
  
  jaja.fold = function(xs, f, init) {
    for (var i = 0, z = xs.length; i != z; ++i) {
      init = f(init, xs[i]);
    }
    return init;
  }
  
  jaja.map = function(xs, f) {
    var ys = [];
    for (var i = 0, z = xs.length; i != z; ++i) {
      ys.push(f(xs[i]));
    }
    return ys;
  };
  
  jaja.filter = function(xs, f) {
    var ys = [];
    for (var i = 0, z = xs.length; i != z; ++i) {
      if (f(xs[i])) {
        ys.push(xs[i]);
      }
    }
    return ys;
  };
  
  
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
  
})(window.jaja = window.jaja || {}, jQuery);



