function init() {
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

      // Classes
      class Vertex {
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

      var tool = "";
      var drawing = false;

      // Shapes and colors
      var vertexStart;
      var vertexEnd;
      var rectangles = [];
      var currentColor = [0, 0, 0];

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

      // Functions
      function click(e, gl, canvas) {
        const x = (2 * e.offsetX) / canvas.width - 1;
        const y = (-2 * e.offsetY) / canvas.height + 1;

        if (drawing) {
          switch (tool) {
            case "vertex":
              break;
            case "line":
              break;
            case "square":
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
              break;
            default:
              drawing = false;
              break;
          }
        } else {
          if (tool != "") {
            drawing = true;
            vertexStart = new Vertex(x, y);
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

      function render() {
        clear();
        renderRectangles();
      }

      // clear canvas
      function clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
    }
  }
}

window.onload = init;
