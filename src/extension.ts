// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { EDE_Commands } from './EDE-Commands';
import { getApiKey, changeMaxToken, changeApiKey, changeAiModel } from "./API-Config-functions";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const EDE = new EDE_Commands;
	EDE.storage = context.globalState;

	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	statusBarItem.command = 'E-D-E.Icon';
	statusBarItem.text = '$(debug-console~spin) E.D.E';
	statusBarItem.tooltip = 'E.D.E Commands';
	statusBarItem.show();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('E.D.E is now active!');

	getApiKey(context.globalState);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.ErrorDiagnostic', () =>{
		EDE.runErrorDiagnostic();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.RunTest', () =>{
		EDE.runTest();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.ExplainError', () =>{
		EDE.explainError();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.Optimize', () =>{
		EDE.optimize();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.AddDocumentation', () =>{
		EDE.addDocumentation();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.ChangeMaxToken', () =>{
		changeMaxToken(EDE.storage);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.ChangeApiKey', () =>{
		changeApiKey(EDE.storage);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.Help', () =>{
		EDE.help();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.ChangeAiModel', () =>{
		changeAiModel(EDE.storage);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.showCommands', () => {
		vscode.window.showQuickPick(['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6', 'Option 7', 'Option 8', 'Option 9']);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('E-D-E.Icon', () => {
		const options = [
			{ label: 'Run Error Diagnostic', action: () => EDE.runErrorDiagnostic()},
			{ label: 'Run Test', action: () => EDE.runTest()},
			{ label: 'Explain Error', action: () => EDE.explainError()},
			{ label: 'Optimize Current File', action: () => EDE.optimize()},
			{ label: 'Add Documentation', action: () => EDE.addDocumentation()},
			{ label: 'Change Your OpenAi API Key', action: () => changeApiKey(EDE.storage)},
			{ label: 'Change Max Token', action: () => changeMaxToken(EDE.storage)},
			{ label: 'Change OpenAi Model', action: () => changeAiModel(EDE.storage)},
			{ label: 'Help', action: () => EDE.help()},
		];
	  
		vscode.window.showQuickPick(options.map(option => option.label))
		.then(selectedOption => {
			const selectedOptionIndex = options.findIndex(option => option.label === selectedOption);
			if (selectedOptionIndex !== -1) {
				options[selectedOptionIndex].action();
			}
		});
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {};