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
let serverList = [];
servers.forEach(server => {
    serverPairs[server.name] = server.host;
    serverList.push(server.name);
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
                return reject()
            } else {
                a[response.request.headers.name] = JSON.parse(body);
                return resolve(a);
            }
        });
    });
}

function getData(socket=io) {
    let promises = [];
    for (let i = 0; i < servers.length; i++) {
        promises.push(getDataFromServers(servers[i]))
    }
    Promise.all(promises.map(p => p.catch(e => e)))
        .then(((data) => {
            console.log(data);
            data = data.filter(function (n) { return n != undefined }); 
            let names = [];
            data.forEach(d => {
                names.push(Object.keys(d)[0]);
            });
            serverList.forEach(s =>{
                if(names.indexOf(s) < 0){
                    let tmp = {};
                    tmp[s] = { state: 'unk' }
                    data.push(tmp);
                }
            })
            console.log(data);
            socket.emit('data update', data);
        }))
        .catch((e) => {
            console.log(error);
        });
}

io.on('connection', function (socket) {
    console.log(`a user connected: ${socket.id}`);
    getData(socket);

    socket.on('disconnect', function () {
        console.log(`user disconnected: ${socket.id}`);
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
