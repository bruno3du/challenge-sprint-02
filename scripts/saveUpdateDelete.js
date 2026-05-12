const save = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const get = (key) => {
  return JSON.parse(window.localStorage.getItem(key));
};

const saveBulk = (key, value) => {
  window.localStorage.setItem(
    key,
    JSON.stringify([...(get(key) || []), ...value]),
  );
};

const remove = (key) => {
  window.localStorage.removeItem(key);
};

const clear = () => {
  window.localStorage.clear();
};
