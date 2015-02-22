var http = require('http')
var port = process.env.PORT || 1337;
var express = require('express');
var app = express(); //init

///////////////////////////////////////////
// Hackster IO Hackathon! 

var rider_waiting = false;
var driver_incoming = false;

app.get('/', gethome);
function gethome(req, res) {
    res.send('<html><body>' +
		'<h1>Hackster IO -- Tuber App!</h1>' +
		'<br/>' +
        '</body></html>');
}

app.get('/hack/requestride', function (req, res) {
    // mobile app requests a ride

    // TODO: make this pose, accept name and date and address

    rider_waiting = true;
    res.send('{}');
});
app.get('/hack/rideavailable', function (req, res) {
    // edison pings, asking if rider is waiting
    driver_incoming = true;
    res.send('{result:"' + rider_waiting + '", ' +
        'address:"'+'123 fake st'+'",' +
        'name:"'+'Marty McFly'+'",' +
        'date:"'+'1973'+'",' +
        'weather:"'+'Sunny'+'",' +
        '}');
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

///////////////////////
// Start server!
var server = app.listen(port, function serverstartup() {
    console.log('NodeExpress server listening on port %d', server.address().port);
});