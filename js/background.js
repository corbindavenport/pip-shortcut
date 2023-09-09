const contentScriptFunc = () => {
    const videos = document.querySelectorAll('video');
    // Loop through video elements until the one that is playing is found
    for (const video of videos) {
        // Find the currently-playing video
        if (!video.paused || (video.currentTime > 0)) {
            // Toggle PiP
            if (!document.pictureInPictureElement) {
                // Remove disablepictureinpicture attribute if present
                if (video.hasAttribute('disablepictureinpicture')) {
                    video.removeAttribute('disablepictureinpicture');
                }

                // Request PiP
                video.requestPictureInPicture();

                // setActionHandler() overrides any existing play or pause handlers, but there's not a way to detect if one has already been set
                // So this checks if there is mediaSession metadata, because if there is, there's *probably* already an action handler
                if (!navigator.mediaSession.metadata) {
                    navigator.mediaSession.setActionHandler('play', () => {
                        console.log('PiP Shortcut is attempting to play the video...');
                        video.play();
                    });
                    navigator.mediaSession.setActionHandler('pause', () => {
                        console.log('PiP Shortcut is attempting to pause the video...');
                        video.pause();
                    });
                }
            }
            else {
                document.exitPictureInPicture();
            }

            break;
        }
    }
}

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {
            tabId: tab.id
        },
        func: contentScriptFunc,
        injectImmediately: true
    });
});

chrome.runtime.onInstalled.addListener(async (details) => {
    // Show welcome message
    if (details.reason === 'install' || details.reason === 'update') {
        chrome.tabs.create({ 'url': chrome.runtime.getURL('main.html') });
    };
});