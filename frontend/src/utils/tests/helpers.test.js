import { mockCollections } from '../../mocks/test-mocks';
import {
  filterDefaultCollection,
  switchObjectInObject,
  switchObjectValueInArray,
  switchUniqueValueInArray,
} from '../helpers';

describe('filterDefaultCollection', function() {

  it('should return an empty array if collections is not Array type', function() {
    const collections = {};
    const filteredObject = filterDefaultCollection(collections);
    expect(Array.isArray(filteredObject)).toBeTruthy();
    expect(filteredObject).toHaveLength(0);

    const filteredString = filterDefaultCollection('collections');
    expect(Array.isArray(filteredString)).toBeTruthy();
    expect(filteredString).toHaveLength(0);
  });

  it('should return filtered collections as Array w/o "Default collections"', function() {
    const notDefaultCollections = [
      {
        "name": "Test Collection",
        "token": "test_collection",
      },
      {
        "name": "Red Collection",
        "token": "red_collection",
      },
    ];
    const collections = mockCollections.concat(notDefaultCollections);

    const filtered = filterDefaultCollection(collections);
    expect(Array.isArray(filtered)).toBeTruthy();
    expect(filtered).toHaveLength(notDefaultCollections.length);
  });

  it('should return filtered array if "token" is not exists', function() {
    const notDefaultCollections = [
      {
        "name": "Test Collection",
      }, {
        "name": "Red Collection",
      }, {
        "name": "Blue Collection",
      },
    ];
    const defaultCollection = [{
      "name": "Default Collection",
    }, {
      "name": "Default Collection",
    }];

    const filtered = filterDefaultCollection(notDefaultCollections.concat(defaultCollection));
    expect(filtered).toHaveLength(notDefaultCollections.length);
  });
});


describe('switchUniqueValueInArray', function() {


  const onAdd = jest.fn();
  const onDelete = jest.fn();

  it('should trow an Error if receive not Array type first argument', function() {

    expect(() => switchUniqueValueInArray({}, 4)).toThrowError();
  });

  it('should remove item if it exists in array', function() {

    const testArray = [1, 2, 4, 6, 7, 8];
    const withoutFirst = testArray.slice(1);

    expect(switchUniqueValueInArray(testArray, testArray[0])).toHaveLength(testArray.length - 1);
    expect(switchUniqueValueInArray(testArray, testArray[0])).toEqual(withoutFirst);
  });
  it('should add item if it NOT exists in array', function() {

    const UNIQUE = 10;

    const testArray = [2, 4, 6, 7, 8];
    const withOne = testArray.concat(UNIQUE);

    expect(switchUniqueValueInArray(testArray, UNIQUE)).toHaveLength(testArray.length + 1);
    expect(switchUniqueValueInArray(testArray, UNIQUE)).toEqual(withOne);
  });

  it('should call onAdd method if it is exists on adding item to array', function() {
    const UNIQUE = 10;

    const testArray = [2, 4, 6, 7, 8];
    switchUniqueValueInArray(testArray, UNIQUE, onAdd, onDelete);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete method if it is exists on adding item to array', function() {

    const testArray = [2, 4, 6, 7, 8];
    switchUniqueValueInArray(testArray, testArray[2], onAdd, onDelete);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should not call onAdd if nothing was added', function() {
    const testArray = [2, 4, 6, 7, 8];
    switchUniqueValueInArray(testArray, testArray[2], onAdd, onDelete);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should not call onDelete if nothing was deleted', function() {
    const UNIQUE = 10;

    const testArray = [2, 4, 6, 7, 8];
    switchUniqueValueInArray(testArray, UNIQUE, onAdd, onDelete);
    expect(onDelete).not.toHaveBeenCalled();
  });

});


describe('switchObjectValueInArray', function() {

  it('should throw an error if firs argument is not an Array type', function() {
    expect(() => switchObjectValueInArray({}, 4)).toThrowError();
  });

  it('should add object to array if it is not present in array', function() {
    const array = [{ a: 3, b: 3 }];
    const object = { b: 2, c: [2, 3, 4] };

    expect(switchObjectValueInArray(array, object)).toEqual(array.concat(object));
  });

  it('should delete from array if it is already exists', function() {
    const object = { b: 2, c: [2, 3, 4] };
    const array = [{ a: 3, b: 3 }, object];
    const expectedArray = [{ a: 3, b: 3 }];

    expect(switchObjectValueInArray(array, object)).toEqual(expectedArray);
  });
});


describe('switchObjectInObject', function() {

  const EXISTING = { a: 1, b: 2 };
  const EXISTING_COPY = { a: 1, b: 2 };
  Object.freeze(EXISTING_COPY);

  it('should add assign new object to existing w/o mutations', function() {

    const key = 'c';
    const value = 3;

    expect(switchObjectInObject(EXISTING, key, value)).toEqual({ ...EXISTING, c: 3 });
    expect(EXISTING).toEqual(EXISTING_COPY);
  });

  it('should remove key from object w/o mutations', function() {
    const keyForDelete = 'b';
    expect(switchObjectInObject(EXISTING, keyForDelete)).toEqual({ a: 1 });
    expect(EXISTING).toEqual(EXISTING_COPY);
  });

  it('should return not modified object if input object is null or not object type', function() {

    const input = null;
    expect(switchObjectInObject(input, 'key', 'value')).toEqual(input);
  });
});
