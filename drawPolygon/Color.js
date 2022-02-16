class Color {
	constructor(r, g, b) {
		// r, g, b: [0..255]
		this.r = r;
		this.g = g;
		this.b = b;
	}
	
	getNormalizedListRepr() {
		return [this.r / 255, this.g / 255, this.b / 255];
	}
}
