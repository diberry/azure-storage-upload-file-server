const getStream = require('into-stream');
const azureStorage = require('azure-storage');

// Azure Storage Node.js documentation
// http://azure.github.io/azure-storage-node/FileService.html

// environment variables
const azureStorageConnectionString = process.env.AZURESTORAGE;
const azureBlobUrl = process.env.AZUREBLOBURL;

if(!azureStorageConnectionString) throw("azureStorageConnectionString is empty");

const queueService = azureStorage.createQueueService(azureStorageConnectionString); 
const blobService = azureStorage.createBlobService(azureStorageConnectionString); 


// file name format in Azure `{{GUID}}-originalfilename`
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};

// queue name is same as blob container
const addMessageToQueue = async (queueName, messageText)=>{

    

    return new Promise(function(resolve, reject) {
        
        const normalizedQueueName = `${queueName}-upload`.toLowerCase();
        console.log(`queue = ${normalizedQueueName}`);

        if(typeof messageTest === 'undefined'){
            messageText = JSON.stringify(messageText);
        } 

        queueService.createQueueIfNotExists(normalizedQueueName, error =>{

            if (error) return reject(error);

            const messageOptions = undefined;

            queueService.createMessage(
                normalizedQueueName,
                messageText,
                messageOptions,
                (error, result) => {

                if (error) return reject(error);
                return resolve(result);
                
            });

        });
    });
}


const uploadFileToBlob = async (container, directory, file, instructions, messaging) => {
 
    try{
    return new Promise((resolve, reject) => {
 
        const blobName = getBlobName(file.originalname);
        const stream = getStream(file.buffer);
        const streamLength = file.buffer.length;

        if(!blobName || !streamLength) throw ("can't find file info");

        container = container.toLowerCase();
        directory = directory.toLowerCase();

        if(!container || !directory) throw ("can't find container and directory names");
 
        console.log(`container = ${container}`);
        console.log(`directory = ${directory}`);
        
        const containerOptions = {
            publicAccessLevel: 'blob'
        };

        blobService.createContainerIfNotExists(container,containerOptions, async (error, result) => {

            if(error) {
                console.log(error);
                throw error;
            }

            blobService.createBlockBlobFromStream(container, `${directory}/${blobName}`, stream, streamLength, async (err,result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {

                    let message = { 
                        filename: blobName, 
                        originalname: file.originalname, 
                        size: streamLength, 
                        path: `${container}/${directory}/${blobName}`,
                        url: `${azureBlobUrl}${container}/${directory}/${blobName}`,
                        messaging: messaging,
                        instructions: instructions,
                        blobResults: result,
                        queueResults: undefined,
                        result: result
                    };

                    if(messaging){

                        message.queueResults = await addMessageToQueue(container, message);
                    }

                    console.log(JSON.stringify(message));

                    resolve(message);
                }
            });
        });
    });
    } catch (err){
        next(err);
    }
};
 
const uploadFile = async(req, res, next) => {
    try {

        const instructions = req.body;
        let messaging = false;
        let response = undefined;

        if (!req.file) return res.json({error: 'no file found'});

        if (req.app.config.messages.enabled){
            messaging = true;
            console.log(`messaging = ${messaging}`)
        }

        const directory = req.body.directory; 
        const container = req.body.container;

        response = await uploadFileToBlob(container, directory, req.file, instructions, messaging); 

        return res.json(response);

    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    uploadFile:uploadFile
}