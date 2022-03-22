// Documentation: https://developer.chrome.com/docs/extensions/reference/commands

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: contentScriptFunc,
        args: ['action'],
    });
});

function contentScriptFunc(name) {
    var videos = document.querySelectorAll('video');
    // Loop through video elements until the one that is playing is found
    for (var i = 0; i < videos.length; ++i) {
        var video = document.querySelectorAll('video')[i];
        // Find the currently-playing video
        if (!video.paused || (video.currentTime > 0)) {
            // Toggle PiP
            if (!document.pictureInPictureElement) {
                // Remove disablepictureinpicture attribute if present
                if (video.hasAttribute('disablepictureinpicture')) {
                    video.removeAttribute('disablepictureinpicture')
                }
                // Request PiP
                video.requestPictureInPicture();
            } else {
                document.exitPictureInPicture();
            }
        }
    }
}

chrome.runtime.onInstalled.addListener(function () {
    handleNotif = function (id) {
        chrome.notifications.onClicked.addListener(function (id) {
            chrome.tabs.create({
                'url': 'chrome://extensions/shortcuts#:~:text=Picture%2Din%2DPicture%20Shortcut'
            })
        })
    }
    chrome.notifications.create({
        'type': 'basic',
        'iconUrl': chrome.runtime.getURL('img/icon128.png'),
        'title': 'Picture-in-Picture Shortcut installed!',
        // TODO: Say Command key for Mac users here, and see if it can programatically display the shortcut
        'message': 'Press Ctrl+Period to toggle PiP while a video is playing, or click here to change the shortcut.'
    }, handleNotif)
})