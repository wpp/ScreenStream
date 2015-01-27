## Note

*This project has been merged into https://github.com/GoogleChrome/webrtc in
case something doesn't work have [a look over
there.](https://github.com/GoogleChrome/webrtc/tree/master/samples/web/content/getusermedia/desktopcapture)*

*This demo app shows you how to use a Chrome extension to access the
`desktopCapture` API in your web-application.*

(If you're writing a WebRTC app with screen sharing, and want to avoid sending
users to `chrome://flags`)

<img src="images/3.gif">

## Index

- [Setup](#setup)
- [How does it work?](#how)
    - [Application (our web-app)](#app)
    - [Extension](#extension)
    - [Glueing it together](#glue)
- [Credits](#credits)

<a name="setup"></a>
# Setup

For the Demo to work, you will need to do 2 things:

## 1. Serve `index.html` over https.

    $ cd ~/wherever/you/cloned/the/repo/screenstream
    $ ruby server

Open Chrome and go to [https://localhost:8000]().
You should see: <img src="images/1.png">

## 2. Install the extension:

1. Go to [chrome://extensions]()
2. Check "Developer mode"
3. Click "Load unpacked extension..."
4. In the dialog choose the `extension` folder from the repository

You should see: <img src="images/2.png">

NOTE: your ID will differ, that's fine though.

<a name="how"></a>
# How does it work?

<a name="app"></a>
## Application (our web-app)

The `index.html` file contains a "Share screen" button, an empty `<video>` tag
and loads some javascript (`app.js`). Think of these two files as our
"application".

<a name="extension"></a>
## Extension

The extension consists of 4 files:

1. background.js
2. content-script.js
3. manifest.json
4. icon.png // not important

### background.js

> holds the main logic of the extension

or in our case, has access to the [desktopCapture
API](https://developer.chrome.com/extensions/desktopCapture). We get access to
this API when we ask for permission in `manifest.json`:

    "permissions": [
      "desktopCapture",
      "https://localhost:8000/*"
    ]

The background page ("background.js" - chrome generates the related html for us)
runs in the extension process and is therefore isolated from our application
environment. Meaning that we don't have a direct way to talk to our application.
That's why we have the content-script.

[1](https://developer.chrome.com/extensions/background_pages)

### content-script.js

> If your extension needs to interact with web pages, then it needs a content
> script. A content script is some JavaScript that executes in the context of a
> page that's been loaded into the browser.

[2](https://developer.chrome.com/extensions/overview#contentScripts)

The content-script does not have access to variables or functions defined on our
page, but it **has access to the DOM**.

<a name="glue"></a>
## Glueing it together


In order to call `navigator.webkitGetUserMedia` in **app.js**, we need a
chromeMediaSourceId which we get from our **background page**.

We have to pass messages through the chain below (left to right):

    app.js            |        |content-script.js |      |background.js       | desktopCapture API
    ------------------|        |------------------|      |--------------------|
    window.postMessage|------->|port.postMessage  |----->|port.onMessage------+
                      | window |                  | port |                 get|*streamID*
    webkitGetUserMedia|<------ |window.postMessage|<-----|port.postMessage<---+

Lets run through the chain:

When the user clicks on "Share Screen", we post a message to **window**,
because...

    window.postMessage({ type: 'SS_UI_REQUEST', text: 'start' }, '*');

the **content-script has access to the DOM.**

    window.addEventListener('message', function(event) {
        if (event.data.type && ((event.data.type === 'SS_UI_REQUEST'))) {
            port.postMessage(event.data);
        }
    }, false);

the content-script can also **talk to the background page**

    var port = chrome.runtime.connect(chrome.runtime.id);

the **background page is listening on that port**,

    port.onMessage.addListener(function (msg) {
      if(msg.type === 'SS_UI_REQUEST') {
        requestScreenSharing(port, msg);
      }

gets access to the stream, and **sends a message containing the
chromeMediaSourceId (`streamID`) back to the port** (the content-script)

    function requestScreenSharing(port, msg) {
      desktopMediaRequestId =
      chrome.desktopCapture.chooseDesktopMedia(data_sources, port.sender.tab,
      function (streamId) {
        msg.type = 'SS_DIALOG_SUCCESS';
        msg.streamId = streamId;
        port.postMessage(msg);
      });
    }

the content-script posts it back to app.js

    port.onMessage.addListener(function(msg) {
        window.postMessage(msg, '*');
    });

where we finally call `navigator.webkitGetUserMedia` with the `streamID`

    if (event.data.type && (event.data.type === 'SS_DIALOG_SUCCESS')) {
      startScreenStreamFrom(event.data.streamId);
    }

    function startScreenStreamFrom(streamId) {
      navigator.webkitGetUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: streamId,
            // ...
          }
        }
      },
      // successCallback
      function(screenStream) {
        videoElement = document.getElementById('video');
        videoElement.src = URL.createObjectURL(screenStream);
        videoElement.play();
      }

*Please note that the code examples in this README are edited for brevity,
complete code is in the corresponding files.*

<a name="credits"></a>
# Credits

Thanks to the guys and gals at [&yet](http://andyet.com/) for [talky.io]()

Thanks to [stackoverflow user Dima
Stopel](stackoverflow.com/questions/14267010/) for:

    openssl genrsa 2048 > private.pem
    openssl req -x509 -new -key private.pem -out public.pem

# License

[MIT](http://opensource.org/licenses/MIT)
