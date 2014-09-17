/*
[[{

}],[
  0, // type/revision#
  [
    'field0 data',
    'field1 data'
  ]
]]

// type/revision# is implicit in ordering
[{
  $metaField: {},

}]


// Default, that is, with no fields defined in the type, is the
// 'unbounded list', type
//
// They also omit the type/revision# identifier and only contain the value list
//
// Multiple types may be defined.
// They are referenced, where x is the global type identifier, as:
//    x = x.0
//    x.1
//    x.2, etc
[[{

},{

}],
[
  [
    'value1',
    1
  ]
]]

[
  [
    [{name: ''}],
    [
      [0, ['blake']],
      [0, ['blake']]
    ],
  [
    [{gender: ''}],
    [
      [1, ['blake', 'male']],
      [1, ['blake', 'male']],
      [0, ['blake']],
    ]
  [
    [{birthday: 'date'}],
    [
      [2, ['blake', 'male', '8/26/1984']]
    ],
  [
    [{gender: false}],
    [
      [3, ['blake', '8/26/2984']]
    ]
  ],
  [
    [{name: false, birthday: false, person: {name: '', gender: '', birthday: ''}}],
    [
      [4, [[2, ['blake', 'male', '8/26/1984']]]]
    ]
  ]
]


typemap

[0, [['name', '']]]
[1, [['name', ''], ['gender', '']]]
[2, [['name', ''], ['gender', ''], ['birthday', '']]]
[3, [['name', ''], ['birthday', '']]]
[4, [['person', 2]]]

UnboundedList
TypeDefinition
ValueList
*/

function cj() {
  var state = { // rename?
    add: push,
    push: push,

    raw: [], // The persistent representation of the object/state/whatever this is
    typeMap: []
  };

  var {raw, typeMap} = state;

  var UnboundedList = Symbol();

  return state;

  function push(data) {
    var typeDifference = computeTypeDifference(data, getLastInsertedType());
    if (typeDifference) addType(typeDifference);
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
      return ''; // ?
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

          if (subDifference) difference[key] = subDifference;
        }
      }

      for (var key in type) {
        var value = data[key];

        if (value === undefined) {
          // was removed
          difference[key] = false;
        }
      }

      return difference;
    }

    throw 'what is this?';
  }

  // A type is a list of (name, type) pairs
  // [ ['name', ''], ['gender', ''] ]
  // [ ['person', 0] ]
  function addType(typeDifference) {
    var typeID = typeMap.length;
    typeMap.push(typeDifference);
    return typeID;
  }

  function getInstanceList(typeDifference) {
    if (!typeDifference) return raw[raw.length - 1][1];

    var instanceList = [];

    raw.push([[typeDifference], instanceList]);

    return instanceList;
  }

  function computeValueList(typeDifference, data) {
    //if (typeDifference )
  }

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



// [[{typeDefintion}typeDefinitions], [[valueList]instanceList]]


var cj = cj();

cj.push({name: 'blake'});
cj.push({name: 'blake', gender: 'male'});
cj.push({name: 'blake', gender: 'male', birthday: '8/26/1984'});
cj.push({name: 'blake', birthday: '8/26/1984'});
cj.push({person: {name: 'blake', gender: 'male', birthday: '8/26/1984'}});

console.log(cj);