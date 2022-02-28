class MoverUI {
    constructor(canvas) {
      this._canvas = canvas;
      this._callbackFunctions = {
        moveStarted: [],
        moved: [],
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
              new Polygon2D(
                  this.getHelperArrays(),
                  this._chosen_object.color.slice()
              )
            );
          }
          this.reset();
        }
      };
  
      this._mouseMoveEventListener = (event) => {
        if (this._moving) {
          this._end_point = this._getNewPointFromMouseEvent(event);
          this._fireEvent("moved", null);
        }
      };
    }
  
    reset() {
      this._moving = false;
      this._chosen_object = null;
      this._chosen_point = null;
      this._start_point = null;
      this._end_point = null;
    }

    getObject(objectList) {
        let pointChosen = this._chosen_point;
        let tolerance = 0.02;
        for (var i = objectList.length - 1; i >= 0; i--) {
            if (!(objectList[i] instanceof Line)) {
              let nearestInfo = objectList[i].getNearestDistance(pointChosen);
              if (nearestInfo[0] < tolerance) {
                this._chosen_object = objectList[i];
                this._end_point = nearestInfo[1];
                this._start_point = nearestInfo[1];
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
      if (this._moving) this._fireEvent("moveEnded", this._chosen_object);
      this.reset();
      this._canvas.removeEventListener("mousedown", this._mouseDownEventListener);
      this._canvas.removeEventListener("mousemove", this._mouseMoveEventListener);
    }

    getHelperArrays() {
        var points = this._chosen_object.getPoints();
        points[points.indexOf(this._start_point)] = this._end_point;
        return points;
    }
  
    getHelperObjects() {
      if (this._end_point != null) {
        return [
          new Polygon2D(
            this.getHelperArrays(),
            this._chosen_object.color.slice()
          ),
        ];
      } else {
        return [];
      }
    }
  }
  