const express = require('express');
const config = require('./config/config');
const app = express();

//let env = 'development'; // deprecated -> moved to config.env
// setting variables for the whole site
app.locals.site = {
        title: config.titleOptions.siteTitle,
        titleSeparator: config.titleOptions.titleSeparator
    };
require('./config/handlebars')();
require('./config/database')(config);
require('./config/express')(app, config);
require('./config/passport')();
require('./config/routes')(app);


module.exports = app;