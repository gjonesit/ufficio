function startFullCalendar(url, options)
{
    options = options || {};
    if (options.headertoolbar == undefined)
    {
        options.headertoolbar = {
            left: 'prev,next',
            center: 'title',
            right: 'today dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        };
    }
    if (options.defaultView == undefined)
    {
        options.defaultView = $(window).width() < 768 ? "listWeek" : "dayGridMonth";
    }
    if (options.homepage == undefined)
    {
        options.homepage = false;
    }
    
    var calendarEl = document.getElementById('fullcalendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        locale: $('html').attr('lang'),
        height: "auto",
        firstDay: 1,
        allDayText: GlobalTranslationArray.tuttoilgiorno,
        noEventsContent: GlobalTranslationArray.noeventi,
        initialView: options.defaultView,
        views: {
            month: {
                dayHeaderFormat: {
                    weekday: 'short'
                }
            }
        },
        headerToolbar: options.headertoolbar,
        buttonText: 
        {
            today:      GlobalTranslationArray.oggi,
            month:      GlobalTranslationArray.mese,
            week:       GlobalTranslationArray.settimana,
            day:        GlobalTranslationArray.giorno,
            list:       GlobalTranslationArray.lista,
        },
        events: function(info, successCallback)
        {
            var data = {
                act             : 'fullcalendar-feed',
                cerca           : $('#sp-cerca').length>0 ? $('#sp-cerca').val() : '',
                filter_cal      : getChecked('sp-filter-cal', options.homepage),
                filter_spazi    : getChecked('sp-filter-spazi', options.homepage),
                filter_persone  : getChecked('sp-filter-persone', options.homepage),
                filter_evento   : getChecked('sp-filter-evento', options.homepage),
                start           : info.startStr,
                end             : info.endStr,
                sede_codice     : sede_codice
            };
            ajaxRequest(url, data, function(risultato){
                successCallback(risultato);
            });
        },
        eventClick: function(info)
        {
            info.jsEvent.preventDefault();
            $('#sp-event-modal .modal-body').html('');
            var data = {
                act         :   'fullcalendar-event',
                id          :   info.event.extendedProps.evento_id,
                tipo        :   info.event.extendedProps.evento_tipo,
                clicked     :   info.event.startStr,
                modal       :   '',
                sede_codice :   sede_codice
            };
            ajaxRequest(url, data, function(risultato){
                $('#sp-event-modal .modal-body').html(risultato);
                $('#sp-event-modal').modal('show');
            });
            /*if (info.event.url) 
            {
                window.open(info.event.url);
            }*/
        },
        eventContent: function(event) 
        {
            if (options.homepage && event.view.type=='dayGridMonth')
            {
                var dot = document.createElement('div');
                dot.style = "width:18px; height: 18px; margin-left:-10px; margin-top:-10px; z-index:2";
                dot.setAttribute('data-tooltip', "tooltip");
                dot.title = event.event.extendedProps.oraStart+' - '+event.event.extendedProps.oraStop+' '+event.event.title;
                
                var arrayOfDomNodes = [ dot ];
                return { domNodes: arrayOfDomNodes };
            }
            else
            {
                if (event.event.extendedProps.imageurl) 
                {
                    var immagine = document.createElement('img');
                    immagine.src = event.event.extendedProps.imageurl;
                    immagine.style = "width:16px; height:16px; margin-right:10px; margin-left:5px;";
                    immagine.setAttribute('data-tooltip', "tooltip");
                    immagine.title = 'Calendario: '+event.event.extendedProps.description;
                }
                else
                {
                    var immagine = document.createElement('i');
                    immagine.className = 'far fa-calendar-alt';
                    immagine.style = "margin-right:4px;";
                }

                var testo = document.createElement('span');
                testo.innerHTML = event.event.title;
                testo.setAttribute('data-tooltip', "tooltip");
                testo.title = event.event.extendedProps.oraStart+' - '+event.event.extendedProps.oraStop+' '+event.event.title;

                if (event.view.type!='listWeek')
                {
                    var paragraph = document.createElement("div");
                    paragraph.style = "width:100%; height:100%; overflow: hidden; text-overflow: ellipsis;";
                    paragraph.appendChild(immagine);
                    paragraph.appendChild(testo);
                }
                else
                {
                    var paragraph = document.createElement("a");
                    paragraph.href = event.event.url;
                    paragraph.appendChild(immagine);
                    paragraph.appendChild(testo);
                }

                var arrayOfDomNodes = [ paragraph ];
                return { domNodes: arrayOfDomNodes };
            }
        },
        eventDidMount: function(info) 
        {
            $('[data-tooltip="tooltip"]').tooltip();
        },
        loading: function (isLoading) 
        {
            if (!options.homepage)
            {
                if (isLoading)
                {
                    $('.sp-loading').removeClass('d-none').show();
                }
                else 
                {                
                    $('.sp-loading').addClass('d-none').hide();
                }
            }
        }
    });
    calendar.render();
    
    if (options.homepage)
    {
        var date = calendar.getDate();
        var month_int = date.getMonth();
        $('.sp-title').html(month_int);
    }
    
    $('.sp-btn-filters').click(function(){
        calendar.refetchEvents();
    });
    
    $('.sp-changeview').change(function(){
        calendar.changeView($('select.sp-changeview').val());
    });
    
    $('#schoolplanner .selectpicker').on("changed.bs.select", function(e, clickedIndex, newValue) {
        if (clickedIndex!==undefined && clickedIndex!=='' && clickedIndex!==null)
        {
            var attuale=$('#'+$(this).attr('id'))[0];
            var id=clickedIndex; //attuale.options[clickedIndex].value;
            var etichetta= attuale.options[clickedIndex].getAttribute('data-content');
            if (newValue)
            {
                createFilterBox($(this).attr('id'), etichetta, id);
            }
            else
            {
                removeFilterBox($(this).attr('id'), id);
            }
        }
    });
    
    $('#schoolplanner .bs-select-all').click(function(){
        var attuale=$(this);
        var tipo_select=attuale.parents('.selectpicker').attr('id');
        $('#'+tipo_select+' option').each(function(){
            var id=$(this).index();
            var etichetta=$(this).attr('data-content');
            if (id!==undefined && id!=='' && id!==null)
            {
                createFilterBox(tipo_select, etichetta, id);
            }
        });
    });
    
    $('#schoolplanner .bs-deselect-all').click(function(){
        var attuale=$(this);
        var tipo_select=attuale.parents('.selectpicker').attr('id');
        $('#'+tipo_select+' option').each(function(){
            var id=$(this).index();
            if (id!==undefined && id!=='' && id!==null)
            {
                removeFilterBox(tipo_select, id);
            }
        });
    });

    return calendar;
}

function getChecked(tipo, homepage)
{
    if (!homepage)
    {
        var array_checkbox = $('select#'+tipo).val();
        if (array_checkbox != '' && array_checkbox != undefined)
        {
            if (!Array.isArray(array_checkbox))
            {
                return array_checkbox;
            }
            else
            {
                return array_checkbox.join(',');
            }
        }
        else
        {
            return '';
        }
    }
    else
    {
        return '';
    }
}

function bindFilters()
{
    $('.sp-filter-item-del').click(function(){
        var tipo_select = $(this).attr('data-select');
        var option_id = $(this).attr('data-option_id');
        $('#'+tipo_select)[0].options[option_id].selected = false;
        var tmp1=$('#'+tipo_select).siblings('.dropdown-menu').find('.inner').attr('id');
        var tmp2=tmp1+'-'+option_id;
        $('#'+tmp2).removeClass('selected').attr('aria-selected', 'false');
        $('#'+tmp2).parents('li').removeClass('selected');
        $('#'+tipo_select).selectpicker('render');
        removeFilterBox(tipo_select, option_id);
    });
}

function createFilterBox(tipo_select, option_value, option_id)
{    
    if ($('.sp-filter-item-del[data-select="'+tipo_select+'"][data-option_id="'+option_id+'"]').length<=0)
    {
        var contenitore = document.createElement('div');
        contenitore.setAttribute('class', 'sp-filter-item');

        var icona;

        switch (tipo_select)
        {
            case 'sp-filter-cal':
                icona = document.createElement('i');
                break;

            case 'sp-filter-spazi':
                icona = document.createElement('i');
                icona.setAttribute('class', 'fas fa-map-marker-alt sp-filter-icon');
                break;

            case 'sp-filter-persone':
                icona = document.createElement('i');
                icona.setAttribute('class', 'fas fa-user-alt sp-filter-icon');
                break;

            case 'sp-filter-evento':
                icona = document.createElement('i');
                icona.setAttribute('class', 'fas fa-calendar-alt sp-filter-icon');
                break;
        }

        var a_cancella = document.createElement('a');
        a_cancella.href = '#';
        a_cancella.setAttribute('class', 'sp-filter-item-del');
        a_cancella.innerHTML = '<i class="fas fa-times"></i>';
        a_cancella.setAttribute('data-select', tipo_select);
        a_cancella.setAttribute('data-option_id', option_id);

        var testo = document.createElement('span');
        testo.innerHTML = option_value;

        contenitore.appendChild(icona);
        contenitore.appendChild(testo);
        contenitore.appendChild(a_cancella);

        $('.sp-filters').append(contenitore);
        bindFilters();
    }
}

function removeFilterBox(tipo_select, option_id)
{
    $('a[data-select="'+tipo_select+'"][data-option_id="'+option_id+'"]').parents('.sp-filter-item').remove();
    bindFilters();
}