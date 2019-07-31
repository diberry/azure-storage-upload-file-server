// file upload and streaming    
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });

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

        if (res.headersSent) {
            return next(err)
          }
          res.status(500)
          res.render('error', { error: err })
    });

}


module.exports = {
    setUpRoutes:setUpRoutes
}