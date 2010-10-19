

;(function(jj, $, undefined) {
  
  jj.page = {};


  function position_of(obj) {
	    var curleft = curtop = 0;
      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
	      return {left: curleft, top: curtop};
      }
    }
  

  //=====================================================================
  //
  // syntax-highlighting
  //
  //=====================================================================
  jj.sh = {};
  jj.sh.all = [];
  
 

  // clear highlighted lines
  jj.sh.clear_highlighted_lines = function(tso)
  {
    if (tso.info.highlighted_lines) {
      tso.info.highlighted_lines.removeClass('highlighted');
    }
  };
  
  
  
  // binary search! :D
  jj.binary_search = function(range, pred, opt_bounds)
  {
    var l = opt_bounds ? opt_bounds[0] : 0;
    var u = opt_bounds ? opt_bounds[1] : range.length;
    
    while (u - l > 1)
    {
      var m = (u + l) >> 1;
      var r = pred(range[m]);
      if (r == -1) {
        l = m;
      }
      else if (r == 1) {
        u = m;
      }
      else {
        return [m, true];
      }
    }
    
    return [m, false];
  };
  
  jj.sh.line_containing_point = function(sh, point)
  {
    var lines = sh.find('td.gutter div.line');
    
    return jj.binary_search(lines, function(line) {
      //alert("line: " + line.offsetTop + ":" + line.offsetHeight + ",   point: " + point);
      var pos = position_of(line);
      if (pos.top < point) {
        if (point < (pos.top + line.offsetHeight)) {
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
  };
  
  

  // selecting line-by-line mode
  jj.sh.activate_line_by_line_selection = function(tso)
  {
    tso.info.mousedown_line = jj.sh.line_containing_point(tso.sh, jj.page.mousedown_y, tso.info.visible_lines_range)[0];
    
    $(window)
      .one('mouseup.highlight', function(e) {
        $(this).unbind('mousemove.highlight');
        tso.info.highlighted_lines = $('div.line.highlighted');
        tso.info.active_mousemove_range = undefined;
        jj.page.mouseup_y = e.pageY;
        jj.page.mousedown_y = null;
      })
      ;
    
    $(window)
      .bind('mousemove.highlight', function(e)
      {
        if (!jj.page.mousedown_y)
          return;
        
        var gutter_lines = tso.sh.find('td.gutter div.line');
        var container_lines = tso.sh.find('div.container div.line');
        
        //
        // get our range of lines. this got complex because I wanted to reduce the amount
        // of operations to an aboslute minimum.
        //
        var from_line_index = -1;
        var to_line_index = -1;
        
        if (e.pageY < jj.page.mousedown_y) {
          from_line_index = jj.sh.line_containing_point(tso.sh, e.pageY, tso.info.visible_lines_range)[0];
          to_line_index = tso.info.mousedown_line + 1;
        }
        else {
          from_line_index = tso.info.mousedown_line;
          to_line_index = jj.sh.line_containing_point(tso.sh, e.pageY, tso.info.visible_lines_range)[0] + 1;
        }
        
        
        //
        // highlight them! :D
        //
        gutter_lines.slice(from_line_index, to_line_index).addClass('highlighted');
        container_lines.slice(from_line_index, to_line_index).addClass('highlighted');
        
        //
        // unhighlight lines outside this range
        //
        if (tso.info.active_mousemove_range)
        {
          if (tso.info.active_mousemove_range[0] < from_line_index) {
            gutter_lines.slice(tso.info.active_mousemove_range[0], from_line_index).removeClass('highlighted');
            container_lines.slice(tso.info.active_mousemove_range[0], from_line_index).removeClass('highlighted');
          }
          
          if (to_line_index < tso.info.active_mousemove_range[1]) {
            gutter_lines.slice(to_line_index, tso.info.active_mousemove_range[1]).removeClass('highlighted');
            container_lines.slice(to_line_index, tso.info.active_mousemove_range[1]).removeClass('highlighted');
          }
        }
        
        
        tso.info.active_mousemove_range = [from_line_index, to_line_index];
        jj.page.mousemove_y = e.pageY;
      })
      ;
    
    
  }
 

  // all shs
  $('document').ready(function()
  {
    $('div.syntaxhighlighter').each(function(){
      jj.sh.all.push({"sh": $(this), "info": {}});
    });
    
    // for each syntax-highlighter
    $.each(jj.sh.all, function()
    {
      tso = this;
      
      // for each line
      tso.sh.find("div.line")
        // clear the selected lines, begin selecting the lines, and remember the mousedown-y
        .bind('mousedown', function(e) {
          jj.page.mousedown_y = e.pageY;
          jj.sh.clear_highlighted_lines(tso);
          jj.sh.activate_line_by_line_selection(tso);
        })
        
        // for only gutter lines, prevent selection
        .filter('td.gutter div.line')
          .bind('mousedown.highlight', function(e) {
             e.preventDefault();
          })
        .end()
        
        // for only code lines, prevent default event if shift is pressed
        .filter('div.container div.line')
          .bind('mousedown.highlight', function(e)
          {
            if (e.shiftKey) {
              e.preventDefault();
              return;
            }
          })
        .end()
        ; 
    });
    
    //
    // when we scroll, we're going to remember which lines are visible on the page.
    // this will help reduce the number of iterations in our binary search when we're
    // mousemoving. an expensive operation we wish to do less of.
    //
    $(window).bind('scroll', function()
    {
      if (jj.page.scroll_timeout) {
        window.clearTimeout(jj.page.scroll_timeout);
        jj.page.scroll_timeout = null;
      }
      
      jj.page.scroll_timeout = window.setTimeout(function() {
        $.each(jj.sh.all, function()
        {
          this.info.visible_lines_range = [
            jj.sh.line_containing_point(this.sh, window.pageYOffset)[0],
            jj.sh.line_containing_point(this.sh, window.pageYOffset + window.innerHeight)[0]
          ];
        })
      }, 200);
    });
  });
  

  
  
  
})(window.jj = window.jj || {}, jQuery);




















