document.getElementById('shortcut-btn').addEventListener('click', (el) => {
    console.log('hi')
    chrome.runtime.sendMessage({action: "openShortcutPage"});
})
