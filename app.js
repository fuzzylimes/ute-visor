const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const exphbs = require('express-handlebars');
const request = require('request');
const path = require('path');
const servers = require('./src/server');
const bodyParser = require('body-parser');
let serverPairs = {};
servers.forEach(server => {
    serverPairs[server.name] = server.host;
});
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
        let a = {};
        request({
            url: server.host + "/controls/stats",
            headers: {
                'name': server.name
            }
        }, (error, response, body) => {
            if(error){
                // return reject(error);
                a[response.request.headers.name] = {state: 'unk'}
                return reject(a)
            } else {
                a[response.request.headers.name] = JSON.parse(body);
                return resolve(a);
            }
        });
    });
}

function getData() {
    let promises = [];
    for (let i = 0; i < servers.length; i++) {
        promises.push(getDataFromServers(servers[i]))
    }
    Promise.all(promises)
        .then(((data) => {
            console.log(data);
            io.emit('data update', data);
        }))
        .catch((error) => {
            console.log(error);
        });
}

io.on('connection', function (socket) {
    console.log('a user connected');
    getData();

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

app.get('/', (req, res,) => {
    res.render('home', {server: servers});
});

app.get('/control/state/:server', (req, res) => {
    let server = req.params.server;
    let url = serverPairs[server];
    let state = req.query.state;
    request.put({
        url: `${url}/controls/${state}`,
        headers: {
            ute: "ute-controller"
        }
    }, (error, response, body) => {
        if (error) throw error;
        if (response.statusCode !== 200){
            console.log(`${response.statusCode} - Something went wrong`);
        } else {
            res.redirect('/');
        }
    });
});

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

setInterval(function() {
    getData();
},10000);
