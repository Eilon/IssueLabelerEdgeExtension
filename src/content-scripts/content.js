
var supportedRepos =
    [
        {
            "owner": "dotnet",
            "repo": "aspnetcore"
        },
        {
            "owner": "dotnet",
            "repo": "maui"
        }
    ];

// This 'waitForElm' code is from https://stackoverflow.com/a/61511955, by Yong Wang. License: CC BY-SA 4.0
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function areaLabelsEqual(area1, area2) {
    function simplifyArea(area) {
        var indexOfSpace = area.indexOf(" ");
        if (indexOfSpace === -1) {
            return area;
        }
        return area.substring(0, indexOfSpace);
    }

    area1 = simplifyArea(area1);
    area2 = simplifyArea(area2);

    // case-insensitive comparison
    return caseInsensitiveCompare(area1, area2);
}

function caseInsensitiveCompare(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0
}

function getCurrentUrlMetadata() {
    if (!caseInsensitiveCompare(window.location.hostname, "github.com")) {
        // If we're not on GitHub, return
        return null;
    }

    var currentGitHubPath = window.location.pathname; // something like: '/dotnet/maui/issues/5862' (no host, no hash/anchor, no query string)
    var pathParts = currentGitHubPath.split("/");

    if (pathParts.length !== 5) {
        // We're not on an Issue or PR page
        return null;
    }

    if (pathParts[0].length !== 0
        || ((pathParts[3] !== "issues") && (pathParts[3] !== "pull"))) {
        // We're not on an Issue or PR page
        return null;
    }

    return {
        "owner": pathParts[1],
        "repo": pathParts[2],
        "number": pathParts[4]
    };
}

function currentPageIsValidForPredictions() {
    var urlMetadata = getCurrentUrlMetadata();

    if (!urlMetadata) {
        return false;
    }

    return supportedRepos.some(
        supportedRepo =>
            caseInsensitiveCompare(supportedRepo.owner, urlMetadata.owner) &&
            caseInsensitiveCompare(supportedRepo.repo, urlMetadata.repo)
    );
}

function isAreaLabel(label) {
    var normalizedLabel = label.toLocaleLowerCase();
    return normalizedLabel.startsWith("area/")
        || normalizedLabel.startsWith("area-")
        || normalizedLabel.startsWith("area:");
}

if (currentPageIsValidForPredictions()) {
    waitForElm('.js-issue-labels').then((labelGroup) => {

        // When label section becomes available, check if it already has an area label

        if (labelGroup && labelGroup.childNodes.length > 0) {
            var foundAreaLabels = [];

            for (let index = 0; index < labelGroup.childNodes.length; index++) {
                const element = labelGroup.childNodes[index];
                if (element.tagName === "A") {
                    var labelName = element.getAttribute("data-name");
                    if (isAreaLabel(labelName)) {
                        foundAreaLabels.push(
                            {
                                "element": element,
                                "areaLabel": labelName
                            });
                    }
                }
            }

            if (foundAreaLabels.length === 0) {
                // If there are no area labels applied, show a message, and also go get predictions ready
                var noAreaAlertSpan = document.createElement('span');
                noAreaAlertSpan.innerText = "Needs area!";
                noAreaAlertSpan.style.backgroundColor = "white";
                noAreaAlertSpan.style.borderRadius = "8px";
                noAreaAlertSpan.style.color = "red";
                noAreaAlertSpan.style.border = "3px dashed red";
                noAreaAlertSpan.style.fontWeight = 400;
                labelGroup.appendChild(noAreaAlertSpan);

                // Send request to service worker to make API call to get label predictions for this issue or PR

                var urlMetadata = getCurrentUrlMetadata();

                chrome.runtime.sendMessage(
                    {
                        "msg": "getpredictions",
                        "owner": urlMetadata.owner,
                        "repo": urlMetadata.repo,
                        "number": urlMetadata.number
                    },
                    predictions => {
                        if (predictions.error) {
                            console.error("ERROR RETRIEVING PREDICTIONS" + predictions.error);
                            noAreaAlertSpan.innerText = "ERROR: " + predictions.error;
                        }
                        else {
                            actualLabelPredictions = predictions.labelScores;

                            var bestLabel = predictions['labelScores'][0]['labelName'];
                            noAreaAlertSpan.innerText = "Consider: " + bestLabel;

                            updatePredictions();
                        }
                    });

                // Predictions JSON looks like:
                // {
                //     "labelScores":
                //         [
                //             { "labelName": "area/blazor \uD83D\uDD78️", "score": 0.850744 },
                //             { "labelName": "area/setup \uD83E\uDE84", "score": 0.06806205 },
                //             { "labelName": "area/tooling ⚙️", "score": 0.027669718 }]
                // }
            }
        }
    });

    var actualLabelPredictions = undefined;

    function updatePredictions() {
        var labelSelectionMenuResult = document.getElementsByClassName('js-filterable-issue-labels');
        if (!labelSelectionMenuResult || !labelSelectionMenuResult.length || !actualLabelPredictions) {
            return;
        }

        var predictedAreaLabelMatches = [];

        labelSelectionMenu = labelSelectionMenuResult[0];
        labelSelectionMenu.childNodes.forEach(element => {
            if (element.tagName === "LABEL") {
                var labelName = document.evaluate("div/input/@data-label-name", element, null, XPathResult.STRING_TYPE, null).stringValue;

                var matchingPredictions = actualLabelPredictions.filter(predictedLabel => areaLabelsEqual(predictedLabel["labelName"], labelName));
                if (matchingPredictions.length == 1) {
                    predictedAreaLabelMatches.push(
                        {
                            "element": element,
                            "areaLabel": labelName,
                            "score": matchingPredictions[0]["score"]
                        });
                }
            }
        });

        if (predictedAreaLabelMatches.length > 0) {

            // sort in reverse order or score (lowest to highest) so that when we move the predictions to the top of the list
            // of labels, the best (highest) prediction is inserted to the top position last, thus appearing first in the list.
            predictedAreaLabelMatches.sort((a, b) => a["score"] - b["score"]);

            for (let index = 0; index < predictedAreaLabelMatches.length; index++) {
                const predictedAreaLabelMatch = predictedAreaLabelMatches[index];

                var labelElement = predictedAreaLabelMatch["element"];

                labelElement.style.border = "2px solid purple";

                var nameMatchResults = document.evaluate(".//span[@class='name']", labelElement);
                if (nameMatchResults) {
                    var nameElement = nameMatchResults.iterateNext();
                    var predictionSpan = document.createElement('span');
                    if (predictedAreaLabelMatch.score > 0.60) {
                        foreColor = "white";
                        backColor = "green";
                    }
                    else if (predictedAreaLabelMatch.score > 0.20) {
                        foreColor = "white";
                        backColor = "orange";
                    }
                    else {
                        foreColor = "black";
                        backColor = "yellow";
                    }

                    predictionSpan.style.fontWeight = "bold";
                    predictionSpan.style.color = foreColor;
                    predictionSpan.style.backgroundColor = backColor;
                    predictionSpan.style.marginLeft = "5px";
                    predictionSpan.style.padding = "2px";

                    predictionSpan.innerText = "P: " + Math.round(predictedAreaLabelMatch.score * 100) + "%";

                    nameElement.appendChild(predictionSpan)
                }

                labelSelectionMenu.removeChild(labelElement);
                labelSelectionMenu.insertBefore(labelElement, labelSelectionMenu.firstChild);
            }

        }
    }

    waitForElm('.js-filterable-issue-labels').then((labelSelectionMenu) => {
        // When the issue/PR label menu opens, update the predictions
        updatePredictions();
    });

}
