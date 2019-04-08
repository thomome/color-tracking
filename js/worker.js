importScripts('./DensityBasedClusterer.js', './ColorTrackerWorker.js');

let tracker;

onmessage = (e) => {
	switch(e.data.type) {
		case 'init':
			const maxDist = e.data.opts.clusterMaxDist;
			const minPts = e.data.opts.clusterMinPts;
			const ratio = e.data.ratio;
			const clusterer = new DensityBasedClusterer(maxDist, minPts);
			tracker = new ColorTrackerWorker(clusterer, ratio);
			break;
		case 'track':
			const colors = e.data.colors;
			const imageData = e.data.imageData;
			const rects = tracker.track(imageData, colors);
			postMessage({
				type: e.data.type,
				rects: rects
			})
			break;
	}
}
