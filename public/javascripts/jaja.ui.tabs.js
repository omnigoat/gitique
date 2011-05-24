//=====================================================================
// 
//=====================================================================
(function(undefined){

	//=====================================================================
	// prototype for the tabs widget
	//=====================================================================
	var tabs_widget_prototype =
	{
		defaults: {
			max_tab_width_pc: 20,
			max_tab_width_px: 80,
			close_button: true,
		},

		tab: function(id) {
			var tab = undefined;
			if (typeof id === "string") {
				tab = this.tabs.find("div.ui-tab-inner").filter(":has(div.ui-tab-content-inner:contains(" + id + "))");
			}
			else {
				tab = this.tabs.get(id);
			}

			return $.extend({iq: tab}, tab_prototype);
		},

		to_panes: function($panes) {
			$panes = ($panes instanceof $) ? $panes : $($panes);
			if (this.$tabs.length !== $panes.length) {
				console.error("mismatch tabs/panes");
			}

			// add classes
			$panes.addClass("ui-pane");

			this.links = jaja.zip(this.tabs, $panes);
			var $tabs = this.$tabs;

			$.each(this.links, function()
			{
				var $tab = $(this[0]),
				    $pane = $(this[1])
				    ;
				
				if ($tab.hasClass("ui-tab-active")) {
					$pane.addClass("ui-pane-active");
				}

				$tab.bind("mousedown", function() {
					$panes.removeClass("ui-pane-active");
					$pane.addClass("ui-pane-active");
				});
			});
		}
	};

	//=====================================================================
	// prototype for a single tab
	//=====================================================================
	var tab_prototype = {
		bind: function(eventname, f)
		{
			if (eventname === "close") {
				$(this.iq).find(".ui-tab-close-circle-inner").bind("mousedown", f);
			}
			else {
				this.iq.bind(eventname, f);
			}
		}
	};




	//=====================================================================
	// tabs function
	//=====================================================================
	$.extend(jaja.ui, {
		tabs: function(elem, options)	{
			return new jaja.ui.tabs.init(elem, options);
		}
	});

	$.extend(jaja.ui.tabs, {
		init: function(elem, options)
		{
			// initialise instance
			$.extend(this, jaja.ui.tabs, tabs_widget_prototype);
			this._settings = $.extend({}, tabs_widget_prototype.defaults, options);
			this.$elem = (elem instanceof $) ? elem : $(elem);
			this.$bar = this.$elem.children("ul");
			this.$tabs = this.$bar.children();
			this.tabs_set = jaja.set(this.$tabs.get(), function(lhs, rhs) {
				return $(lhs).offset().left < $(rhs).offset().left;
			});

			this.tabs_topology = [];
			var widget = this;

			this.$tabs.each(function(i) {
				widget.tabs_topology.push({
					node: this,
					threshold: 0.33,
				});

				$(this).css("z-index", (widget.$tabs.length - i - 1));
			});
			

			

			// add classes
			this.$elem.addClass("jaja-ui-tabs");
			this.$bar.addClass("ui-bar");
			this.$tabs.addClass("ui-tab");
			this.$tabs.filter(".default").removeClass("default").addClass("ui-tab-active");
			
			// add elements
			this.$tabs.wrapInner("<div class='ui-tab-inner'><div class='ui-tab-content'><div class='ui-tab-content-inner'></div></div></div>");
			this.$tabs.draggable({axis:'x', containment:'parent', distance: 10});

			//
			// MOUSEDOWN
			//
			this.$tabs.bind("mousedown", function()
			{
				// reset previous active tab
				widget.$tabs.filter(".ui-active")
					.removeClass("ui-active")
					.css("z-index", widget.activetab_old_zindex);

				// activate new tab
				$(this).addClass("ui-active");
				widget.activetab_old_zindex = this.style.zIndex;
				this.style.zIndex = 9001;
			})
			//
			// START DRAGGING
			//
			.bind("dragstart", function()
			{				
			})
			//
			// WHILST DRAGGING
			//
			.bind("drag", function()
			{
				widget.tabs_set.sort();

				var $this = $(this),
				    this_index = widget.tabs_set.index(this)
				    ;
				
				if (this_index === undefined) { console.error("bad index!"); return false; }

				if (this_index > 0) {
					widget._swap_prev_tab($this);
				}
				
				if (this_index < widget.tabs_set.length - 1) {
					widget._swap_next_tab($this);
				}

			})
			//
			// STOP DRAGGING
			//
			.bind("dragstop", function()
			{
				var $this = $(this), active_tab = this;
				
				// set z-index by position (except active tab!)
				widget.tabs_set.sort();
				widget.tabs_set.each(function(i) {
					if (this != active_tab) {
						this.style.zIndex = widget.$tabs.length - i - 1;
					}
				});
				
				// snap active tab back into place
				$this.animate({
					left: (widget.tabs_set.index(this) - $this.index()) * $(this).outerWidth()
				}, 100);
			});



			//
			// close button
			//
			if (this._settings.close_button)
			{
				this.$tabs.find(".ui-tab-inner").append(
					"<div class='ui-tab-close'>" +
						"<div class='ui-tab-close-circle'>" +
							"<div class='ui-tab-close-circle-inner'><span>x</span></div>" +
						"</div></div><div style='clear: both' />"
				);

				this.$tabs.find("div.ui-tab-close-circle-inner")
					.bind("mouseenter", function() {
						$(this).addClass("ui-active");
						$(this).find("span").addClass("ui-active");
					})
					.bind("mouseleave", function() {
						$(this).removeClass("ui-active");
						$(this).find("span").removeClass("ui-active");
					})
					.bind("mousedown", function(event) {
						event.stopPropagation();
					})
					;
			}
		




			// return the widget
			return this;
		},



		//=====================================================================
		// PREV
		//=====================================================================
		_swap_prev_tab: function($current)
		{
			var current = $current.get(0),
			    current_index = this.tabs_set.index(current),
			    prev = this.tabs_set.get(current_index - 1),
			    $prev = $(prev),
			    prev_topo = this.tabs_topology[current_index - 1]
			    ;
			

			if (prev_topo.node != current &&
				$current.position().left <
					(current_index - 1) * $prev.outerWidth() + $prev.outerWidth() * 0.33 + $current.parent().position().left)
			{
				$prev.stop().animate({
					left: (current_index - $prev.index()) * $prev.outerWidth()
				}, 300);

				// swap z-indices around
				this.activetab_old_zindex = $prev.css("z-index");
				$prev.css("z-index", this.activetab_old_zindex);

				// swap topology around
				this.tabs_topology.swap(current_index, current_index - 1);
			}
		},

		//=====================================================================
		// NEXT
		//=====================================================================
		_swap_next_tab: function($current, $next, threshold)
		{
			var current = $current.get(0),
			    current_index = this.tabs_set.index(current),
			    next = this.tabs_set.get(current_index + 1),
			    $next = $(next),
			    next_topo = this.tabs_topology[current_index + 1]
			    ;
			
			if (next_topo.node != current &&
				($current.position().left + $current.outerWidth()) > 
					(current_index + 1) * $next.outerWidth() + $next.outerWidth() * 0.66 + $current.parent().position().left)
			{
				$next.stop().animate({
					left: (current_index - $next.index()) * $next.outerWidth()
				}, 300);

				// swap z-indices around
				this.activetab_old_zindex = $next.css("z-index");
				$next.css("z-index", this.activetab_old_zindex);

				// swap topology
				this.tabs_topology.swap(current_index, current_index + 1);
			}
		}
	});

})();
