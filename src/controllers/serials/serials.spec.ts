import 'mocha';
let supertest = require('supertest')

describe('GET /topEpisodes', function() {
    it('responds with json', function(done) {
        supertest('http://localhost:5000')
        .get('/topEpisodes/45')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
        done();
    });
    it('responds with error message', function(done){
        supertest('http://localhost:5000')
        .get('/topEpisodes/0')
        .set('Accept', 'application/json')
        .expect(400)
        .expect('"Series Id cannot be zero or negative value"')
        done();
      });
});

