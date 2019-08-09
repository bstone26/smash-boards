var express = require('express');
var bodyParser = require('body-parser');

let navigationController = require('./controller/navigationController');
let sessionController = require('./controller/sessionController');

var app = express();

var urlencodedParser = bodyParser.urlencoded({extended: false});
app.set('view engine', 'ejs');

app.use('/session', sessionController);

app.use('/', navigationController);

app.listen(8080);


