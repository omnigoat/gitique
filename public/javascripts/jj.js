


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
  
  
  
  jj.sh.selected_range = function(tso, lbound, ubound)
  {
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
    
    return {from: from_line_index, to: to_line_index};
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
        tso.info.hovering_line = undefined;
        jj.page.mouseup_y = e.pageY;
        jj.page.mousedown_y = null;
      })
      ;
    
    $(window)
      .bind('mousemove.highlight', function(e)
      {
        if (!jj.page.mousedown_y)
          return;
        
        // don't do squat if we're just in our own line
        var mouseline = -1;
        if ( tso.info.hovering_line ) {
          mouseline = jj.sh.line_containing_point(tso.sh, e.pageY, tso.info.visible_lines_range)[0];
          if (mouseline  == tso.info.hovering_line ) {
            return;
          }
        }
        
         
        //
        // get our range of lines. this got complex because I wanted to reduce the amount
        // of operations to an aboslute minimum.
        //
        var from_line_index = -1;
        var to_line_index = -1;
        
        if (e.pageY < jj.page.mousedown_y) {
          from_line_index = mouseline;
          to_line_index = tso.info.mousedown_line + 1;
        }
        else {
          from_line_index = tso.info.mousedown_line;
          to_line_index = mouseline + 1;
        }
        
        
        
        //
        // highlight them! :D
        //
        var gutter_lines = tso.gutter.children();
        var container_lines = tso.container.children();
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
        tso.info.hovering_line = jj.sh.line_containing_point(tso.sh, e.pageY, tso.info.visible_lines_range)[0];
        jj.page.mousemove_y = e.pageY;
      })
      ;
  };
 

  // all shs
  $('document').ready(function()
  {
    var kf = jj.sh.selected_highlighters ? $(jj.sh.selected_highlighters) : $('div.syntaxhighlighter');
    
    kf.each(function(){
      jj.sh.all.push(
        {
          "sh": $(this),
          "gutter": $(this).find('td.gutter'),
          "container": $(this).find('div.container'),
          "info": {}
        }
      );
    });
    
    // for each syntax-highlighter
    $.each(jj.sh.all, function()
    {
      tso = this;
      
      // wrap the container in a wrapper so we can scroll horizontally
      tso.container.wrapAll('<div class="container-wrapper">');
      
      tso.gutter
        .bind('mousedown.highlight', function(event)
        {
          var $target = $(event.target);
          if ($target.is('div.line'))
          {
            $target.addClass('highlighted');

            $(tso.container.children()[$target.index()])
              .addClass('highlighted')
              ;
            
            jj.page.mousedown_y = event.pageY;
            jj.sh.clear_highlighted_lines(tso);
            jj.sh.activate_line_by_line_selection(tso);
            event.preventDefault();
            return false;
          }
        })
        ;
      
      tso.container.bind('mousedown.highlight', function(e) {
        if (e.shiftKey) {
          e.preventDefault();
          return false;
        }
      });
      
      jj.sh.async_load_file(tso, window.filename, 0);
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
          jj.page.scroll_timeout = null;
        })
      }, 200);
    });
    
    
    jj.mainpre = $('#viewer #mainpre');
    
    var $vsb = $('#vsb');
    
    setInterval(function() {
      var current_top = parseInt(jj.mainpre.css('top'));
      var offset = ($vsb.data('scroll.target') - current_top) * 0.6;
      jj.mainpre.css('top', current_top + offset);
    }, 16);
    
    
    $vsb.slider(
		  {
		    orientation: "vertical",
		    
		    value: 0,
		    min: 0,
		    max: 0,
		    
		    slide: function(event, ui) {
		      //$(this).data('sv', ui.value);
		      var v = parseInt($vsb.slider('option', 'max')) - ui.value;
		      $(this).data('scroll.target', -$('div.container div.line:eq(' + v + ')').position().top);
		      console.log(v + ":" + $(this).data('scroll.target'));
        }
      }
		);
		
		$('#hsb').slider({
		  slide: function(event, ui) {
		    var c = $('#mainpre div.container');
		    var topValue = -(ui.value) * (parseInt(c.css('width'))/150);
		    c.css('left', topValue);
		  }
		});
  });
  
  
  //=====================================================================
  //
  // loading asynchronously
  //
  //=====================================================================
  jj.sh.async_load_file_impl = function(tso, $buffer, filename, line)
  {
    if ( jQuery.type(line) != "number" ) {
      alert('problem!');
    }
    
    $.ajax({
      url: 'ajax/load',
      data: {"repo_id": repo_id, "branch": branch, "filename": filename, from: line, to: line + 1200},
      
      success: function(msg)
      {
        var $parent = $buffer.parent();
        
        $buffer
          .append(msg)
          .detach()
          ;
        
        $buffer.find('td.gutter div.line')
          .each(function(index) {
            var $this = $(this);
            $this.text((line+index));
            $this.removeClass('index'+index);
            $this.addClass('index'+(line+index));
          })
          .appendTo(tso.sh.find('td.gutter'))
          ;
        
        $buffer.find('div.container .line')
          .appendTo(tso.sh.find('div.container'))
          ;

        $buffer
          .children()
            .remove()
          ;
        
        $parent.append($buffer);
        
        // update scrollbar
        var cvsbv = $('#vsb').slider('option', 'value');
        var cvsbm = $('#vsb').slider('option', 'max');
        var k = cvsbm - cvsbv;
        var nl = tso.container.children().length - 1;
        $('#vsb').slider('option', 'max', nl);
        $('#vsb').slider('option', 'value', nl - k);
        console.log($('#vsb').slider('option', 'value'));
        
        jj.mainpre_height = parseInt(jj.mainpre.css('height'));
        
        if ((line + 1200) < window.total_lines) {
          jj.sh.async_load_file_impl(tso, $buffer, filename, line + 1200);
        }
      }
    });
  }
  
  jj.sh.async_load_file = function(tso, filename, line2)
  {
    tso.sh.find('.line').remove();
    
    jj.sh.async_load_file_impl(tso, $('#shower'), filename, 0);
    
  };
  

  
  
})(window.jj = window.jj || {}, jQuery);




















