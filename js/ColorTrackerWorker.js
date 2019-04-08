class ColorTrackerWorker {
	constructor(clusterer, ratio) {
		this.clusterer = clusterer;
		this.ratio = ratio;
	}

	track(imageData, colors) {
		const trackedPixels = this.findPixels(imageData, colors);
		const trackedRects = this.clusterRects(trackedPixels, colors);
		return trackedRects;
	}

	findPixels(imageData, colors) {
		const trackedPixels = {}
		for(let i = 0; i < colors.length; i++) {
			trackedPixels[colors[i].name] = [];
		}

		let pixelIndex = 0;
		for(let i = 0; i < imageData.data.length; i+=4) {
			const color = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];

			for(let j = 0; j < colors.length; j++) {
				const target = colors[j];
				const dist = this.colorDistance(target.color, color);
				if(dist < target.threshold) {
					trackedPixels[target.name].push(this.indexToCoords(pixelIndex, imageData.width));
				}
			}
			pixelIndex++;
		}
		return trackedPixels;
	}

 	clusterRects(trackedPixels, colors) {
		const trackedRects = [];

		for(let i = 0; i < colors.length; i++) {
			const color = colors[i];
			const clusters = this.clusterer.run(trackedPixels[color.name]);

			for(let i = 0; i < clusters.length; i++) {
				const points = clusters[i];
				let top = Infinity;
				let bottom = 0;
				let left = Infinity;
				let right = 0;

				for(let j = 0; j < points.length; j++) {
					const p = trackedPixels[color.name][points[j]];
					if(p[0] < left) left = p[0];
					if(p[0] > right) right = p[0];
					if(p[1] < top) top = p[1];
					if(p[1] > bottom) bottom = p[1];
				}

				trackedRects.push({
					color: color.name,
					rect: {
						top: top * 1/this.ratio,
						right: right * 1/this.ratio,
						bottom: bottom * 1/this.ratio,
						left: left * 1/this.ratio
					}
				})
			}
		}
		return trackedRects;
	}

	colorDistance(c1, c2) {
		return Math.sqrt(
			(c1[0] - c2[0]) * (c1[0] - c2[0]) +
			(c1[1] - c2[1]) * (c1[1] - c2[1]) +
			(c1[2] - c2[2]) * (c1[2] - c2[2])
		);
	}

	indexToCoords(index, width) {
		return [
			index % width,
			Math.floor(index / width)
		]
	}
}
