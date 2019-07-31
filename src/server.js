require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');

const compress = require('compression'),
    cors = require('cors'),
    timeout = require('connect-timeout'),
    session = require('express-session');

// file upload and streaming    
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });

const azureStorage = require('./azureStorage.js');

// environment variables
const secret = process.env.SESSIONSECRET; // doesn't use sessions at the moment

const timeoutLimit = 900000;
const port = 3000;

const getError = (req, res, next) => {
    next(new Error("This is an error and it should be logged to the console"));
}

const setupApp = (app) => {
    app.use(compress());
    app.use(cors());
    app.use(express.json());
    app.use(timeout(timeoutLimit));
    app.use(session({secret: secret}))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
  }
const routes = (app) => {
    app.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', '*');
        if ('OPTIONS' == req.method) {
            res.sendStatus(200);
        } else {
            next();
        }
    });
    app.get('/', (req, res, next) => {
        res.send(
        '<form action="/upload" method="post" enctype="multipart/form-data">' +
        '<input type="file" name="uploadedFile" /><br>' +
        '<input type="text" name="container" value="myContainer" /><br>' + 
        '<input type="text" name="directory" value="myDirectory" /><br>' +
        '<input type="submit" value="Upload" /><br>' +
        '</form>'
        );
    });

    app.post('/upload', singleFileUpload.single('uploadedFile'), azureStorage.uploadFile);

    app.use(function (err, req, res, next) {
        if (err.message == "Not Found" || err.statusCode == 404) {
            return res.status(404).send("file not found");
        } else if (err.name === 'UnauthorizedError') {
            // failed authentication on routes that require it
            res.status(401).send('invalid token : ' + err);
    
        } else {
            res.status(err.statusCode || 500).send(err);
        }
    });

}
const get = () => {

    try {
  
      const app = express();
  
      setupApp(app);
      routes(app);
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