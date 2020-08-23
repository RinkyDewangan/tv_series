"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
let supertest = require('supertest');
describe('GET /topEpisodes', function () {
    it('responds with json', function (done) {
        supertest('http://localhost:5000')
            .get('/topEpisodes/45')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
        done();
    });
    it('responds with error message', function (done) {
        supertest('http://localhost:5000')
            .get('/topEpisodes/')
            .set('Accept', 'application/json')
            .expect(400)
            .expect('"No Series Id found in query params"');
        done();
    });
});
//# sourceMappingURL=serials.spec.js.map