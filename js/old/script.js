
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
  const tracker = new ColorTracker(video);
  tracker.addColor({
    name: 'yellow',
    threshold: 50,
    color: [245, 248, 169]
  });
	tracker.addColor({
    name: 'red',
    threshold: 50,
    color: [239, 86, 79]
  });
	/*tracker.addColor({
    name: 'green',
    threshold: 50,
    color: [78, 195, 166]
  });*/
	tracker.run();

	let trackings = [];

	tracker.on('track', (rects) => {
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
