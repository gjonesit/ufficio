$('document').ready(function(){
	//con le nuove versioni di jquery ui 
	//non si vedono i bottoni delle dialog se è presente bootstrap
	//richiamo button noConflict per fixare
	var bootstrapButton = $.fn.button.noConflict() // return $.fn.button to previously assigned value
	$.fn.bootstrapBtn = bootstrapButton            // give $().bootstrapBtn the Bootstrap functionality
	
	$.fn.bsModal = $.fn.modal.noConflict();
	
	
	
	/* 
	 * Sostituisco i bottoni di query UI con quelli di bootstrap
	 * 
	 */
	//$.fn.button = $.fn.bootstrapBtn;  
	
	/*
	 * Estendo la dialog jquery ui per creare il bottone di chiusura,
	 * visto che eliminando i button ui e sostituendoli con bootstrap questi non vengono più creati 
	 */
	/*
	$.widget( "ui.dialog", $.ui.dialog, {
		open: function() {
			$(this.uiDialogTitlebarClose)
				.addClass("ui-button ui-corner-all ui-widget ui-button-icon-only")
				.attr('title', 'Close')
				//.html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span>");
				.html("<span class='ui-button-icon ui-icon ui-icon-closethick'></span><span class='ui-button-icon-space'></span>Close");
			// Invoke the parent widget's open().
			return this._super();
		}
	});
	*/
	
	
	
	$('button[data-loading-text]').click(function () {
		try{
			$(this).button('loading');
		}
		catch(exIgnored){
			$(this).bootstrapBtn('loading');
		}
	   
	});
	
});

$.validator.messages.required = 'Questo campo &egrave; obbligatorio';
$.validator.setDefaults({
	highlight: function(element) {		
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
            error.insertAfter(element);
        }
    }
});