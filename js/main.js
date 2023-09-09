// Add version number to welcome page
document.querySelector('#version').textContent = chrome.runtime.getManifest().version;

// Add keyboard shortcut to page
chrome.commands.getAll().then(async function (commands) {
    const platformInfo = await chrome.runtime.getPlatformInfo();
    if (platformInfo.os === 'mac') {
        var defaultShortcut = '⌘.';
    } else {
        var defaultShortcut = 'Ctrl.'
    }
    document.querySelector('#shortcut').textContent = (commands[0].shortcut || defaultShortcut);
});

// Open browser keyboard shortcut setting
document.querySelector('#keyboard-shortcut-btn').addEventListener('click', async function () {
    // Firefox cannot automatically navigate to the keyboard shortcut configuration page
    if (window.navigator.userAgent.includes('Firefox')) {
        const bsCollapse = new bootstrap.Collapse('#firefoxShortcutCollapse').show();
    } else {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts#:~:text=Picture%2Din%2DPicture%20Shortcut' });
    };

});
