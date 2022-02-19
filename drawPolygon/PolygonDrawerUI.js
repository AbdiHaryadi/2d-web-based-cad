class PolygonDrawerUI {
	constructor(canvas) {
		this._canvas = canvas;
		this._currentPoints = [];
		this._callbackFunctions = {
			"pointCreated": [],
			"polygonCreated": [],
			"polygonAborted": [],
		};
		this._status = "idle";
		this._epsilon = 0.05;
		
		this._mouseDownEventListener = event => {
			let newPoint;
			
			if (this._currentPoints.length === 0) {
				// Create first point and commit
				const newPoint = this._addNewPointToCurentPointsFromMouseEvent(event);
				this._fireEvent("pointCreated", newPoint);
			}
			
			if (this._status === "idle") {
				// Create new point
				this._addNewPointToCurentPointsFromMouseEvent(event);
				
			} else {
				// Continue the latest point
				this._updateLatestPointFromMouseEvent(event);
			}
			
			this._status = "movingPoint";
		};
		
		this._mouseUpEventListener = event => {
			if (this._status === "movingPoint") {
				const firstPoint = this._currentPoints[0];
				const latestPoint = this._currentPoints[this._currentPoints.length - 1];
				if (latestPoint.distance(firstPoint) < this._epsilon) {
					// Abort the latest point
					this._currentPoints.pop();
					
					if (this._currentPoints.length >= 3) {
						this._fireEvent("polygonCreated", new Polygon2D(this._currentPoints.slice()));
					} else {
						// don't build polygon
						this._fireEvent("polygonAborted", null);
					}
					
					// Clear
					this._currentPoints = [];
					this._status = "idle";
					
				} else {
					const secondLatestPoint = this._currentPoints[this._currentPoints.length - 2];
					if (latestPoint.distance(secondLatestPoint) < this._epsilon) {
						// Abort the latestPoint
						this._currentPoints.pop();
					} else {
						// Commit the latest point
						this._fireEvent("pointCreated", latestPoint);
					}
				}
			}
			
			this._status = "idle";
		};
		
		this._mouseMoveEventListener = event => {
			if (this._status === "movingPoint") {
				this._updateLatestPointFromMouseEvent(event);
			} // else: do nothing
		};
	}
	
	_getWebGLCoordinateFromMouseEvent(event) {
		// Return WebGL coordinate from mouse position (determined by event)
		const newX = 2 * event.offsetX / this._canvas.width - 1;
		const newY = -2 * event.offsetY / this._canvas.height + 1;
		return [newX, newY];
	}
	
	_addNewPointToCurentPointsFromMouseEvent(event) {
		const [newX, newY] = this._getWebGLCoordinateFromMouseEvent(event);
		const newPoint = new Point2D(newX, newY);
		this._currentPoints.push(newPoint);
		return newPoint;
	}
	
	_updateLatestPointFromMouseEvent(event) {
		// Update latest point like from mouse position (determined by event)
		const latestPoint = this._currentPoints[this._currentPoints.length - 1];
		const [newX, newY] = this._getWebGLCoordinateFromMouseEvent(event);
		latestPoint.x = newX;
		latestPoint.y = newY;
	}
	
	listen(event, callback) {
		this._callbackFunctions[event].push(callback);
	}
	
	_fireEvent(event, data) {
		this._callbackFunctions[event].forEach(callback => callback(data));
	}
	
	activate() {
		this._canvas.addEventListener("mousedown", this._mouseDownEventListener);
		this._canvas.addEventListener("mouseup", this._mouseUpEventListener);
		this._canvas.addEventListener("mousemove", this._mouseMoveEventListener);
	}
	
	deactivate() {
		this._canvas.removeEventListener("mousedown", this._mouseDownEventListener);
		this._canvas.removeEventListener("mouseup", this._mouseUpEventListener);
		this._canvas.removeEventListener("mousemove", this._mouseMoveEventListener);
	}
	
}