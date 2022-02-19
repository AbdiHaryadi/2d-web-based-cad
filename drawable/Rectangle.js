class Rectangle {
  constructor(v1, v2, color) {
    this.v1 = v1;
    this.v2 = v2;
    this.color = color;
  }

  getVertices() {
    return Rectangle.getVertices(this.v1, this.v2);
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
}
