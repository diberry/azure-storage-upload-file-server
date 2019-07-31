const getStream = require('into-stream');
const azureStorage = require('azure-storage');

// environment variables
const azureStorageConnectionString = process.env.AZURESTORAGE;
const azureBlobUrl = process.env.AZUREBLOBURL;

if(!azureStorageConnectionString) throw("azureStorageConnectionString is empty");

// file name format in Azure `{{GUID}}-originalfilename`
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};

const uploadFileToBlob = async (container, directory, file) => {
 
    return new Promise((resolve, reject) => {
 
        const blobName = getBlobName(file.originalname);
        const stream = getStream(file.buffer);
        const streamLength = file.buffer.length;

        if(!blobName || !streamLength) throw ("can't find file info");

        container = container.toLowerCase();
        directory = directory.toLowerCase();

        if(!container || !directory) throw ("can't find container and directory names");
 
        const blobService = azureStorage.createBlobService(azureStorageConnectionString); 
        
        const containerOptions = {
            publicAccessLevel: 'blob'
        };

        blobService.createContainerIfNotExists(container,containerOptions, (error, result) => {

            if(error) {
                console.log(error);
                throw error;
            }

            blobService.createBlockBlobFromStream(container, `${directory}/${blobName}`, stream, streamLength, (err,result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve({ filename: blobName, 
                        originalname: file.originalname, 
                        size: streamLength, 
                        path: `${container}/${directory}/${blobName}`,
                        url: `${azureBlobUrl}${container}/${directory}/${blobName}`,
                        result: result
                    });
                }
            });
        });
    });
};
 
const uploadFile = async(req, res, next) => {
    try {

        const directory = req.body.directory; 
        const container = req.body.container;
        const uploadResponse = await uploadFileToBlob(container, directory, req.file); 
        return res.json(uploadResponse);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    uploadFile:uploadFile
}