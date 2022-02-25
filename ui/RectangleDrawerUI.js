class RectangleDrawerUI {
  constructor(canvas) {
    this._canvas = canvas;
    this._callbackFunctions = {
      rectangleCreated: [],
    };

    this._drawing = false;
    this._vertexStart = null;
    this._vertexEnd = null;
    this.color = [0, 0, 0];

    this._mouseClickEventListener = (event) => {
      if (this._drawing) {
        this._vertexEnd = this._getNewPointFromMouseEvent(event);
        if (!this._vertexStart.equals(this._vertexEnd)) {
          this._drawing = false;
          this._fireEvent(
            "rectangleCreated",
            new Rectangle(
              this._vertexStart,
              this._vertexEnd,
              this.color.slice()
            )
          );
        }
      } else {
        this._drawing = true;
        this._vertexStart = this._getNewPointFromMouseEvent(event);
        this._drawing = true;
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
    this._canvas.addEventListener("click", this._mouseClickEventListener);
  }

  deactivate() {
    this._canvas.removeEventListener("click", this._mouseClickEventListener);
  }

  getHelperObjects() {
    return [];
  }
}
