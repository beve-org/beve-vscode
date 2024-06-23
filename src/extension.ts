// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';
// import { CodeActionKind } from 'vscode';
// import { read_beve, write_beve } from "./beve"
// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed

// export function activate(context: vscode.ExtensionContext) {

// 	console.log('BEVE dosyası Yakalayıcı aktif!',);
// 	// vscode.workspace.onDidOpenTextDocument(() => {
// 	// 	console.log("onDidOpenTextDocument");
// 	// });
// 	vscode.workspace.onDidOpenNotebookDocument(() => {
// 		console.log("onDidOpenNotebookDocument");
// 	});
// 	vscode.workspace.onDidOpenTextDocument(() => {
// 		console.log("onDidOpenTextDocument");
// 	});
// 	vscode.workspace.onDidSaveTextDocument(() => {
// 		console.log("onDidSaveTextDocument");
// 	});

// 	vscode.workspace.onDidCloseTextDocument(() => {
// 		console.log("onDidCloseTextDocument");
// 	});
// 	vscode.window.showInformationMessage('BEVE dosyası Yakalayıcı aktif!');
// 	const fep = vscode.languages.registerDocumentFormattingEditProvider('beve',
// 		{
// 			provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
// 				console.log('BEVE dosyası formatlanıyor...');
// 				const content = document.getText();
// 				const formatted = write_beve(JSON.parse(content));
// 				// uint8array to string
// 				const formattedStr = new TextDecoder().decode(write_beve(JSON.parse(content)));
// 				return [vscode.TextEdit.replace(new vscode.Range(0, 0, document.lineCount, 0), formattedStr)];
// 			}
// 		}
// 	);
// 	context.subscriptions.push(fep);
// 	vscode.workspace.onDidOpenTextDocument(async (document) => {
// 		console.log("onDidOpenTextDocument"); console.log('BEVE dosyası açıldı!');
// 		if (document.fileName.endsWith('.beve')) {
// 			try {
// 				const content = await vscode.workspace.fs.readFile(document.uri);
// 				const parsedData = read_beve(content);

// 				const newDocument = await vscode.workspace.openTextDocument({
// 					content: JSON.stringify(parsedData, null, 2),
// 					language: 'json'
// 				});
// 				await vscode.window.showTextDocument(newDocument, vscode.ViewColumn.Beside);
// 			} catch (error) {
// 				if (error instanceof Error) { // Spesifik hata türünü kontrol etme
// 					vscode.window.showErrorMessage(`BEVE ayrıştırma hatası: ${error.message}`);
// 				} else {
// 					vscode.window.showErrorMessage('Bilinmeyen bir hata oluştu.');
// 				}
// 			}
// 		}
// 	});
// 	// beve parse command
// 	let disposable = vscode.commands.registerCommand('beve.parse', async () => {
// 		console.log('BEVE dosyası ayrıştırılıyor... (Komut ile)', context.subscriptions);
// 		const activeEditor = vscode.window.activeTextEditor;
// 		if (activeEditor) {
// 			const document = activeEditor.document;
// 			if (document.languageId === 'beve') {
// 				try {
// 					const content = await vscode.workspace.fs.readFile(document.uri);
// 					const parsedData = read_beve(content);

// 					const newDocument = await vscode.workspace.openTextDocument({
// 						content: JSON.stringify(parsedData, null, 2),
// 						language: 'json'
// 					});
// 					await vscode.window.showTextDocument(newDocument, vscode.ViewColumn.Beside);
// 					vscode.window.showInformationMessage('BEVE dosyası ayrıştırıldı.');
// 				} catch (error) {
// 					if (error instanceof Error) {
// 						vscode.window.showErrorMessage(`BEVE ayrıştırma hatası: ${error.message}`);
// 					} else {
// 						vscode.window.showErrorMessage('Bilinmeyen bir hata oluştu.');
// 					}
// 				}
// 			}
// 		} else {
// 			vscode.window.showErrorMessage('Aktif bir dosya yok.');

// 		}
// 	});
// 	context.subscriptions.push(disposable);

// }

// // export function activate(context: vscode.ExtensionContext) {
// // 	console.log('Congratulations, your extension "beve" is now active!');
// // 	setTimeout(() => {
// // 		vscode.languages.registerCodeActionsProvider('beve', new BeveCodeActionProvider(), {
// // 			providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
// // 		});
// // 	}, 5000);
// // }

// // class BeveCodeActionProvider implements vscode.CodeActionProvider {
// // 	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): Promise<vscode.CodeAction[]> {
// // 		if (document.languageId !== 'beve') {
// // 			return []; // Sadece beve dosyaları için
// // 		}
// // 		console.log('BEVE dosyası ayrıştırılıyor... (QuickFix ile)', vscode.window.visibleTextEditors);
// // 		const content = await vscode.workspace.fs.readFile(document.uri);

// // 		try {
// // 			const parsedData = read_beve(content);
// // 			const action = new vscode.CodeAction('JSON olarak görüntüle', vscode.CodeActionKind.QuickFix);
// // 			action.edit = new vscode.WorkspaceEdit();
// // 			action.edit.createFile(
// // 				vscode.Uri.file(document.uri.fsPath + '.json'),
// // 				{ overwrite: true, ignoreIfExists: false }
// // 			);
// // 			action.edit.insert(
// // 				vscode.Uri.file(document.uri.fsPath + '.json'),
// // 				new vscode.Position(0, 0),
// // 				JSON.stringify(parsedData, null, 2)
// // 			);
// // 			return [action];
// // 		} catch (error) {
// // 			if (error instanceof Error) {
// // 				vscode.window.showErrorMessage(`BEVE ayrıştırma hatası: ${error.message}`);
// // 			} else {
// // 				vscode.window.showErrorMessage('Bilinmeyen bir hata oluştu.');
// // 			}
// // 			return [];
// // 		}
// // 	}
// // }


// // This method is called when your extension is deactivated
// export function deactivate() { }
import * as vscode from 'vscode';
import { readBeve, writeBeve } from './beve';

export function activate(context: vscode.ExtensionContext) {
	console.log('BEVE eklentisi aktif!');
	vscode.workspace.onDidOpenTextDocument(async (document) => {
		console.log('BEVE dosyası açıldı!', document.languageId, document.fileName);
		if (document.languageId === 'beve' || document.fileName.endsWith('.beve')) {
			await convertAndShowJson(document);
		}
	});

	// Komut için aynı işlevi kullan
	vscode.commands.registerCommand('beve.parse', async (uri?: vscode.Uri) => {
		const document = uri ? await vscode.workspace.openTextDocument(uri) : vscode.window.activeTextEditor?.document;
		if (document && document.languageId === 'beve') {
			await convertAndShowJson(document);
		} else {
			vscode.window.showErrorMessage('Lütfen bir .beve dosyası seçin.');
		}
	});
}

async function convertAndShowJson(document: vscode.TextDocument) {
	try {
		const content = await vscode.workspace.fs.readFile(document.uri);
		const parsedData = readBeve(content);
		console.log(parsedData);
		const jsonDocument = await vscode.workspace.openTextDocument({
			content: JSON.stringify(parsedData, null, 2),
			language: 'json'
		});

		await vscode.window.showTextDocument(jsonDocument, vscode.ViewColumn.Beside);
	} catch (error) {
		console.log(error);
		if (error instanceof Error) {
			vscode.window.showErrorMessage(`BEVE ayrıştırma hatası: ${error.message}`);
		} else {
			vscode.window.showErrorMessage('Bilinmeyen bir hata oluştu.');
		}
	}
}