var prodDataURL = 'http://interactive.guim.co.uk/spreadsheetdata/0AkRR3zKqdlUHdDI1NzZ2RVJSdGNOek9WWTdiUUxyTEE.jsonp';
var testDataURL = 'http://interactive.guim.co.uk/spreadsheetdata/0AjNAJ9Njg5YTdEx0SFh4cFh1MmtveUR5YlZxbEpjZ2c.jsonp';
var $output = $('#output');
var $entryList = $('#entryList');
var embedURL = 'http://s3-eu-west-1.amazonaws.com/gdn-stage/antarctica-2013/index.html?update_id=';
var iframeCode = '<iframe src="{{ src }}" style="width: 100%; height: 560px; overflow: hidden;" seamless frameborder="0" scrolling="no"></iframe>';
var entries;
var selectedEntry;

function getData() {
    $.ajax({
        type:'get',
        dataType:'jsonp',
        url: testDataURL,
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
            selectEntry(index);
            $entryList.find('li').removeClass('active');
            $(this).addClass('active');
        });
        $entryList.append(item);
    });
}

function selectEntry(index) {
    var selectedIndex = ('undefined' === typeof index) ? entries.length-1 : index ;
    selectedEntry = selectedIndex;
    updatePreview();
    updateEmbedCode();
}

function updatePreview() {
    var iframeSrc = embedURL + entries[selectedEntry].updatenumber;
    $('iframe').attr('src', iframeSrc);
}

function updateEmbedCode() {
    var embedCode = iframeCode.replace('{{ src }}', embedURL + entries[selectedEntry].updatenumber);
    $output.val(embedCode);
}

function init() {
    getData();
}

init();
