import { Dictionary } from "./Database";

const accessibilityData = {
  object: new Dictionary("Accessibility"),
  read: function () {
    const stored = this.object.load();
    const defaults = { Background: "Tech", Font: "Lexend" };
    const result = stored === null ? defaults : stored;
    return result;
  },
  save: function (data) {
    this.object.save(data);
  },
};

export default accessibilityData;
