class RectangleConverter {
	static toJSON(obj) {
		return {
			type: "rectangle",
			p1: Point2DConverter.toJSON(obj.v1),
			p2: Point2DConverter.toJSON(obj.v2),
			color: ColorConverter.toJSON(obj.color),
		}
	}
	
	static toDrawableObject(jsonObj) {
		return new Rectangle(
			Point2DConverter.toDrawableObject(jsonObj.p1),
			Point2DConverter.toDrawableObject(jsonObj.p2),
			ColorConverter.toDrawableObject(jsonObj.color)
		);
	}
}