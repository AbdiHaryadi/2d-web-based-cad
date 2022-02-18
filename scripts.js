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

			let drawing = false;
			let tool = "square";
			let start_point = null;
			let end_point = null;
			
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
					if (tool == "line") {
						lines.push(new Line(start_point, end_point, [0, 0, 0]));
							// change to selected color
					} else {
						squares.push(new Square(start_point, end_point, [0, 0, 0]))
							// change to selected color
					}
					start_point = null;
					end_point = null;
					render();
				} else {
					drawing = true;
					start_point = new Point(x, y);
				}
			})

			// canvas.addEventListener('mouseup', (e) => {
			// 	drawing = false;
			// })

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
		}
	}
}

window.onload = init;