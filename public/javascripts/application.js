// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults




// allow jQuery to play nice with Rails via ajax
jQuery.ajaxSetup({'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")} })
