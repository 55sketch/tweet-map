// Mapbox Access Token
L.mapbox.accessToken = 'pk.eyJ1Ijoibmlja21vcmV0b24iLCJhIjoiN1YzbVQ4OCJ9.LtxClALVgG8k2DCnA5vX-A';

// Set up filters
function init() {
    var filterArr = [];
    var q = document.getElementById('search-term').value;
    var range = document.getElementById('range').value;
    var postcode = document.getElementById('postcode').value;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.postcodes.io/postcodes/' + postcode);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            filterArr.push('lat=' + data.result.latitude, 'lon=' + data.result.longitude);
            console.log(filterArr);
            if (q) {
                filterArr.push('q=' + encodeURIComponent(q));
            }
            if (range) {
                filterArr.push('range=' + range + 'mi');
            }

            var filter = filterArr.join('&');
            renderTwitterMap(filter, data.result.latitude, data.result.longitude);
        }
    };
    xhr.send();
}

// Get tweets and render map
function renderTwitterMap(filter, latitude, longitude) {
    console.log(filter, latitude, longitude);
    // Get data from API
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api?' + filter);
    xhr.onload = function() {
        if (xhr.status === 200) {

            // Remove loading class from body   
            document.getElementById('map').classList.remove('loading');

            // Create a map in the div #map
            var map = L.mapbox.map('map', 'mapbox.streets', {
                center: [latitude, longitude],
                zoom: 7
            });

            // Parse data
            var data = JSON.parse(xhr.responseText);
            console.log(data);
            for (var i = data.length - 1; i >= 0; i--) {
                var tweet = data[i];
                // Get geo from tweet
                var lat = tweet.place.bounding_box.coordinates[0][0][1];
                var lon = tweet.place.bounding_box.coordinates[0][0][0];
                // Check if tweet has media
                if (tweet.entities.media) {
                    var tweetImage = '<img src="' + tweet.entities.media[0].media_url_https + '"/>';
                } else {
                    var tweetImage = '';
                }

                // Add marker to the map
                var marker = L.marker([lat, lon]).addTo(map);
                // Pop up template
                var template = '<img src="' + tweet.user.profile_image_url_https + '" class="profile-image" /><h3 class="screen-name">' + tweet.user.screen_name + '</h3>' + tweetImage + '<p>' + tweet.text + '</p><a href="https://twitter.com/statuses/' + tweet.id_str + '"/>Link</a>'
                    // Add tweet text to marker popup
                marker.bindPopup(template);
            }
        } else {
            console.log('Request failed.  Returned status of ' + xhr.status);
        }
    };

    xhr.send();

}

// Form submission function
function formSubmit(e) {
    e.preventDefault();
    map.remove();
    document.getElementById('map-container').innerHTML = '<div id="map" class="loading"></div>';
    init();
}

// Bind function to form
document.getElementById('search-form').addEventListener('submit', formSubmit, false);

// Initialise first run of map render
init();
