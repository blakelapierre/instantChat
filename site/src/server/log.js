module.exports = (router) => {
    router.post('/log', (req, res) => {
      var level = req.body.level,
          args = req.body.args;

      console.log('Got from browser:', level, args);
    });
};