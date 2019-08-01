const request = require('supertest');
const path = require('path');
const app = require('../src/server.js');

describe('routes', () => {

    it('should get root', async (done) => {

        try{

            request(app.get())
            .get(`/`)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                }
                done();
            });
        } catch (error){
            done(error);
        }
    });

    it('should upload file', async (done) => {

        try{

            const filename = path.join(__dirname,'../assets/short.txt');
            console.log(filename);
            const multipartName = 'uploadedFile';

            const directoryName = "jest-AzureStorageBlobs-";
            const containerName = "jest-AzureStorageBlobs" + (+new Date).toString();

            request(app.get())
            .post(`/upload`)
            .set('Content-type', 'text/plain')
            .field("container", containerName)
            .field("directory", directoryName)
            .attach(multipartName, filename)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    done(err);
                }
                done();
            });
        } catch (error){
            done(error);
        }
    });
});