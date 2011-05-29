
//=====================================================================
//
//=====================================================================
(function(undefined){

	$.extend(jaja.ui, {
		filetree: function($root_ul, fetch_fn) {
			$root_ul = ($root_ul instanceof $) ? $root_ul : $($root_ul);
			if ($root_ul.length === 0) { console.error("no root ul found!"); }
			return new jaja.ui.filetree.init($root_ul, fetch_fn);
		}
	});

	$.extend(jaja.ui.filetree, {
		init: function($root_ul, fetch_fn)
		{
			$.extend(this, jaja.ui.filetree, {
				// where we are currently
				location: [],
				// type: 0-folder, 1-file
				root_node: {type: 0, children: {}},
				// save the fetch function for later
				fetch_fn: fetch_fn,
				// hold onto the element
				$dom_node: $root_ul,
			});
			this.current_node = this.root_node;

			var self = this;

			$root_ul.find(".ui-filetree-entry").each(function() {
				
				var $this = $(this),
				    text = $.trim($this.children(".ui-filetree-name").text())
				    ;
				
				self.root_node.children[text] = {type: 0, loaded: false, children: {}};
			});

			$(".ui-filetree-entry").live("click", function() {
				var $this = $(this),
				    text = $.trim($this.children(".ui-filetree-name").text())
				    ;
				
				self.cd_down(text);
				self.animate_cd(self.current_node, "rtl");
			});
		},

		animate_cd: function(node)
		{
			var self = this,
			    $pane = $("<div class='ui-filetree-pane'/>"),
			    $table = $("<div class='ui-filetree-table' />").appendTo($pane);
			
			$.each(node.children, function(key, value) {
				$table.append(
					$("<div class='ui-filetree-entry' />").append(
						$("<div class='ui-filetree-name'>" + key + "</div>")
					)
				);
			});

			$pane.css({position: "absolute", left: this.$dom_node.outerWidth(), top: 0});
			this.$dom_node.parent().append($pane);

			this.$dom_node.add($pane).animate({left: "-=" + this.$dom_node.outerWidth()}, 600, function() {
				$pane.css({position: "relative", left: 0, top: 0});
				self.$dom_node = self.$dom_node.replaceWith($pane);
			});
		},

		bind: function(eventname, fn) {
			var event_parts = eventname.split("."),
			    name = event_parts[0],
			    namespace = event_parts[1]
			    ;
			
			if (name === "cd") {
				this.$dom_node.bind("tree_" + eventname, fn);
			}			
		},

		cd_down: function(child_directory)
		{
			var child = this.current_node.children[child_directory];

			// verify child exists
			if (child === undefined) {
				console.error("node '" + child_directory + "' isn't there.");
				return false;
			}
			// verify child is correct
			else if (child.type !== 0) {
				console.error("node '" + child_directory + "' isn't a directory");
				return false;
			}
			// verify child is loaded
			else if (!child.loaded) {
				if (!this.load_node(child_directory)) {
					console.error("couldn't load directory", child_directory);
					return false;
				}
			}

			// cd to child
			this.current_node = this.current_node.children[child_directory];
			this.location.push(child_directory);
			return true;
		},

		load_node: function(child_node)
		{
			var result = this.fetch_fn(this.location.concat([child_node]));
			if (result !== undefined) {
				this.current_node.children[child_node].children = result;
				console.dir(this.root_node);
				return true;
			}
			else {
				return false;
			}
		},
	});
})();

//=====================================================================
// 
//=====================================================================
(function(undefined){

	$.extend(jaja.ui, {
		tree: function($root_ul) {
			$root_ul = ($root_ul instanceof $) ? $root_ul : $($root_ul);
			if ($root_ul.length === 0) { console.error("no root ul found!"); }
			return new jaja.ui.tree.init($root_ul);
		}
	});

	$.extend(jaja.ui.tree, {
		init: function($root_ul)
		{
			$.extend(this, jaja.ui.tree);
			
			var $root_div = this._build_div_tree($root_ul).wrapAll("<div class='ui-tree-root ui-tree-folder' />");
		},


		init_old: function($root_ul)
		{
			$.extend(this, jaja.ui.tree);
			
			var $root_div = this._build_div_tree($root_ul).wrapAll("<div class='ui-tree-root ui-tree-folder' />");

			this._for_each($root_div, undefined, ".ui-tree-folder > div:first", function() {
				var $this = $(this);
				$this.prepend("<div class='ui-tree-folder-icon'></div>");
			});
		},

		_build_div_tree: function($node)
		{
			if ($node.length !== 1) { console.error("incorrect ul node"); return; }
			var self = this;

			$node.children("li").each(function() {
				var $li = $(this),
				    $div = $("<div/>")
              .html($li.html())
              .replaceAll($li),

				    $child_ul = $div.children("ul")
				    ;
				
				if ($child_ul.length > 0) {
					$div.addClass('ui-tree-folder');
				}
				$child_ul.length === 1 && self._build_div_tree($child_ul);
			});

			return $node.children().replaceAll($node);
		},

		_for_each: function($root, down_fn, filter, up_fn)
		{
			var self = this;
			
			if ( down_fn !== undefined && ((filter === undefined) || $root.is(filter)) ) {
				down_fn.apply($root[0], [$root]);
			}

			$root.children().each(function() {
				self._for_each($(this), down_fn, filter, up_fn);;
			}); // this._for_each.partial(undefined, fn, filter) );

			if ( up_fn !== undefined && ((filter === undefined) || $root.is(filter)) ) {
				up_fn.apply($root[0], [$root]);
			}
		},


	});

})();