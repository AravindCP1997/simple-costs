import { Dictionary } from "./Database";

const authenticationData = {
  object: new Dictionary("Authentication"),
  read: function () {
    const stored = this.object.load();
    const defaults = { passcode: "" };
    const result = stored === null ? defaults : stored;
    return result;
  },
  save: function (data) {
    this.object.save(data);
  },
};

export default authenticationData;
