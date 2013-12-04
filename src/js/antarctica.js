var Antarctica = (function() {
    var currentUpdateID;

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

    function handleDataResponse(data) {
        console.log(data);
    }

    function showUpdate(id) {
        console.log(id);
    }

    function init() {
        currentUpdateID = getParameterByName('update_id');
        showUpdate(currentUpdateID);
        getData();
    }


    return {
        init: init,
        handleDataResponse: handleDataResponse
    };
}());

gsS3Callback = Antarctica.handleDataResponse;
Antarctica.init();

