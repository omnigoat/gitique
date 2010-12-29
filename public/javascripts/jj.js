


;(function(jj, $, undefined) {
  
  jj.page = {};
  
  //=====================================================================
  // calculate width of system scrollbars
  //=====================================================================
  function getScrollerWidth() {
    var scr = null;
    var inn = null;
    var wNoScroll = 0;
    var wScroll = 0;

    // Outer scrolling div
    scr = document.createElement('div');
    scr.style.position = 'absolute';
    scr.style.top = '-1000px';
    scr.style.left = '-1000px';
    scr.style.width = '100px';
    scr.style.height = '50px';
    // Start with no scrollbar
    scr.style.overflow = 'hidden';

    // Inner content div
    inn = document.createElement('div');
    inn.style.width = '100%';
    inn.style.height = '200px';

    // Put the inner div in the scrolling div
    scr.appendChild(inn);
    // Append the scrolling div to the doc
    document.body.appendChild(scr);

    // Width of the inner div sans scrollbar
    wNoScroll = inn.offsetWidth;
    // Add the scrollbar
    scr.style.overflow = 'auto';
    // Width of the inner div width scrollbar
    wScroll = inn.offsetWidth;

    // Remove the scrolling div from the doc
    document.body.removeChild(document.body.lastChild);

    // Pixel width of the scroller
    return (wNoScroll - wScroll);
  }
  
  
  jj.page.scrollbar_width = getScrollerWidth();
  console.log(jj.page.scrollbar_width);
  
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
  
  
  
  
  //=====================================================================
  //
  // syntax-highlighting
  //
  //=====================================================================
  jj.sh = {
    detail: {
      all: [],
    
      //=====================================================================
      // the skeleton esh is simply an esh without any information. we will
      // create instances of this by extending an object with these functions
      //=====================================================================
      skeleton_esh:
      {
        //=====================================================================
        // loading asynchronously
        //   note: "this" refers to an esh
        //=====================================================================
        load_file: function(filename, line)
        {
          if (line === undefined) {
            line = 0;
          }
          
          var esh = this;

          $.ajax({
            url: 'ajax/load',
            data: {"repo_id": repo_id, "branch": branch, "filename": filename, from: line, to: line + 1200},
            
            success: function(msg)
            {
              var $buffer = esh.buffer;
              
              $buffer
                .append(msg)
                .detach()
                ;
              
              $buffer.find('td.gutter div.line')
                .each(function(index) {
                  var $this = $(this);
                  $this.text(line+index+1);
                  $this.removeClass('index'+index);
                  $this.addClass('index'+(line+index));
                })
                .appendTo(esh.gutter)
                ;
              
              $buffer.find('div.container .line')
                .appendTo(esh.container)
                ;

              $buffer
                .children()
                .remove()
                ;
              
              //esh.sh.append(this.buffer);
              
              // update scrollbar
              var cvsbv = esh.vsb.slider('option', 'value');
              var cvsbm = esh.vsb.slider('option', 'max');
              var k = cvsbm - cvsbv;
              var nl = esh.container.children().length - 1;
              esh.vsb.slider('option', 'max', nl);
              esh.vsb.slider('option', 'value', nl - k);
              console.log($('#vsb').slider('option', 'value'));
              

              if ((line + 1200) < window.total_lines) {
                this.load_file(filename, line + 1200);
              }
              
            }
          });
        }
      }
    },
    
    // clear highlighted lines
    clear_highlighted_lines: function(esh)
    {
      if (esh.info.highlighted_lines) {
        esh.info.highlighted_lines.removeClass('highlighted');
      }
    }
  };

  
  

  
  jj.sh.line_containing_point = function(sh, point)
  {
    var lines = sh.find('td.gutter div.line');
    
    return jj.binary_search(lines, function(line) {
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
  /*
  $('document').ready(function()
  {
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
  });
  */
  
  
  
  //=====================================================================
  //
  // initialise a syntax-highlighter
  //
  //=====================================================================
  jj.sh.initialise = function(sh, options)
  {
    // handles 
    if (typeof sh === "string") {
      $(sh).each(function(i, x){
        jj.sh.initialise(x);
      });
      return this;
    }
    
    // disambiguate my own code - sh is a jquery object, let's make sure
    // we remember by aliasing it with $sh
    var $sh = $(sh);
    var $parent = $sh.parent();
    
    // 1) remove the 'pre' from the document, and replace it with a div of the same id
    $sh.detach();
    var sh_id = $sh.attr('id');
    $parent.append('<div id="' + sh_id + '" class="extended-syntax-highligther"></div>');

    // 2) add the 'workspace' and scrollbars, and add the original 'pre' to the workspace
    $parent.find('#' + sh_id).append('<div class="workspace"></div><div class="vsb"></div><div class="hsb"><div class="buffer" style="display: hidden"></div>');
    $parent.find('div.workspace').append($sh);
    
    // 3) highlight the pre, and wrap it so it sits in the workspace
    SyntaxHighlighter.highlight({}, $sh[0]);
    $parent.find('div.workspace').find('div.syntaxhighlighter').unwrap();
    
    
    // set up our "esh" - Extended SyntaxHighlighter.
    var esh = $.extend(
      jj.sh.detail.skeleton_esh,
      
      {
        "parent": $parent,
          "self": $parent.find('div#' + sh_id),
            "workspace": $parent.find('div.workspace'),
              "sh": $parent.find('div.syntaxhighlighter'),
                "gutter": $parent.find('td.gutter'),
                "container": $parent.find('div.container'),
            "vsb": $parent.find('div.vsb'),
            "hsb": $parent.find('div.hsb'),
            "buffer": $parent.find('div.buffer'),
        "info": {}
      }
    );
    console.log(esh.self.position().top);
    
    esh.self.css({
      width: $parent.outerWidth() - esh.self.position().left,
      height: $parent.outerHeight() - esh.self.position().top
    });
    
    esh.workspace.css({
      height: esh.self.outerHeight() - esh.workspace.position().top - jj.page.scrollbar_width,
      width: esh.self.outerWidth() - esh.workspace.position().left - jj.page.scrollbar_width,
      overflow: 'hidden'
    });
    
    jj.sh.detail.all.push(esh);
    
    // wrap the container in a wrapper so we can scroll horizontally
    esh.container.wrapAll('<div class="container-wrapper">');
    
    esh.gutter.children().remove();
    esh.container.children().remove();
    
    
    //---------------------------------------------------------------------
    // scrolling
    //---------------------------------------------------------------------
    setInterval(function() {
      var k = esh.vsb.data('scroll.target');
      if (k !== undefined) {
        var current_top = parseInt(esh.sh.css('top'));
        var offset = (k - current_top) * 0.6;
        esh.sh.css('top', current_top + offset);
      }
    }, 16);
    
    esh.vsb.slider(
		  {
		    orientation: "vertical",
		    
		    value: 1,
		    min: 0,
		    max: 1,
		    
		    slide: function(event, ui) {
		      $(this).data(
		        'scroll.target',
		        -esh.container.find('div.line:eq(' + (parseInt(esh.vsb.slider('option', 'max')) - ui.value) + ')').position().top
		      );
        }
      }
		);
		
		esh.hsb.slider({
		  slide: function(event, ui) {
		    var c = esh.container;
		    var topValue = -(ui.value) * (parseInt(c.css('width'))/150);
		    c.css('left', topValue);
		  }
		});
		
		esh.hsb.css({
		  position: 'absolute',
		  top: esh.workspace.position().top + esh.workspace.outerHeight()
		});
		
    esh.hsb.css('width', esh.workspace.width() - jj.page.scrollbar_width);
    esh.hsb.css('left', '10px');
    esh.hsb.css('height', jj.page.scrollbar_width - (esh.hsb.outerHeight(true) - esh.hsb.height()));
    esh.hsb.find('a.ui-slider-handle').css('height', esh.hsb.height());
    esh.hsb.find('a.ui-slider-handle').css('top', '-1px');
    
    
    esh.vsb.css('position', 'absolute');
    esh.vsb.css('top', '0px');
    esh.vsb.css('left', esh.workspace.width());
    esh.vsb.css('height', esh.workspace.height());
    esh.vsb.css('width', jj.page.scrollbar_width - (esh.vsb.outerWidth(true) - esh.vsb.width()));
    esh.vsb.find('a.ui-slider-handle').css('width', esh.vsb.width());
    esh.vsb.find('a.ui-slider-handle').css('left', '-1px');
    
    //esh.gutter.css('width', '100%');
    //esh.sh.find('table').css('left', '0px');
    //esh.sh.find('td.code').css('width', '100%');
    // bind mousewheel event to syntax-highlighter
    esh.parent.mousewheel(function(event, delta) {
      console.log ("bloah");
      var $vsb = esh.vsb;
      $vsb.slider("value", $vsb.slider("value") + delta * 3);
      //console.log($vsb.slider('option', 'slide'));
      $vsb.slider('option', 'slide').call($vsb, event, {handle: $vsb.slider('widget'), value: $vsb.slider('value')});
      event.preventDefault();
    });
    
    // mousedown action for highlighting lines
    esh.gutter
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
          jj.sh.clear_highlighted_lines(esh);
          jj.sh.activate_line_by_line_selection(esh);
          event.preventDefault();
          return false;
        }
      })
      ;
    
    // um... can't remember
    esh.container.bind('mousedown.highlight', function(e) {
      if (e.shiftKey) {
        e.preventDefault();
        return false;
      }
    });
    
    return esh;
  }
  
  
  
  
  
  
  jj.sh.async_load_file = function(tso, filename, line2)
  {
    tso.sh.find('.line').remove();
    
    jj.sh.async_load_file_impl(tso, $('#shower'), filename, 0);
    
  };
  

  
  
})(window.jj = window.jj || {}, jQuery);




















