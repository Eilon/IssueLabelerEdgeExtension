chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {

    if (request.msg === "getpredictions") {
      var predictorUrl = `https://dotnet-aspnetcore-labeler.azurewebsites.net/api/WebhookIssue/${request.owner}/${request.repo}/${request.number}`;
      try {
        fetch(predictorUrl).then(r => r.json().then(j => sendResponse(j)));
      }
      catch (e) {

      }

      return true; // Will respond asynchronously.
    };

  });
