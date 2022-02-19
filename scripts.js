// Classes
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getArray() {
    return [this.x, this.y]
  }
}

class Line {
  constructor(p1, p2, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
  }

  getLength() {
    return Math.sqrt(Math.pow((this.p1.x - this.p2.x), 2) 
      + Math.pow((this.p1.y - this.p2.y), 2));
  }
}

class Square {
  constructor(p1, p2, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
  }

  getArray() {
    return Square.getArray(this.p1, this.p2);
  }

  static getArray(p1, p2) {
    const length = Math.min(Math.abs(p2.x - p1.x),
      Math.abs(p2.y - p1.y));
    const pdiag = [p1.x + ((p2.x - p1.x > 0) ? length : (length * -1)),
          p1.y + ((p2.y - p1.y > 0) ? length : (length * -1))];
    return [
      p1.x, p1.y,
      pdiag[0], p1.y,
      pdiag[0], pdiag[1],
      p1.x, pdiag[1]
    ];
  }
}

class Vertex { // Warning: bertabrakan dengan class Point dan Point2D
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getVertex() {
    return [this.x, this.y];
  }

  match(v2) {
    return (
      this.getVertex()[0] == v2.getVertex()[0] &&
      this.getVertex()[1] == v2.getVertex()[1]
    );
  }
}

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
}

function init() {
	/*		
			
			canvas.addEventListener('mousemove', (e) => {
				if (drawing) {
					const x = 2 * e.offsetX / canvas.width - 1;
					const y = -2 * e.offsetY / canvas.height + 1;
					
					end_point = new Point(x, y);
					render();
				}
			})

			canvas.addEventListener('mousedown', (e) => {
				const x = 2 * e.offsetX / canvas.width - 1;
				const y = -2 * e.offsetY / canvas.height + 1;

				if (drawing) {
					drawing = false;
				} else {
					
				}
			})

			// canvas.addEventListener('mouseup', (e) => {
			// 	drawing = false;
			// })
			
			let lines = [];
			let squares = [];
			
			function render() {
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				renderLines();
				renderSquares();
				if (drawing && tool == "line") // change to selected color
					renderLine(start_point, end_point, [0, 0, 0]);
				if (drawing && tool == "square") // change to selected color
					renderSquare(new Square(start_point, end_point, [0, 0, 0]));
			}
		}
	}
  */
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl");

  if (!gl) {
    // gl is not defined
    alert("Keliatannya perambanmu tidak mendukung WebGL. :(");
  } else {
    // Create shader
    const vertCode = `
      /* Your vertex program here */
      attribute vec2 vPosition;
      attribute vec3 vColor;
      varying vec4 fColor;
      void main()
      {
        gl_Position = vec4(vPosition, 0.0, 1.0);
        fColor = vec4(vColor, 1.0);
        
        gl_PointSize = 5.0;
      }
    `;

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    const fragCode = `
      /* Your fragment program here */
      precision mediump float;
      varying vec4 fColor;
      void main()
      {
        gl_FragColor = fColor;
      }
    `;

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    // Create program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log(gl.getProgramInfoLog(shaderProgram));
    } else {
      gl.useProgram(shaderProgram);

      // Combine
      // Pay attention to the variable of program!
      const vertex_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
      var coord = gl.getAttribLocation(shaderProgram, "vPosition");
      gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(coord);

      const color_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
      var colorAttrib = gl.getAttribLocation(shaderProgram, "vColor");
      gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(colorAttrib);

      gl.clearColor(1.0, 1.0, 1.0, 1.0); // First canvas color
      gl.enable(gl.DEPTH_TEST);
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Render part
      clear(); // Harus ada setiap render!

      var tool = "";
      var drawing = false;

      // Shapes and colors
      var vertexStart;
      var vertexEnd;
      var rectangles = [];
      var currentColor = [0, 0, 0];
      
      let start_point = null;
			let end_point = null;

      // Button listeners
      var vertexBtn = document.getElementById("vertexBtn");
      var lineBtn = document.getElementById("lineBtn");
      var squareBtn = document.getElementById("squareBtn");
      var rectangleBtn = document.getElementById("rectangleBtn");
      var polygonBtn = document.getElementById("polygonBtn");
      var pickerBtn = document.getElementById("pickerBtn");
      var clearBtn = document.getElementById("clearBtn");
      var helpBtn = document.getElementById("helpBtn");
      var saveBtn = document.getElementById("saveBtn");
      var loadBtn = document.getElementById("loadBtn");

      var toolIndicator = document.getElementById("currentTool");

      vertexBtn.addEventListener("click", function () {
        tool = "vertex";
        toolIndicator.innerHTML = tool;
      });

      lineBtn.addEventListener("click", function () {
        tool = "line";
        toolIndicator.innerHTML = tool;
      });

      squareBtn.addEventListener("click", function () {
        tool = "square";
        toolIndicator.innerHTML = tool;
      });

      rectangleBtn.addEventListener("click", function () {
        tool = "rectangle";
        toolIndicator.innerHTML = tool;
        vertexStart = null;
      });

      polygonBtn.addEventListener("click", function () {
        tool = "polygon";
        toolIndicator.innerHTML = tool;
      });

      pickerBtn.addEventListener("click", function () {
        drawing = false;
      });

      clearBtn.addEventListener("click", function () {
        tool = "";
        toolIndicator.innerHTML = tool;
        drawing = false;
        clear();
        rectangles = [];
      });

      helpBtn.addEventListener("click", function () {});

      saveBtn.addEventListener("click", function () {});

      loadBtn.addEventListener("click", function () {});

      canvas.addEventListener("click", (e) => {
        click(e, gl, canvas);
      });

      canvas.addEventListener("mousemove", () => {
        if (drawing) {
          canvas.style.cursor = "crosshair";
        } else {
          canvas.style.cursor = "default";
        }
      });
      
      // Polygon part
      let helperPoints = [];
			let polygons = [];
      
			const polygonDrawerUI = new PolygonDrawerUI(canvas);
			polygonDrawerUI.listen("pointCreated", point => {
				helperPoints.push(point);
				render();
			});
			polygonDrawerUI.listen("polygonCreated", polygon => {
				helperPoints = []; // clear helperPoints
				polygons.push(polygon);
				render();
			});
			polygonDrawerUI.listen("polygonAborted", () => {
				helperPoints = []; // clear helperPoints
				render();
			});
			
			polygonDrawerUI.activate();

      // Functions
      function click(e, gl, canvas) {
        const x = (2 * e.offsetX) / canvas.width - 1;
        const y = (-2 * e.offsetY) / canvas.height + 1;

        if (drawing) {
          switch (tool) {
            case "vertex":
              break;
            case "line":
              drawing = false;
              lines.push(new Line(start_point, end_point, [0, 0, 0]));
							// change to selected color
              start_point = null;
					    end_point = null;
              break;
            case "square":
              drawing = false;
              squares.push(new Square(start_point, end_point, [0, 0, 0]))
							// change to selected color
              start_point = null;
					    end_point = null;
              break;
            case "rectangle":
              vertexEnd = new Vertex(x, y);
              if (!vertexStart.match(vertexEnd)) {
                drawing = false;
                rectangles.push(
                  new Rectangle(vertexStart, vertexEnd, currentColor)
                );
              }
              break;
            case "polygon":
              // TODO: Combine dengan polygon
              break;
            default:
              drawing = false;
              break;
          }
        } else {
          if (tool != "") {
            drawing = true;
            vertexStart = new Vertex(x, y);
            start_point = new Point(x, y);
          }
        }
        render();
      }

      function renderRectangle(rectangle) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(rectangle.getVertices().flat(2)),
          gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(
            [
              rectangle.color,
              rectangle.color,
              rectangle.color,
              rectangle.color,
            ].flat(2)
          ),
          gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      }

      function renderRectangles() {
        rectangles.forEach((rectangle) => {
          renderRectangle(rectangle);
        });
      }
      
      function renderPolygons() {
				polygons.forEach(polygon => {
					const pointList = polygon.getTriangulationPoints();
					const colorList = Array(pointList.length).fill(polygon.getColor());
					
					gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointList.map(
						p => p.getListRepr()
					).flat()), gl.STATIC_DRAW);
					gl.bindBuffer(gl.ARRAY_BUFFER, null);
					
					gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorList.map(
						c => c.getNormalizedListRepr()
					).flat()), gl.STATIC_DRAW);
					gl.bindBuffer(gl.ARRAY_BUFFER, null);
					
					gl.drawArrays(gl.TRIANGLES, 0, pointList.length);
				});
			}
			
			function renderPolygonsHelper() {
				if (helperPoints.length > 0) {
					gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(helperPoints.map(
						p => p.getListRepr()
					).flat()), gl.STATIC_DRAW);
					gl.bindBuffer(gl.ARRAY_BUFFER, null);
					
					gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
						Array(helperPoints.length * 3).fill(0.0)
					), gl.STATIC_DRAW);
					gl.bindBuffer(gl.ARRAY_BUFFER, null);
					
					gl.drawArrays(gl.POINTS, 0, helperPoints.length);
				}
			}
      
      function renderLine(start, end, color) {
				// const start = line.p1;
				// const end = line.p2;
				// const color = line.color;

				gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
				gl.bufferData(gl.ARRAY_BUFFER, 
					new Float32Array([start.getArray(), end.getArray()].flat(2))
					, gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);

				gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
				gl.bufferData(gl.ARRAY_BUFFER, 
					new Float32Array([color, color].flat(2)), gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);

				gl.drawArrays(gl.LINES, 0, 2);
			}

			function renderLines() {
				lines.forEach(line => {
					renderLine(line.p1, line.p2, [0, 0, 0]);
				});
			}

			function renderSquare(square) {
				gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
				gl.bufferData(gl.ARRAY_BUFFER, 
					new Float32Array(square.getArray().flat(2))
					, gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);

				gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
				gl.bufferData(gl.ARRAY_BUFFER, 
					new Float32Array([square.color, square.color, square.color, square.color]), gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);

				gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
			}

			function renderSquares() {
				squares.forEach(square => {
					renderSquare(square);
				})
			}

      function render() {
        clear();
        renderRectangles();
        renderPolygonsHelper();
				renderPolygons();
      }

      // clear canvas
      function clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
    }
  }
}

window.onload = init;
