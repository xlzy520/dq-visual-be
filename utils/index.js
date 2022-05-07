const filterParams = (params) => {
  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = params[key];
    if (!value) {
      delete params[key];
    }
  }
  return params;
};

const search = (params = [], item) => {
  return params.every((p) => {
    return new RegExp(p).test(item[p]);
  });
};

module.exports = {
  filterParams,
  search,
};
