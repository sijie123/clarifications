const config = require('../config.js');
const PubSub = require('pubsub-js');

config.plugins.forEach(pluginName => {
  try {
    let Plugin = require(`./${pluginName}.js`);
    let p = new Plugin(PubSub);
    console.log(`Loaded plugin: ${pluginName}`);
  } catch (e) {
    console.error(`Failed to load plugin: ${pluginName}. Error: ${e}`);
  }
})

const publishThread = (thread) => {
  PubSub.publish("NEW_THREAD", thread);
}

const publishMessage = (message) => {
  PubSub.publish("NEW_MESSAGE", message);
}

module.exports = {
  publishThread: publishThread,
  publishMessage: publishMessage
}