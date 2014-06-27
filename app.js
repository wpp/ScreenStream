document.getElementById('start').addEventListener('click', function() {
  // send screen-sharer request to content-script
  window.postMessage({ type: 'SS_UI_REQUEST', text: 'start' }, '*');
});

// listen for messages from the content-script
window.addEventListener('message', function (event) {
  if (event.origin != window.location.origin) return;

  // content-script will send a 'SS_PING' msg if extension is installed
  if (event.data.type && (event.data.type === 'SS_PING')) {
    console.log('extension seems to be installed');
  }

  // user chose a stream
  if (event.data.type && (event.data.type === 'SS_DIALOG_SUCCESS')) {
    startScreenStreamFrom(event.data.streamId);
  }

  // user clicked on 'cancel' in choose media dialog
  if (event.data.type && (event.data.type === 'SS_DIALOG_CANCEL')) {
    console.log('User cancelled!');
  }
});

function startScreenStreamFrom(streamId) {
  navigator.webkitGetUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: streamId,
        maxWidth: window.screen.width,
        maxHeight: window.screen.height
      }
    }
  },
  // successCallback
  function(screenStream) {
    videoElement = document.getElementById('video');
    videoElement.src = URL.createObjectURL(screenStream);
    videoElement.play();
  },
  // errorCallback
  function(err) {
    console.log('getUserMedia failed!: ' + err);
  });
}
