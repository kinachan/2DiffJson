
const isJsonFormat = (string) => {
  if (/^[\],:{}\s]*$/.test(string.replace(/\\["\\\/bfnrtu]/g, '@').
  replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
  replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
    return true;
  }
  return false;
}

const onPaste = () => {
  setTimeout(() => {
    successFunction();
  }, 500);
}

const toObject = (string) => {
  const keyRegex = new RegExp(/(\s{1})([a-zA-Z]*)(:)/, 'g');
  const valueRegex = new RegExp(/(:)(\s)(')(.*)(')/, 'g');
  const lastCommaRegex = new RegExp(/(})(,)(\n)(\s*)(]|})(,)/, 'g');
  string = string.replace(keyRegex, `$1"$2"$3`);
  string = string.replace(valueRegex, `$1$2"$4"`);
  string = string.replace(lastCommaRegex, `$1$3$4$5`);

  return JSON.parse(string);
}

const validError = (data, name) => {
  const targetElement = name === 'jsonAFieldError' ? jsonAFieldError : jsonBFieldError;
  if (!data.result) {
    targetElement.classList.add('visible');
    return false;
  }
  targetElement.classList.remove('visible');
  return true;
}

const isEmptyObject = (obj) => Object.keys(obj).length === 0;

const createHtmlElement = (data) => {
  let childElement = '';
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (isObject(value)) {
      childElement += `<h6>${key}</h6>`
      childElement += `<ul>${createHtmlElement(data[key])}</ul>`;
    } else {
      const isOld = key === 'oldVal';
      const label = isOld ? '旧' : '新';

      const newClass = isOld ? 'oldval' : 'newval'
      childElement += `<li class="${newClass}">${label}：${data[key]}</li>`
    }
  });
  return childElement;
}

const createHtmlElements = (data) => {
  const elementBody  = isEmptyObject(data) ? '差分はありません' : createHtmlElement(data);
  const element = `
  <ul>
    ${elementBody}
  </ul>  
  `;
  list.innerHTML = element;
};

const JSONTryParse = (string) => {
  try {
    const object = JSON.parse(string);
    return object;
  } catch(e) {
    return null;
  }
}


const canChangeFormat = (value) => {
  if (value === '' ) return {result: false, value: null }

  if (!isJsonFormat(value)) {
    // if (isObject(toObject(value))) {
    //   return {result: true, value: value}
    // }
    return {result: false, value: null};
  }
  const json = JSONTryParse(value);
  return {result: json !== null, value: json};
}

const successFunction = () => {
  const aValue = jsonField.value;
  const bValue = jsonBField.value;

  const formatAValue = canChangeFormat(aValue);
  const formatBValue = canChangeFormat(bValue);

  if (!validError(formatAValue, 'jsonAFieldError') || 
    !validError(formatBValue, 'jsonBFieldError')) {
    return;
  }

  const result = diffJson(formatAValue.value, formatBValue.value);
  console.log(result);
  createHtmlElements(result);
}

const jsonField = document.getElementById('JSONAField');
const jsonBField = document.getElementById('JSONBField');
const jsonAFieldError = document.getElementById('jsonAFieldError');
const jsonBFieldError = document.getElementById('jsonBFieldError');
const list = document.getElementById('list');

jsonField.addEventListener('change', e => {
  onPaste(e, jsonAFieldError);
});

jsonBField.addEventListener('change', e => {
  onPaste(e, jsonBFieldError);
});