require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');

const compress = require('compression'),
    cors = require('cors'),
    timeout = require('connect-timeout'),
    session = require('express-session');

const routes = require('./routes.js');

// environment variables
const secret = process.env.SESSIONSECRET; // doesn't use sessions at the moment
const timeoutLimit = 60000; // 1 minute timeout
const port = 3000;

const setupApp = (app) => {
    app.use(compress());
    app.use(cors());
    app.use(express.json());
    app.use(timeout(timeoutLimit));
    app.use(session({secret: secret}));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    // root request to static files
    app.use(express.static(__dirname + '/assets')); // *.css, *.png

    app.config = {
        'messages': {
          'enabled': true
          }
      };
  }

const get = () => {

    try {
  
      const app = express();

      setupApp(app);
      routes.setUpRoutes(app);

      console.log(`environment: ${app.get('env')}`);
      
      return app;
  
    } catch (err) {
      throw err;
    }
  }
  const start = (app) => {
  
    app.listen(port, () => {
        console.log(`Server running on: ${port}`);
    });
  }
  

module.exports = {
    get: get,
    start: start
  }