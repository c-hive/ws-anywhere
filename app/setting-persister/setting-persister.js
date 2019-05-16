const Setting = require("../db/setting");

class SettingPersister {
  constructor(id) {
    this.id = id;

    this.copy = this.copy.bind(this);
  }

  copy(cb) {
    Setting.findById(this.id, (err, currentSettings) => {
      cb(err, currentSettings);
    });
  }

  update(data, cb) {
    Setting.findByIdAndUpdate(this.id, data, err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(err);

        return cb(err);
      }

      this.copy(cb);
    });
  }
}

module.exports = SettingPersister;
