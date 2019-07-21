function initAlert(msg){
	$('#alert div.alert__msg').html(msg);
	$('#alert:hidden').show();

	$('.alert__close').on('click', function(){
		$('#alert:visible').hide();
	});


	$(document).on('mouseup', function (e) {
    var container = $("#alert:visible");
    if (!container.is(e.target) && container.has(e.target).length === 0 ||
    	$('#map__widget').is(e.target)
    	) {
        container.hide();
        console.log(1);
    } else {
    	console.log(2);
    }
	});
}