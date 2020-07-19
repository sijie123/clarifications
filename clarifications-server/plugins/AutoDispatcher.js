const db = require('../util/db.js');
const config = require('../config.js')

class AutoDispatcher {
  constructor(PubSub) {
    PubSub.subscribe('NEW_THREAD', this.dispatch);
  }

  dispatch(msg, thread) {
    console.log(`New thread with ID ${thread.id} created. Automatically granting access to ${thread.isLogistics ? config.autoDispatcher.logisticsCommittee : config.autoDispatcher.scientificCommittee}.`);
    db.none("INSERT INTO threadsaccess VALUES($1, $2)", [thread.id, thread.isLogistics ? config.autoDispatcher.logisticsCommittee : config.autoDispatcher.scientificCommittee]);
  }
}

module.exports = AutoDispatcher;