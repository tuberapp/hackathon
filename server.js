var http = require('http')
var port = process.env.PORT || 1337;
var express = require('express');
var app = express(); //init
var qs = require('querystring');

///////////////////////////////////////////
// Hackster IO Hackathon! 

var rider_waiting = false;
var driver_incoming = false;
var rider_id = 1;
var rider_details = [];
var car_location = {};

app.get('/', gethome);


function findWeatherAndReturn(rider, response) {
    path = "http://api.wunderground.com/api/73de21f5b11ba67d/history_";
    path += (rider.date + "/q/" + rider.state + "/" + rider.city + ".json")

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
            car_location = rider
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
    var body = '';
    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6)
            req.connection.destroy();
    });
    req.on('end', function () {
        req.body = qs.parse(body);

        // TODO: make this pose, accept name and date and address
        if (!req.body) return res.sendStatus(400)
        rider_waiting = true;

        var id = rider_id;
        rider_id++;

        rider = {
            'name': req.body.name,
            'date': req.body.date,
            'address': req.body.address,
            'state': req.body.state,
            'city': req.body.city

        }
        rider_details.push(rider)
        res.send('welcome, ' + req.body.name)

    });
});

app.get('/hack/rideavailable', function (req, res) {
    // edison pings, asking if rider is waiting
    driver_incoming = true;

    //find the weather.
    if( rider_details.length > 0){
        rider = rider_details.pop()
        rider.result = true
        findWeatherAndReturn(rider, res)

    }
    else {
        res.send(JSON.stringify({'result':false}))
    }

});

app.get('/hack/rideaccepted', function (req, res) {
    // driver pushed button on edison
});
app.get('/hack/rideprogress', function (req, res) {
    // mobile app wants to know where driver is
    res.send(car_location);
});

// Start server!
var server = app.listen(port, function serverstartup() {
    console.log('NodeExpress server listening on port %d', server.address().port);
});

