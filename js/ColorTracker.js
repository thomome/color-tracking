class ColorTracker {
  constructor(source) {
    if(!source) {
      return false;
    }

    this.maxWidth = 200;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

		this.clusterer = new DensityBasedClusterer();
		this.clusterMaxDist = 7;
		this.clusterMinPts = 3;

		this.worker = new Worker('./js/worker.js');
		this.worker.onmessage = (e) => {
			this.handleWorkerResponse(e);
		}
		this.workerTimer = {};
		this.workersLength = 4;
		this.workers = [];
		for(var i = 0; i < this.workersLength; i++) {
			this.workers.push(this.worker);
		}

    this.source = source;
    if(source.tagName === 'VIDEO') {
      this.orignalWidth = source.videoWidth;
      this.orignalHeight = source.videoHeight;
    } else {
      this.orignalWidth = source.width;
      this.orignalHeight = source.height;
    }

    this.ratio = this.maxWidth / this.orignalWidth;
    this.width = this.ratio * this.orignalWidth;
    this.height = this.ratio * this.orignalHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.colors = [];
    this.imageData = [];
    this.imageDataLength = 0;
    this.trackedPixels = {};
    this.trackedRects = [];

		this.events = {};

		this.fps = [];
		this.last = performance.now();
  }

  addColor(color) {
    this.colors.push(color);
  }

  run() {
		this.last = performance.now();
    this.ctx.drawImage(this.source, 0, 0, this.width, this.height);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height).data;
    this.imageDataLength = this.width * this.height * 4;

    for(let i = 0; i < this.colors.length; i++) {
      this.trackedPixels[this.colors[i].name] = [];
    }
    this.trackedRects = [];

		const partLength = Math.ceil(this.imageDataLength / (this.workersLength * 4)) * 4;
		this.workerTimer.findPixels = { done: 0, todo: this.workersLength };
		for(let i = 0; i < this.workersLength; i++) {
			const start = i * partLength;
			const end = i + 1 === this.workersLength ? this.imageDataLength : (i + 1) * partLength;
			this.workers[i].postMessage({
				type: 'findPixels',
				width: this.width,
				imageData: this.imageData.slice(start, end),
				colors: this.colors,
				startIndex: start / 4
			});
		}
  }

  clusterRects() {
		this.workerTimer.clusterRects = { done: 0, todo: this.colors.length };
    for(let i = 0; i < this.colors.length; i++) {
      const color = this.colors[i];
      const pixels = this.trackedPixels[color.name];

			this.workers[i].postMessage({
				type: 'clusterRects',
				color: color,
				pixels: pixels,
				maxDist: this.clusterMaxDist,
				minPts: this.clusterMinPts,
				ratio: this.ratio
			});
    }
  }

	on(event, callback) {
		if(!this.events[event]) this.events[event] = [];
		this.events[event].push(callback);
	}

	done() {
		const now = performance.now();
		this.fps.unshift(now - this.last);
		this.fps.splice(60);
		document.querySelector('h2').innerHTML = Math.round(this.fps.reduce((sum, val) => sum + val) / this.fps.length) + 'ms';

		if(this.events.track) {
			for(let i = 0; i < this.events.track.length; i++) {
				this.events.track[i]( this.trackedRects );
			}
		}

		if(this.fps[0] < 16) {
			window.setTimeout(() => {
				this.run();
			}, 16 - this.fps[0]);
		} else {
			this.run();
		}
	}

	handleWorkerResponse(e) {
		this.workerTimer[e.data.type].done++;
		if(e.data.type === 'findPixels') {
			for(let i = 0; i < this.colors.length; i++) {
				const color = this.colors[i];
				this.trackedPixels[color.name].push(...e.data.pixels[color.name]);
			}
			if(this.workerTimer[e.data.type].done === this.workerTimer[e.data.type].todo) {
				this.clusterRects();
			}
		} else if(e.data.type === 'clusterRects') {
			this.trackedRects.push(...e.data.rects);
			if(this.workerTimer[e.data.type].done === this.workerTimer[e.data.type].todo) {
				this.done();
			}
		}
	}

  colorDistance(c1, c2) {
    return Math.sqrt(
      (c1[0] - c2[0]) * (c1[0] - c2[0]) +
      (c1[1] - c2[1]) * (c1[1] - c2[1]) +
      (c1[2] - c2[2]) * (c1[2] - c2[2])
    );
  }
}
