// Documentation: https://developer.chrome.com/docs/extensions/reference/commands

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
    });
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === 'openShortcutPage') {
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts#:~:text=Picture%2Din%2DPicture%20Shortcut' });
        }
    }
);

chrome.runtime.onInstalled.addListener(() => {
    // Set message depending on OS
    const notification = {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('img/icon128.png'),
        title: 'Picture-in-Picture Shortcut installed!',
        buttons: [
            {
                title: 'Change shortcut'
            },
            {
                title: 'Join Discord'
            }
        ],
        message: navigator.userAgentData.platform === 'macOS'
            ? 'Press Command+Period to toggle PiP while a video is playing.'
            : 'Press Ctrl+Period to toggle PiP while a video is playing.',
    };

    // Send notification
    chrome.notifications.create(notification, () => {
        // Handle notification click
        chrome.notifications.onButtonClicked.addListener((_, buttonIndex) => {
            if (buttonIndex === 0) {
                // Open settings button
                chrome.tabs.create({ url: 'chrome://extensions/shortcuts#:~:text=Picture%2Din%2DPicture%20Shortcut' });
            } else if (buttonIndex === 1) {
                // Open Discord
                chrome.tabs.create({ url: 'https://discord.com/invite/59wfy5cNHw' });
            }
        });
    });
});