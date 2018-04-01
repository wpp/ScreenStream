let desktopMediaRequestId = '';

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(msg => {
    if (msg.type === 'SS_UI_REQUEST') {
      requestScreenSharing(port, msg);
    }
    if (msg.type === 'SS_UI_CANCEL') {
      cancelScreenSharing(msg);
    }
  });
});

function requestScreenSharing(port, msg) {
  // https://developer.chrome.com/extensions/desktopCapture
  // params:
  //  - 'data_sources' Set of sources that should be shown to the user.
  //  - 'targetTab' Tab for which the stream is created.
  //  - 'streamId' String that can be passed to getUserMedia() API
  // Also available:
  //  ['screen', 'window', 'tab', 'audio']
  const sources = ['screen', 'window', 'tab', 'audio'];
  const tab = port.sender.tab;

  desktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia(
    sources,
    port.sender.tab,
    streamId => {
      if (streamId) {
        msg.type = 'SS_DIALOG_SUCCESS';
        msg.streamId = streamId;
      } else {
        msg.type = 'SS_DIALOG_CANCEL';
      }
      port.postMessage(msg);
    }
  );
}

function cancelScreenSharing(msg) {
  if (desktopMediaRequestId) {
    chrome.desktopCapture.cancelChooseDesktopMedia(desktopMediaRequestId);
  }
}

function flatten(arr) {
  return [].concat.apply([], arr);
}

// This avoids a reload after an installation
chrome.windows.getAll({ populate: true }, windows => {
  const details = { file: 'content-script.js', allFrames: true };

  flatten(windows.map(w => w.tabs)).forEach(tab => {
    // Skip chrome:// pages
    if (tab.url.match(/(chrome):\/\//gi)) {
      return;
    }

    // https://developer.chrome.com/extensions/tabs#method-executeScript
    // Unfortunately I don't know how to skip non authorized pages, and
    // executeScript doesn't have an error callback.
    chrome.tabs.executeScript(tab.id, details, () => {
      const { runtime: { lastError } } = chrome;

      if (
        lastError &&
        !lastError.message.match(/cannot access contents of url/i)
      ) {
        console.error(lastError);
      }

      console.log('After injection in tab: ', tab);
    });
  });
});
