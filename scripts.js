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
      drawing = false;

      // Shapes and colors
      var currentColor = [0, 0.5, 1]; // Sistem 0..1
      let objectList = [];
      let tempObjectList = [];

      // UI
      // Line
      const lineDrawerUI = new LineDrawerUI(canvas);
      lineDrawerUI.listen("lineCreated", (line) => {
        objectList.push(line);
        render();
      });
      lineDrawerUI.listen("lineAborted", () => {
        render();
      });
      lineDrawerUI.listen("endPointCreated", () => {
        render();
      });

      // Square
      const squareDrawerUI = new SquareDrawerUI(canvas);
      squareDrawerUI.listen("squareCreated", (square) => {
        objectList.push(square);
        render();
      });
      squareDrawerUI.listen("squareAborted", () => {
        render();
      });
      squareDrawerUI.listen("endPointCreated", () => {
        render();
      });

      // Rectangle
      const rectangleDrawerUI = new RectangleDrawerUI(canvas);
      rectangleDrawerUI.listen("rectangleCreated", (rectangle) => {
        objectList.push(rectangle);
        render();
      });

      // Polygon
      const polygonDrawerUI = new PolygonDrawerUI(canvas);
      polygonDrawerUI.listen("pointCreated", (point) => {
        render();
      });
      polygonDrawerUI.listen("polygonCreated", (polygon) => {
        objectList.push(polygon);
        render();
      });
      polygonDrawerUI.listen("polygonAborted", () => {
        render();
      });

      const uiMap = {
        line: lineDrawerUI,
        square: squareDrawerUI,
        rectangle: rectangleDrawerUI,
        polygon: polygonDrawerUI,
      };

      // Bind color to currentColor
      Object.entries(uiMap).forEach(([_, ui]) => {
        ui.color = currentColor;
      });

      // End of UI

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

      function changeTool(newTool) {
        if (tool in uiMap) {
          // defined
          uiMap[tool].deactivate();
        }

        tool = newTool;
        toolIndicator.innerHTML = tool;

        if (tool in uiMap) {
          // defined
          uiMap[tool].activate();
          drawing = true;
        } else {
          drawing = false;
        }
      }

      vertexBtn.addEventListener("click", function () {
        changeTool("vertex");
      });
      lineBtn.addEventListener("click", function () {
        changeTool("line");
      });
      squareBtn.addEventListener("click", function () {
        changeTool("square");
      });
      rectangleBtn.addEventListener("click", function () {
        changeTool("rectangle");
      });
      polygonBtn.addEventListener("click", function () {
        changeTool("polygon");
      });
      pickerBtn.addEventListener("click", function () {
        changeTool("picker");
      });

      clearBtn.addEventListener("click", function () {
        changeTool("");
        clear();
        objectList = [];
      });

      helpBtn.addEventListener("click", function () {});
      saveBtn.addEventListener("click", function () {
        saveFile(objectList);
      });
	  
      loadBtn.addEventListener("click", function () {
        loadFile(newObjectList => {
          objectList = newObjectList;
		  render();
        });
      });

      canvas.addEventListener("mousemove", () => {
        if (drawing) {
          canvas.style.cursor = "crosshair";
        } else {
          canvas.style.cursor = "default";
        }
      });

      function getCurrentUIHelperObjects() {
        if (tool in uiMap) {
          // defined
          return uiMap[tool].getHelperObjects();
        } else {
          return [];
        }
      }

      function render() {
        clear();
        objectList.forEach((obj) =>
          obj.render(gl, vertex_buffer, color_buffer)
        );
        getCurrentUIHelperObjects().forEach((obj) =>
          obj.render(gl, vertex_buffer, color_buffer)
        );
      }

      // clear canvas
      function clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
    }
  }
}

window.onload = init;
