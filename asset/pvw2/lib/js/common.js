function checkSeoUrl()
{
    /*if (window.location.href.indexOf("spaggiari.eu") > -1 || window.location.href.indexOf("web2.local") > -1) 
    {*/
        return '/pvw2/app/default/';
    /*}
    else
    {
        return '/app/default/';
    }*/
}

function checkSeoUrl2()
{
    if (window.location.href.indexOf("spaggiari.eu") > -1 || window.location.href.indexOf("web2.local") > -1)
    {
        return false;
    }
    else
    {
        return true;
    }
}

function errorModal(msg)
{
    $('#error-modal .error-modal-text').html(msg);
    $('#error-modal').modal({backdrop: 'static', keyboard: false}, 'show');
}

function okModal(msg)
{
    $('#ok-modal .ok-modal-text').html(msg);
    $('#ok-modal').modal({backdrop: 'static', keyboard: false}, 'show');
}

function infoModal(msg)
{
    $('#info-modal .info-modal-text').html(msg);
    $('#info-modal').modal({backdrop: 'static', keyboard: false}, 'show');
}

function loadingModal(act='show')
{
    if (act=='hide')
    {
        $('#loading-modal').modal(act);
    }
    else
    {
        $('#loading-modal').modal({backdrop: 'static', keyboard: false}, act);
    }
}

function contentModal(title, text)
{
    $('#content-modal .modal-title').text(title);
    $('#content-modal .modal-body').html(text);
    $('#content-modal').modal('show', {backdrop: 'static', keyboard: false});
}

function confirmModal(msg, callback)
{
    if ($('#confirm-modal').length > 0)
    {
        $('#confirm-modal .confirm-modal-text').html(msg);
        $('#confirm-modal').modal({backdrop: 'static', keyboard: false}, 'show');

        $('#confirm-modal .btn-primary').unbind().click(function(){
            callback(true);
            $('#confirm-modal').modal('hide');
        });

        $('#confirm-modal .btn-secondary').unbind().click(function(){
            callback(false);
            $('#confirm-modal').modal('hide');
        });
    }
    else
    {
        if (confirm(msg) == true)
        {
            callback(true);
        }
        else
        {
            callback(false);
        }
    }
}

function controllaObb()
{
    var ok=true;
    $('select.obb, input.obb, textarea.obb').each(function()
    {
        var valore=$(this).val();
        valore=$.trim(valore);
        if ($(this).is(':checkbox'))
        {
            if ($(this).is(':checked'))
            {
                valore = 'on';
            }
            else
            {
                valore = '';
            }
        }
        if (valore=='' || valore==null)
        {
            ok=false;
            $(this).addClass('forms_obb_input');
        }
    });
    return ok;
}

function controllaObb2(id_popup)
{
    var ok=true;
    $('#'+id_popup+' select.obb, #'+id_popup+' input.obb, #'+id_popup+' textarea.obb').each(function()
    {
        if ($(this).attr('type') == 'checkbox')
        {
            if (!$(this).is(':checked'))
            {
                ok=false;
                $(this).parent().find('label').addClass('forms_obb_input');
            }
        }
        else
        {
            var valore=$(this).val();
            valore=$.trim(valore);
            if (valore=='' || valore==null)
            {
                ok=false;
                $(this).addClass('forms_obb_input');
            }
        }
    });
    return ok;
}

function doLogin()
{
    $.AuthApi({
        action: 'authenticate',
        authLogin: $('#accedi-mail').val(),
        authPass: $('#accedi-pwd').val(),
        authAllowAccountChoice: false,
        authCompleted: function(json){
            $('.accedi-error').hide();
            if (json.hasOwnProperty('data'))
            {
                if (!json.data.auth.loggedIn){
                    if (json.data.auth.errors!=''){
                        $('.accedi-error').text(json.data.auth.errors).removeClass('d-none').show('slow');
                    }
                    else{
                        if (json.data.auth.verified){
                            if (json.data.pfolio !== undefined && json.data.pfolio.fullList !== undefined && json.data.pfolio.fullList.length>1){
                                var html='';
                                $.each(json.data.pfolio.fullList, function(i, item) {
                                    html+='<div class="userselect-item mb-4" xid="'+item.account_string+'"><h5>'+item.nome+'</h5>';
                                    html+='<p>'+item.scuola_descrizione+' '+item.scuola_intitolazione+' - '+item.account_string+'</p>';
                                    html+='</div>';
                                });
                                $('#UserSelectModalForm .modal-body').html(html);
                                $('#UserSelectModalForm').modal('show');
                                bindLoginChoose();
                            }
                        }
                    }
                }
                else
                {
                    checkSedeCodice();
                }
            }
            else
            {
                location.reload();
            }
        }
    });
}

function bindLoginChoose()
{
    $('.userselect-item').click(function(e){
        var xaccount = $(this).attr('xid');
        inviaDatiASync('/auth/app/default/AuthApi4.php', {'a' : 'aLoginSam', 'uid' : xaccount}, function(jsonr){
            if (jsonr.hasOwnProperty('data'))
            {
                if (jsonr.data.auth.loggedIn)
                {
                    checkSedeCodice();
                }
                else
                {
                    alert('Errore autenticazione, si prega di riprovare!');
                }
            }
            else
            {
                location.reload();
            }
        });
    });
}

function checkSedeCodice()
{
    ajaxRequest(checkSeoUrl()+'auth.php', {'act' : 'checkUser'}, function(risultato){
        location.reload();
    }, function(err){
        doLogout();
    });
}

function doLogout()
{
    inviaDatiASync("/auth/app/default/AuthApi4.php", {'a' : 'aReset'}, function(){
        location.reload();
    });
}

function doReset()
{
    $('#ForgotPwdModalForm').modal('show');
    bindPwdReminder();
}

function bindPwdReminder()
{
    $('#forgot-mail').keypress(function(e){
        if(e.keyCode == 13)
        {
            e.preventDefault();
        }
    });
    
    $('.btn-reminder').click(function(){
        $('.reset-error').hide();
        $('.reset-success').hide();
        if ($('#forgot-mail').val()!='')
        {
            inviaDatiASync('/sso/app/default/sam.php', $('#pvw-reminder-form').serialize(), function(result){
                if (result.status)
                {
                    $('.reset-success').removeClass('d-none').show('slow');
                }
                else
                {
                    $('.reset-error').removeClass('d-none').show('slow').html(result.err);
                }
            });
        }
        else
        {
            $('.reset-error').removeClass('d-none').show('slow').html('Inserire un indirizzo e-mail!');
        }
    });
}

function getRssFeed(rssurl, onSuccess)
{
    var dato={
        'act'       :   'getRssFeed',
        'rssurl'    :   encodeURI(rssurl)
    };
    
    $.ajax({
        type: "POST",
        url: checkSeoUrl()+'tools.php',
        data: dato,
        async: true,
        success: function(data)
        {
            if(typeof(onSuccess)=='function')
            {
                onSuccess(data);
            }
        }
    });
    return true;
}

function resizeIframe(obj)
{
    obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
}

function inIframe()
{
    try
    {
        return window.self !== window.top;
    }
    catch (e)
    {
        return true;
    }
}

function avviaCaptcha(msg, element = '.captcha')
{
    $(element).realperson({
        length: 5,
        regenerate: '<i class="fas fa-sync-alt"></i> '+msg,
        chars: $.realperson.alphanumeric,
        hashName: '{n}Hash',
    });
}

function fallbackCopyTextToClipboard(text)
{
    var textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try
    {
        var successful = document.execCommand('copy');
        if (successful)
        {
            alert('Copiato negli appunti!');
        }
        else
        {
            alert('Impossibile copiare negli appunti ', text);
        }
    }
    catch (err)
    {
        alert('Impossibile copiare negli appunti ', text);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text)
{
    if (!navigator.clipboard)
    {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function(){
        alert('Copiato negli appunti!');
    }, function(err) {
        alert('Impossibile copiare negli appunti ', text);
    });
}