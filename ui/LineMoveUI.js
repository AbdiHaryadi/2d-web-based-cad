class LineMoveUI {
  constructor(canvas) {
    this._canvas = canvas;
    this._callbackFunctions = {
      moveStarted: [],
      lineMoved: [],
      moveEnded: [],
      moveAborted: [],
    };

    this.reset();

    this._mouseDownEventListener = (event) => {
      if (!this._moving) {
        this._chosen_point = this._getNewPointFromMouseEvent(event);
        this._fireEvent("moveStarted", null);
      } else {
        if (this._end_point == null) {
          this._fireEvent("moveAborted", null);
        } else {
          this._fireEvent(
            "moveEnded",
            new Line(
              this._start_point,
              this._end_point,
              this._chosen_line.color.slice()
            )
          );
        }
        this.reset();
      }
    };

    this._mouseMoveEventListener = (event) => {
      if (this._moving) {
        this._end_point = this._getNewPointFromMouseEvent(event);
        this._fireEvent("lineMoved", null);
      }
    };
  }

  reset() {
    this._moving = false;
    this._chosen_line = null;
    this._chosen_point = null;
    this._start_point = null;
    this._end_point = null;
  }

  getLine(objectList) {
    let pointChosen = this._chosen_point;
    let tolerance = 0.02;
    for (var i = objectList.length - 1; i >= 0; i--) {
      if (objectList[i] instanceof Line) {
        if (
          objectList[i].p1.distance(pointChosen) < tolerance ||
          objectList[i].p2.distance(pointChosen) < tolerance
        ) {
          this._chosen_line = objectList[i];
          objectList[i].p1.distance(pointChosen) <
          objectList[i].p2.distance(pointChosen)
            ? ((this._end_point = objectList[i].p1),
              (this._start_point = objectList[i].p2))
            : ((this._end_point = objectList[i].p2),
              (this._start_point = objectList[i].p1));
          objectList.splice(i, 1);
          this._moving = true;
          break;
        }
      }
    }
  }

  _getNewPointFromMouseEvent(event) {
    // Return Point based on WebGL coordinate from mouse position (determined by event)
    const newX = (2 * event.offsetX) / this._canvas.width - 1;
    const newY = (-2 * event.offsetY) / this._canvas.height + 1;
    const newPoint = new Point2D(newX, newY);
    return newPoint;
  }

  listen(event, callback) {
    this._callbackFunctions[event].push(callback);
  }

  _fireEvent(event, data) {
    this._callbackFunctions[event].forEach((callback) => callback(data));
  }

  activate() {
    this._canvas.addEventListener("mousedown", this._mouseDownEventListener);
    this._canvas.addEventListener("mousemove", this._mouseMoveEventListener);
  }

  deactivate() {
    if (this._moving) this._fireEvent("moveEnded", this._chosen_line);
    this.reset();
    this._canvas.removeEventListener("mousedown", this._mouseDownEventListener);
    this._canvas.removeEventListener("mousemove", this._mouseMoveEventListener);
  }

  getHelperObjects() {
    if (this._end_point != null) {
      return [
        new Line(
          this._start_point,
          this._end_point,
          this._chosen_line.color.slice()
        ),
      ];
    } else {
      return [];
    }
  }
}
