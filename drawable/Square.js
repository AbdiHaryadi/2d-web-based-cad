class Square {
  constructor(p1, p2, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
  }

  getArray() {
    return Square.getArray(this.p1, this.p2);
  }

  getPoints() {
    var points = this.getArray();
    var list_points = [];
    for (var i = 0; i < points.length; i += 2) {
      var point = new Point2D(points[i], points[i + 1])
      list_points.push(point);
    }
    return list_points;
  }

  static getArray(p1, p2) {
    const length = Math.min(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));
    const pdiag = [
      p1.x + (p2.x - p1.x > 0 ? length : length * -1),
      p1.y + (p2.y - p1.y > 0 ? length : length * -1),
    ];
    return [p1.x, p1.y, pdiag[0], p1.y, pdiag[0], pdiag[1], p1.x, pdiag[1]];
  }

  getNearestDistance(chosenpoint) {
    var idx_nearest = -1;
    var nearest = 999;
    var points = this.getArray();
    var list_points = [];
    for (var i = 0; i < points.length; i += 2) {
      var point = new Point2D(points[i], points[i + 1])
      list_points.push(point);
      var distance = point.distance(chosenpoint);
      if (distance < nearest) {
        idx_nearest = Math.floor(i / 2);
        nearest = distance;
      }
    }
    return [nearest, list_points[idx_nearest], list_points[(idx_nearest + 2) % 4]];
  }

  render(gl, vertex_buffer, color_buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getArray().flat(2)),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [this.color, this.color, this.color, this.color].flat(2)
      ),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  toJSON() {
    return SquareConverter.toJSON(this);
  }
}
