
//https://arjunphp.com/express-js-upload-images-to-azure-blob-storage/

const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
const azureStorage = require('azure-storage');
const getStream = require('into-stream');
 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());
 
const azureStorageConfig = {
    accountName: "diberryassetmgrtest",
    accountKey: "",
    blobURL: "https://diberryassetmgrtest.blob.core.windows.net/",
    containerName: "arjun-server"
};
 
uploadFileToBlob = async (directoryPath, file) => {
 
    return new Promise((resolve, reject) => {
 
        const blobName = getBlobName(file.originalname);
        const stream = getStream(file.buffer);
        const streamLength = file.buffer.length;
 
        const blobService = azureStorage.createBlobService(""); 
        
        const containerOptions = {
            publicAccessLevel: 'blob'
        };

        blobService.createContainerIfNotExists(azureStorageConfig.containerName,containerOptions, (error, result) => {

            if(error) {
                console.log(error);
                throw error;
            }

            blobService.createBlockBlobFromStream(azureStorageConfig.containerName, `${directoryPath}/${blobName}`, stream, streamLength, (err,result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve({ filename: blobName, 
                        originalname: file.originalname, 
                        size: streamLength, 
                        path: `${azureStorageConfig.containerName}/${directoryPath}/${blobName}`,
                        url: `${azureStorageConfig.blobURL}${azureStorageConfig.containerName}/${directoryPath}/${blobName}` });
                }
            });
        });
    });
};
 
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};
 
const imageUpload = async(req, res, next) => {
    try {
        const image = await uploadFileToBlob('images', req.file); // images is a directory in the Azure container
        return res.json(image);
    } catch (error) {
        console.log(error);
        next(error);
    }
}
 
app.post('/upload/image', singleFileUpload.single('image'), imageUpload)
 
 
app.listen(port, () => console.log(`Example app listening on port ${port}!`))