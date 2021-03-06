# Issue Labeler Browser Extension

Browser extension for Microsoft Edge or Google Chrome to predict area labels for .NET GitHub repos.

## Supported GitHub repos

The extension will only activate on GitHub pages for issues and pull requests for these repos:

1. https://github.com/dotnet/maui
1. https://github.com/dotnet/aspnetcore


## Installation and update

1. Clone this repo or download the repo as a ZIP
1. Go to the list of browser extensions for your browser:
   * In Edge navigate to <a href="edge://extensions/" target="_blank">edge://extensions/</a>
   * In Chrome navigate to <a href="chrome://extensions/" target="_blank">chrome://extensions/</a>
1. Enable **Developer Mode** so that you can install extensions from disk
1. Click **Load Unpacked** and select the `src` folder of the repo you cloned and click **OK**
1. You should now have the extension installed
1. Navigate to an issue in the MAUI or AspNetCore repo. If it doesn't have any "area" label(s) yet, you will see an area suggestion:<br/><img width="239" alt="image" src="https://user-images.githubusercontent.com/202643/162540732-e49239de-a43a-451b-864f-2ebff8f93a6e.png">
1. Open the list of labels to see the top 3 predictions, along with the confidence of those:<br/><img width="247" alt="image" src="https://user-images.githubusercontent.com/202643/162540792-6280b8dd-3006-42d4-8f1d-5b4ca703df29.png">
1. You can select any of the predicted area labels, or of course select any other labels as you normally would.

If you already have the extension and want to update:

1. Update your local copy of the extension by fetching again from this repo using Git, or download the ZIP and overwrite the local files.
1. In the browser extension list click **Reload** for this extension:<br />![image](https://user-images.githubusercontent.com/202643/162541864-534dc20c-8d2d-4c48-b15b-8e9305ef2bae.png)


Coming soon: install directly from browser extension gallery.

## Feedback and issues

Feedback, questions, or concerns? Please log an issue in this repo!

## Privacy Policy

No information, personal or otherwise, of any kind, will be stored by this application. For supported GitHub repositories (see above) the extension will transmit only the item's repo owner, repo name, and issue/PR number to a remote service to get the associated area predictions. None of these items contain personally identifiable information because they are all public issues on GitHub.
