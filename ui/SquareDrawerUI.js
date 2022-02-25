class SquareDrawerUI {
  constructor(canvas) {
    this._canvas = canvas;
    this._callbackFunctions = {
      squareCreated: [],
      startPointCreated: [],
      endPointCreated: [],
      squareAborted: [],
    };

    this._drawing = false;
    this._start_point = null;
    this._end_point = null;
    this.color = [0, 0, 0];

    this._mouseDownEventListener = (event) => {
      if (this._drawing) {
        if (this._end_point == null) {
          this._fireEvent("squareAborted", null);
        } else {
          this._fireEvent(
            "squareCreated",
            new Square(this._start_point, this._end_point, this.color.slice())
          );
        }

        this._drawing = false;
        this._start_point = null;
        this._end_point = null;
      } else {
        this._drawing = true;
        this._start_point = this._getNewPointFromMouseEvent(event);
        this._fireEvent("startPointCreated", this._start_point);
      }
    };

    this._mouseMoveEventListener = (event) => {
      if (this._drawing) {
        this._end_point = this._getNewPointFromMouseEvent(event);
        this._fireEvent("endPointCreated", this._end_point);
      }
    };
  }

  _getNewPointFromMouseEvent(event) {
    // Return Point based on WebGL coordinate from mouse position (determined by event)
    const newX = (2 * event.offsetX) / this._canvas.width - 1;
    const newY = (-2 * event.offsetY) / this._canvas.height + 1;
    return new Point2D(newX, newY);
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
    this._drawing = false;
    this._start_point = null;
    this._end_point = null;
    this._canvas.removeEventListener("mousedown", this._mouseDownEventListener);
    this._canvas.removeEventListener("mousemove", this._mouseMoveEventListener);
  }

  getHelperObjects() {
    if (this._end_point != null) {
      return [new Square(this._start_point, this._end_point, this.color)];
    } else {
      return [];
    }
  }
}
