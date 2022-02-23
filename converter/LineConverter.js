class LineConverter {
	static toJSON(obj) {
		return {
			type: "line",
			p1: Point2DConverter.toJSON(obj.p1),
			p2: Point2DConverter.toJSON(obj.p2),
			color: ColorConverter.toJSON(obj.color),
		}
	}
	
	static toDrawableObject(jsonObj) {
		return new Line(
			Point2DConverter.toDrawableObject(jsonObj.p1),
			Point2DConverter.toDrawableObject(jsonObj.p2),
			ColorConverter.toDrawableObject(jsonObj.color)
		);
	}
}