var prodDataURL = 'http://interactive.guim.co.uk/spreadsheetdata/0AkRR3zKqdlUHdDI1NzZ2RVJSdGNOek9WWTdiUUxyTEE.jsonp';
var $output = $('#output');
var $entryList = $('#entryList');
var embedURL = 'http://interactive.guim.co.uk/embed/antarctica-2013/';
var iframeCode = '<iframe src="{{ src }}" style="width: 100%; height: 560px; overflow: hidden;" seamless frameborder="0" scrolling="no"></iframe>';
var entries;
var selectedEntry;

function getData() {
    $.ajax({
        type:'get',
        dataType:'jsonp',
        url: prodDataURL,
        jsonpCallback: 'gsS3Callback',
        cache: true
    });
}

function gsS3Callback(response) {
    entries = response.data;
    listEntries();
    selectEntry();
}

function listEntries() {
    entries.forEach(function(entry, index) {
        var item = $('<li></li>').html(entry.date);
        item.on('click', function() {
            if ($(this).hasClass('active')) {
                selectEntry(null);
                $(this).removeClass('active');
                return;
            }

            selectEntry(parseInt(index, 10));
            $entryList.find('li').removeClass('active');
            $(this).addClass('active');
        });
        $entryList.append(item);
    });
}

function selectEntry(index) {
    selectedEntry = index;
    updatePreview();
    updateEmbedCode();
}

function updatePreview() {
    var iframeSrc = embedURL;
    if (selectedEntry !== null && typeof selectedEntry === 'number') {
        iframeSrc += '?update_id=' + entries[selectedEntry].updatenumber;
    }
    $('iframe').attr('src', iframeSrc);
}

function updateEmbedCode() {
    var iframeSrc = embedURL;
    if (selectedEntry !== null && typeof selectedEntry === 'number') {
        iframeSrc += '?update_id=' + entries[selectedEntry].updatenumber;
    }
    var embedCode = iframeCode.replace('{{ src }}', iframeSrc);
    $output.val(embedCode);
}

function init() {
    getData();
}

init();
