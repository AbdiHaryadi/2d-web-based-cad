class ColorConverter {
  static toJSON(obj) {
    /* Assume obj is a list represent [r, g, b]. */
    return {
      type: "color",
      r: obj[0],
      g: obj[1],
      b: obj[2],
    };
  }

  static toDrawableObject(jsonObj) {
    return [jsonObj.r, jsonObj.g, jsonObj.b];
  }
}
