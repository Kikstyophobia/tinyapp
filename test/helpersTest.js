const { assert } = require('chai');

const { getUserByEmail, passwordChecker } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const userID = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(userID, expectedUserID);
  });

  it('should return false when given a non-existent email ', function() {
    const userID = getUserByEmail("testing@example.com", testUsers)
    assert.isFalse(userID);
  });
});


describe('passwordChecker', function() {
  it('checks if input password matches database password', function () {
    const inputPassword = passwordChecker("dishwasher-funk", testUsers)
    assert.isTrue(inputPassword);
  })
});
