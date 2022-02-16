class Point2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	
	getListRepr() {
		return [this.x, this.y];
	}
	
	distance(other) {
		return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
	}
	
	static getOrientation(p1, p2, p3) {
		/* Idea: find the determinant of this matrix:
		 *       [ 1   p1.x   p1.y ]
		 *       [ 1   p2.x   p2.y ]
		 *       [ 1   p3.x   p3.y ]
		 *       If the value > 0, p1, p2, and p3 make
		 *       counterclockwise orientation. Return 1.
		 *       If the value < 0, it is clockwise orientation. Return -1.
		 *       If the value = 0, it is colinear. Return 0.
		*/
		
		const signedArea = Point2D.getSignedParallelogramArea(p1, p2, p3);
		if (signedArea > 0) {
			return 1;
		} else if (signedArea < 0) {
			return -1;
		} else {
			return 0;
		}
	}
	
	static getSignedParallelogramArea(p1, p2, p3) {
		/* Idea: find the determinant of this matrix:
		 *       [ 1   p1.x   p1.y ]
		 *       [ 1   p2.x   p2.y ]
		 *       [ 1   p3.x   p3.y ]
		 *       If the value > 0, p1, p2, and p3 make
		 *       counterclockwise orientation.
		 *       If the value < 0, it is clockwise orientation.
		 *       If the value = 0, it is colinear.
		 *       The absolute value is the area.
		*/
		return (
			p2.x * p3.y - p2.y * p3.x
			- p1.x * (p3.y - p2.y)
			+ p1.y * (p3.x - p2.x)
		);
	}
}
