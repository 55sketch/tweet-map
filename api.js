// Require OAuth and Twitter libraries
var OAuth2 = require('oauth').OAuth2;
var Twitter = require('twitter');

// Filter function so that only Tweets with geolocation are returned
function filterGeoTweets(tweets) {
    
    var geoTweets = [];

    for (var i = tweets.statuses.length - 1; i >= 0; i--) {
        
        var tweet = tweets.statuses[i];
        
        if (tweet.place) {
            geoTweets.push(tweet);
        }
    }

    return geoTweets;
}

// API 
function createAPI(req, res) {

    // Set up Twitter query parameters
    var lat = req.query.lat || '',
        lon = req.query.lon || '',
        query = req.query.q || '',
        range = req.query.range || '50mi',
        geocode = lat + ',' + lon + ',' + range;

    // Authorise as application
    var oauth2 = new OAuth2(process.env.TWITTER_CONSUMER_KEY, process.env.TWITTER_CONSUMER_SECRET, 'https://api.twitter.com/', null, 'oauth2/token', null);
    
    // Get token
    oauth2.getOAuthAccessToken('', {
        'grant_type': 'client_credentials'
    }, function(error, access_token) {
        if (error) {
            console.log(error);
            // Return error
            return res.status(error.statusCode).json(error);

        } else {
           
            // User application token in Twitter connection
            var client = new Twitter({
                consumer_key: process.env.TWITTER_CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
                bearer_token: access_token
            });
            
            // Options for twitter get
            var options = {
                q: query,
                count: 100
            };
            
            // Set geocode if it exists
            if (lat && lon) {
                options.geocode = geocode;
            }
            
            // Get tweets based on search parameter
            client.get('search/tweets', options, function(error, tweets) {
                if (error) {
                    console.log(error);
                    // Return error
                    return res.status(error.code).json(error);

                } else {
                    // Filter for tweets that have geolocation
                    var geoTweets = filterGeoTweets(tweets);
                    
                    // Return filtered tweets as json
                    return res.status(200).json(geoTweets);
                }
            });

        }
    });
}

// Export
module.exports = {
    createAPI: createAPI
};