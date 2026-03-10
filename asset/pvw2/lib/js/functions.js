$(document).on('show.bs.modal', '.modal', function (event) {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    $('.modal:visible').modal('handleUpdate');
    setTimeout(function() {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});

function inviaDatiASync(pagina, dato, onSuccess)
{
    $.ajax({
        type: "POST",
        url: pagina,
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

function inviaFileASync(pagina, dato, onSuccess)
{
    $.ajax({
        type: "POST",
        url: pagina,
        data: dato,
        async: true,
        processData: false,
        contentType: false,
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

function inviaDati(pagina, dato)
{
    var risultato="";
    $.ajax({
        type: "POST",
        url: pagina,
        data: dato,
        async: false,
        success: function(data)
        {
            risultato=data;
        }
    });
    return risultato;
}

function ajaxRequest
(
    pagina,
    dato,
    onSuccess = false,
    onError = false,
    onComplete = false,
    processData = true,
    contentType = 'application/x-www-form-urlencoded; charset=UTF-8',
    dataType = 'json',
    async = true,
    type = 'POST'
)
{
    $.ajax({
        type: type,
        url: pagina,
        data: dato,
        async: async,
        dataType: dataType,
        processData: processData,
        contentType: contentType,
        success: function(data)
        {
            if (typeof(onSuccess) == 'function')
            {
                onSuccess(data.result);
            }
        },
        error: function(err)
        {
            if (typeof(onError) == 'function')
            {
                onError(err);
            }
            else
            {
                if (err.responseJSON.message != 'undefined')
                {
                    errorModal(err.responseJSON.message);
                }
                else
                {
                    errorModal('Errore del server');
                }
            }
        },
        complete: function()
        {
            if (typeof(onComplete) == 'function')
            {
                onComplete();
            }
        }
    });
    return true;
}

function ajaxSelectpickerInit(selector, ajaxUrl, ajaxAct, extraParams = {})
{
    let data = {
        cerca: '{{{q}}}',
        act: ajaxAct
    };
    data = {...data, ...extraParams};

    $(selector).selectpicker({
        'deselectAllText'   :   'Deseleziona tutto',
        'selectAllText'     :   'Seleziona tutto',
        'noneSelectedText'  :   'Nessun elemento selezionato',
        'noneResultsText'   :   'Nessun risultato corrispondente a {0}',
        'liveSearch'        :   true
    }).ajaxSelectPicker({
        ajax: {
            url: ajaxUrl,
            data: data
        },
        minLength: 3,
        requestDelay: 1000,
        locale: {
            emptyTitle: 'Nessun elemento selezionato',
            statusInitialized: 'Digitare qualche carattere per iniziare la ricerca...',
            searchPlaceholder: 'Cerca',
            statusNoResults: 'Nessun risultato',
            errorText: 'Nessun risultato',
            statusSearching: 'Ricerca in corso...',
            statusTooShort: 'Inserire almeno 3 caratteri'
        },
        preprocessData: function(data){
            data = data.result;
            var i, l = data.length, array = [];
            if (l) {
                for (i = 0; i < l; i++) {
                    array.push($.extend(true, data[i], {
                        text : data[i].text,
                        value: data[i].value,
                        data : {
                            subtext: data[i].subtext
                        }
                    }));
                }
            }
            return array;
        },
        preserveSelected: false
    });
}

function selectpickerInit()
{
    $('.selectpicker').selectpicker({
        'deselectAllText'   :   'Deseleziona tutto',
        'selectAllText'     :   'Seleziona tutto',
        'noneSelectedText'  :   'Nessun elemento selezionato',
        'noneResultsText'   :   'Nessun risultato corrispondente a {0}',
        'liveSearch'        :   true
    });
    $('.selectpicker').selectpicker('refresh');
}

function tokenizeInit(selector)
{
    var tomselect = new TomSelect(selector, {
        plugins: ['remove_button'],
        create: true,
        selectOnTab: true,
        render: {
            option: function(data, escape){
                return '<div>' + escape(data.text) + '</div>';
            },
            item: function(data, escape){
                return '<div>' + escape(data.text) + '</div>';
            },
            option_create: function(data, escape){
                return '<div class="create">Aggiungi <strong>' + escape(data.input) + '</strong>&hellip;</div>';
            },
            no_results: function(data,escape){
                return '<div class="no-results">Nessun risultato per "'+escape(data.input)+'"</div>';
            },
            not_loading: function(data,escape){
                // no default content
            },
            optgroup: function(data){
                let optgroup = document.createElement('div');
                optgroup.className = 'optgroup';
                optgroup.appendChild(data.options);
                return optgroup;
            },
            optgroup_header: function(data, escape){
                return '<div class="optgroup-header">' + escape(data.label) + '</div>';
            },
            loading: function(data,escape){
                return '<div class="spinner"></div>';
            },
            dropdown: function(){
                return '<div></div>';
            }
        },
        onItemAdd: function(value, $item){
            $('#tags-ts-control').val('');
            $('#tags-ts-dropdown').html('');
        }
    });
    return tomselect;
}

function autoCompleteInit(selector, url, act, tipo = '', minLength = 0)
{
    $(selector).autoComplete({
        minLength: minLength,
        resolver: 'custom',
        events: {
            search: function (qry, callback) {
                $.ajax(
                    url,
                    {
                        data: {
                            'act'   : act,
                            'tipo'  : tipo,
                            'q'     : qry
                        }
                    }
                ).done(function (res) {
                    callback(res.result)
                });
            }
        }
    });
}