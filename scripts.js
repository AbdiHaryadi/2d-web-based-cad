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
	
			// Contoh render:
			var vertices = [
				-0.5, -0.5,
				0.5, -0.5,
				0.0, 0.0,
			];
			
			var colors = [
				1.0, 0.0, 0.0, // #ff0000 (red)
				1.0, 1.0, 0.0, // #ffff00 (yellow)
				0.0, 0.0, 1.0, // #0000ff (blue)
			];
			
			var numPoints = 3; // Sesuaikan dengan banyak titik.
			
			gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			
			gl.drawArrays(gl.TRIANGLES, 0, 3); // Jenisnya segitiga; boleh diubah
		}
	}
}

window.onload = init;