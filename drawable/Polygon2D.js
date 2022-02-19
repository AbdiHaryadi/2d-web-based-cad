class Polygon2D {
  constructor(points, color = [0, 0, 0]) {
    // Assume points is more than 2
    // Points does not make self-intersection Polygon2D
    this._points = points.slice(); // copy the list
    this.color = color;
  }

  _getConvexHullPoints() {
    function getLeftConvexHullPointsAccumulate(points, p1, p2) {
      const selectedPoints = points.filter(
        (p3) =>
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
          selectedPoints,
          p1,
          leftFarthestPoint
        );

        result.push(
          ...getLeftConvexHullPointsAccumulate(
            selectedPoints,
            leftFarthestPoint,
            p2
          )
        );
        result.push(leftFarthestPoint);
        return result;
      }
    }

    const currentPoints = this._points.slice(); // copy
    currentPoints.sort((p1, p2) => p1.x - p2.x); // ordered by absis

    const leftestPoint = currentPoints[0];
    const rightestPoint = currentPoints[currentPoints.length - 1];

    const result = getLeftConvexHullPointsAccumulate(
      this._points,
      leftestPoint,
      rightestPoint
    );
    result.push(
      ...getLeftConvexHullPointsAccumulate(
        this._points,
        rightestPoint,
        leftestPoint
      )
    );
    result.push(leftestPoint, rightestPoint);

    return result;
  }

  _makeCounterClockwiseOrientation() {
    const convexHullPoints = this._getConvexHullPoints();

    function findNextConvexHullPointIndex(points, startIndex) {
      // return points.length if not found

      let i = startIndex;
      let p = points[startIndex];
      while (!convexHullPoints.includes(p) && i < points.length) {
        p = points[++i];
      } // convexHullPoints.includes(p) or i == this._points.length
      return i;
    }

    const i1 = findNextConvexHullPointIndex(this._points, 0); // Guaranteed found

    const i2 = findNextConvexHullPointIndex(this._points, i1 + 1);
    if (i2 == this._points.length) {
      throw new Error("Invalid polygon! (only one convex hull point detected)");
    } // else: continue

    const i3 = findNextConvexHullPointIndex(this._points, i2 + 1);
    if (i3 == this._points.length) {
      throw new Error("Invalid polygon! (only one convex hull point detected)");
    } // else: continue

    const p1 = this._points[i1];
    const p2 = this._points[i2];
    const p3 = this._points[i3];
    let selectedOrientationValue = Point2D.getSignedParallelogramArea(
      p1,
      p2,
      p3
    );

    if (selectedOrientationValue == 0) {
      throw new Error(
        "Implementation error! (orientation starts with colinear)"
      );
    } else if (selectedOrientationValue < 0) {
      // It's clockwise. Reverse it.
      this._points.reverse();
    } // else: it's counterclockwise; do nothing.

    // This is a self-intersection validation
    // Needed later or deleted if not needed.

    // let nextI3 = i3 + 1;
    // let nextP3 = this._points[nextI3];
    // while (!convexHullPoints.includes(nextP3)) {
    //   nextI3 = (nextI3 + 1) % this._points.length;
    //   nextP3 = this._points[nextI3];
    // } // convexHullPoints.includes(nextP3)

    // while (i3 != i3First) {
    //   // pointIdx = i2;
    //   // i2 = i3;
    //   i3 = nextI3;

    //   p1 = p2;
    //   p2 = p3;
    //   p3 = nextP3;

    //   let currentOrientationValue = Point2D.getOrientation(p1, p2, p3);

    //   if (
    //     currentOrientationValue != 0 &&
    //     currentOrientationValue != selectedOrientationValue
    //   ) {
    //     // do nothing
    //   }

    //   orientationValue += Point2D.getOrientation(p1, p2, p3);

    //   let nextI3 = i3 + 1;
    //   let nextP3 = this._points[nextI3];
    //   while (!convexHullPoints.includes(nextP3)) {
    //     nextI3 = (nextI3 + 1) % this._points.length;
    //     nextP3 = this._points[nextI3];
    //   } // convexHullPoints.includes(nextP3)

    //   pointIdx = i2;
    //   i2 = i3;
    //   i3 = nextI3;
    // } // i3 == i3sFirst

    // if (orientationValue < 0) {
    //   // It's counterclockwise: reverse it.
    //   this._points.reverse();
    // } else if (orientationValue == 0) {
    //   // It's an error
    // }
  }

  getTriangulationPoints() {
    this._makeCounterClockwiseOrientation();

    let pointIdx = 0;

    let currentPoints = this._points.slice();
    let p1 = currentPoints[pointIdx];
    let p2 = currentPoints[pointIdx + 1];
    let p3 = currentPoints[pointIdx + 2];

    let result = [];

    while (currentPoints.length > 3) {
      if (Point2D.getSignedParallelogramArea(p1, p2, p3) >= 0) {
        // Colinear or counterclockwise
        // Make sure this is "ear" triangle (a.k.a. no vertices inside it)
        let isEar = true;
        let earTestPointIdx = 0;

        while (earTestPointIdx < currentPoints.length && isEar) {
          if (
            (earTestPointIdx - pointIdx + currentPoints.length) %
              currentPoints.length >
            2
          ) {
            let p4 = currentPoints[earTestPointIdx];
            // Outside includes edge.
            const isOutside =
              Point2D.getSignedParallelogramArea(p1, p2, p4) <= 0 ||
              Point2D.getSignedParallelogramArea(p2, p3, p4) <= 0 ||
              Point2D.getSignedParallelogramArea(p3, p1, p4) <= 0;
            isEar = isOutside;
          } // else: skip
          earTestPointIdx += 1;
        }

        if (isEar) {
          // Make face
          result.push(p1, p2, p3);
          currentPoints.splice((pointIdx + 1) % currentPoints.length, 1);
        } // else: don't; you can break the shape
      } // else: no need to check

      // Check another points
      pointIdx = (pointIdx + 1) % currentPoints.length;

      p1 = currentPoints[pointIdx];
      p2 = currentPoints[(pointIdx + 1) % currentPoints.length];
      p3 = currentPoints[(pointIdx + 2) % currentPoints.length];
    } // currentPoints.length == 3

    if (Point2D.getSignedParallelogramArea(p1, p2, p3) >= 0) {
      result.push(p1, p2, p3);
    }

    return result;
  }

  getPoints() {
    return this._points.slice();
  }

  render(gl, vertex_buffer, color_buffer) {
    const pointList = this.getTriangulationPoints();
    const colorList = Array(pointList.length).fill(this.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(pointList.map((p) => p.getListRepr()).flat()),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(colorList.flat()),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.TRIANGLES, 0, pointList.length);
  }
}
