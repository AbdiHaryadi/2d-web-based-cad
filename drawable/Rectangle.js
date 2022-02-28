class Rectangle {
  constructor(v1, v2, color) {
    this.v1 = v1;
    this.v2 = v2;
    this.color = color;
  }

  getVertices() {
    return Rectangle.getVertices(this.v1, this.v2);
  }

  getPoints() {
    var points = this.getVertices();
    var list_points = [];
    for (var i = 0; i < points.length; i += 2) {
      var point = new Point2D(points[i], points[i + 1])
      list_points.push(point);
    }
    return list_points;
  }

  getNearestDistance(chosenpoint) {
    var idx_nearest = -1;
    var nearest = 999;
    var points = this.getVertices();
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

  static getVertices(v1, v2) {
    // TODO: kalau dirotasi gabener
    return [v1.x, v1.y, v1.x, v2.y, v2.x, v2.y, v2.x, v1.y];
  }

  render(gl, vertex_buffer, color_buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.getVertices().flat(2)),
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
    return RectangleConverter.toJSON(this);
  }
}
