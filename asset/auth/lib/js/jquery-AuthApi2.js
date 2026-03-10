// jquery-AuthApi2.js - r.20171025-1
jQuery.extend({

	AuthApi: function(options){
		var version = "2.2.7",
		
			// internal consts
			konst = {
				'apiUrl': "/auth-p7/app/default/AuthApi4.php",
				'actionLoginPwd': 'a=aLoginPwd',
				'actionLoginSam': 'a=aLoginSam',
				'actionDlgPwcange': 'a=aDlgPwchange',
				'actionReset': 'a=aReset',
				
				'arqChangePasswordUrl': "/home/app/default/pwchangedialog.php",
				
				'changePasswordDialogCode': 'changePasswordDialog',
				'accountChoiceDialogCode':  'accountChoiceDialog',
				
				'warnMsgShowingTime': 5000,
				'successMsgShowingTime': 3000,
				'choiceDialogTimeout': 30000, // OKKIO!! in produzione MAX 30sec (30000ms)
				'globalTimeout': 30000        // OKKIO!!! in produzione 30sec. (30000ms)
			},
			
			// default options
			defaults = {
				'action': 'authenticate', // action to run (default=authenticate): authenticate|samauthenticate|passwordChange|reset
				
				'authTarget': '',         // app-code/project-code (optional)
				'authCid': '',            // customer-code (optional)
				'authLogin': '',          // login-name
				'authPass': '',           // password
				'authPin': '',            // pin
				'authAllowAccountChoice': true, // enable/disable Account-Choice dialog
				'authCompleted': function(data,status,xhr){},  // authentication completed callback
				
				'resetCompleted': function(data,status,xhr){}, // reset completed callback
				
				'onDialogOpen': function(code, dialog){}, // (any) dialog on-open callback
				
				'onError': function( xhr, status, error ){} // on ajaxerror callback
			}			
			;
		
		options=typeof(options)=='object' ? options : {};
		options = $.extend({}, defaults, options);
		

		
		// execute password-change procedure
		var changePasswordExec=function(dialog){
			var $dialog=$(dialog),
				$msgContainer=$dialog.find('.aapi-dlg-unit.warnings'),
				$successContainer=$dialog.find('.aapi-dlg-unit.success'),
				url=konst.arqChangePasswordUrl+'?action=SAVE',
				/*postData={
					'login': $dialog.find('[name="user"]').val(),
					'password': $dialog.find('[name="pold"]').val(),
					'np1': $dialog.find('[name="pnew"]').val(), 
					'np2': $dialog.find('[name="rnew"]').val()
				};*/
				postData=$('#pwdChangeForm').serialize();

			if(jQuery("#j-captcha-aDlgPwchange").length > 0)
			{
				postData += postData.trim() != '' ? '&' : '';
				postData += 'j-captchaCx='+jQuery("#j-captcha-aDlgPwchange").realperson('getHash');
			}
			
			$.post(url, postData, function(response){
				
				if(response=="OK"){
					$successContainer.slideDown();
					$dialog.dialog("option","buttons",[]);
					window.setTimeout(function(){
						$dialog.dialog("close");
					}, konst.successMsgShowingTime);				
					
				}else{
					$msgContainer.html(response).slideDown();
					window.setTimeout(function(){
						$msgContainer.slideUp();
					}, konst.warnMsgShowingTime);				
				}
			});
		}
		
		// start password-change procedure
		var changePasswordStart=function(flavour){
			var url = konst.apiUrl+'?'+konst.actionDlgPwcange; // url for dialog template
			flavour=(typeof flavour=="string")?flavour:"";
			// getting dialog template
			$.post(url, false, function(json, textStatus) {
				var $html=$(json.data.dialog); // dialog template
				// removing elements from template depending on flavor
				switch(flavour){
					case "change":
						$html.find('.aapi-dlg-unit.header').addClass("x-remove");
						$html.find('.aapi-dlg-unit.header.change').removeClass("x-remove");
					break;
					case "expired":
						$html.find('.aapi-dlg-unit.header').addClass("x-remove");
						$html.find('.aapi-dlg-unit.header.expired').removeClass("x-remove");
					break;
					default: 
						$html.find('.aapi-dlg-unit.header').addClass("x-remove");
				}
				$html.find('.x-remove').remove();
				$html.find('.aapi-dlg-unit.warnings').hide();
				$html.find('.aapi-dlg-unit.success').hide();
				

				// showing dialog: PasswordChangeDialog				
				$($html).dialog({
					'buttons': [
						{
							'text': json.data.strings.abort,
							'click': function(){$(this).dialog('close')}
						},
						{
							'text': json.data.strings.ok,
							'click': function(){
								changePasswordExec(this);
							}
						}
					],
					'dialogClass': "aapi-dlg",
					'width': "30em",
					'modal': true,
					'open': function(){
						var $dialog=$(this);
						// hide dialog titlebar
						$dialog.closest('.ui-dialog').find('.ui-dialog-titlebar').hide();
						// fill some input fields
						$dialog.find('[name="user"]').val(options.authLogin);
						$dialog.find('[name="pold"]').val(options.authPass);
						
						window.setTimeout(function(){
							$dialog.find('.aapi-dlg-unit.warnings').slideUp();
						}, konst.warnMsgShowingTime);
						// call onDialogOpen callback if defined
						if(typeof options.onDialogOpen == "function"){
							options.onDialogOpen(konst.changePasswordDialogCode, this)
						}						
					},
					'close': function(){
						$(this).remove();
					},
					'resizable': false
				});
			
			}, "json");	
		}
		
		// evaluate requested-action following the authentication process
		var evalActionRequested=function(actionRequested){
			//console.log("inPLUGIN: evalActionRequested: ", actionRequested);
			switch(actionRequested){
				case konst.changePasswordDialogCode:
					changePasswordStart('expired')
				break;
			}
		}
		
		// authentication callback 
		var onAuthCompleted=function(json,status,xhr){
			// are there a requested-action?
			if(json.data && json.data.auth && json.data.auth.actionRequested){
				// if so... evaluate it
				evalActionRequested(json.data.auth.actionRequested);
			}
			
			if(typeof options.authCompleted == "function"){
			
				//console.log("inPLUGIN: onAuthCompleted: ", json);
				// check conditions for AccountChoiceDialog
				var runChoicheDialog=options.authAllowAccountChoice
					&& json.data != undefined
					&& json.data.auth.verified
					&& !json.data.auth.loggedIn
					;
				
				if(runChoicheDialog){
					//console.log("inPLUGIN: onAuthCompleted: running AccountChoiceDialog ");
					var $html=false;
					if(json.data.pfolio.filteredDialogHtml){
						$html=$(json.data.pfolio.filteredDialogHtml);
					}else if(json.data.pfolio.fullDialogHtml){
						$html=$(json.data.pfolio.fullDialogHtml);
					}
					if($html){
						
					}
					
					// showing dialog: AccountChoiceDialog 				
					$($html).dialog({
						'buttons': [],
						'dialogClass': "aapi-dlg",
						'width': "30em",
						'modal': true,
						'open': function(){
							var $dialog=$(this);
							// hide dialog titlebar
							$dialog.closest('.ui-dialog').find('.ui-dialog-titlebar').hide();
							
							// ensure closing dialog after timeout
							window.setTimeout(function(){
								// but only if not already closed
								if ($.contains(document, $dialog[0])){
									$.post(konst.apiUrl+'?'+konst.actionReset);
									$dialog.dialog("close");
								}
							}, konst.choiceDialogTimeout);
							
							// call onDialogOpen callback if defined
							if(typeof options.onDialogOpen == "function"){
								options.onDialogOpen(konst.accountChoiceDialogCode, this)
							}
							
							$dialog.find('.item[x-account]')
							.unbind()
							.click(function(){
								// AccountChoiceDialog item clicked
								var xaccount=$(this).attr('x-account');
								var ajaxOptions = {
									'url':  konst.apiUrl+'?'+konst.actionLoginSam,
									'data': {'uid': xaccount},
									'async': true,
									'type': "POST",
									'success': onAuthCompleted,
									'error': onError
								};
								$.ajax(ajaxOptions);
								$dialog.dialog("close");
								
							});
							
						},
						'close': function(){
							$(this).remove();
						},
						'resizable': false
					});
					
				}else{
					//console.log("inPLUGIN: onAuthCompleted: skipped AccountChoiceDialog ");
				}
			
				if(typeof options.authCompleted == "function"){
					options.authCompleted(json,status,xhr);
				}
			}
		}
		
		// authentication callback 
		var onResetCompleted=function(json,status,xhr){
			//console.log("inPLUGIN: onResetCompleted: ", json, status, xhr);
			if(typeof options.resetCompleted == "function"){
				options.resetCompleted(json,status,xhr);
			}
			
		}
		
		// on Error callback 
		var onError=function(xhr,status,error){
			//console.log("inPLUGIN: onError: ", xhr,status,error);
			if(typeof options.onError == "function"){
				options.onError(xhr,status,error);
			}
		}
		
		// running of specific actions
		var postData={},ajaxOptions={};
		switch(options.action){
		
			case 'authenticate':
				postData = {
					'cid': options.authCid,
					'uid': options.authLogin,
					'pwd': options.authPass,
					'pin': options.authPin,
					'target': options.authTarget
				};
				ajaxOptions = {
					'url':  konst.apiUrl+'?'+konst.actionLoginPwd,
					'data': postData,
					'async': true,
					'type': "POST",
					'success': onAuthCompleted,
					'error': onError,
					'timeout': konst.globalTimeout
				};
				$.ajax(ajaxOptions);
			break;
			
			case 'samauthenticate':
				postData = {
					'uid': options.authLogin,
				};
				ajaxOptions = {
					'url':  konst.apiUrl+'?'+konst.actionLoginSam,
					'data': postData,
					'async': true,
					'type': "POST",
					'success': onAuthCompleted,
					'error': onError,
					'timeout': konst.globalTimeout
				};
				$.ajax(ajaxOptions);
			break;
			
			case 'passwordChange':
				changePasswordStart('change');
			break;
			
			case 'reset':
			default:
				ajaxOptions = {
					'url':  konst.apiUrl+'?'+konst.actionReset,
					'async': true,
					'type': "POST",
					'success': onResetCompleted,
					'error': onError,
					'timeout': konst.globalTimeout
				};
				$.ajax(ajaxOptions);
			break;
			
		}
		
	}
})
	
