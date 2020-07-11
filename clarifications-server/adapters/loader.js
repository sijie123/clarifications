const config = require('../config.js');

let loadedAdapters = {}
for(let adapterName in config.adapters) {
  let adapterFile = config.adapters[adapterName];
  try {
    let Adapter = require(`./${adapterFile}/main.js`);
    loadedAdapters[adapterName] = Adapter;
    console.log(`Loaded adapter: ${adapterName}`);
  } catch (e) {
    console.error(`Failed to load adapter: ${adapterName}. Error: ${e}`);
  }
}

module.exports = loadedAdapters