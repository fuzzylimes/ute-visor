const express = require('express');
const exphbs = require('express-handlebars');
const request = require('request');
const path = require('path');
const app = express();
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


app.get('/', (req, res) => {
    res.render('home', {server: servers});
});

app.get('/controller', (req, res) => {
    let url = req.body.url;
    let method = req.body.method.toUpperCase();
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});