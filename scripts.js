function init() {
	canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	
	if (!gl) {
		/* gl is not defined */
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
			
			
			gl.clearColor(1.0, 1.0, 0.9, 1.0); // First canvas color
			gl.enable(gl.DEPTH_TEST);
			gl.viewport(0, 0, canvas.width, canvas.height);
			
			// Render part
			gl.clear(gl.COLOR_BUFFER_BIT); // Harus ada setiap render!
			
			let helperPoints = [];
			let polygons = [];
			
			function render() {
				gl.clear(gl.COLOR_BUFFER_BIT); // Harus ada setiap render!
				renderPolygonsHelper();
				renderPolygons();
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
		}
	}
}

window.onload = init;