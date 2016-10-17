'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Mailtemplate = mongoose.model('Mailtemplate'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, mailtemplate;

/**
 * Mailtemplate routes tests
 */
describe('Mailtemplate CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Mailtemplate
    user.save(function () {
      mailtemplate = {
        name: 'Mailtemplate name'
      };

      done();
    });
  });

  it('should be able to save a Mailtemplate if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Mailtemplate
        agent.post('/api/mailtemplates')
          .send(mailtemplate)
          .expect(200)
          .end(function (mailtemplateSaveErr, mailtemplateSaveRes) {
            // Handle Mailtemplate save error
            if (mailtemplateSaveErr) {
              return done(mailtemplateSaveErr);
            }

            // Get a list of Mailtemplates
            agent.get('/api/mailtemplates')
              .end(function (mailtemplatesGetErr, mailtemplatesGetRes) {
                // Handle Mailtemplate save error
                if (mailtemplatesGetErr) {
                  return done(mailtemplatesGetErr);
                }

                // Get Mailtemplates list
                var mailtemplates = mailtemplatesGetRes.body;

                // Set assertions
                (mailtemplates[0].user._id).should.equal(userId);
                (mailtemplates[0].name).should.match('Mailtemplate name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Mailtemplate if not logged in', function (done) {
    agent.post('/api/mailtemplates')
      .send(mailtemplate)
      .expect(403)
      .end(function (mailtemplateSaveErr, mailtemplateSaveRes) {
        // Call the assertion callback
        done(mailtemplateSaveErr);
      });
  });

  it('should not be able to save an Mailtemplate if no name is provided', function (done) {
    // Invalidate name field
    mailtemplate.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Mailtemplate
        agent.post('/api/mailtemplates')
          .send(mailtemplate)
          .expect(400)
          .end(function (mailtemplateSaveErr, mailtemplateSaveRes) {
            // Set message assertion
            (mailtemplateSaveRes.body.message).should.match('Please fill Mailtemplate name');

            // Handle Mailtemplate save error
            done(mailtemplateSaveErr);
          });
      });
  });

  it('should be able to update an Mailtemplate if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Mailtemplate
        agent.post('/api/mailtemplates')
          .send(mailtemplate)
          .expect(200)
          .end(function (mailtemplateSaveErr, mailtemplateSaveRes) {
            // Handle Mailtemplate save error
            if (mailtemplateSaveErr) {
              return done(mailtemplateSaveErr);
            }

            // Update Mailtemplate name
            mailtemplate.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Mailtemplate
            agent.put('/api/mailtemplates/' + mailtemplateSaveRes.body._id)
              .send(mailtemplate)
              .expect(200)
              .end(function (mailtemplateUpdateErr, mailtemplateUpdateRes) {
                // Handle Mailtemplate update error
                if (mailtemplateUpdateErr) {
                  return done(mailtemplateUpdateErr);
                }

                // Set assertions
                (mailtemplateUpdateRes.body._id).should.equal(mailtemplateSaveRes.body._id);
                (mailtemplateUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Mailtemplates if not signed in', function (done) {
    // Create new Mailtemplate model instance
    var mailtemplateObj = new Mailtemplate(mailtemplate);

    // Save the mailtemplate
    mailtemplateObj.save(function () {
      // Request Mailtemplates
      request(app).get('/api/mailtemplates')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Mailtemplate if not signed in', function (done) {
    // Create new Mailtemplate model instance
    var mailtemplateObj = new Mailtemplate(mailtemplate);

    // Save the Mailtemplate
    mailtemplateObj.save(function () {
      request(app).get('/api/mailtemplates/' + mailtemplateObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', mailtemplate.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Mailtemplate with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/mailtemplates/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Mailtemplate is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Mailtemplate which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Mailtemplate
    request(app).get('/api/mailtemplates/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Mailtemplate with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Mailtemplate if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Mailtemplate
        agent.post('/api/mailtemplates')
          .send(mailtemplate)
          .expect(200)
          .end(function (mailtemplateSaveErr, mailtemplateSaveRes) {
            // Handle Mailtemplate save error
            if (mailtemplateSaveErr) {
              return done(mailtemplateSaveErr);
            }

            // Delete an existing Mailtemplate
            agent.delete('/api/mailtemplates/' + mailtemplateSaveRes.body._id)
              .send(mailtemplate)
              .expect(200)
              .end(function (mailtemplateDeleteErr, mailtemplateDeleteRes) {
                // Handle mailtemplate error error
                if (mailtemplateDeleteErr) {
                  return done(mailtemplateDeleteErr);
                }

                // Set assertions
                (mailtemplateDeleteRes.body._id).should.equal(mailtemplateSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Mailtemplate if not signed in', function (done) {
    // Set Mailtemplate user
    mailtemplate.user = user;

    // Create new Mailtemplate model instance
    var mailtemplateObj = new Mailtemplate(mailtemplate);

    // Save the Mailtemplate
    mailtemplateObj.save(function () {
      // Try deleting Mailtemplate
      request(app).delete('/api/mailtemplates/' + mailtemplateObj._id)
        .expect(403)
        .end(function (mailtemplateDeleteErr, mailtemplateDeleteRes) {
          // Set message assertion
          (mailtemplateDeleteRes.body.message).should.match('User is not authorized');

          // Handle Mailtemplate error error
          done(mailtemplateDeleteErr);
        });

    });
  });

  it('should be able to get a single Mailtemplate that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Mailtemplate
          agent.post('/api/mailtemplates')
            .send(mailtemplate)
            .expect(200)
            .end(function (mailtemplateSaveErr, mailtemplateSaveRes) {
              // Handle Mailtemplate save error
              if (mailtemplateSaveErr) {
                return done(mailtemplateSaveErr);
              }

              // Set assertions on new Mailtemplate
              (mailtemplateSaveRes.body.name).should.equal(mailtemplate.name);
              should.exist(mailtemplateSaveRes.body.user);
              should.equal(mailtemplateSaveRes.body.user._id, orphanId);

              // force the Mailtemplate to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Mailtemplate
                    agent.get('/api/mailtemplates/' + mailtemplateSaveRes.body._id)
                      .expect(200)
                      .end(function (mailtemplateInfoErr, mailtemplateInfoRes) {
                        // Handle Mailtemplate error
                        if (mailtemplateInfoErr) {
                          return done(mailtemplateInfoErr);
                        }

                        // Set assertions
                        (mailtemplateInfoRes.body._id).should.equal(mailtemplateSaveRes.body._id);
                        (mailtemplateInfoRes.body.name).should.equal(mailtemplate.name);
                        should.equal(mailtemplateInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Mailtemplate.remove().exec(done);
    });
  });
});
