module.exports = ['$resource', $resource => {
  const {location} = window,
        {protocol, hostname} = location,
        stats = $resource(`${protocol}//${hostname}:3002/stats`);

  console.log(location);

  return stats;
}];