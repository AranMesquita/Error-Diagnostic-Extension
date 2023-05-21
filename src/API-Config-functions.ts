import * as vscode from 'vscode';

/**
 * Checks to see if the user already has an API key if the user does not the user is then asked to provide one.
 * @returns string --> The API key.
 * @returns empty string --> If a API key is not provided.
 */
export const getApiKey = async (storage: any): Promise<string> => {
    let apiKey: string | undefined = storage.get(`apikey`);
	if (apiKey === undefined){
        const input: string | undefined = await vscode.window.showInputBox({ prompt: "Please enter your Open AI Api key inorder for E.D.E to work.", ignoreFocusOut: true });
        if (input === undefined){
            return "";
        }
		storage.update('apikey', input);
        return input;
		};
    return apiKey;
};

/**
 * @returns number --> The max tokens for the Open AI API request.
 */
export const getMaxTokens = (storage: any): number => {
    let maxTokens: number | undefined = Number(storage.get(`maxToken`));
    return maxTokens ? Number(maxTokens) : 1000;
};

/**
 * @returns string --> The Ai model for the Open AI API request.
 */
export const getAiModel = (storage: any): string => {
    let apiModel: string | undefined = storage.get(`model`);
    return apiModel ? apiModel : "gpt-3.5-turbo";
};
    

/**
 * Provided for the user, if the user whishes to increase/decrease the max tokens to increase or decrease the maximum length of a response from Open AI.
 * @returns void --> Changes the max tokens that will be returned when getMaxTokens variable is called.
 */
export const changeMaxToken = async (storage: any): Promise<void> => {
        const input: string | undefined = await vscode.window.showInputBox({ prompt: "Please enter new maxToken.", ignoreFocusOut: true });
        if (input === undefined){
            return;
        }
		storage.update('maxToken', Number(input));
};

/**
 * Provided for the user, To change there Open AI API key if they make a new API key.
 * @returns void --> Changes the already given API key to a new one.
 */
export const changeApiKey = async (storage: any): Promise<void> => {
    const input: string | undefined = await vscode.window.showInputBox({ prompt: "Please enter your new OpenAI Api key.", ignoreFocusOut: true });
    if (input === undefined){
        return;
    }
    storage.update('apikey', input);
};

export const changeAiModel = async (storage: any): Promise<void> => {
    const input: string | undefined = await vscode.window.showInputBox({ prompt: "Please enter your new OpenAI model.", ignoreFocusOut: true });
        if (input === undefined){
            return;
        }
        storage.update('model', input);
};