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

## How it works

Node.js express server receives file and streams to Azure Blob Storage. ExpressJS server doesn't need to have significant storage but it should have memory sufficient to handle streaming. 

