
;(function(jj, $, undefined) {
  
  
  jj.shs = {};
  
  //=====================================================================
  //
  // syntax-highlighting
  //
  //=====================================================================
  
  // maps a specific sh to an id
  jj.shs.add = function(id, parent)
  {
    if (!jj.shs.elements) {
      jj.shs.elements = [];
    }
    
    jj.shs.elements[id] = parent.children("div.syntaxhighlighter").first();
  }
  
  // all shs
  $('document').ready(function(){
    {
      jj.shs.all = $('div.syntaxhighlighter');
    })
    ;
  
  
  
  //=====================================================================
  // editor is an object representing... an editor
  //=====================================================================
  jj.editor = {};
  
  //=====================================================================
  // set editor
  //=====================================================================
  jj.editor.bind = function(nm) {
    jj.editor.id = nm;
  }
  
  //=====================================================================
  // clear highlighted lines
  //=====================================================================
  jj.editor.clear_highlighted_lines = function()
  {
    if (jj.editor.highlighted) {
      jj.editor.highlighted.each(function() {
        $(this).removeClass('highlighted');
      })
      ;
    }
  };
  
  //=====================================================================
  // the code for selecting line-by-line
  //=====================================================================
  jj.editor.activate_line_by_line_selection = function()
  {
    $('body')
      .bind('mousemove.highlight', function(e)
      {
        if (!jona.page.mousedown_y)
          return;
        
        var from = Math.min(e.pageY, jona.page.mousedown_y);
        var to = Math.max(e.pageY, jona.page.mousedown_y);
        
        $('.line')
          .filter(function() {
            var position = position_of(this);
            return from < (position.top + this.offsetHeight) && position.top < to;
          })
          .each(function() {
            $(this).addClass('highlighted');
          })
          ;
        
        if (jona.page.mousemove_y)
        {
          $('.line.highlighted')
            .filter(function() {
              var position = position_of(this);
              return to < position.top || (position.top + this.offsetHeight) < from;
            })
            .each(function() {
              $(this).removeClass('highlighted');
            })
            ;
        }
        
        jona.page.mousemove_y = e.pageY;
      })
      ;
    
    $('body')
      .one('mouseup.highlight', function(e) {
        $(this).unbind('mousemove.highlight');
        jona.page.mouseup_y = e.pageY;
        jona.editor.highlighted = $('div.line.highlighted');
        jona.page.mousedown_y = null;
      })
      ;
  }
  
})(window.jash = window.j || {}, jQuery);



