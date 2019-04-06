
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
  const yellow = {
    name: 'yellow',
    threshold: 50,
    color: [255, 229, 67]
  }
	const red = {
    name: 'red',
    threshold: 50,
    color: [239, 86, 79]
  }
	const green = {
    name: 'green',
    threshold: 50,
    color: [78, 195, 166]
  }

  const tracker = new ColorTracker(video);
  tracker.addColor(yellow);
	tracker.addColor(red);
	tracker.addColor(green);
	tracker.run();

	let trackings = [];

	tracker.onTrack = (rects) => {
		trackings = rects;
	}


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
