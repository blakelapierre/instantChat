"use strict";
function cj() {
  var state = {
    add: push,
    push: push,
    raw: [],
    typeMap: []
  };
  var $__0 = $traceurRuntime.assertObject(state),
      raw = $__0.raw,
      typeMap = $__0.typeMap;
  var UnboundedList = Symbol();
  return state;
  function push(data) {
    var typeDifference = computeTypeDifference(data, getLastInsertedType());
    if (typeDifference)
      addType(typeDifference);
    var instanceList = getInstanceList(typeDifference);
    instanceList.push(computeValueList(typeDifference, data));
  }
  function computeTypeDifference(data, type) {
    var difference = {};
    if (type === undefined) {
      if (typeof data === 'object') {
        for (var key in data) {
          difference[key] = computeTypeDifference(data[key], type);
        }
        return difference;
      }
      return '';
    }
    if (data == null) {
      for (var key in type) {
        difference[key] = false;
      }
      return difference;
    }
    if (typeof data === 'object') {
      for (var key in data) {
        var dualType = type[key];
        if (dualType) {
          var value = data[key],
              subDifference = computeTypeDifference(value, dualType);
          if (subDifference)
            difference[key] = subDifference;
        }
      }
      for (var key in type) {
        var value = data[key];
        if (value === undefined) {
          difference[key] = false;
        }
      }
      return difference;
    }
    throw 'what is this?';
  }
  function addType(typeDifference) {
    var typeID = typeMap.length;
    typeMap.push(typeDifference);
    return typeID;
  }
  function getInstanceList(typeDifference) {
    if (!typeDifference)
      return raw[raw.length - 1][1];
    var instanceList = [];
    raw.push([[typeDifference], instanceList]);
    return instanceList;
  }
  function computeValueList(typeDifference, data) {}
  function getLastInsertedType() {
    return raw.length > 0 ? raw[raw.length - 1][0] : undefined;
  }
  function toObject(compressedValue) {
    if (typeof compressedValue === 'array') {
      var typeID = compressedValue[0],
          data = compressedValue[1],
          map = typeMap[typeID],
          object = {};
      for (var i = 0; i < data.length; i++) {
        var subMap = map[i],
            key = subMap[0],
            type = subMap[1];
        object[key] = type === '' ? data[i] : toObject(data[i]);
      }
      return object;
    }
    return compressedValue;
  }
}
var cj = cj();
cj.push({name: 'blake'});
cj.push({
  name: 'blake',
  gender: 'male'
});
cj.push({
  name: 'blake',
  gender: 'male',
  birthday: '8/26/1984'
});
cj.push({
  name: 'blake',
  birthday: '8/26/1984'
});
cj.push({person: {
    name: 'blake',
    gender: 'male',
    birthday: '8/26/1984'
  }});
console.log(cj);
