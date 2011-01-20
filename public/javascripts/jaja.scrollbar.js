//=====================================================================
//
//=====================================================================
;(function(jaja, $, undefined) {
	if (jaja.ui === undefined) {
		jaja.ui = {};
	}
	
	
	//=====================================================================
	// function that creates a scrollbar
	//=====================================================================
	jaja.ui.scrollbar = function self($elem, options) {
		return new jaja.ui.scrollbar._init($elem, options);
	};
	
	
	//=====================================================================
	//
	// extending the scrollbar object
	//
	//=====================================================================
	$.extend(jaja.ui.scrollbar, {
		//=====================================================================
		// default options for scrollbar
		//=====================================================================
		defaults:
		{
			min: 0,
			max: 100,
			value: 0,
			step: 1,
			orientation: "horizontal",
			enabled: true,
			paging_multiplier: 5,
			
			// default change function does nothing
			change: function() {},
		},
		
		//=====================================================================
		// the skeletal scrollbar
		//=====================================================================
		_settings: undefined, // please define later
		
		value: function(v, relative)
		{
			var hz = this._settings.horizontal,
			    axis = hz ? 'left' : 'top',
			    x = this.$nub.position()[axis],
				  step = this._settings.step,
				  delta = this._settings.pixel_delta
				  ;
			
			if (v === undefined) {
				return Math.round(x / delta) * step;
			}
			else {
				var bounded_value = jaja.bounded(0, relative ? this.value() + v : v, this._settings.max);
				this.$nub.css(axis, bounded_value * step * delta);
				this._recalculate_innerbars();
				this._settings.change(this.value());
			}
		},
		
		// "poised" bits change colour on mouse-hover
		_poised: function(sb) {
			sb = sb || this;
			sb._poisable().addClass("jaja-ui-poised", 600);
		},
		_unpoised: function(sb) {
			//console.log("unpoising");
			sb = sb || this;
			sb._poisable(sb).removeClass("jaja-ui-poised", 1200);
		},
		_poisable: function() {
			return this.$less_button.add(this.$more_button).add(this.$nub);
		},
		
		// the size of the bars on either side of the nub must change whenever
		// the nub moves
		_recalculate_innerbars: function() {
			if (this._settings.horizontal) {
				this.$less_bar.css({
						width: this.$nub.position().left,
					});
				
				this.$more_bar.css({
						width: this.$bar.innerWidth() - this.$nub.position().left - this.$nub.outerWidth(),
					});
			}
			else {
				this.$less_bar.css({
						height: this.$nub.position().top,
					});
				
				this.$more_bar.css({
						height: this.$bar.innerHeight() - this.$nub.position().top - this.$nub.outerHeight(),
					});
			}	
		},
		
		
		// the nub of the scrollbar has a few special properties. it changes from
		// poised to active whenever it's hovered directly, and if we mousedown and
		// then leave the bounds of our scrollbar, we do *not* become unpoised
		_nub_mouseenter: function() {
			$(this)
				.addClass("jaja-ui-active")
				.one("mouseleave.scrollbar", sb._nub_mouseleave)
				;
		},

		_nub_mouseleave: function() {
			$(this).removeClass("jaja-ui-active");
		},
		
		_nub_mousedown: function(sb, event)
		{
			var nub = this, $nub = sb.$nub, $whole = sb.$whole;
			$nub.unbind("mouseleave.scrollbar");
			$nub.unbind("mouseenter.scrollbar");
			$whole.unbind("mouseleave");
			
			$(document).one("mouseup.jaja-ui-scrollbar", function(event) {
				if (event.target.parentNode === nub) {
					event.stopPropagation();
					$nub.bind("mouseleave.scrollbar", sb._nub_mouseleave);
					$whole.bind("mouseleave", sb._unpoised.partial(sb));
					$(document).unbind("mouseup.jaja-ui-scrollbar");
				}
				else {
					sb._nub_mouseleave(); //$nub.removeClass("jaja-ui-active");
					$nub.bind("mouseenter.scrollbar", sb._nub_mouseenter);
					sb._unpoised();
				}
			});
		},
		
		_range: function() {
			if (this._settings.horizontal) {
				return this.$bar.innerWidth() - this.$nub.outerWidth();
			} else {
				return this.$bar.innerHeight() - this.$nub.outerHeight();
			}
		},
		
		_nub_set: function(value) {
			this.$nub.css('left', jaja.bounded(0, value, this._range()));
		},
		
		_calculate_deltas: function()
		{
			var range = this._range(),
			    max = this._settings.max,
			    default_step = this._settings.step
			    ;
			
			console.log(this, range, max, default_step);
			if (range > max) {
				this._settings.pixel_delta = (range / max) * default_step;
				this._settings.step = default_step;
			}
			else {
				this._settings.step = (max / range) * default_step;
				this._settings.pixel_delta = default_step;
			}
		},
		
		
		
		//=====================================================================
		// initialising the object
		//=====================================================================
		_init: function($elem, options)
		{
			// this instance has all the scrollbar functions too!
			$.extend(this, jaja.ui.scrollbar);
			// this._settings now has the combined options
			this._settings = $.extend({}, this.defaults, options);
			this._settings.horizontal = this._settings.orientation === "horizontal";
			
			// set up the structure of our scrollbar
			this.$whole = $elem;
			this.$less_button = $('<a href="#" class="jaja-ui-button jaja-ui-scrollbutton-less"><</a>');
			this.$bar = $('<div class="jaja-ui-scrollbar-bar"></div>');
			this.$wrapper = $('<div></div>');
			this.$less_bar = $('<div id="less" class="jaja-ui-scrollbar-innerbar"></div>');
			this.$nub = $('<a href="#" class="jaja-ui-scrollbar-nub"></a>');
			this.$more_bar = $('<div id="more" class="jaja-ui-scrollbar-innerbar"></div>');
			this.$more_button = $('<a href="#" class="jaja-ui-scrollbutton-more jaja-ui-button">></a>');
			
			// quickhand for horizontal scrollbars
			var hz = this._settings.horizontal;
			// needed for the scopes!
			var self = this;

			
			this.$whole
				.addClass("jaja-ui-scrollbar")
				.addClass(hz ? "" : "jaja-ui-vertical")
				.mouseenter(this._poised.partial(this.self))
				.mouseleave(this._unpoised.partial(this.self))
				;
			
				
			this.$less_button
				.appendTo(this.$whole)
				.css({
					'float': hz ? 'left' : undefined,
					display: "block",
					width: hz ? this.$whole.innerHeight() - 2 : this.$whole.innerWidth() - 2,
					height: hz ? this.$whole.innerHeight() - 2 : this.$whole.innerWidth() - 2,
					'text-decoration': 'none',
				})
				.bind("click", function() {
					self.value(-self._settings.step, true);
					event.preventDefault();
				})
				;
				
			
			this.$bar
				.appendTo(this.$whole)
				.css({
					'float': hz ? 'left' : undefined,
					dispaly: "block",
					width: hz ? this.$whole.innerWidth() - this.$less_button.outerWidth() * 2 : this.$whole.innerWidth(),
					height: hz ? this.$whole.innerHeight() : this.$whole.innerHeight() - this.$less_button.outerHeight() * 2,
				})
				;
			
			
				
			this.$wrapper
				.appendTo(this.$bar)
				.css({
					position: 'relative',
					height: this.$bar.innerHeight(),
					width: this.$bar.innerWidth(),
				})
				;
				
				
			this.$less_bar
				.appendTo(this.$wrapper)
				.css({
					position: 'absolute',
					height: hz ? this.$whole.innerHeight() : 1,
					width: hz ? 1 : this.$whole.innerWidth(),
					background: "#ff0000",
					opacity: 0.2
				})
				.click(function(event) {
					self.value(-self._settings.step * self._settings.paging_multiplier, true);
					event.preventDefault();
				})
				;
			
			this.$nub
				.appendTo(this.$wrapper)
				.append($('<span>' + (hz ? '||' : '=') + '</span>')
					.css({
						display: "table-cell",
						'vertical-align': hz ? "auto" : "middle",
						"text-align": "center",
						width: hz ? 30 : this.$bar.innerWidth() - 2,
						height: hz ? this.$bar.innerHeight() - 2 : 30, //calculate_nub_size(),
					})
				)
				.css({
					width: hz ? 30 : this.$bar.innerWidth() - 2,
					height: hz ? this.$bar.innerHeight() - 2 : 30, //calculate_nub_size(),
					"text-align": "center",
					"vertical-align": "middle",
					"text-decoration": "none",
					'font-size': '0.6em',
					position: 'absolute',
					"z-index": 2,
				})
				.draggable({
					axis: hz ? "x" : "y",
					containment: this.$bar,
					
					stop: function(event) {
						self._recalculate_innerbars();
						self._settings.change(self.value());
					},
					
					drag: function(event) {
						//self._recalculate_innerbars();
						self._settings.change(self.value());
					}
					
				})
				.bind("mouseenter", this._nub_mouseenter) //jaja.ui.detail.scrollbar_nub_mouseenter)
				.bind("mousedown", function() {this._nub_mousedown})
				.mousedown(function(event) {
					event.preventDefault();
				})
				;
			
				
			this.$more_bar
				.appendTo(this.$wrapper)
				.css({
					position: 'absolute',
					right: hz ? 0 : undefined,
					bottom: hz ? undefined : 0,
					height: hz ? this.$bar.innerHeight() : 1,
					width: hz ? 1 : this.$bar.innerWidth(),
					background: "#00ff00",
					opacity: 0.2
				})
				.click(function(event) {
					console.log("blha");
					self.value(self._settings.step * self._settings.paging_multiplier, true);
					event.preventDefault();
				})
				;
				
			
			
			this.$more_button
				.appendTo(this.$whole)
				.css({
					'float': hz ? 'left' : 'none',
					display: "block",
					width: hz ? this.$whole.innerHeight() - 2 : this.$whole.innerWidth() - 2,
					height: hz ? this.$whole.innerHeight() - 2 : this.$whole.innerWidth() - 2,
					'text-decoration': 'none',
				})
				.click(function() {
					self.value(self._settings.step, true);
					event.preventDefault();
				})
				;
				
				
			var range_width = this.$wrapper.innerWidth() - this.$nub.outerWidth();
			
			this._recalculate_innerbars();
			this._calculate_deltas();
		},
	});
	
	
	jaja.bounded = function(lbound, v, ubound) {
		return v < lbound ? lbound : v > ubound ? ubound : v;
	};
		
	
	
	
})(jaja, jQuery);






