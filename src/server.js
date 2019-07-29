require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
const azureStorage = require('azure-storage');

const compress = require('compression'),
    cors = require('cors'),
    timeout = require('connect-timeout'),
    session = require('express-session');

// file upload and streaming    
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
const getStream = require('into-stream');

const secret = "1234$#@!";
const timeoutLimit = 900000;
const port = 3000;
const containerName = "streaminguploads";
const azureStorageConnectionString = process.env.AZURESTORAGE;
const azureBlobUrl = "diberryassetmgrtest.file.core.windows.net";

if(!azureStorageConnectionString) throw("azureStorageConnectionString is empty");

// GUID-originalfilename
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};
 
const uploadFile = async(req, res, next) => {
    try {
        const file = await uploadFileToBlob('myfiles', req.file); // images is a directory in the Azure container
        return res.json(file);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const uploadFileToBlob = async (directoryPath, file) => {
 
    return new Promise((resolve, reject) => {
 
        const blobName = getBlobName(file.originalname);
        const stream = getStream(file.buffer);
        const streamLength = file.buffer.length;
 
        const blobService = azureStorage.createBlobService(azureStorageConnectionString); 
        
        const containerOptions = {
            publicAccessLevel: 'blob'
        };

        blobService.createContainerIfNotExists(containerName,containerOptions, (error, result) => {

            if(error) {
                console.log(error);
                throw error;
            }

            blobService.createBlockBlobFromStream(containerName, `${directoryPath}/${blobName}`, stream, streamLength, (err,result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve({ filename: blobName, 
                        originalname: file.originalname, 
                        size: streamLength, 
                        path: `${containerName}/${directoryPath}/${blobName}`,
                        url: `${azureBlobUrl}${containerName}/${directoryPath}/${blobName}` });
                }
            });
        });
    });
};

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
        res.send("hello world");
    });
    
    app.get('/upload', function (req, res) {
        res.send(
        '<form action="/upload" method="post" enctype="multipart/form-data">' +
        '<input type="file" name="uploadedFile" />' +
        '<input type="submit" value="Upload" />' +
        '</form>'
        );
    });
    app.post('/upload', singleFileUpload.single('uploadedFile'), uploadFile)
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