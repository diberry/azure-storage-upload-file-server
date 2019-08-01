// file upload and streaming    
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
const path = require('path');

const azureStorage = require('./azureStorage.js');

const setUpRoutes = (app) => {
    
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

    app.post('/upload', singleFileUpload.single('uploadedFile'), azureStorage.uploadFile);

    app.get('/', function (req, res, next) {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    });

    app.use(function (err, req, res, next) {

        console.log(`error handler ${err}`);

        if (res.headersSent) {
            return next(err);
          }
          res.status(500).send(err);

    });
}

module.exports = {
    setUpRoutes:setUpRoutes
}