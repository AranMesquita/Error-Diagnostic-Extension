import * as vscode from 'vscode';

export class VscodeBackgroundProcesses{
    /**
    * Displays a message in a pop-up window.
    * @param message - The message to display.
    * @param receiveInput - Set true to recieve a 'Yes' or 'No' input from the user.
    * @returns void.
    */
    protected popUpNotification = async (message: string, receiveInput: boolean): Promise<string | undefined | void> =>{
        if (receiveInput){
            return await vscode.window.showInformationMessage(message, 'Yes', 'No');
        }
        vscode.window.showInformationMessage(message);
    };


    /**
    * Displays a Web View.
    * @param title - The Title and/or heading(<h1>title</h1>) of the Web View.
    * @param response - The text to put into the body of the Web View.
    * @returns void.
    */
    protected popUpWebView = (title: string, response: string) => {
        const panel = vscode.window.createWebviewPanel(
            `${title}`,
            `${title}`,
            vscode.ViewColumn.Active,
            {}
        );
        panel.webview.html = `
        <h2>${title}</h2>
        ${response}
        `;
    };

    /**
     * Prompts the user for input and returns the input.
     * @param prompt - The prompt to display.
     * @returns A promise that resolves to the user's input.
     */
    protected prompt = async(prompt: string): Promise<string | undefined> => {
        const input: string | undefined = await vscode.window.showInputBox({ prompt: prompt, ignoreFocusOut: true });
        return input;
    };

    /**
     * Creates a new file and writes code into it.
     * @param code - The code to write into the file.
     * @param fileExtension - The file extension for the new file.
     * @param name - The name for the new file.
     * @returns void.
     */
    protected createNewFile = (code: string, fileExtension: string, name: string): void => {
        const folderPath: string = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const fileName: string = `new${name}.${fileExtension.replace(".", "")}`;
        const filePath: vscode.Uri = vscode.Uri.file(folderPath + '/' + fileName);
        const writeIntoFile: Uint8Array = new Uint8Array(Buffer.from(code));

        vscode.workspace.fs.writeFile(filePath, writeIntoFile).then(() => {
            vscode.window.showInformationMessage('File created: ' + fileName);
        }, (error) => {
            vscode.window.showErrorMessage('Error creating file: ' + error);
        });
    };

    /**
     * Gets the extension(.py or .js or .java etc) of the current file the user is busy working on.
     * @returns string --> the extension of the current file the user is working on.
     * @retruns undefined --> if the current file the user is on is unreadable.
     */
    protected getFileExtension = (): string | undefined => {
        const fileName: string | undefined = vscode.window.activeTextEditor?.document.fileName;
        if (!fileName) {
            return undefined;
        }
        let fromIndex: number = 0;
        for(let index = fileName?.length - 1; index >= 0; index--) {
            if (fileName[index] === '.') {
                fromIndex = index + 1;
                break;
            }
        }
        return fileName.slice(fromIndex, fileName.length);
    };


    /**
     * Gets the name of the current file the user is working on.
     * @returns string --> the name of the current file the user is working on.
     * @retruns undefined --> if the current file the user is on is unreadable.
     */
    protected getCurrentFileName = (): string | undefined => {
        const fileName: string | undefined = vscode.window.activeTextEditor?.document?.fileName;
        if(!fileName) {
            return undefined;
        }
        let fromIndex: number = 0;
        let toIndex: number = fileName?.length - 3;
        for(let index = fileName?.length; index >= 0; index--) {
            if (fileName[index] === '.') {
                toIndex = index;
            }
            if (fileName[index] === '\\') {
                fromIndex = index + 1;
                break;
            }
        }
        return fileName.slice(fromIndex, toIndex);
    };
};