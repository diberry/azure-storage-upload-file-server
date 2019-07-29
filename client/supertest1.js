const request = require('supertest');


const filename = './pepper.jpg';
const route = 'upload';
const multipartName = 'uploadedFile';
const port = `3000`;
const host = `localhost`;

request(`http://${host}:${port}`)
  .post(`/${route}`)
  .attach(multipartName, filename)
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
    console.log(res.statusCode);
    console.log(JSON.stringify(res));
  });