module.exports = ['localStorageService', (storage) => {
  var identityKey = 'identity',
      identity = storage.get(identityKey);

  if (!isValid(identity)) {
    // handle failure cases?!

    identity = createIdentity();
    storage.put(identityKey, identity);
  }

  function isValid(identity) {
    return identity !== undefined; // need something better here
  }

  function createIdentity() {
    return {};
  }

  function getIdentity() {
    return identity;
  }

  return { getIdentity };
}];