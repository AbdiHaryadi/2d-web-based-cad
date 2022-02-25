class Point2DConverter {
  static toJSON(obj) {
    return {
      type: "point2d",
      x: obj.x,
      y: obj.y,
    };
  }

  static toDrawableObject(jsonObj) {
    return new Point2D(jsonObj.x, jsonObj.y);
  }
}
