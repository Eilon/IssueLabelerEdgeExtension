function getPredictionUrl(predictionRequest) {

  var repoMappings =
  {
    "dotnet/aspnetcore": "https://dotnet-aspnetcore-labeler.azurewebsites.net/api/WebhookIssue/dotnet/aspnetcore/{0}",
    "dotnet/maui": "https://dotnet-aspnetcore-labeler.azurewebsites.net/api/WebhookIssue/dotnet/maui/{0}"
  };

  var urlPattern = repoMappings[`${predictionRequest.owner}/${predictionRequest.repo}`];

  if (!urlPattern) {
    return null;
  }

  var predictorUrl = urlPattern.replace('{0}', predictionRequest.number);

  return predictorUrl;
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {

    if (request.msg === "getpredictions") {

      var predictorUrl = getPredictionUrl({
        "owner": request.owner,
        "repo": request.repo,
        "number": request.number
      });

      if (!predictorUrl) {
        sendResponse({ "error": "Unsupported repo" });
        return;
      }

      fetch(predictorUrl)
        .then(r => {
          if (!r.ok) {
            throw { "error": r.status };
          }
          return r;
        })
        .then(r => r.json())
        .then(j => sendResponse(j))
        .catch(error => {
          sendResponse(error);
        });

      return true; // Will respond asynchronously.
    };

  });
