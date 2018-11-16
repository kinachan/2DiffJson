
const isObject = any => typeof any === 'object' && any !== null && !Array.isArray(any);
const setCompareObject = (a, b, key, object) => {
  object[key] = {
    oldVal: a[key] || null,
    newval: b[key] || null,
  };
};

const isNeedDeleteProp = (result, object, key) => {
  if (Object.keys(result).length === 0) {
    delete object[key];
  }
};

const checkNewProperty = (a, b, object) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  bKeys.forEach((bKey) => {
    if (aKeys.includes(bKey)) return;
    setCompareObject(a, b, bKey, object);
  });
};

let compareArray; // ESLintのエラー避けとして変数をここに定義している。

const compareValue = (a, b, key) => () => a[key] === b[key];
const isDiffValue = (isObj, isArr, compareFunc) => {
  return !isObj && !isArr && !compareFunc();
};

const compareObject = (a, b = {}, object = {}) => {
  const aKeys = Object.keys(a);
  checkNewProperty(a, b, object);

  aKeys.forEach((key) => {
    const item = a[key];
    const bItem = b[key];

    const isObj = isObject(item);
    const isArr = Array.isArray(item);

    if (isObj) {
      object[key] = {};
      const result = compareObject(item, bItem, object[key], key);
      isNeedDeleteProp(result, object, key);
    }

    if (isArr) {
      object[key] = {};
      const result = compareArray(item, bItem, object[key], key);
      isNeedDeleteProp(result, object, key);
    }
    if (isDiffValue(isObj, isArr, compareValue(a, b, key))) {
      setCompareObject(a, b, key, object);
    }
  });
  return object;
};

compareArray = (a, b = [], object = {}) => {
  a.forEach((aItem, i) => {
    const bItem = b[i];
    const isObj = isObject(aItem);
    const isArr = Array.isArray(aItem);

    if (isObj) {
      object[i.toString()] = {};
      const result = compareObject(aItem, bItem, object[i], i);
      isNeedDeleteProp(result, object, i);
    }
    if (isArr) {
      object[i] = {};
      const result = compareArray(aItem, bItem, object, i);
      isNeedDeleteProp(result, object, i);
    }
    if (isDiffValue(isObj, isArr, compareValue(a, b, i))) {
      setCompareObject(a, b, i, object);
    }
  });
  return object;
};

const diffJson =  (a, b) => {
  if (a == null || b == null) {
    return null;
  }
  if (isObject(a)) {
    return compareObject(a, b, {});
  }
  if (Array.isArray(a)) {
    return compareArray(a, b, []);
  }
  return null;
};
