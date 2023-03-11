// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
// import axios from 'axios';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "devassistant" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('devassistant.helloWorld1', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from devassistant1!');
	});

	// The commandId parameter must match the command field in package.json
	let understandThisCommand = vscode.commands.registerCommand('devassistant.understandThis', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		const editor = vscode.window.activeTextEditor;
		if(editor){
			const selectedText = editor.document.getText(editor.selection);
			if(!selectedText){
				vscode.window.showErrorMessage('please select the code section you need to understand');
				return;
			}
			
			vscode.window.showInformationMessage('🤔 Thinking ...');
			const webviewPanel = vscode.window.createWebviewPanel(
				'devAssistant',
				'Dev Assistant',
				vscode.ViewColumn.One,
				{
					enableForms: true, 
					enableScripts: true,
					localResourceRoots: [ vscode.Uri.joinPath(context.extensionUri, 'src/css')]
				}
			);

			// Get path to resource on disk
			const cssFile = vscode.Uri.joinPath(context.extensionUri, 'src/css', 'styles.css');
			const data = await getData(selectedText);
			const cssFileUri = webviewPanel.webview.asWebviewUri(cssFile);
			webviewPanel.webview.html = getHtml({selectedText, data, cssUriArray: [cssFileUri]});

		}


	});

	const getData = async (query: string = ''): Promise<any> => {
		
	};


	const getHtml = ({selectedText, data, cssUriArray}: { selectedText: string, data?: any, cssUriArray?: vscode.Uri[]}): string => {

		let css : string = "";

		if(cssUriArray){
			cssUriArray?.forEach(element => {
				css += `<link rel="stylesheet" href="${element}">`;
			});
		}





		return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			${css}
			<title>Cat Coding</title>
		</head>
		<body>
			<section>
				<div> 
					<input id="queryInput" type="text" class="formControl">
				</div>

				<div> Result content : ${selectedText} </div>

				<div>
					<p> ${data} </p>
				</div>
			</section>

			<script >
				let input = document.getElementById("queryInput");
				input.addEventListener('keyup', (e) => {
					console.log(e.target.value);
				})
			</script>
		</body>
		`;
	};

	context.subscriptions.push(understandThisCommand);
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
