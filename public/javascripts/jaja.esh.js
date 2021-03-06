//=====================================================================
// requires jaja.scrollbar
//=====================================================================
;(function(jaja, $, undefined) {
	
	//=====================================================================
	// function that creates a scrollbar
	//=====================================================================
	jaja.ui.esh = function self($elem, options) {
		return new jaja.ui.esh._init($elem, options);
	};
	
	$.extend(jaja.ui.esh, {
		
		load_file: function(filename, line)
		{
			if (line === undefined) {
				line = 0;
			}
			
			var self = this;
			
			$.ajax({
				url: 'ajax/load',
				data: {"repo_id": repo_id, "branch": branch, "filename": filename, from: line, to: line + 1200},
				
				success: function(msg)
				{
					var $buffer = self.$buffer;
					
					$buffer
						.append(msg)
						.detach()
						;
					
					$buffer.find('td.gutter div.line')
						.each(function(index) {
							var $this = $(this);
							$this.text(line+index+1);
							$this.removeClass('index'+index);
							$this.addClass('index'+(line+index));
						})
						.appendTo(self.$gutter)
						;
					
					$buffer.find('div.container .line')
						.appendTo(self.$container)
						;

					$buffer
						.children()
						.remove()
						;
					
					// update scrollbar
					self._recalculate_vsb_range();
					//var vsb = self.$vsb.data('jaja.ui.scrollbar');
					//vsb.setting('max', self.$container.children().length - 1);
					
					
					
					if ((line + 1200) < window.total_lines) {
						self.load_file(filename, line + 1200);
					}
					
				}
			});
		},
		
		// indices is an array of numbers, lines is an array of corresponding code-lines
		push_lines: function(indices, lines)
		{
			var $gutter = this.$gutter, $container = this.$container;

			$.each(indices, function(i, x)
			{
				if (i > 0 && x != indices[i - 1] + 1) {
					$gutter.append('<div style="font-size: 50%">&nbsp;</div>');
					$container.append('<div style="font-size: 50%">&nbsp;</div>');
				}

				$gutter.append('<div>' + (x + 1) + '</div>');
				$container.append(lines[i]);
			});

			this._recalculate_vsb_range();
		},
		
		_recalculate_vsb_range: function()
		{
			var vsb = this.$vsb.data('jaja.ui.scrollbar');
			vsb.setting('max', this.$container.children().length - 1);
		},
		
		_line_containing_point: function(point)
		{
			var lines = this.$gutter.children();
			
			return jaja.binary_search(lines, function(line)
			{
				var $line = $(line),
						pos = $line.offset()
						;
				
				if (pos.top < point) {
					if (point < pos.top + $line.outerHeight()) {
						return 0;
					}
					else {
						return -1;
					}
				}
				else {
					return 1;
				}
			});
		},
			
		
		
		
		
		
		
		_activate_line_by_line_selection: function(mousedown_line)
		{
			var esh = this;
			
			//esh._settings.mousedown_line = mousedown_line;
			
			$(window)
			.one('mouseup.highlight', function(e) {
					$(this).unbind('mousemove.highlight');
					esh._settings.highlighted_lines = $('div.line.highlighted');
					esh._settings.hovering_line = undefined;
			})
			.bind('mousemove.highlight', function(e)
			{
				var mouseline = esh._line_containing_point(e.pageY).value;
				
				// don't do squat if we're just in our own line
				if ( esh._settings.hovering_line && mouseline === esh._settings.hovering_line ) {
					return;
				}
			
				
				 
				//
				// get our range of lines. this got complex because I wanted to reduce the amount
				// of operations to an aboslute minimum.
				//
				var from_line_index = -1;
				var to_line_index = -1;
				//console.log(jaja.page.mousedown_position.y);
				if (e.pageY < jaja.page.mousedown_position.y) {
					from_line_index = mouseline;
					to_line_index = mousedown_line + 1;
				}
				else {
					from_line_index = mousedown_line;
					to_line_index = mouseline + 1;
				}
				
				
				
				//
				// highlight them! :D
				//
				var gutter_lines = esh.$gutter.children();
				var container_lines = esh.$container.children();
				gutter_lines.slice(from_line_index, to_line_index).addClass('highlighted');
				container_lines.slice(from_line_index, to_line_index).addClass('highlighted');
				
				//
				// unhighlight lines outside this range
				//
				
				if (esh._settings.active_mousemove_range)
				{
					var active_range = esh._settings.active_mousemove_range;
					if (active_range.from < from_line_index) {
						gutter_lines.slice(active_range.from, from_line_index).removeClass('highlighted');
						container_lines.slice(active_range.from, from_line_index).removeClass('highlighted');
					}
					
					if (to_line_index < active_range.to) {
						gutter_lines.slice(to_line_index, active_range.to).removeClass('highlighted');
						container_lines.slice(to_line_index, active_range.to).removeClass('highlighted');
					}
				}
				
				
				esh._settings.active_mousemove_range = {from: from_line_index, to: to_line_index};
				esh._settings.hovering_line = mouseline;
			})
			;
		},
		
		
		selected_lines: function()
		{
			var indices = [];
			var $content = this.$container.find('div.line.highlighted')
				.each(function() {
					indices.push($(this).index());
				})
				;
			
			return {indices: indices, lines: $content};
		},
		
		
		
		_clear_highlighted_lines: function()
		{
			if (this._settings.highlighted_lines) {
				this._settings.highlighted_lines.removeClass('highlighted');
			}
		},
		
		_resize: function()
		{
			console.log(
				this.$parent,
				this.$parent.outerWidth() + "x" + this.$parent.outerHeight() + " @ " + this.$parent.position().left + ":" + this.$parent.position().top
			);
			
			//console.log(this.$parent.outerHeight() - this.$whole.position().top);
			
			jaja.dynamically_size({
				element: this.$whole,
				in_response_to: [this.$parent],
				using: {
					width: function($parent) {return $parent.outerWidth() - this.position().left;},
					height: function($parent) {return $parent.outerHeight() - this.position().top;},
				}
			});

			//this.$whole
			//	.css({
			//		width: this.$parent.outerWidth() - this.$whole.position().left,
			//		height: this.$parent.outerHeight() - this.$whole.position().top
			//	})
			//	;
			
			jaja.dynamically_size({
				element: this.$workspace,
				in_response_to: [this.$whole],
				using: {
					height: function($whole) {return $whole.outerHeight() - this.position().top - jj.page.scrollbar_width;},
					width: function($whole) {return $whole.outerWidth() - this.position().left - jj.page.scrollbar_width;},
				},
			});

			//this.$workspace
			//	.css({
			//		height: this.$whole.outerHeight() - this.$workspace.position().top - jj.page.scrollbar_width,
			//		width: this.$whole.outerWidth() - this.$workspace.position().left - jj.page.scrollbar_width,
			//	})
			//	;
			
			

			this.$vsb.css({
				right: 0,
				width: jj.page.scrollbar_width,
			});
			
			jaja.dynamically_size({
				element: this.$vsb,
				in_response_to: [this.$workspace],
				using: {
					top: function($w) {return $w.position().top;},
					height: function($w) {console.log("yep", $w.height()); return $w.height();},
				}
			});


			jaja.dynamically_size({
				element: this.$hsb,
				in_response_to: [this.$workspace],
				using: {
					top: function($w) {return $w.position().top + $w.outerHeight();},
					width: function($w) { return $w.width();},
				}
			});
			
			

			this.$hsb.css({
				right: jj.page.scrollbar_width,
				height: jj.page.scrollbar_width,
			});
		},
		
		_init: function($sh, options)
		{
			$.extend(this, jaja.ui.esh);
			this._settings = {};
			
			var $parent = $sh.parent(),
					$next = $sh.next(),
					sh_id = $sh.attr('id'),
					adder = $next[0] ? {f: 'insertBefore', v: $next} : {f: 'appendTo', v: $parent}
					;
			
			// 1) syntax-highlight it!
			SyntaxHighlighter.highlight({}, $sh[0]);
			// 2) reset $sh to point to the new one
			$sh = $parent.find('div.syntaxhighlighter').unwrap();
			
			
			// set up our "esh" - Extended SyntaxHighlighter.
			$.extend(this, {
				$parent: $parent,
					$whole: $('<div id="' + sh_id + '" class="extended-syntax-highligther"></div>'),
						$workspace: $('<div class="workspace"></div>'),
							$sh: $sh,
								$gutter: $sh.find('td.gutter'),
								$container: $sh.find('div.container'),
						$vsb: $('<div class="vsb"></div>'),
						$hsb: $('<div class="hsb"></div>'),
						$buffer: $('<div class="buffer" style="display: hidden"></div>'),
			});
			

			this.$whole
				[adder.f](adder.v)
				.css({
					position: 'relative',
					width: '100%',
					height: '100%',
				})
				;
			
			this.$workspace
				.appendTo(this.$whole)
				.css({
					overflow: 'hidden'
				})
				;
			
			this.$sh
				.appendTo(this.$workspace)
				;
			
			this.$vsb
				.appendTo(this.$whole)
				.css({
					position: 'absolute',
					right: 0,
				})
				;
			
			this.$hsb
				.appendTo(this.$whole)
				.css({
					position: 'absolute',
				})
				;
			
			this.$buffer
				.appendTo(this.$whole)
				;
			
						
			// wrap the container in a wrapper so we can scroll horizontally
			this.$container
				.wrapAll('<div class="container-wrapper">')
				;
			
			this.$gutter
				.children().remove()
				;
				
			this.$container
				.children().remove()
				;
			

			this._resize();
			
			//=====================================================================
			// scrolling
			//=====================================================================
			var self = this;
			setInterval(function() {
				var k = self.$vsb.data('scroll.target');
				if (k !== undefined) {
					self.$vsb.css({
							top: self.$workspace.position().top,
							height: self.$workspace.height(),
					});

					var current_top = parseInt(self.$sh.css('top'));
					var offset = (k - current_top) * 0.6;
					self.$sh.css('top', current_top + offset);
				}
			}, 16);

			
			jaja.ui.scrollbar( this.$hsb, {
				change: function(value) {
					var c = self.$container;
					var topValue = -(value) * (parseInt(c.css('width'))/150);
					c.css('left', topValue);
				}
			});
			
			jaja.ui.scrollbar(this.$vsb, {
				orientation: "vertical",
				
				change: function(value) {
					self.$vsb.data(
						'scroll.target',
						-self.$container.find('div.line').eq(value).position().top
					);
				}
			});
			
			// bind mousewheel event to syntax-highlighter
			this.$parent.mousewheel(function(event, delta) {
				var $vsb = self.$vsb;
				$vsb.data('jaja.ui.scrollbar').value(-delta, true, true);
				event.preventDefault();
			});
			
			
			
			
			
			//=====================================================================
			// highlighting
			//=====================================================================
			this.$gutter
				.bind('mousedown.highlight', function(event)
				{
					var $target = $(event.target),
							target_index = $target.index(),
							$code_line = self.$container.children().eq(target_index)
							;
					
					if ($target.is('div.line'))
					{
						// if we're mousedowning on a selected line, then unselect it instead
						if (event.ctrlKey === true && event.shiftKey === false &&$target.hasClass('highlighted'))
						{
							$target.removeClass('highlighted');
							$code_line.removeClass('highlighted');
							self._settings.shift_select_start_line = undefined;
							return true;
						}
						
						if (event.ctrlKey === false) {
							self._clear_highlighted_lines();
						}
						
						// if the shift key is down, hmm......
						if (event.shiftKey === true)
						{
							if (self._settings.shift_select_start_line === undefined) {
								self._settings.shift_select_start_line = self._settings.mouseup_line;
							}
							
							var range = {
								from: Math.min(self._settings.shift_select_start_line, target_index),
								to: Math.max(self._settings.shift_select_start_line, target_index) + 1,
							};
											 
							self.$gutter.children().slice(range.from, range.to).addClass('highlighted');
							self.$container.children().slice(range.from, range.to).addClass('highlighted');	
						}
						else {
							$target.addClass('highlighted');
							$code_line.addClass('highlighted');
							self._activate_line_by_line_selection(target_index);
							self._settings.shift_select_start_line = undefined;
						}
						
						
						
						
						self._settings.mousedown_line = target_index;
						event.preventDefault();
					}
				})
				.bind('mouseup.highlight2', function(event)
				{
					var $target = $(event.target),
							target_index = $target.index(),
							$code_line = self.$container.children().eq(target_index)
							;
					
					
					if ($target.is('div.line') && $target.hasClass('highlighted'))
					{
						// we start a shift-select range if the shift key is down (duh), and
						// the start of the range isn't defined. if it is defined, it means we
						// are still extending our selected range with the shift key
						if (event.shiftKey) {
							if (self._settings.shift_select_start_line === undefined) {
								self._settings.shift_select_start_line = target_index;
							}
						}
						else {
							self._settings.shift_select_start_line = undefined;
						}
						
						self._settings.highlighted_lines = self.$sh.find('div.highlighted');
						self._settings.mouseup_line = target_index;
						
						
						if (self._settings.active_lines) {
							self._settings.active_lines.removeClass('active');
						}
						self._settings.active_lines = $target.add($code_line).addClass('active');
						
					}
				})
				;
			
			// um... can't remember
			this.$container.bind('mousedown.highlight', function(e) {
				if (e.shiftKey) {
					e.preventDefault();
					return false;
				}
			});
			
			return this;
		},
	});
	
})(jaja, jQuery);