class Line {
  constructor(p1, p2, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
  }

  getLength() {
    return Math.sqrt(
      Math.pow(this.p1.x - this.p2.x, 2) + Math.pow(this.p1.y - this.p2.y, 2)
    );
  }

  render(gl, vertex_buffer, color_buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([this.p1.getListRepr(), this.p2.getListRepr()].flat(2)),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([this.color, this.color].flat(2)),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.LINES, 0, 2);
  }

  toJSON() {
    return LineConverter.toJSON(this);
  }
}
