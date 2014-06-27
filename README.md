Here is how you get access to the users screen with a chrome extension.

# Setup

## Server

You will need to serve the `index.html` file over https.

    $ cd ~/wherever/you/cloned/the/repo/screenstream
    $ ruby server

Open Chrome and go to [https://localhost:8000]().
If everything worked you should see: <img src="images/1.png">

## Extension

For the demo to work, you need to install the extension:

1. Go to [chrome://extensions/]()
2. Check "Developer mode"
3. Click "Load unpacked extension..."
4. In the dialog choose the `extension` folder from the repository

If everything worked you should see: <img src="images/2.png">

NOTE: your ID will differ, that's fine though.

# Explanation

The `index.html` file contains a very simple "Share screen" button, an empty `<video>` tag
and loads some javascript `app.js`.

In `app.js` we first add an EventListener to react to the users click.

    document.getElementById('start').addEventListener('click', function() {
      // send screen-sharer request to content-script
      window.postMessage({ type: 'SS_UI_REQUEST', text: 'start' }, '*');
    });

the third line is where it gets interesting:

TODO finish the readme :)

> If your extension needs to interact with web pages, then it needs a content script. A content script is some JavaScript that executes in the context of a page that's been loaded into the browser.

[1](https://developer.chrome.com/extensions/overview#contentScripts)

# Credits

Thanks to the guys and gals at [&yet](http://andyet.com/) for [talky.io]()

Thanks to [stackoverflow user Dima Stopel](http://stackoverflow.com/questions/14267010/how-to-create-self-signed-ssl-certificate-for-test-purposes) for:

    openssl genrsa 2048 > private.pem
    openssl req -x509 -new -key private.pem -out public.pem
