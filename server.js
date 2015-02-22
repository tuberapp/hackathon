var http = require('http')
var port = process.env.PORT || 1337;
var express = require('express');
var app = express(); //init
var bodyParser = require('body-parser')


app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

///////////////////////////////////////////
// Hackster IO Hackathon! 

var rider_waiting = false;
var driver_incoming = false;
var rider_id = 1;
var rider_details = [];

app.get('/', gethome);


function findWeatherAndReturn(rider ,response){
    path = "http://api.wunderground.com/api/73de21f5b11ba67d/history_";
    path += (rider.date +  "/q/" + rider.state + "/" + rider.city + ".json")

    console.log(path)

    //do the http request to get the weather
    var options = {
        hostname: 'api.wunderground.com',
        path: path
    };

    http.get(path, function (http_res) {
        var data = "";

        // this event fires many times, each time collecting another piece of the response
        http_res.on("data", function (chunk) {
            // append this chunk to our growing `data` var
            data += chunk;
        });

        // this event fires *one* time, after all the `data` events/chunks have been gathered
        http_res.on("end", function () {
            // you can use res.send instead of console.log to output via express
            console.log(data);
            data = JSON.parse(data)
            weather = data['history']['dailysummary'][0]['meantempi']
            
            rider['weather'] = weather
            response.send(rider);
        });
    });
}

function gethome(req, res) {
    res.send('<html><body>' +
		'<h1>Hackster IO -- Tuber App!</h1>' +
		'<br/>' +
        '</body></html>');
}

app.post('/hack/requestride', function (req, res) {
    // mobile app requests a ride

    // TODO: make this pose, accept name and date and address
    if (!req.body) return res.sendStatus(400)
    rider_waiting = true;

    var id = rider_id;
    rider_id++;

    rider = {
        'name' : req.body.name,
        'date' : req.body.date,
        'address' : req.body.address,
        'state' : req.body.state,
        'city': req.body.city

    }

    rider_details.push( rider )
    res.send('welcome, ' + req.body.name)
});

app.get('/hack/rideavailable', function (req, res) {
    // edison pings, asking if rider is waiting
    driver_incoming = true;

    //find the weather.

    rider =  rider_details.pop()

    weather = findWeatherAndReturn(rider, res)
    

});

app.get('/hack/rideaccepted', function (req, res) {
    // driver pushed button on edison
    res.send('{}');
});
app.get('/hack/rideprogress', function (req, res) {
    // mobile app wants to know where driver is
    res.send('{result:' + driver_incoming + ', ' +
        'carlocation:"999 3rd ave"' +
        'cardate:"2015"' +
        '}');
});

// Start server!
var server = app.listen(port, function serverstartup() {
    console.log('NodeExpress server listening on port %d', server.address().port);
});
