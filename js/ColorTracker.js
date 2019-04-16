class ColorTracker {
  constructor(source, opts = {}) {
    if(!source || ['IMG', 'VIDEO'].indexOf(source.tagName) === -1) {
      return false;
    }

		this.defaultOptions = {
			resolution: 150,
			clusterMaxDist: 3,
			clusterMinPts: 3,
			fps: 60
		};
		this.opts = Object.assign({}, this.defaultOptions, opts);

		this.source = source;

		this.orignalWidth = this.source.tagName === 'IMG' ? this.source.width : this.source.videoWidth;
		this.orignalHeight = this.source.tagName === 'IMG' ? this.source.height : this.source.videoHeight;
		this.ratio = this.opts.resolution / this.orignalWidth;
    this.width = this.ratio * this.orignalWidth;
    this.height = this.ratio * this.orignalHeight;

		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');

		this.worker = new Worker('./js/worker.js');
		this.worker.onmessage = (e) => {
			this.handleWorkerResponse(e);
		}
		this.worker.postMessage({
			type: 'init',
			opts: this.opts,
			ratio: this.ratio
		});

    this.colors = [];
    this.imageData = {};
		this.events = {};

		this.last = performance.now();
  }

	emit(event, data) {
		if(this.events[event]) {
			for(let i = 0; i < this.events[event].length; i++) {
				this.events[event][i](data);
			}
		}
	}

	on(event, callback) {
		if(!this.events[event]) this.events[event] = [];
		this.events[event].push(callback);
	}

  addColor(color) {
    this.colors.push(color);
  }

  run() {
		this.last = performance.now();
    this.ctx.drawImage(this.source, 0, 0, this.width, this.height);
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);

		this.worker.postMessage({
			type: 'track',
			colors: this.colors,
			imageData: this.imageData
		})
  }

	done(rects) {
		if(rects.length > 0) {
			this.emit('track', rects);
		}
		const now = performance.now();
		let wait = 1000/this.opts.fps - (now - this.last);
		if(wait < 0) wait = 0;

		setTimeout(() => {
			this.run();
		}, wait);
	}

	handleWorkerResponse(e) {
		if(e.data.type === 'track') {
			this.done(e.data.rects);
		}
	}
}
