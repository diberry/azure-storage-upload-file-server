# File upload to Azure Blob storage

## Steps to use

1. `npm install`
1. Copy `.env.sample` and rename to `.env.` file.
1. Create Azure Storage resource.
1. Add resource values to `.env`:
    * Storage connection string
    * Storage url to construct URLs for files
    * Session secret (not currently used)
1. `npm start`
1. Open brownser to `http://localhost:3000`.
1. Select file, enter container and directory (within) container. Container and directory values are lowercased before used.
1. Submit form.
1. Open Storage Explorer or Azure portal and view resource's container and directory. Filename has a unique ID prepended to the file.

## Configure

### Blob storage

Uploads a single file to blob store.

### Queue Messaging

If messaging is enabled, the body of the form is part of the message, along with results of other operations such as create a blob.

Messaging is on by default, to disable, set  app.config.messages.enabled to `false` in **server.js**.

### Response

Response is a JSON object: 

```JSON
{
    "filename": "5347493062294617-kb.1.json",
    "originalname": "kb.1.json",
    "size": 61135,
    "path": "mycontainer-5/mydirectory-5/5347493062294617-kb.1.json",
    "url": "myresource.file.core.windows.netmycontainer-5/mydirectory-5/5347493062294617-kb.1.json",
    "messaging": true,
    "instructions": {
        "container": "myContainer-5",
        "directory": "myDirectory-5"
    },
    "blobResults": {
        "container": "mycontainer-5",
        "name": "mydirectory-5/5347493062294617-kb.1.json",
        "lastModified": "Wed, 31 Jul 2019 15:51:11 GMT",
        "etag": "\"0x8D715CEE8FAAADE\"",
        "contentLength": "0",
        "requestId": "4900fd16-401e-0013-39b7-47e233000000",
        "contentSettings": {
            "contentMD5": "88r1GLLBsrZwgL5yKDnvSQ=="
        }
    },
    "queueResults": {
        "messageId": "8118b3f4-6dd5-46f0-8743-576879624b65",
        "insertionTime": "Wed, 31 Jul 2019 15:51:11 GMT",
        "expirationTime": "Wed, 07 Aug 2019 15:51:11 GMT",
        "popReceipt": "AgAAAAMAAAAAAAAAiSPyxrdH1QE=",
        "timeNextVisible": "Wed, 31 Jul 2019 15:51:11 GMT"
    },
    "result": {
        "container": "mycontainer-5",
        "name": "mydirectory-5/5347493062294617-kb.1.json",
        "lastModified": "Wed, 31 Jul 2019 15:51:11 GMT",
        "etag": "\"0x8D715CEE8FAAADE\"",
        "contentLength": "0",
        "requestId": "4900fd16-401e-0013-39b7-47e233000000",
        "contentSettings": {
            "contentMD5": "88r1GLLBsrZwgL5yKDnvSQ=="
        }
    }
}
```

## How it works

Node.js express server receives file and streams to Azure Blob Storage. ExpressJS server doesn't need to have significant storage but it should have memory sufficient to handle streaming. 

