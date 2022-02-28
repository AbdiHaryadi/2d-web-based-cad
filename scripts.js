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
      var drawing = false;

      // Shapes and colors
      var currentColor = [1, 0, 0]; // Sistem 0..1
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

      // Line Move
      const lineMoveUI = new LineMoveUI(canvas);

      lineMoveUI.listen("moveStarted", () => {
        lineMoveUI.getLine(objectList);
        render();
      });

      lineMoveUI.listen("moveEnded", (line) => {
        objectList.push(line);
        render();
      });

      lineMoveUI.listen("moveAborted", () => {
        render();
      });

      lineMoveUI.listen("lineMoved", () => {
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

      // Resize Square
      const squareResizeUI = new SquareResizeUI(canvas);

      squareResizeUI.listen("resizeStarted", () => {
        squareResizeUI.getSquare(objectList);
        render();
      });

      squareResizeUI.listen("resizeEnded", (square) => {
        objectList.push(square);
        render();
      });

      squareResizeUI.listen("resizeAborted", () => {
        render();
      });

      squareResizeUI.listen("squareResized", () => {
        render();
      });

      // Rectangle
      const rectangleDrawerUI = new RectangleDrawerUI(canvas);
      rectangleDrawerUI.listen("rectangleCreated", (rectangle) => {
        objectList.push(rectangle);
        render();
      });

      rectangleDrawerUI.listen("rectangleAborted", () => {
        render();
      });

      rectangleDrawerUI.listen("endPointCreated", () => {
        render();
      });

      // Resize Rectangle
      const rectangleResizeUI = new RectangleResizeUI(canvas);

      rectangleResizeUI.listen("resizeStarted", () => {
        rectangleResizeUI.getRectangle(objectList);
        render();
      });

      rectangleResizeUI.listen("resizeEnded", (rectangle) => {
        objectList.push(rectangle);
        render();
      });

      rectangleResizeUI.listen("resizeAborted", () => {
        render();
      });

      rectangleResizeUI.listen("rectangleResized", () => {
        render();
      });

      // Polygon
      const polygonDrawerUI = new PolygonDrawerUI(canvas);
      polygonDrawerUI.listen("pointCreated", (point) => {
        render();
      });

      polygonDrawerUI.listen("pointUpdated", (point) => {
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
        moveLine: lineMoveUI,
        resizeSquare: squareResizeUI,
        resizeRectangle: rectangleResizeUI,
      };

      // Bind color to currentColor
      // TODO
      Object.entries(uiMap).forEach(([_, ui]) => {
        ui.color = currentColor;
      });

      // End of UI

      // Button listeners
      var movePointBtn = document.getElementById("movePointBtn");
      var lineBtn = document.getElementById("lineBtn");
      var squareBtn = document.getElementById("squareBtn");
      var rectangleBtn = document.getElementById("rectangleBtn");
      var resizeRectangleBtn = document.getElementById("resizeRectangleBtn");
      var polygonBtn = document.getElementById("polygonBtn");
      var moveLineBtn = document.getElementById("moveLineBtn");
      var resizeSquareBtn = document.getElementById("resizeSquareBtn");
      var pickerBtn = document.getElementById("pickerBtn0");
      var undoBtn = document.getElementById("undoBtn");
      var clearBtn = document.getElementById("clearBtn");
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

      moveLineBtn.addEventListener("click", function () {
        changeTool("moveLine");
      });

      resizeSquareBtn.addEventListener("click", function () {
        changeTool("resizeSquare");
      });

      resizeRectangleBtn.addEventListener("click", function () {
        changeTool("resizeRectangle");
      });

      pickerBtn0.addEventListener("change", function () {
        changeTool("picker");
        currentColor = hex2rgb(pickerBtn.value);

        Object.entries(uiMap).forEach(([_, ui]) => {
          ui.color = currentColor;
        });
      });

      undoBtn.addEventListener("click", function () {
        objectList.pop();
        render();
      });

      clearBtn.addEventListener("click", function () {
        changeTool("");
        clear();
        objectList = [];
        printObjects();
        hideHelpBox();
      });

      saveBtn.addEventListener("click", function () {
        saveFile(objectList);
      });

      loadBtn.addEventListener("click", function () {
        loadFile((newObjectList) => {
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

      // help event listeners
      lineBtn.addEventListener("mouseover", function () {
        showHelpBox(
          "Line",
          "Click the canvas once where you want to start the line and click the canvas again to end the line."
        );
      });

      lineBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      squareBtn.addEventListener("mouseover", function () {
        showHelpBox(
          "Square",
          "Click the canvas once where you want to start making a square and click the canvas again to finish making a square."
        );
      });

      squareBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      rectangleBtn.addEventListener("mouseover", function () {
        showHelpBox(
          "Rectangle",
          "Click the canvas once where you want to start making a rectangle and click the canvas again to finish making a rectangle."
        );
      });

      rectangleBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      polygonBtn.addEventListener("mouseover", function () {
        showHelpBox(
          "Polygon",
          "Click  once to make a starting point then click wherever to make a vertex and then close the polygon to save it."
        );
      });

      polygonBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      pickerBtn0.addEventListener("mouseover", function () {
        showHelpBox("Color Picker", "Click to pick a new color.");
      });

      pickerBtn0.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      moveLineBtn.addEventListener("mouseover", function () {
        showHelpBox(
          "Move Line",
          "Click one end of the line you want to move and click again where you want to move it to."
        );
      });

      moveLineBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      resizeSquareBtn.addEventListener("mouseover", function () {
        showHelpBox(
          "Resize Square",
          "Click one vertex of the square you want to resize and click again to finished resizing the square."
        );
      });

      resizeSquareBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      resizeRectangleBtn.addEventListener("mouseover", function () {
        showHelpBox(
          "Resize Rectangle",
          "Click one vertex of the rectangle you want to resize and click again to finished resizing the rectangle."
        );
      })

      resizeRectangleBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      })

      undoBtn.addEventListener("mouseover", function () {
        showHelpBox("Undo", "Undo the last drawn object.");
      });

      undoBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      clearBtn.addEventListener("mouseover", function () {
        showHelpBox("Clear", "Click to clear the canvas.");
      });

      clearBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      saveBtn.addEventListener("mouseover", function () {
        showHelpBox("Save", "Click to save your current canvas.");
      });

      saveBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      loadBtn.addEventListener("mouseover", function () {
        showHelpBox("Load", "Click to load a file.");
      });

      loadBtn.addEventListener("mouseout", function () {
        hideHelpBox();
      });

      function hex2rgb(hex) {
        hex = hex.slice(1);
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        return [r, g, b];
      }

      function value2hex(val) {
        var hex = (val * 255).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }

      function rgb2hex(rgb) {
        return (
          "#" +
          value2hex(rgb.at(0)) +
          value2hex(rgb.at(1)) +
          value2hex(rgb.at(2))
        );
      }

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
        getCurrentUIHelperObjects().forEach((obj) =>
          obj.render(gl, vertex_buffer, color_buffer)
        );
        objectList
          .slice()
          .reverse()
          .forEach((obj) => obj.render(gl, vertex_buffer, color_buffer));
        printObjects();
      }

      // clear canvas
      function clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }

      // helpbox
      var helpBox = document.getElementById("helpBox");
      var helpTitle = document.getElementById("helpTitle");
      var helpBody = document.getElementById("helpBody");

      function hideHelpBox() {
        helpBox.style.display = "none";
        helpTitle.innerHTML = "";
        helpBody.innerHTML = "";
      }

      function showHelpBox(title, body) {
        helpBox.style.display = "block";
        helpTitle.innerHTML = title;
        helpBody.innerHTML = body;
      }

      function printObjects() {
        var list = document.getElementById("objectList");
        var idx = 1;
        list.innerHTML = "";

        objectList.forEach((element) => {
          const color = rgb2hex(element.color);
          const item = `
            <div style="background-color: #EEE; padding: 0.5rem; margin-bottom: 0.5rem;">
              <h3 style="padding: 0; margin: 0 0 0.5rem 0;">${
                "Object " + idx
              }</h3>
              <input type="color" value="${color}" id="${"pickerBtn" + idx}" />
            </div>
          `;
          list.innerHTML += item;
          idx++;
        });

        var pickerBtns = document.querySelectorAll(
          "[id^='pickerBtn']:not([id$='pickerBtn0'])"
        );

        for (let i = 0; i < pickerBtns.length; i++) {
          pickerBtns[i].addEventListener("change", function () {
            changeTool("picker");
            objectList[i].color = hex2rgb(pickerBtns[i].value);
            render();
          });
        }
      }
    }
  }
}

window.onload = init;
