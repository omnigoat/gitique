
;(function(jaju, $, undefined) {
  
  jaju.removeClass = function(jqe, class_partial) {
    var m = jqe.attr('class').match(class_partial)[0];
    jqe.removeClass(m);
    return m;
  };
  
})(window.jaju = window.jaju || {}, jQuery);



