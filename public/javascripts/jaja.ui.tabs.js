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
					sliding: false,
				});
			});
			

			

			// add classes
			this.$elem.addClass("jaja-ui-tabs");
			this.$bar.addClass("ui-bar");
			this.$tabs.addClass("ui-tab");
			this.$tabs.filter(".default").removeClass("default").addClass("ui-tab-active");
			
			// add elements
			this.$tabs.wrapInner("<div class='ui-tab-inner'><div class='ui-tab-content'><div class='ui-tab-content-inner'></div></div></div>");
			this.$tabs.draggable({axis:'x', containment:'parent', distance: 10});

			this.$tabs.bind("drag", function()
			{
				widget.tabs_set.sort();

				var $this = $(this),
				    this_index = widget.tabs_set.index(this)
				    ;
				
				console.log("dragging");
				if (this_index === undefined) { console.error("bad index!"); return false; }

				if (this_index > 0) {
					var prev = widget.tabs_set.get(this_index - 1),
					    $prev = $(prev),
					    prev_topo = widget.tabs_topology[this_index - 1]
					    ;
					
					if (!prev_topo.sliding && $this.position().left < $prev.position().left + ($prev.outerWidth() * 0.33))
					{
						console.log("animating prev");
						$prev.animate({
							left: (this_index - $prev.index()) * $prev.outerWidth()
						}, 300, function() {
							prev_topo.sliding = false;
						});

						prev_topo.sliding = true;
						var t = widget.tabs_topology[this_index];
						widget.tabs_topology[this_index] = prev_topo;
						widget.tabs_topology[this_index - 1] = t;
					}
				}

				if (this_index < widget.tabs_set.length - 1) {
					var next = widget.tabs_set.get(this_index + 1),
					    $next = $(next),
					    next_topo = widget.tabs_topology[this_index + 1]
					    ;
					
					if (!next_topo.sliding && ($this.position().left + $this.outerWidth()) > $next.position().left + ($next.outerWidth() * 0.66)) {
						console.log("animating next");
						$next.animate({
							left: (this_index - $next.index()) * $next.outerWidth()
						}, 300, function() {
							next_topo.sliding = false;
						});;

						next_topo.sliding = true;
						var t = widget.tabs_topology[this_index];
						widget.tabs_topology[this_index] = widget.tabs_topology[this_index + 1];
						widget.tabs_topology[this_index + 1] = t;
					}
				}

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
		}
	});

})();
