class SquareResizeUI {
	constructor(canvas) {
		this._canvas = canvas;
		this._callbackFunctions = {
			"resizeStarted": [],
			"squareResized": [],
			"resizeEnded": [],
			"resizeAborted": []
		};
		
		this.reset();
		
		this._mouseDownEventListener = event => {
			if (!this._moving) {
				this._chosen_point = this._getNewPointFromMouseEvent(event);
				this._fireEvent("resizeStarted", null);
			} else {
				if (this._end_point == null) {
					this._fireEvent("resizeAborted", null);
				} else {
					this._fireEvent("resizeEnded", new Square(this._start_point, this._end_point, this._chosen_square.color.slice()));
				}
				this.reset();
			}
		};
		
		this._mouseMoveEventListener = event => {
			if (this._moving) {
				this._end_point = this._getNewPointFromMouseEvent(event);
				this._fireEvent("squareResized", null);
			}
		};
	}

	reset() {
		this._moving = false;
		this._chosen_square = null;
		this._chosen_point = null;
		this._start_point = null;
		this._end_point = null;
	}

	getSquare(objectList) {
		let pointChosen = this._chosen_point;
		let tolerance = 0.02;
		for (var i = objectList.length - 1; i >= 0; i--) {
			if (objectList[i] instanceof Square) {
				let nearestInfo = objectList[i].getNearestDistance(pointChosen);
				console.log(nearestInfo);
				if (nearestInfo[0] < tolerance) {
					this._chosen_square = objectList[i];
					this._start_point = nearestInfo[2];
					this._end_point = nearestInfo[1];
					objectList.splice(i, 1);
					this._moving = true;
					break;
				}
			}
		}
	}
	
	_getNewPointFromMouseEvent(event) {
		// Return Point based on WebGL coordinate from mouse position (determined by event)
		const newX = 2 * event.offsetX / this._canvas.width - 1;
		const newY = -2 * event.offsetY / this._canvas.height + 1;
		const newPoint = new Point2D(newX, newY);
		return newPoint;
	}
	
	listen(event, callback) {
		this._callbackFunctions[event].push(callback);
	}
	
	_fireEvent(event, data) {
		this._callbackFunctions[event].forEach(callback => callback(data));
	}
	
	activate() {
		this._canvas.addEventListener("mousedown", this._mouseDownEventListener);
		this._canvas.addEventListener("mousemove", this._mouseMoveEventListener);
	}
	
	deactivate() {
		this._fireEvent("resizeEnded", this._chosen_square);
		this.reset();
		this._canvas.removeEventListener("mousedown", this._mouseDownEventListener);
		this._canvas.removeEventListener("mousemove", this._mouseMoveEventListener);
	}
	
	getHelperObjects() {
		if (this._end_point != null) {
			return [new Square(this._start_point, this._end_point, 
				this._chosen_square.color.slice())];
		} else {
			return [];
		}
	}
}