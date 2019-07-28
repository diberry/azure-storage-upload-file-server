const request = require('supertest');


const filename = './breathe.mp3';
const route = 'uploads';
const multipartName = 'uploadFile';
const port = `3000`;
const host = `localhost`;

request(`http://${host}:${port}`)
  .post(`/${route}`)
  .attach(multipartName, filename)
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });