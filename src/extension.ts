import * as vscode from 'vscode';
import axios from 'axios';
import { ConversationDto, Roles } from './dto/conversation.dto';
import {encode, decode} from 'gpt-3-encoder';
// import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "devassistant" is now active!');

	let disposable = vscode.commands.registerCommand('devassistant.helloWorld1', () => {

		vscode.window.showInformationMessage('Hello World from devassistant1!');
	});

	let understandThisCommand = vscode.commands.registerCommand('devassistant.understandThis', async () => {

		const editor = vscode.window.activeTextEditor;
		if(editor){
			const selectedText = editor.document.getText(editor.selection);
			if(!selectedText){
				vscode.window.showErrorMessage('please select the code section you need to understand');
				return;
			}

			const query : ConversationDto [] = await updateQuery(selectedText);
			console.log({query});
			
			vscode.window.showInformationMessage('🤔 Thinking ...');
			const webviewPanel = vscode.window.createWebviewPanel(
				'devAssistant',
				'Dev Assistant',
				vscode.ViewColumn.One,
				{
				   enableScripts: true,
					// localResourceRoots: [ vscode.Uri.joinPath(context.extensionUri, 'src/css')]
				}
			);

			// Get path to resource on disk
			const cssFile = vscode.Uri.joinPath(context.extensionUri, 'src/css', 'styles.css');
			const data = await getData(query);
			const cssFileUri = webviewPanel.webview.asWebviewUri(cssFile);
			webviewPanel.webview.html = await getHtml({selectedText, data: data.content, cssUriArray: [cssFileUri]});

		}


	});

	const updateQuery = async (newQuestion: string = '', role: Roles = Roles.user): Promise<ConversationDto[]> => {
		const query = await context.workspaceState.get('conversation');
		const startingConversation =  [
				{ role: Roles.system, content: 'you are a helpful assistant senior software engineer peer programming and assisting other engineers, ensuring they understand the code that they write and re-write it more efficiently'},
			];
		if(!query){
			await context.workspaceState.update('conversation', [...startingConversation, {content: newQuestion, role: Roles.user}]);
			return [...startingConversation, {content: `Help me understand this code : ${newQuestion}`, role: Roles.user}];
		} else {
			//remember to check if token size is less than max token.
			const oldConversation: ConversationDto[] = context.workspaceState.get<ConversationDto[]>('conversation')!;
			if(role === Roles.assistant){
				await context.workspaceState.update('conversation', [...oldConversation, {content: newQuestion, role: Roles.assistant}]);
				return [...oldConversation, {content: newQuestion, role: Roles.assistant}];
			} else if (role === Roles.user) {
				await context.workspaceState.update('conversation', [...oldConversation, {content: `Help me understand this code : ${newQuestion}`, role: Roles.user}]);
				return [...oldConversation, {content: `Help me understand this code : ${newQuestion}`, role: Roles.user}];
			}
			return oldConversation;
		}
	};

	const getData = async (query: ConversationDto[]): Promise<any> => {
		try {
			let data: ConversationDto;
			const res = await axios.post('http://localhost:3000/chat',{query});
			data = await res.data;
			console.log({data});
			const updated = await updateQuery(data.content, Roles.assistant);
			console.log({updated});
			return data;	
		} catch (error) {
			console.error({errorGettingData: error});
		}
	};


	const getHtml = async ({selectedText, data = '', cssUriArray}: { selectedText: string, data?: any, cssUriArray?: vscode.Uri[]}): Promise<string> => {
		console.log({nD: await data});
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
