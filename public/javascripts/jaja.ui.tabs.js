//=====================================================================
// 
//=====================================================================
(function(undefined){

	$.extend(jaja.ui, {
		tabs: function(elem) {
			var $elem = (elem instanceof $) ? elem : $(elem),
			    $bar = $elem.children("ul"),
			    $tabs = $bar.children(),
			    $panes = $elem.children("div")
			    ;
			
			// make sure that we have an equal number of tabs and panes
			if ($tabs.length !== $panes.length) {
				alert("mismatch tabs/panes");
			}

			

		}
	});

})();