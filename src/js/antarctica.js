var Antarctica = (function() {
    var prodDataURL = 'http://interactive.guim.co.uk/spreadsheetdata/0AkRR3zKqdlUHdDI1NzZ2RVJSdGNOek9WWTdiUUxyTEE.jsonp';
    var currentUpdateIndex;
    var ractive;
    var entries;
    var queryEntryID;
    var shipMarkers = [];
    var map;

    // Useful utils
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function getDateString(dateValue) {
        var dateValues = dateValue.split('/');
        var date = new Date(dateValues[2], dateValues[1] -1, dateValues[0]);
        return date.toDateString();
    }

    // https://github.com/rhysbrettbowen/debounce/blob/master/debounce.js
    function debounce(func, wait) {
        var timeout, args, context, timestamp;
        return function() {
            context = this;
            args = [].slice.call(arguments, 0);
            timestamp = new Date();

            var later = function() {
                var last = (new Date()) - timestamp;
                if (last < wait) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    func.apply(context, args);
                }
            };

            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
        };
    }

    function getData() {
        $.ajax({
            type:'get',
            dataType:'jsonp',
            url: prodDataURL,
            jsonpCallback: 'gsS3Callback',
            cache: true
        });
    }

    function parseEntries(data) {
        return data.map(function(entry) {
            entry.title = ('undefined' === typeof entry.title) ? '-' : entry.title;
            entry.date = getDateString(entry.date);
            return entry;
        });
    }

    function handleDataResponse(response) {
        entries = parseEntries(response.sheets.data);
        currentUpdateIndex = entries.length - 1;

        if (queryEntryID) {
            var queriedData = entries.filter(function(entry) {
                return entry.updatenumber === queryEntryID;
            });

            if (queriedData.length > 0) {
                currentUpdateIndex = entries.indexOf(queriedData[0]);
            }
        }
        renderTemplate();
        addMap();
        showUpdate();
    }

    function renderTemplate() {
        ractive = new Ractive({
            el: 'templateOutput',
            template: '#mainTemplate'
        });

        ractive.on({
            previousEntry: previousEntry,
            nextEntry: nextEntry
        });
    }

    function addMap() {
        // Use new Google Maps look
        google.maps.visualRefresh = true;

        var styledMap = new google.maps.StyledMapType(
            AntarcticaMapStyles,
            {name: 'Styled Map'}
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

        drawShipPath();
        setActiveShipMarker();

        google.maps.event.addDomListener(window, 'resize', debounce(function() {
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
                marker.setZIndex(2);
            } else {
                marker.setIcon(smallShipIcon);
                marker.active = false;
                marker.setZIndex(1);
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
            navToEntry(1);
        }
    }

    function previousEntry() {
        if (currentUpdateIndex - 1 >= 0) {
            navToEntry(-1);
        }
    }

    function navToEntry(direction) {
        currentUpdateIndex += direction;
        showUpdate();
        updateMapPosition();
    }

    function updateNavigation() {
        $('.al-nav-button-prev').toggleClass('disabled', currentUpdateIndex === 0);
        $('.al-nav-button-next').toggleClass('disabled', currentUpdateIndex === entries.length -1);
    }

    function updateMapPosition() {
        var data = entries[currentUpdateIndex];
        var shipLatlng = new google.maps.LatLng(data.lat, data.long);
        gMap.setCenter(shipLatlng);
    }

    function goToEntry(entryID) {
        currentUpdateIndex = entryID;
        showUpdate();
    }


    function showUpdate() {
        ractive.set(entries[currentUpdateIndex]);
        setActiveShipMarker();
        updateNavigation();
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
$(document).ready(Antarctica.init);
