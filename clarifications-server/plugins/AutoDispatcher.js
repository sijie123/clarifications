const db = require('../util/db.js');

class AutoDispatcher {
  constructor(PubSub) {
    PubSub.subscribe('NEW_THREAD', this.dispatch);
  }

  dispatch(msg, thread) {
    console.log(`New thread with ID ${thread.id} created. Automatically granting access to ${thread.isLogistics ? 'VOL' : 'ITC'}.`);
    db.none("INSERT INTO threadsaccess VALUES($1, $2)", [thread.id, thread.isLogistics ? 'VOL' : 'ITC']);
  }
}

module.exports = AutoDispatcher;