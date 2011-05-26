
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
			
			this._for_all($root_ul, function() {
				var $node = $(this);
				return $("<div class='ui-tree-folder'/>")
					.html($node.html())
					.replaceAll($node);
			});
		},

		_for_all: function($node, fn)
		{
			if ($node.length !== 1) { console.error("incorrect ul node"); return; }
			var self = this;

			$node.children("li").each(function() {
				var $li = fn.apply(this, [this]),
				    $child_ul = $li.children("ul")
				    ;
				
				$child_ul.length === 1 && self._for_all($child_ul, fn);
			});

			$node.replaceWith($node.children());
		}


	});

})();