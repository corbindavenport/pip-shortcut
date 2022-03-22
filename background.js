// Documentation: https://developer.chrome.com/docs/extensions/reference/commands

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: contentScriptFunc,
        args: ['action'],
    })
})

function contentScriptFunc(name) {
    var videos = document.querySelectorAll('video')
    // Loop through video elements until the one that is playing is found
    for (var i = 0; i < videos.length; ++i) {
        var video = document.querySelectorAll('video')[i]
        // Find the currently-playing video
        if (!video.paused || (video.currentTime > 0)) {
            // Toggle PiP
            if (!document.pictureInPictureElement) {
                // Remove disablepictureinpicture attribute if present
                if (video.hasAttribute('disablepictureinpicture')) {
                    video.removeAttribute('disablepictureinpicture')
                }
                // Request PiP
                video.requestPictureInPicture()
                // setActionHandler() overrides any existing play or pause handlers, but there's not a way to detect if one has already been set
                // So this checks if there is mediaSession metadata, because if there is, there's *probably* already an action handler
                if (!navigator.mediaSession.metadata) {
                    navigator.mediaSession.setActionHandler('play', function () {
                        console.log('PiP Shortcut is attempting to play the video...')
                        video.play()
                    })
                    navigator.mediaSession.setActionHandler('pause', function () {
                        console.log('PiP Shortcut is attempting to pause the video...')
                        video.pause()
                    })
                }
            } else {
                document.exitPictureInPicture()
            }
            break
        }
    }
}

chrome.runtime.onInstalled.addListener(function () {
    // Set message depending on OS
    var notification = {
        'type': 'basic',
        'iconUrl': chrome.runtime.getURL('img/icon128.png'),
        'title': 'Picture-in-Picture Shortcut installed!',
        'buttons': [{
            title: 'Change keyboard shortcut'
        },
        {
            title: 'Join Discord'
        }
        ]
    }
    if (navigator.userAgentData.platform === 'macOS') {
        notification.message = 'Press Command+Period to toggle PiP while a video is playing.'
    } else {
        notification.message = 'Press Ctrl+Period to toggle PiP while a video is playing.'
    }
    // Handle notification click
    handleNotif = function () {
        chrome.notifications.onButtonClicked.addListener(function (id, i) {
            console.log(id, i)
            if (i === 0) {
                // Open settings button
                chrome.tabs.create({
                    'url': 'chrome://extensions/shortcuts#:~:text=Picture%2Din%2DPicture%20Shortcut'
                })
            } else if (i === 1) {
                chrome.tabs.create({ url: 'https://discord.com/invite/59wfy5cNHw' })
            }
        })
    }
    // Send notification
    chrome.notifications.create(notification, handleNotif)
})