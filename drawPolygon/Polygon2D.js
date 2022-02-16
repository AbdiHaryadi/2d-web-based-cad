class Polygon2D {
	constructor(points, color) {
		// Assume points is more than 2
		// Points does not make self-intersection Polygon2D
		this._points = points.slice(); // copy the list
		if (color) { // defined
			this._color = color;
		} else {
			console.log(color);
			this._color = new Color(0, 0, 0);
		}
		
	}
	
	_getConvexHullPoints() {
		function getLeftConvexHullPointsAccumulate(points, p1, p2) {
			const selectedPoints = points.filter(p3 =>
				// p1 -> p2 -> p3 must make counterclockwise to be true
				Point2D.getSignedParallelogramArea(p1, p2, p3) > 0
			);
			
			let i;
			if (selectedPoints.length == 0) {
				return [];
				
			} else {
				let leftFarthestPoint = null;
				let maxArea = -1;
				for (const p3 of selectedPoints) {
					let currentArea = Point2D.getSignedParallelogramArea(p1, p2, p3);
					
					if (maxArea < currentArea) {
						leftFarthestPoint = p3;
						maxArea = currentArea;
					}
				}
				
				const result = getLeftConvexHullPointsAccumulate(
					selectedPoints, p1, leftFarthestPoint);
					
				result.push(...getLeftConvexHullPointsAccumulate(
					selectedPoints, leftFarthestPoint, p2));
				result.push(leftFarthestPoint);
				return result;
			}
		}
		
		const currentPoints = this._points.slice(); // copy
		currentPoints.sort((p1, p2) => p1.x - p2.x); // ordered by absis
		
		const leftestPoint = currentPoints[0];
		const rightestPoint = currentPoints[currentPoints.length - 1];
		
		const result = getLeftConvexHullPointsAccumulate(this._points, leftestPoint, rightestPoint);
		result.push(...getLeftConvexHullPointsAccumulate(this._points, rightestPoint, leftestPoint));
		result.push(leftestPoint, rightestPoint);
		
		return result;
		
	}
	
	_makeCounterClockwiseOrientation() {
		const convexHullPoints = this._getConvexHullPoints();
		
		let i1 = 0;
		let p1 = this._points[i1];
		while ((!convexHullPoints.includes(p1))) {
			// Guaranteed loop will be stop
			p1 = this._points[++i1];
		} // convexHullPoints.includes(p1)
		
		let i2 = i1 + 1;
		let p2 = this._points[i2];
		while ((!convexHullPoints.includes(p2)) && (i2 < this._points.length)) {
			p2 = this._points[++i2];
		} // convexHullPoints.includes(p2) or i2 == this._points.length
		
		if (i2 == this._points.length) {
			throw new Error("Invalid polygon! (only one convex hull point detected)");
		} // else: continue
		
		let i3 = i2 + 1;
		let p3 = this._points[i3];
		while ((!convexHullPoints.includes(p3)) && (i3 < this._points.length)) {
			p3 = this._points[++i3];
		} // convexHullPoints.includes(p3) or i3 == this._points.length
		
		if (i3 == this._points.length) {
			throw new Error("Invalid polygon! (only two convex hull points detected)");
		} // else: continue
		// const i3First = i3;
		
		let selectedOrientationValue = Point2D.getSignedParallelogramArea(p1, p2, p3);
		
		if (selectedOrientationValue == 0) {
			throw new Error("Implementation error! (orientation starts with colinear)");
		} else if (selectedOrientationValue < 0) {
			// It's clockwise. Reverse it.
			this._points.reverse();
		} // else: it's counterclockwise; do nothing.
		
		// This is a self-intersection validation
		// Needed later.
		/*
		let nextI3 = i3 + 1;
		let nextP3 = this._points[nextI3];
		while (!convexHullPoints.includes(nextP3)) {
			nextI3 = (nextI3 + 1) % this._points.length;
			nextP3 = this._points[nextI3];
		} // convexHullPoints.includes(nextP3)
		
		while (i3 != i3First) {
			// i1 = i2;
			// i2 = i3;
			i3 = nextI3;
			
			p1 = p2;
			p2 = p3;
			p3 = nextP3;
			
			let currentOrientationValue = Point2D.getOrientation(p1, p2, p3);
			
			if (currentOrientationValue != 0 && currentOrientationValue != selectedOrientationValue) {
				// do nothing
			}
			
			orientationValue += Point2D.getOrientation(p1, p2, p3);
			
			let nextI3 = i3 + 1;
			let nextP3 = this._points[nextI3];
			while (!convexHullPoints.includes(nextP3)) {
				nextI3 = (nextI3 + 1) % this._points.length;
				nextP3 = this._points[nextI3];
			} // convexHullPoints.includes(nextP3)
		
			i1 = i2;
			i2 = i3;
			i3 = nextI3;
		} // i3 == i3sFirst
		
		if (orientationValue < 0) {
			// It's counterclockwise: reverse it.
			this._points.reverse();
		} else if (orientationValue == 0) {
			// It's an error
			
		}
		*/
		
		
	}
	
	getTriangulationPoints() {
		this._makeCounterClockwiseOrientation();
		
		// Asumsikan titiknya berurutan counterclockwise dan lebih dari 2.
		let i1 = 0;
		let i2 = 1;
		let i3 = 2;
		
		let currentPoints = this._points.slice();
		let p1 = currentPoints[i1];
		let p2 = currentPoints[i2];
		let p3 = currentPoints[i3];
		
		let result = [];
		
		while (currentPoints.length > 3) {
			if (Point2D.getSignedParallelogramArea(p1, p2, p3) >= 0) {
				// Colinear or counterclockwise
				// Make sure this is "ear" triangle (a.k.a. no vertices inside it)
				let isEar = true;
				let i4 = 0;
				while (i4 < currentPoints.length && isEar) {
					if (i4 !== i1 && i4 !== i2 && i4 !== i3) {
						let p4 = currentPoints[i4];
						// Outside includes edge.
						const isOutside =
							(Point2D.getSignedParallelogramArea(p1, p2, p4) <= 0)
							|| (Point2D.getSignedParallelogramArea(p2, p3, p4) <= 0)
							|| (Point2D.getSignedParallelogramArea(p3, p1, p4) <= 0);
						isEar = isOutside;
						
					} // else: skip
					i4 += 1;
				}
				
				if (isEar) {
					result.push(p1, p2, p3);
				
					currentPoints.splice(i2, 1);
					
					i1 = i1 % currentPoints.length;
					i2 = (i1 + 1) % currentPoints.length;
					i3 = (i1 + 2) % currentPoints.length;
				} else {
					console.log(p1, p2, p3);
					i1 = (i1 + 1) % currentPoints.length;
					i2 = (i2 + 1) % currentPoints.length;
					i3 = (i3 + 1) % currentPoints.length;
				}
				
			} else {
				i1 = (i1 + 1) % currentPoints.length;
				i2 = (i2 + 1) % currentPoints.length;
				i3 = (i3 + 1) % currentPoints.length;
			}
			
			p1 = currentPoints[i1];
			p2 = currentPoints[i2];
			p3 = currentPoints[i3];
			
		} // currentPoints.length == 3
		
		if (Point2D.getSignedParallelogramArea(p1, p2, p3) >= 0) {
			result.push(p1, p2, p3);
		}
		
		return result;
	}
	
	getPoints() {
		return this._points.slice();
	}
	
	getColor() {
		return this._color;
	}
	
	setColor(color) {
		this._color = color;
	}
	
	
}