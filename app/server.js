require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const querystring = require('querystring');
var cors = require('cors');

require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' });

const app = express();
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))
    // parse requests of content-type - application/json
app.use(bodyParser.json())

var callLogger = (req, res, next) => {
        let qs = querystring.stringify(req.query);

        let parseIp = req.headers['x-forwarded-for'];
        if (parseIp) {
            parseIp = parseIp.split(',').shift();
        } else if (req.socket) {
            parseIp = req.socket.remoteAddress;
        }
        const host = req.headers['Host'] || req.headers['host'];
        console.log(`Req from: ${host} ${parseIp} ${req.method}: ${req.path} ${qs}`);
        console.log(`Headers ${req.headers}`)
        next();
    }
    // Add logger middleware before router middleware to express
    // .use(middleware)  is the syntax to add middleware to express
app.use(callLogger);


process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Database configurations
const mongoose = require('mongoose');
const { verifyToken } = require('./security/security');
mongoose.Promise = global.Promise;

// connect to database
mongoose.connect(process.env.DB_URL)
    .then(() => { console.log("Successfully connected to database"); })
    .catch(err => {
        console.error("Cannot connect to the database. Exiting now", err);
        process.exit();
    })

//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.set("debug", (collectionName, method, query, doc) => {
    console.log(`Collection: ${collectionName}.${method}`, JSON.stringify(query), doc);
});

app.options('*', cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, PUT, PATCH, POST");
    next();
})

// Add security as below
// app.use(function(req, res, next) {
//     verifyToken(req, res, next)
// });

// Other routes
require('./route/postcodearea')(app);
require('./route/postcodedistrict')(app);
require('./route/postcode-area-csv-loader')(app);
require('./route/postcode-district-csv-loader')(app);
app.use('/health', require('./route/healthcheck'));

//Listen for requests
app.listen(process.env.PORT, () => {
    console.log(`Server listening on ${process.env.PORT}`);
    console.log(`Server Context Path ${process.env.CONTEXT_PATH}`);
});