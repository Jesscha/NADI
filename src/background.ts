chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension Installed');
  getAuthTokenInteractive();
  console.log("getAuthTokenInteractive")  
});

function getAuthTokenInteractive() {
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError || !token) {
      console.error(chrome.runtime.lastError);
      return;
    }
    // 이 토큰을 사용해 Google API를 호출할 수 있습니다.
    console.log('Access token:', token);

    // Access token을 새 탭 페이지로 전달하거나, 다른 API 호출 로직을 추가하세요.
    chrome.runtime.sendMessage({ type: 'authToken', token: token });
  });
}

chrome.action.onClicked.addListener(() => {
  getAuthTokenInteractive();
});
