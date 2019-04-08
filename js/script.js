
const video = document.querySelector('video');
navigator.mediaDevices.getUserMedia({
	audio: false,
	video: {
		width: 1280,
		height: 720,
		frameRate: {
      ideal: 60,
      min: 15
    }
	}
}).then((mediaStream) => {
  video.srcObject = mediaStream;
  video.onloadedmetadata = function(e) {
    video.play();
    init();
  };
})

function init() {
  const tracker = new ColorTracker(video, {
		fps: 60
	});
  tracker.addColor({
    name: 'yellow',
    threshold: 50,
    color: [245, 248, 169]
  });
	tracker.addColor({
    name: 'red',
    threshold: 50,
    color: [153, 37, 52]
  });
	tracker.run();

	let trackings = [];

	let last = performance.now();
	const fps = [];

	tracker.on('track', (rects) => {
		const now = performance.now();
		fps.unshift(now - last);
		last = now;
		fps.splice(60);
		document.querySelector('h2').innerHTML = Math.round(fps.reduce((sum, val) => sum + val) / fps.length);
		trackings = rects;
	});


  const ctx = document.querySelector('canvas').getContext('2d');

  loop();
  function loop() {
    ctx.canvas.width = ctx.canvas.width;

    trackings.forEach((t) => {
			ctx.beginPath();
      ctx.rect(
        t.rect.left,
        t.rect.top,
        t.rect.right - t.rect.left,
        t.rect.bottom - t.rect.top
      );
      ctx.fillStyle = t.color;
      ctx.fill();
    })

    window.requestAnimationFrame(loop);
  }
}
