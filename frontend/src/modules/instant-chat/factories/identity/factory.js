import openpgp from 'openpgp';

module.exports = [() => {
  console.log(openpgp);
  var keyring = new openpgp.Keyring(),
      {publicKeys, privateKeys} = keyring;

  console.log(publicKeys, privateKeys);


  let identity;

  if (privateKeys.keys.length > 0) identity = privateKeys.keys[0];

  if (!isValid(identity)) {
    // handle failure cases?!
    identity = createIdentity();
  }

  function isValid(identity) {
    return identity !== undefined; // need something better here
  }

  function createIdentity() {
    console.log('Generating PGP Key!');
    return openpgp
      .generateKeyPair({
        numBits: 2048,
        userId: 'test',
        passphrase: 'some passphrase'
      })
      .then(keypair => {
        console.log(publicKeys, privateKeys);
        console.log(keypair);
        identity = keypair.key;
        privateKeys.push(identity);
        keyring.store();
        console.log('identity', identity);
        return identity;
      });
  }

  function getIdentity() {
    if (identity) {
      return new Promise((resolve, reject) => resolve(identity.primaryKey.fingerprint));
    }
    else {
      return createIdentity().then(identity => { return identity.primaryKey.fingerprint; });
    }
  }

  return { getIdentity };
}];