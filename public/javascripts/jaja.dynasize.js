

//=====================================================================
// requires jaja.scrollbar
//=====================================================================
;(function(jaja, $, undefined) {
	
	$.extend(jaja, {
		dynamically_size: function(options)
		{
			// default options, and option checking
			options = $.extend({}, jaja.dynamically_size.defaults, options);
			if (options.element === undefined || options.using === undefined) return false;
			
			// $triggers is an array of jquery objects, one for each trigger. by design.
			var $triggers = jaja.map(options.in_response_to, function(x) {return $(x);});
			    
			// save closure for possible instant execution
			var on_resize = function() {
				$.each(options.using, function(i, command) {
					options.element.css(i, command.apply(options.element, $triggers));
				});
			};

			// each trigger gets the same binding
			$.each($triggers, function(i, $trigger_elem) {
				$trigger_elem.bind("resize.dynamically_size", on_resize);
			});
			
			// possibly execute immediately
			if (options.apply_now) {
				on_resize();
			}
		},
	});

	jaja.dynamically_size.defaults = {
		in_response_to: $(window),
		apply_now: true,
	};

})(jaja, jQuery);








