const express = require('express');
const config = require('./config/config');
const app = express();

//let env = 'development'; // depricated -> moved to config.env
require('./config/database')(config[config.env]);
require('./config/express')(app, config[config.env]);
require('./config/passport')();
require('./config/routes')(app);

module.exports = app;