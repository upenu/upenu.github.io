(function($) {
  // Family Tree
  $.getJSON("famtree.json", function(data) {
	var options = { 'data': data }
	$('#chartContainer').orgchart(options);
  });
})(jQuery);
