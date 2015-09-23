import openpgp from 'openpgp';

module.exports = [() => {
  const keyring = new openpgp.Keyring(),
      {publicKeys, privateKeys} = keyring;

  return { get: getIdentity, clear };

  function getIdentity(notify) {
    const {keys} = privateKeys,
          [key] = keys;

    if (key) {
      return new Promise((resolve, reject) => resolve(getFingerprint(key)));
    }
    else {
      return createIdentity(notify).then(getFingerprint);
    }

    function getFingerprint(key) { return key.primaryKey.fingerprint; }
  }

  function clear(confirm) {
    if (confirm === 'yes') {
      console.log(privateKeys);

      privateKeys.keys.splice(0, privateKeys.keys.length);
      keyring.store();
    }
  }

  function createIdentity(notify) {
    const numBits = 2048,
          userId = 'test',
          passphrase = 'some passphrase';

    notify('Generating', {numBits});

    return openpgp
      .generateKeyPair({numBits, userId, passphrase})
      .then(keypair => {
        const {key} = keypair;

        privateKeys.push(key);
        keyring.store();

        return key;
      });
  }
}];