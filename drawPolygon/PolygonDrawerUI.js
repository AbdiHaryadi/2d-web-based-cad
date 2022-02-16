class PolygonDrawerUI {
	constructor(canvas) {
		this._canvas = canvas;
		this._currentPoints = [];
		this._callbackFunctions = {
			"pointCreated": [],
			"lastPointRemoved": [],
			"polygonCreated": [],
		};
		this._status = "idle";
		this._firstPoint = null;
		this._epsilon = 0.04;
		
		this._mouseDownEventListener = event => {
			if (this._status === "idle") {
				this._status = "firstPointCreated";
				const newX = 2 * event.offsetX / this._canvas.width - 1;
				const newY = -2 * event.offsetY / this._canvas.height + 1;
				const newPoint = new Point2D(newX, newY);
				this._firstPoint = newPoint;
				this._currentPoints.push(newPoint);
				this._fireEvent("pointCreated", newPoint);
				
			} else {
				this._status = "determineNewPoint";
			}
		};
		
		this._mouseUpEventListener = event => {
			if (this._status === "determineNewPoint") {
				const newX = 2 * event.offsetX / this._canvas.width - 1;
				const newY = -2 * event.offsetY / this._canvas.height + 1;
				const newPoint = new Point2D(newX, newY);
				if (newPoint.distance(this._firstPoint) < this._epsilon) {
					this._fireEvent("polygonCreated", new Polygon2D(this._currentPoints.slice()));
					this._currentPoints = [];
					this._status = "idle";
					this._firstPoint = null;
					
				} else {
					this._currentPoints.push(newPoint);
					this._fireEvent("pointCreated", newPoint);
				}
				
			} else if (this._status === "firstPointCreated") {
				this._fireEvent("lastPointRemoved", null);
				this._status = "idle";
				this._currentPoints = [];
			}
		};
		
		this._mouseMoveEventListener = event => {
			if (this._status === "firstPointCreated") {
				this._status = "determineNewPoint"
			} // else: nothing happened
		};
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