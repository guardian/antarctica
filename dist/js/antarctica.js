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

        addMap();

        ractive.on({
            previousEntry: previousEntry,
            nextEntry: nextEntry
        });

        showUpdate();
    }

    function addMap() {
        google.maps.visualRefresh = true;

        var styledMap = new google.maps.StyledMapType(
            AntarcticaMapStyles,
            {name: "Styled Map"}
        );

        var mapOptions = {
            center: new google.maps.LatLng(-63.46, -166.34),
            disableDefaultUI: true,
            zoom: 2
        };

        var map = new google.maps.Map($('.al-map').get()[0], mapOptions);
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');

        var myLatlng = new google.maps.LatLng(-63.46, -166.34);
        // To add the marker to the map, use the 'map' property
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title:"Hello World!"
        });
    }

    function nextEntry() {
        if (currentUpdateIndex + 1 < entries.length) {
            currentUpdateIndex += 1 ;
            showUpdate();
        }
    }

    function previousEntry() {
        if (currentUpdateIndex - 1 >= 0) {
            currentUpdateIndex -= 1 ;
            showUpdate();
        }
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

