var Antarctica = (function() {
    var prodDataURL = 'http://interactive.guim.co.uk/spreadsheetdata/0AkRR3zKqdlUHdDI1NzZ2RVJSdGNOek9WWTdiUUxyTEE.jsonp';
    var testDataURL = 'http://interactive.guim.co.uk/spreadsheetdata/0AjNAJ9Njg5YTdEx0SFh4cFh1MmtveUR5YlZxbEpjZ2c.jsonp';
    var currentUpdateIndex;
    var ractive;
    var entries;
    var queryEntryID;
    var shipMarkers = [];
    var map;

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
            url: testDataURL,
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

        var centerLatLng = new google.maps.LatLng(-63.46, 166.34);

        var mapOptions = {
            center: centerLatLng,
            disableDefaultUI: true,
            zoom: 2
        };

        gMap = new google.maps.Map($('.al-map').get()[0], mapOptions);
        gMap.mapTypes.set('map_style', styledMap);
        gMap.setMapTypeId('map_style');

//        shipMarker = new google.maps.Marker({
//            position: centerLatLng,
//            map: gMap,
//            title: "",
//            icon: {
//                path: google.maps.SymbolPath.CIRCLE,
//                fillOpacity: 1,
//                fillColor: 'ffffff',
//                strokeOpacity: 1.0,
//                strokeColor: '585858',
//                strokeWeight: 2.0,
//                scale: 6 //pixels
//            }
//        });

        drawShipPath();
        setActiveShipMarker();

        google.maps.event.addDomListener(window, 'resize', _.debounce(function() {
            gMap.setCenter(centerLatLng);
        }, 200));
    }

    var smallShipIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillOpacity: 1,
        fillColor: 'ffffff',
        strokeOpacity: 1.0,
        strokeWeight: 0,
        scale: 5 //pixels
    };

    var smallHoverShipIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillOpacity: 1,
        fillColor: 'ffffff',
        strokeOpacity: 1.0,
        strokeColor: '585858',
        strokeWeight: 2.0,
        scale: 6 //pixels
    };

    var bigShipIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillOpacity: 1,
        fillColor: 'ffffff',
        strokeOpacity: 1.0,
        strokeColor: '585858',
        strokeWeight: 2.0,
        scale: 8 //pixels
    };

    function setActiveShipMarker() {
        shipMarkers.forEach(function(marker, index) {
            if (currentUpdateIndex === index) {
                marker.setIcon(bigShipIcon);
                marker.active = true;
            } else {
                marker.setIcon(smallShipIcon);
                marker.active = false;
            }
        });
    }


    function drawShipPath() {
        var shipCoordinates = [];
        entries.forEach(function(entry, index, list) {
            var gPosition = new google.maps.LatLng(entry.lat, entry.long);
            shipCoordinates.push(gPosition);

            var shipMarker = new google.maps.Marker({
                position: gPosition,
                map: gMap,
                title: entry.date,
                icon: smallShipIcon,
                active: false
            });

            shipMarkers.push(shipMarker);

            google.maps.event.addListener(shipMarker, 'mouseover', function() {
                if (false === shipMarker.active) {
                    shipMarker.setIcon(smallHoverShipIcon);
                }
            });
            google.maps.event.addListener(shipMarker, 'mouseout', function() {
                if (false === shipMarker.active) {
                    shipMarker.setIcon(smallShipIcon);
                }
            });

            google.maps.event.addListener(shipMarker, 'click', function() {
                if (false === shipMarker.active) {
                    goToEntry(index);
                }
            });
        });

        var shipPath = new google.maps.Polyline({
            path: shipCoordinates,
            geodesic: true,
            strokeColor: '#FFFFFF',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        shipPath.setMap(gMap);
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

    function updateShipPosition() {
        var data = entries[currentUpdateIndex];
        var shipLatlng = new google.maps.LatLng(data.lat, data.long);
        //shipMarker.setPosition(shipLatlng);
    }

    function goToEntry(entryID) {
        currentUpdateIndex = entryID;
        showUpdate();
    }


    function showUpdate() {
        ractive.set(entries[currentUpdateIndex]);
        updateShipPosition();
        setActiveShipMarker();
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

