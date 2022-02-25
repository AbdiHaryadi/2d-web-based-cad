class PolygonDrawerUI {
  constructor(canvas) {
    this._canvas = canvas;
    this._callbackFunctions = {
      pointCreated: [],
      polygonCreated: [],
      polygonAborted: [],
      pointUpdated: [],
    };

    this._epsilon = 0.05;
    this.color = [0, 0, 0];

    this._setInitialState();

    this._mouseClickEventListener = (event) => {
      if (this._status === "waitingForStartPoint") {
        this._status = "creatingPoints";

        // Create and commit first point
        this._addNewPointToCurentPointsFromMouseEvent(event);
        this._commitLatestPoint();

        // Create second, uncommited point
        this._addNewPointToCurentPointsFromMouseEvent(event);
      } else {
        if (this._latestPointPutNearFirstPoint()) {
          this._abortLatestPoint();

          if (this._hasEnoughPointsToBuildPolygon()) {
            const newPolygon = this._createNewPolygon();
            this._setInitialState();
            this._fireEvent("polygonCreated", newPolygon);
          } else {
            this._setInitialState();
            this._fireEvent("polygonAborted", null);
          }
        } else if (!this._latestPointPutNearSecondLatestPoint()) {
          this._commitLatestPoint();
          this._addNewPointToCurentPointsFromMouseEvent(event);
        } // else: ignore that click
      }
    };

    this._mouseMoveEventListener = (event) => {
      if (this._status === "creatingPoints") {
        this._updateLatestPointFromMouseEvent(event);
      } // else: do nothing
    };
  }

  _createNewPolygon() {
    return new Polygon2D(this._currentPoints.slice(), this.color.slice());
  }

  _hasEnoughPointsToBuildPolygon() {
    return this._currentPoints.length >= 3;
  }

  _commitLatestPoint() {
    this._fireEvent(
      "pointCreated",
      this._currentPoints[this._currentPoints.length - 1]
    );
  }

  _abortLatestPoint() {
    this._currentPoints.pop();
  }

  _latestPointPutNearFirstPoint() {
    return (
      this._currentPoints[this._currentPoints.length - 1].distance(
        this._currentPoints[0]
      ) < this._epsilon
    );
  }

  _latestPointPutNearSecondLatestPoint() {
    return (
      this._currentPoints[this._currentPoints.length - 1].distance(
        this._currentPoints[this._currentPoints.length - 2]
      ) < this._epsilon
    );
  }

  _getWebGLCoordinateFromMouseEvent(event) {
    // Return WebGL coordinate from mouse position (determined by event)
    const newX = (2 * event.offsetX) / this._canvas.width - 1;
    const newY = (-2 * event.offsetY) / this._canvas.height + 1;
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
    this._fireEvent("pointUpdated", latestPoint);
  }

  listen(event, callback) {
    this._callbackFunctions[event].push(callback);
  }

  _fireEvent(event, data) {
    this._callbackFunctions[event].forEach((callback) => callback(data));
  }

  activate() {
    this._canvas.addEventListener("click", this._mouseClickEventListener);
    this._canvas.addEventListener("mousemove", this._mouseMoveEventListener);
  }

  deactivate() {
    this._canvas.removeEventListener("click", this._mouseClickEventListener);
    this._canvas.removeEventListener("mousemove", this._mouseMoveEventListener);

    const needSendAbortedMessage = this._currentPoints.length > 0;
    this._setInitialState();
    if (needSendAbortedMessage) {
      this._fireEvent("polygonAborted", null);
    }
  }

  getHelperObjects() {
    const lines = [];
    for (let i = 1; i < this._currentPoints.length; i++) {
      lines.push(
        new Line(this._currentPoints[i - 1], this._currentPoints[i], this.color)
      );
    }
    return lines;
  }

  _setInitialState() {
    this._currentPoints = [];
    this._status = "waitingForStartPoint";
  }
}
