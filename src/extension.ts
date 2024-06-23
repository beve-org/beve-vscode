
import * as vscode from 'vscode';
import { readBeve, writeBeve } from './beve';
class BeveTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
	async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
		console.log('BEVE dosyası binary yerine .txt olarak okunuyor...');
		try {
			const content = await vscode.workspace.fs.readFile(uri);
			const jsonData = readBeve(content);
			return JSON.stringify(jsonData, null, 2); // JSON'u metin olarak döndür
		} catch (error) {
			vscode.window.showErrorMessage('Beve dosyası ayrıştırılamadı.');
			return '';
		}
	}
}
export function activate(context: vscode.ExtensionContext) {
	console.log('BEVE eklentisi başlatılıyor...');
	const provider = new BeveTextDocumentContentProvider();
	const registration = vscode.workspace.registerTextDocumentContentProvider('beve', provider);
	context.subscriptions.push(registration);
	console.log('BEVE eklentisi aktif!');
	vscode.workspace.onDidOpenTextDocument(async (document) => {
		if (document.languageId === 'beve' || document.fileName.endsWith('.beve')) {
			console.log('BEVE dosyası açıldı!', document.languageId, document.fileName);
			const watcher = await convertAndShowJson(document);
			if (watcher) {
				context.subscriptions.push(watcher);
			}

		}
	});

	// Komut için aynı işlevi kullan
	vscode.commands.registerCommand('beve.JSON_EDITOR', async (uri?: vscode.Uri) => {
		const document = uri ? await vscode.workspace.openTextDocument(uri) : vscode.window.activeTextEditor?.document;
		if (document && document.languageId === 'beve') {
			console.log('BEVE dosyası ayrıştırılıyor...');
			await convertAndShowJson(document);
		} else {
			vscode.window.showErrorMessage('Lütfen bir .beve dosyası seçin.');
		}
	});
	vscode.commands.registerCommand('beve.toJSON', async (uri?: vscode.Uri) => {
		const document = uri ? await vscode.workspace.openTextDocument(uri) : vscode.window.activeTextEditor?.document;
		if (document && document.languageId === 'beve') {
			try {
				const content = await vscode.workspace.fs.readFile(document.uri);
				const jsonData = readBeve(content);
				// .beve dosyasını .json dosyasına dönüştür
				const newFileName = document.uri.fsPath.replace('.beve', '.json');
				const jsonUri = vscode.Uri.file(newFileName);
				await vscode.workspace.fs.writeFile(jsonUri, Buffer.from(JSON.stringify(jsonData, null, 2)));
				vscode.window.showInformationMessage('.json dosyası oluşturuldu.');
			} catch (error) {
				vscode.window.showErrorMessage('BEVE dosyası ayrıştırma hatası.');
			}
		}
	});
	vscode.commands.registerCommand('beve.fromJSON', async (uri?: vscode.Uri) => {
		const document = uri ? await vscode.workspace.openTextDocument(uri) : vscode.window.activeTextEditor?.document;
		if (document && document.languageId === 'beve') {
			try {
				const content = await vscode.workspace.fs.readFile(document.uri);
				const jsonData = JSON.parse(content.toString());
				// .json dosyasını .beve dosyasına dönüştür
				const newFileName = document.uri.fsPath.replace('.json', '.beve');
				const beveUri = vscode.Uri.file(newFileName);
				await vscode.workspace.fs.writeFile(beveUri, writeBeve(jsonData));
				vscode.window.showInformationMessage('.beve dosyası oluşturuldu.');
			} catch (error) {
				vscode.window.showErrorMessage('JSON geçersiz veya BEVE dönüştürme hatası.');
			}
		}
	});


}

async function convertAndShowJson(document: vscode.TextDocument) {
	try {
		const content = await vscode.workspace.fs.readFile(document.uri);
		const parsedData = readBeve(content);
		// create preview document
		console.log(parsedData);
		// create temporary JSON document


		// close beve tab
		const jsonDocument = await vscode.workspace.openTextDocument({
			content: JSON.stringify(parsedData, null, 2),
			language: 'json'
		});
		await vscode.window.showTextDocument(jsonDocument, vscode.ViewColumn.Beside, true);
		// handle onSave event
		const watcher = vscode.workspace.onDidSaveTextDocument(async (savedDocument) => {
			if (savedDocument === jsonDocument) {
				const beveData = writeBeve(JSON.parse(savedDocument.getText()));
				await vscode.workspace.fs.writeFile(document.uri, beveData);
				vscode.window.showInformationMessage('.beve dosyası güncellendi.');
			}
		});
		// dispose watcher when jsonDocument is closed
		return watcher;

	} catch (error) {
		console.log(error);
		if (error instanceof Error) {
			vscode.window.showErrorMessage(`BEVE ayrıştırma hatası: ${error.message}`);
		} else {
			vscode.window.showErrorMessage('Bilinmeyen bir hata oluştu.');
		}
	}
}

