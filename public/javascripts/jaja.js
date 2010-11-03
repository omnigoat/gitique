
;(function(jaja, $, undefined) {
  
  jaja.detail =
  {
    scrollbar: {
      options: {},
      
      ify: function($element)
      {
        var $parent = $element.parent();
        $element.replaceWith(
          '<div id="' + $element.attr('id') + '" class="jaja-scrollbar">' +
            '<div class="jaja-scrollbar-less"></div>' +
              '<a class="jaja-scrollbar-nub"></a>' +
                '<div class="jaja-scrollbar-more"></div>'
        );
      }
    }
  };
  
  jaja.scrollbar = function(elements, options)
  {
    elements.each(function(i, element)
    {
      var $element = $(element);
      jaja.detail.scrollbar.ify($element);
    });
  }
  
})(window.jaja = window.jaja || {}, jQuery);



