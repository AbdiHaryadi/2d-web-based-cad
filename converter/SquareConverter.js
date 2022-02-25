class SquareConverter {
  static toJSON(obj) {
    return {
      type: "square",
      p1: Point2DConverter.toJSON(obj.p1),
      p2: Point2DConverter.toJSON(obj.p2),
      color: ColorConverter.toJSON(obj.color),
    };
  }

  static toDrawableObject(jsonObj) {
    return new Square(
      Point2DConverter.toDrawableObject(jsonObj.p1),
      Point2DConverter.toDrawableObject(jsonObj.p2),
      ColorConverter.toDrawableObject(jsonObj.color)
    );
  }
}
