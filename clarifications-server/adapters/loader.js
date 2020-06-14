const config = require('../config.js');

let loadedAdapters = {}
config.adapters.forEach(adapterName => {
  try {
    let Adapter = require(`./${adapterName}/main.js`);
    loadedAdapters[adapterName] = Adapter;
    console.log(`Loaded adapter: ${adapterName}`);
  } catch (e) {
    console.error(`Failed to load adapter: ${adapterName}. Error: ${e}`);
  }
})

module.exports = loadedAdapters