importScripts('./DensityBasedClusterer.js');
const clusterer = new DensityBasedClusterer();

onmessage = (e) => {
	if(e.data.type === 'findPixels') {
		postMessage({
			type: e.data.type,
			pixels: findPixels(e.data.startIndex, e.data.imageData, e.data.colors, e.data.width)
		});
	} else if(e.data.type === 'clusterRects') {
		postMessage({
			type: e.data.type,
			rects: clusterRects(e.data.pixels, e.data.color, e.data.maxDist, e.data.minPts, e.data.ratio)
		});
	}
}

function clusterRects(pixels, color, maxDist, minPts, ratio) {
	const clusters = clusterer.run(pixels, maxDist, minPts);
	const trackedRects = [];

	for(let i = 0; i < clusters.length; i++) {
		const points = clusters[i];
		let top = Infinity;
		let bottom = 0;
		let left = Infinity;
		let right = 0;

		for(let j = 0; j < points.length; j++) {
			const p = pixels[points[j]];
			if(p[0] < left) left = p[0];
			if(p[0] > right) right = p[0];
			if(p[1] < top) top = p[1];
			if(p[1] > bottom) bottom = p[1];
		}

		trackedRects.push({
			color: color.name,
			rect: {
				top: top * 1/ratio,
				right: right * 1/ratio,
				bottom: bottom * 1/ratio,
				left: left * 1/ratio
			}
		})
	}

	return trackedRects;
}

function findPixels(startIndex, imageData, colors, width) {
	const trackedPixels = {}
	for(let i = 0; i < colors.length; i++) {
		trackedPixels[colors[i].name] = [];
	}

	let pixelIndex = startIndex;
	for(let i = 0; i < imageData.length; i+=4) {
		const color = [imageData[i], imageData[i + 1], imageData[i + 2]];

		for(let j = 0; j < colors.length; j++) {
			const target = colors[j];
			const dist = colorDistance(target.color, color);
			if(dist < target.threshold) {
				trackedPixels[target.name].push(indexToCoords(pixelIndex, width));
			}
		}
		pixelIndex++;
	}
	return trackedPixels;
}

function colorDistance(c1, c2) {
	return Math.sqrt(
		(c1[0] - c2[0]) * (c1[0] - c2[0]) +
		(c1[1] - c2[1]) * (c1[1] - c2[1]) +
		(c1[2] - c2[2]) * (c1[2] - c2[2])
	);
}

function indexToCoords(index, width) {
	return [
		index % width,
		Math.floor(index / width)
	]
}
