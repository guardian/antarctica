var Antarctica = (function() {
    var currentUpdateIndex;
    var ractive;
    var entries;
    var queryEntryID;

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function getData() {
        $.ajax({
            type:'get',
            dataType:'jsonp',
            url: 'http://interactive.guim.co.uk/spreadsheetdata/0AkRR3zKqdlUHdDI1NzZ2RVJSdGNOek9WWTdiUUxyTEE.jsonp',
            jsonpCallback: 'gsS3Callback',
            cache: true
        });
    }

    function handleDataResponse(response) {
        entries = response.data;
        currentUpdateIndex = entries.length - 1;

        if (queryEntryID) {
            var queriedData = _.findWhere(entries, { updatenumber: queryEntryID});
            if (queriedData) {
                currentUpdateIndex = entries.indexOf(queriedData);
            }
        }

        ractive = new Ractive({
            el: 'templateOutput',
            template: '#mainTemplate'
        });

        showUpdate();
    }


    function showUpdate() {
        ractive.set(entries[currentUpdateIndex]);
    }

    function init() {
        queryEntryID = parseInt(getParameterByName('update_id'), 10);
        getData();
    }


    return {
        init: init,
        handleDataResponse: handleDataResponse
    };
}());

gsS3Callback = Antarctica.handleDataResponse;
Antarctica.init();

