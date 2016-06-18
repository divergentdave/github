import assert from 'assert';
import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import {assertSuccessful} from './helpers/callbacks';
import fixtureExhausted from './fixtures/repos-ratelimit-exhausted.js';
import fixtureOk from './fixtures/repos-ratelimit-ok.js';

describe('Rate limit error', function() {
   let github;
   let user;

   before(function() {
      github = new Github();
      user = github.getUser(testUser.USERNAME);
   });

   it('should reject promise with 403 error', function() {
      const scope = fixtureExhausted();
      return user.listRepos().then(function() {
         assert.fail(undefined, undefined, 'Promise was resolved instead of rejected');
      }, function(error) {
         expect(error).to.be.an.error();
         expect(error).to.have.own('response');
         expect(error.response).to.have.own('status');
         expect(error.response.status).to.be(403);
         scope.done();
      });
   });

   it('should call callback', function(done) {
      const scope = fixtureExhausted();
      user.listRepos(assertSuccessful(done, function(error, result) {
         expect(error).to.be.an.error();
         expect(error).to.have.own('response');
         expect(error.response).to.have.own('status');
         expect(error.response.status).to.be(403);
         expect(result).is.not.a.list();
         expect(result).is.not.truthy();
         scope.done();
         done();
      }));
   });
});

describe('Rate limit OK', function() {
   let github;
   let user;

   before(function() {
      github = new Github();
      user = github.getUser(testUser.USERNAME);
   });

   it('should resolve promise', function() {
      const scope = fixtureOk();
      return expect(user.listRepos()).to.resolve.to.object().then(() => {
         scope.done();
      });
   });

   it('should call callback with array of results', function(done) {
      const scope = fixtureOk();
      user.listRepos(assertSuccessful(done, function(error, result) {
         expect(error).is.not.an.error();
         expect(error).is.not.truthy();
         expect(result).is.array();
         scope.done();
         done();
      }));
   });
});
