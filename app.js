const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const exphbs = require('express-handlebars');
const request = require('request');
const path = require('path');
const servers = require('./src/server');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Set public directory
app.use(express.static(path.join(__dirname, '/public')));

// Constants
const port = 5555;

function getDataFromServers(server){
    return new Promise(function (resolve, reject){
        request({
            url: server.host + "/controls/stats",
            body: server.name
        }, (error, response, body) => {
            if(error){
                return reject(error);
            } else {
                let a = {}
                a[response.request.body] = JSON.parse(body);
                return resolve(a);
            }
        });
    });
}

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

app.get('/', (req, res) => {
    res.render('home', {server: servers});
    let promises = [];
    for (let i=0; i < servers.length; i++){
        promises.push(getDataFromServers(servers[i]))
    }
    Promise.all(promises)
        .then(((data) => {
            console.log(data);
            io.emit('data update', data)
        }))
        .catch((error) => {
            console.log(error);
        })
});

app.get('/control/state', (req, res) => {
    let url = req.body.url;
    let state = req.body.state;
});

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

setInterval(function() {
    let promises = [];
    for (let i = 0; i < servers.length; i++) {
        promises.push(getDataFromServers(servers[i]))
    }
    Promise.all(promises)
        .then(((data) => {
            console.log(data);
            io.emit('data update', data)
        }));
},10000);