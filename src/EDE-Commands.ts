import * as vscode from 'vscode';
import { OpenAI_API_request, wrapApiResponseInHTML } from './OpenAI-API';
import { VscodeBackgroundProcesses } from './VscodeBackgroundProcesses';

/**
 * This Class contains all the E.D.E commands.
 * 
 * It provides the following commands:
 * 
 * * translateCodeSnippet - Translates a code snippet to a language of your choice.
 * * translateCodeFile - Translates a code file to a language of your choice.
 * * askQuestion - Asks OpenAI API a question and returns a response.
 * * explainError - Asks OpenAI API to explain an error and suggest ways to fix it.
 * * errorDiagnostic - Asks OpenAI API to look for errors in the your current file and suggest ways to fix them.
 * * optimize - Asks OpenAI API to optimize the code and improve its performance.
 * * addDocumentation - Asks OpenAI API to add documentation to the code without making any changes to the code itself.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class EDE_Commands extends VscodeBackgroundProcesses{

    public storage: any;
    /**
     * Provides an explanation of a given error.
     * @returns void, however a pop up window is displayed to the user of the explanation.
     */
    explainError = async (): Promise<void> => {
        const error: string | undefined = await this.prompt("Enter your error: ");
        if (!error || error.length === 0) {
            return;
        }
        let response: string = await OpenAI_API_request(`Explain what this error means
        and why I am getting this error, using an example and suggest a way in which I can fix the error, here is the error: \n${error}`, this.storage);
        if (response.length > 750){
            response = await wrapApiResponseInHTML(response, this.storage);
            this.popUpWebView('Explenation: ', response);
            return;
        }
        this.popUpNotification(`Explenation: ${response}`, false);
    };


    /**
     * Searches through the current file for any errors or bugs and suggets a possible solution on how to correct them.
     * @returns void, however a pop up window is displayed to the user of the suggested solution.
     */
    runErrorDiagnostic = async (): Promise<void> => {
        const code: string | undefined = vscode.window.activeTextEditor?.document.getText();
        if (!code || code.length === 0) {
            this.popUpNotification("Un-able to read file", false);
            return;
        }
        let response: string = await OpenAI_API_request(`Look for any errors in this code and explain what the error means
        and the reason this error is occuring, using an example and suggest a way in which the error can be fixed, here is the code: \n${code}`, this.storage);
        if (response.length > 750){
            response = await wrapApiResponseInHTML(response, this.storage);
            this.popUpWebView('Error Diagnostic: ', response);
            return;
        }
        this.popUpNotification(`Error Diagnostic: ${response}`, false);
    };

    /**
     * Searches through the current file for any possible ways to make the code more eficient.
     * @returns void, however either a pop up window is displayed to the user of the optimizations made to the code, 
     * or the user is promted for a whole new file to be made containing the optimized code.
     */
    optimize = async (): Promise<void> => {
        const code: string | undefined = vscode.window.activeTextEditor?.document.getText();
        if (!code || code.length === 0) {
            this.popUpNotification("Un-able to read file", false);
        }
        const makeNewFile: string | undefined | void = await this.popUpNotification("Do you want to make a new file containing the translated code snippet?: ", true);
        //const makeNewFile: string = await prompt("Do you want to make a new file of the optimzied code? (y/n): ");
        let response: string = await OpenAI_API_request(`Optimize and improve this code, the desired result should be O(n) time complexity and O(n) sapce/and or memory or better performance, also remove all redundecies,
    and also add documentation in between each line of the code explaining what each line does, only return the optimized code, no other words, only the code, ONLY return the code, here is the code: \n${code}`, this.storage);
        if (makeNewFile === "Yes") {
            const fileName: string | undefined = this.getCurrentFileName();
            if (!fileName){
                return;
            }
            const fileExtension: string | undefined = this.getFileExtension();
            if (!fileExtension){
                return;
            }
            this.createNewFile(response, fileExtension.toLowerCase(), `${fileName}-OptimizedCode`);
            return;
        }
        if (response.length > 750){
            response = await wrapApiResponseInHTML(response, this.storage);
            this.popUpWebView('Optimized Code: ', response);
            return;
        }
        this.popUpNotification(`Optimized Code: ${response}`, false);
    };


    /**
     * Adds documentation the current file the user is on.
     * @returns void.
     */
    addDocumentation = async (): Promise<void> => {
        const document: vscode.TextDocument | undefined = vscode.window.activeTextEditor?.document;
        if (!document) {
            this.popUpNotification("no file found", false);
            return;
        }
        const code: string | undefined = document?.getText();
        if (code.length === 0) {
            return;
        }
        let response: string = await OpenAI_API_request(`Please add documentation to the following code without making any changes to the code itself. Please include the documentation along with the code. Here is the code: \n${code}`, this.storage);
        response = await wrapApiResponseInHTML(response, this.storage);
        this.popUpWebView('Documentation: ', response);

        // Edit the current file the user is working on:
        // if (response.length <= code.length){
        //     this.popUpWebView('Documentation: ', response);
        //     return;
        // };

        // const edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
        // const startPosition: vscode.Position = new vscode.Position(0, 0);
        // const endPosition: vscode.Position = new vscode.Position(document.lineCount, 0);
        // const range: vscode.Range = new vscode.Range(startPosition, endPosition);

        // edit.replace(document.uri, range, response);
        // vscode.workspace.applyEdit(edit);
        // this.popUpNotification(response, false);
        // return;
    };

    /**
    * Provides a webview on the documentation on what E.D.E can do and what E.D.E meant for (explaning the different commands and giving an example on how each command is used).
    * @returns void.
    */
    help = (): void => {
        const response = `<div class="markdown">
        <h1>E.D.E</h1>
        <p><em><code>Programmers spend about 50% of their time actually writing code and spend the other 90% of their time debugging code</code> ~ programmerWhoNeedsSlee....iMeanMoreCoffee.</em></p>
        <p>E.D.E stands for 'Error Diagnostic Extension', this is an extension developed by a programmer who just tired of those ambiguous and confusing error messages(@C++ 👀), tired of spending hours on sites like Stack Overflow just to find someone providing some random, outdated way to fix the error with no explanation, tired of head banging, tired of pulling my hair out(figuratively), tired of repeating the 'Oooh that's why' ~ Sheldon Cooper meme. Well that's why E.D.E was made, to utilize ai so one can become more efficient and productive. E.D.E is made to aid in your debugging process, using OpenAi's ChatGpt to look for errors in your code, and provide explanations on those errors, so you as a developer can have a better understanding on why an error is occurring and what different errors actually mean. E.D.E also provides possible solutions for errors that it finds, because it's just as important to understand how to implement a solution to fix an error.</p>
      </div>
      <style>
        .markdown {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          padding: 10px;
          background-color: #ffffff;
          border-radius: 5px;
        }
        h1 {
          font-size: 24px;
          margin-top: 0;
        }
        p {
          margin-bottom: 10px;
        }
        em {
          font-style: italic;
        }
        code {
          font-family: Consolas, monospace;
          background-color: #f8f8f8;
          padding: 2px 4px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
      </style>
      
      <div class="markdown">
        <h2>Commands:</h2>
        <hr>
        <ul>
          <li><code>Run Error Diagnostic</code> - this command will look for any errors in the current file you are working on, explain what the error means, give a supposed reason why this error is occurring, and also suggest a way in which the error can be fixed.</li>
          <li><code>Run Test</code> - this command runs a test on the current file, testing for errors, and also shows you how your current code is executing.</li>
          <li><code>Explain Error</code> - this command is used to explain an error you might not understand or have never seen before. This command requires you to copy-paste the error into the prompt that will ask you 'Enter your error: '.</li>
          <li><code>Optimize Current File</code> - this command looks for ways to optimize the code in the current file you are working on.</li>
          <li><code>Add Documentation</code> - this command will add documentation to the current file you are working on. It won't actually add it to the current file you are working on but pop up a web-view that has the documentation for your code. So you can see what documentation is necessary to add to your code.</li>
          <li><code>Change Your OpenAi API Key</code> - this command allows you to change your OpenAi Chatgpt API key in case you'd like to change it at some point.</li>
          <li><code>Change Max Token</code> - this command allows you to change your OpenAi Chatgpt API max token (the default is set to '1000'). 'You can think of tokens as pieces of words used for natural language processing. For English text, 1 token is approximately 4 characters or 0.75 words. As a point of reference, the collected works of Shakespeare are about 900,000 words or 1.2M tokens.' ~ <a href="https://openai.com/pricing">OpenAi</a> &lt;-- knil siht wollof snekot tuoba erom wonk ot ekil d'uoy fi</li>
          <li><code>Change OpenAi Model</code> - this command allows you to change your <a href="https://platform.openai.com/docs/models/overview">OpenAi AI model</a> in case you'd like to change it at some point (the default is set to 'gpt-3.5-turbo').</li>
          <li><code>Help</code> - this command will show this very README.md as a web view if you need help using E.D.E.</li>
        </ul>
      </div>
      <style>
        .markdown {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        h2 {
          font-size: 20px;
          margin-top: 0;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 10px 0;
        }
        ul {
          padding-left: 20px;
          margin-bottom: 10px;
        }
        li {
          margin-bottom: 5px;
        }
        code {
          font-family: Consolas, monospace;
          background-color: #f8f8f8;
          padding: 2px 4px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
      </style>
      
      <div class="markdown">
        <h2>Requirements:</h2>
        <hr>
        <p>E.D.E requires you to have your own OpenAi API Key in order to work.</p>
        <ul>
          <li>To get an OpenAi API Key, visit <a href="https://platform.openai.com/account/api-keys">openai.com</a> and sign up with OpenAi.</li>
          <li>To use the OpenAi API, it does cost money (I'll let you decide whether it is expensive or not). Visit <a href="https://openai.com/pricing">openai.com/pricing</a> to understand more about OpenAi's pricing options.</li>
        </ul>
      </div>
      <style>
        .markdown {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        h2 {
          font-size: 20px;
          margin-top: 0;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 10px 0;
        }
        ul {
          padding-left: 20px;
          margin-bottom: 10px;
        }
        li {
          margin-bottom: 5px;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
      
      <div class="markdown">
        <h2>Extension Settings:</h2>
        <hr>
        <ol>
          <li>
            <h3>Click on the E.D.E icon in the bottom right corner</h3>
            <img src="https://github.com/AranMesquita/Error-Diagnostic-Extension/blob/main/E-D-E/README-assets/E.D.E-icon.png" alt="E.D.E icon" width="350" height="125">
          </li>
          <li>
            <h3>A drop-down menu should appear showing all E.D.E commands, then click on the command you wish to use.</h3>
            <img src="https://github.com/AranMesquita/Error-Diagnostic-Extension/blob/main/E-D-E/README-assets/Drop-down-menu-1.png" alt="Drop-down menu" width="560" height="350">
          </li>
          <li>
            <h3>Click the 'Change Your Open AI API Key' command</h3>
            <img src="https://github.com/AranMesquita/Error-Diagnostic-Extension/blob/main/E-D-E/README-assets/change-api-key.png" alt="Change API Key" width="560" height="350">
          </li>
          <li>
            <h3>Then enter (copy + paste) your OpenAi API key and press 'enter'</h3>
            <img src="https://github.com/AranMesquita/Error-Diagnostic-Extension/blob/main/E-D-E/README-assets/enter-api-key.png" alt="Enter API Key" width="560" height="350">
          </li>
        </ol>
      </div>
      <style>
        .markdown {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        h2 {
          font-size: 20px;
          margin-top: 0;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 10px 0;
        }
        ol {
          padding-left: 20px;
          margin-bottom: 10px;
        }
        h3 {
          font-size: 18px;
          margin: 10px 0;
        }
        img {
          display: block;
          margin: 10px 0;
          max-width: 100%;
          height: auto;
        }
      </style>
      
      
      <div class="markdown">
        <h2>To use the E.D.E commands:</h2>
        <hr>
        <ol>
          <li>
            <h3>Make sure you are on the file you want to run an error diagnostic on/run a test on/optimize/add documentation to.</h3>
          </li>
          <li>
            <h3>Click on the E.D.E icon in the bottom right corner</h3>
            <img src="https://github.com/AranMesquita/Error-Diagnostic-Extension/blob/main/E-D-E/README-assets/E.D.E-icon.png" alt="E.D.E icon" width="350" height="125">
          </li>
          <li>
            <h3>A drop-down menu should appear showing all E.D.E commands, then click on the command you wish to use.</h3>
            <img src="https://github.com/AranMesquita/Error-Diagnostic-Extension/blob/main/E-D-E/README-assets/Drop-down-menu-1.png" alt="Drop-down menu" width="560" height="350">
          </li>
          <li>
            <h3>If the icon is not there, open the command palette</h3>
            <code>ctrl + shift + p</code>
          </li>
          <li>
            <h3>While the command palette is open, you can now search for the E.D.E commands</h3>
            <img src="https://github.com/AranMesquita/Error-Diagnostic-Extension/blob/main/E-D-E/README-assets/E.D.E-help.png" alt="Command palette" width="560" height="350">
          </li>
          <li>
            <h3>Click on the 'Help' command; this should activate the extension, and now you can use the extension as normal.</h3>
          </li>
        </ol>
      </div>
      <style>
        .markdown {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          padding: 10px;
          background-color: #000000;
          border-radius: 5px;
        }
        h2 {
          font-size: 20px;
          margin-top: 0;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 10px 0;
        }
        ol {
          padding-left: 20px;
          margin-bottom: 10px;
        }
        h3 {
          font-size: 18px;
          margin: 10px 0;
        }
        img {
          display: block;
          margin: 10px 0;
          max-width: 100%;
          height: auto;
        }
        code {
          font-family: Consolas, monospace;
          background-color: #000000;
          padding: 2px 4px;
        }
      </style>
      <div class="response">
        <p>If you've made it this far, here is a picture of a silly giraffe:</p>
        <img src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTI6tj4nGe5rPAFgqe_78kiWzfB8m000zJ8TcSSvgwM9-Krx0n8" alt="Silly Giraffe" width="150" height="200">
        </div>
        <style>
        .response {
            font-family: Arial, sans-serif;
            padding: 10px;
            background-color: #000000;
            border-radius: 5px;
            text-align: center;
        }
        p {
            font-size: 16px;
            margin-bottom: 10px;
            color: #ffffff;
        }
        img {
            display: block;
            margin: 0 auto;
            max-width: 100%;
            height: auto;
        }
        </style>`;
        this.popUpWebView("Help:", response);
    };


    /**
     * Runs a test on the current file the user is on, to show the user how the code in the current file is working.
     * @returns void. However a pop up window is showed to the user to show how E.D.E tested the code.
     */

    runTest = async (): Promise<void> => {
        const code: string | undefined = vscode.window.activeTextEditor?.document.getText();
        if (!code || code.length === 0) {
            this.popUpNotification("Un-able to read file", false);
            return;
        }
        let response: string = await OpenAI_API_request(`You are an ai that tests code to look for vulnerabilities, bugs and errors. Run a test on the code I provide, use random valid inputs on functions where applicable, 
        here is the code: \n${code}`, this.storage);
        if (response.length > 750){
            response = await wrapApiResponseInHTML(response, this.storage);
            this.popUpWebView('Test: ', response);
            return;
        }
        this.popUpNotification(`Test: ${response}`, false);
    };
};