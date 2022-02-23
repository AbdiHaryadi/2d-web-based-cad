function loadFile(callback) {
	const input = document.createElement("input");
	input.type = "file";
	
	input.onchange = e => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.readAsText(file);
		
		reader.onload = readerEvent => {
			const content = readerEvent.target.result;
			const jsonContent = _parseJsonOrNull(content);
			
			if (jsonContent == null) {
				alert("Cannot read that file.");
				
			} else {
				const newObjectList = jsonContent.map(jsonObj => {
					switch (jsonObj.type) {
						case "line":
							return LineConverter.toDrawableObject(jsonObj);
							break;
						case "polygon2d":
							return Polygon2DConverter.toDrawableObject(jsonObj);
							break;
						case "rectangle":
							return RectangleConverter.toDrawableObject(jsonObj);
							break;
						case "square":
							return SquareConverter.toDrawableObject(jsonObj);
							break;
						default:
							throw new Error("Unidentified drawable object: " + jsonObj.type);
					}
				});
				
				callback(newObjectList);
			}
		}
	}
	
	// Automatically used
	input.click();
}

function saveFile(objectList) {
	const jsonObj = objectList.map(obj => obj.toJSON());
	const jsonStr = JSON.stringify(jsonObj);
	
	const downloadLink = document.createElement("a");
	downloadLink.href = URL.createObjectURL(new Blob([jsonStr], { type: "text/plain" }));
	downloadLink.setAttribute("download", "savedCanvas.json");
	document.body.appendChild(downloadLink);
	
	// Automatically download
	downloadLink.click();
	
	document.body.removeChild(downloadLink);
	
}

function _parseJsonOrNull(str) {
	try {
		return JSON.parse(str);
	} catch (exception) {
		console.log(exception);
		return null;
	}
}