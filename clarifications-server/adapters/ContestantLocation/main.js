const db = require('../../util/db.js');
const Jimp = require('jimp');

class ContestantLocation {
  constructor(request) {
    this.request = request;
  }

  async queryText() {
    return db.one("SELECT seatname, locationText FROM plugin_userlocation INNER JOIN plugin_seat USING (seatname) WHERE username = $1", [this.request])
      .then(result => {
        return {success: true, data: result}
      }).catch(err => {
        return {success: false, errorCode: 404, errorMessage: `Could not get seat information for user ${this.request}.`}
      })
  }

  async drawLocation(map, x1, y1, x2, y2) {
    const red = 0xFF0000FF;
    let box = await new Jimp(x2 - x1, y2 - y1, red)
    return map.blit(box, x1, y1).getBufferAsync(Jimp.MIME_JPEG);
  }

  async queryMap() {
    let result = await db.one("SELECT map, locationText, x1, y1, x2, y2 FROM plugin_seat WHERE seatname = $1", [this.request])
                         .catch(err => {
                           return {success: false, errorCode: 404, errorMessage: `Could not get seat information for user ${this.request}.`}
                         })
    if (result.success == false) return result;

    return Jimp.read(`adapters/ContestantLocation/${result['map']}.jpg`)
      .then(contestFloor => this.drawLocation(contestFloor, result['x1'], result['y1'], result['x2'], result['y2']))
      .then(mapData => {
        return {success: true, data: mapData}
      }).catch(err => {
        return {success: false, errorCode: 500, errorMessage: `Failed to render map due to error: ${err}`}
      })
  }
}

module.exports = ContestantLocation;