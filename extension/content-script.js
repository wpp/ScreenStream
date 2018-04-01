// https://chromeextensionsdocs.appspot.com/apps/content_scripts#host-page-communication
//   - 'content_script' and execution env are isolated from each other
//   - In order to communicate we use the DOM (window.postMessage)
//
// app.js            |        |content-script.js |      |background.js
// window.postMessage|------->|port.postMessage  |----->| port.onMessage
//                   | window |                  | port |
// getUserMedia      |<------ |window.postMessage|<-----| port.postMessage
//
window.contentScriptHasRun = false;

(function() {
  // prevent the content script from running multiple times
  if (window.contentScriptHasRun) {
    return;
  }

  window.contentScriptHasRun = true;

  const port = chrome.runtime.connect(chrome.runtime.id);
  port.onMessage.addListener(msg => {
    window.postMessage(msg, '*');
  });

  window.addEventListener(
    'message',
    event => {
      // Only accept messages from ourselves
      if (event.source !== window) {
        return;
      }
      // Only accept events with a data type
      if (!event.data.type) {
        return;
      }

      if (['SS_UI_REQUEST', 'SS_UI_CANCEL'].includes(event.data.type)) {
        port.postMessage(event.data);
      }
    },
    false
  );

  window.postMessage({ type: 'SS_PING', text: 'start' }, '*');
})();
