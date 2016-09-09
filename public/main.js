var tweetMap = (function() {

    // Mapbox Access Token - L object comes from the MapBox library
    L.mapbox.accessToken = 'pk.eyJ1Ijoibmlja21vcmV0b24iLCJhIjoiN1YzbVQ4OCJ9.LtxClALVgG8k2DCnA5vX-A';

    // Initialise app
    function init() {

        // bind function to form
        document.getElementById('search-form').addEventListener('submit', formSubmit, false);

        // Submit form
        document.getElementById('form-submit').click();

    }

    // Form submission function
    function formSubmit(e) {

        // Prevent default
        e.preventDefault();

        // Get Postcode from form
        var postcode = document.getElementById('postcode').value;

        // Validate postcode
        if (valid_postcode(postcode)) {

            // Reinitialise Map
            reinitMap();

            // Clear any error message
            document.getElementById('postcode-error').innerHTML = '';

            // Get lat/lon from postcode api
            get('https://api.postcodes.io/postcodes/' + postcode, setFilters);

        } else {

            // Output Error
            document.getElementById('postcode-error').innerHTML = 'Sorry, that postcode doesn\'t appear to be valid';
        }
    }

    // Get function 
    function get(url, success) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function() {
            if (xhr.status === 200) {

                // Parse the data
                var data = JSON.parse(xhr.responseText);

                // Call success function
                success(data);

            } else {
                console.log('Request failed.  Returned status of ' + xhr.status);
            }
        };
        xhr.send();
    }

    // Postcode validator
    function valid_postcode(postcode) {

        // Remove spaces
        postcode = postcode.replace(/\s/g, "");

        // Set up regex
        var regex = /^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i;

        // Test
        return regex.test(postcode);
    }

    // Reinitialise map
    function reinitMap() {

        // Get map
        var map = document.getElementById('map');

        // Check if map exists
        if (map) {
            // Remove initial map to avoid initialisation error
            map.parentElement.removeChild(map);

            // Recreate Map element
            document.getElementById('map-container').innerHTML = '<div id="map" class="loading"></div>';
        }
    }

    // Set query string
    function setFilters(data) {

        // Get Query values from form
        var q = document.getElementById('search-term').value;
        var range = document.getElementById('range').value;

        // Get lat/long from data
        var lat = data.result.latitude;
        var lon = data.result.longitude;

        // Set up empty array for the filters
        var filterArr = [];

        // Push lat/lon into filterArr
        filterArr.push('lat=' + lat, 'lon=' + lon);

        // Push query and range in to filterArr
        if (q) {
            filterArr.push('q=' + encodeURIComponent(q));
        }
        if (range) {
            filterArr.push('range=' + range + 'mi');
        }

        // Join array to create query string
        var filter = filterArr.join('&');

        // Call renderTwitterMap function, passing query string and lat/lon for map centering
        renderTwitterMap(filter, lat, lon);
    }

    // Get tweets and initialise map
    function renderTwitterMap(filter, latitude, longitude) {
        get('/api?' + filter, function(data) {

            // Remove loading class from body   
            document.getElementById('map').classList.remove('loading');

            // Create a map in the div #map
            var map = L.mapbox.map('map', 'mapbox.streets', {
                center: [latitude, longitude],
                zoom: 7
            });

            // Create markers on the map
            createMarkers(map, data);
        });
    }

    // Add markers to the map
    function createMarkers(map, data) {

        // Check there is data
        if (data.length > 0) {

            // Clear any error message
            document.getElementById('no-tweets').innerHTML = '';

            // Loop through data
            for (var i = data.length - 1; i >= 0; i--) {

                // Set tweet
                var tweet = data[i];

                // Get geo from tweet
                var lat = tweet.place.bounding_box.coordinates[0][0][1];
                var lon = tweet.place.bounding_box.coordinates[0][0][0];

                var tweetImage = '';

                // Check if tweet has media
                if (tweet.entities.media) {
                    tweetImage = '<img src="' + tweet.entities.media[0].media_url_https + '"/>';
                }

                // Add marker to the map
                var marker = L.marker([lat, lon]).addTo(map);

                // Pop up template
                var template = '<img src="' + tweet.user.profile_image_url_https + '" class="profile-image" /><h3 class="screen-name">' + tweet.user.screen_name + '</h3>' + tweetImage + '<p class="card-text">' + tweet.text + '</p><a href="https://twitter.com/statuses/' + tweet.id_str + '"/>Link</a>';

                // Add template to marker popup
                marker.bindPopup(template);
            }
        } else {

            // Output error
            document.getElementById('no-tweets').innerHTML = 'Sorry, there don\'t appear to be any geotagged tweets that match your search';
        }
    }


    // Initialise first run of map render
    init();

})();
