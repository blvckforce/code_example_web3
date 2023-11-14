import config from '../../config';
import { callWithTimeout, numberFieldValidation, trimNonEnglishCharacters, withPrefixAndLimitChange } from '../forms';

describe('trimNonEnglishCharacters', () => {

  it('should return value back if value is not String', function() {
    const value = [1, 2, 3];
    const _t = trimNonEnglishCharacters(value);
    expect(Array.isArray(_t)).toBeTruthy();
  });

  it(`shouldn't modify value if value is not String`, function() {
    const value = [1, 2, 3];
    const _t = trimNonEnglishCharacters(value);
    expect(_t).toStrictEqual(value);
  });


  it('should return only English and special chars and numbers', function() {
    const value = '324234k l23kjh 32gjh4 льфыдодвл!"№;%:?*()[]';
    const valueNotEng = '324234k l23kjh 32gjh4 !";%:?*()[]';

    const english = trimNonEnglishCharacters(value);
    expect(english).toEqual(valueNotEng);
  });
});

describe('withPrefixAndLimitChange', function() {

  let prefix;
  let value;
  beforeEach(() => {
    prefix = 'test';
    value = '_string';
  });

  it('should return a function, which need only one argument', function() {
    const _t = withPrefixAndLimitChange(prefix);
    expect(typeof _t === 'function').toBeTruthy();
    expect(_t.length).toBe(1);
  });


  it('should return value with prefix w/o limit', function() {
    const _value = withPrefixAndLimitChange(prefix)(value);
    expect(_value).toEqual(prefix + value);
  });

  it('should return full value with prefix and limit if string are less then limit', function() {
    const _value = withPrefixAndLimitChange(prefix, 20)(value);
    expect(_value).toEqual(prefix + value);
  });

  it('should return sub value with prefix and limit if string are longer then limit', function() {
    const limit = 8;
    const subString = (prefix + value).substring(0, limit);
    const _value = withPrefixAndLimitChange(prefix, limit)(value);
    expect(_value).toEqual(subString);
  });

  it('should return full value with prefix if limit is larger then English string length', function() {
    const limit = 20;
    const valueNonEng = value + 'фыввыавыа';

    const _value = withPrefixAndLimitChange(prefix, limit)(valueNonEng);
    expect(_value).toEqual(prefix + value);
  });
  it('should return sub value with prefix if limit is less then English string length', function() {
    const limit = 8;
    const valueNonEng = value + 'фыввыавыа';

    const subString = (prefix + value).substring(0, limit);

    const _value = withPrefixAndLimitChange(prefix, limit)(valueNonEng);
    expect(_value).toEqual(subString);
  });
});

describe('callWithTimeout', function() {

  let dummyFunc;
  let timer;

  beforeAll(() => {
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(global, 'clearTimeout');
  });

  beforeEach(() => {
    jest.useFakeTimers();
    timer = 2000;
    dummyFunc = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call setTimeout only once', function() {
    callWithTimeout(dummyFunc, 0);
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  it('should be called with params', function() {
    callWithTimeout(dummyFunc, timer);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), timer);
  });

  it('should call callback Func by timeout', function() {

    expect(dummyFunc).not.toHaveBeenCalled();
    callWithTimeout(dummyFunc, timer);
    jest.runAllTimers();
    expect(dummyFunc).toHaveBeenCalledTimes(1);
  });

  it('should should clear timeOut after callback call', function() {

    callWithTimeout(dummyFunc, timer);
    expect(clearTimeout).not.toHaveBeenCalled();

    jest.runAllTimers();
    expect(dummyFunc).toHaveBeenCalledTimes(1);
    expect(clearTimeout).toHaveBeenCalledTimes(1);
  });

});


describe('numberFieldValidation', function() {

  it('should return value if it is 0 or empty string', function() {
    const value = [0, '', 0.0000000];

    value.forEach(val => {
      expect(val).not.toBeTruthy();
      expect(numberFieldValidation(val)).toBe(val);
    });
  });

  it(`should return value if it is "Valid" number by parameters (decimals scale are not bigger then ${config.numberInputsDecimalsScale})`, function() {
    const validValues = [2, 3.999, 5.011, 0.2];
    validValues.forEach(val => {
      expect(val).toBeTruthy();
      expect(numberFieldValidation(val)).toBe(val);
    });
  });

  it(`should return Number value if it is "Valid" String by parameters (decimals scale are not bigger then ${config.numberInputsDecimalsScale})`, function() {
    const validValues = ['2', '3.999', '5.011', '0.2'];
    validValues.forEach(val => {
      expect(numberFieldValidation(val)).toBe(+val);
    });
  });

  it(`should return void if value's type is NaN`, function() {
    const values = [{}, [], () => null, new Set(), undefined, null];
    values.forEach(val => {
      expect(numberFieldValidation(val)).toBe(undefined);
    });
  });

  it('should trim "semiValid" values to decimals scale from config', function() {
    const semiValidValues = [5.0001, 1.9999999, 0.22222222, '0.222222', -0.9999999];

    semiValidValues.forEach((value) => {
      const val = +((+value).toFixed(config.numberInputsDecimalsScale).toString());
      expect(numberFieldValidation(value)).toBe(val);
    });
  });
});
