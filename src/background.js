chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "get_snapshot") {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tabId = tabs[0].id;
            try {
                await chrome.debugger.attach({ tabId }, "1.3");
                await chrome.debugger.sendCommand({ tabId }, "DOM.enable");
                await chrome.debugger.sendCommand({ tabId }, "DOMSnapshot.enable");

                const snapshot = await chrome.debugger.sendCommand(
                    { tabId },
                    "DOMSnapshot.captureSnapshot",
                    {
                        computedStyles: [],
                        includeDOMRects: true,
                        includePaintOrder: true
                    }
                );

                chrome.debugger.detach({ tabId });
                sendResponse(snapshot);
            } catch (e) {
                document.getElementById("result").innerHTML = "Erro ao carregar o snapshot"
                try { chrome.debugger.detach({ tabId }); } catch(err){}
                sendResponse(null);
            }
        });

        return true;
    }
});
