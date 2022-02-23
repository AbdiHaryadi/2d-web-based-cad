class Polygon2DConverter {
	static toJSON(obj) {
		return {
			type: "polygon2d",
			points: obj.getPoints().map(p => p.toJSON()),
			color: ColorConverter.toJSON(obj.color),
		}
	}
	
	static toDrawableObject(jsonObj) {
		return new Polygon2D(
			jsonObj.points.map(p => Point2DConverter.toDrawableObject(p)),
			ColorConverter.toDrawableObject(jsonObj.color)
		);
	}
}