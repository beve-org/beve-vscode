
import * as vscode from 'vscode';
import { readBeve, writeBeve } from './beve';
class BeveTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
	async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
		try {
			console.log('BEVE dosyası ayrıştırılıyor...', uri.fsPath);
			const content = await vscode.workspace.fs.readFile(uri);

			// Tagged binary formatındaki veriyi oku ve parse et
			const parsedData = readBeve(content);

			return JSON.stringify(parsedData, null, 2);
		} catch (error) {
			vscode.window.showErrorMessage('Beve dosyası ayrıştırılamadı.');
			console.error('Beve dosyası ayrıştırılamadı.', error);
			return 'Hata oluştu: ' + error; // Hata durumunda hata mesajını döndür
		}
	}
}
class BeveFileSystemProvider implements vscode.FileSystemProvider {

	constructor() {
		console.log('BEVE dosya sistemi sağlayıcısı oluşturuldu.');
	}
	private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	private _bufferedEvents: vscode.FileChangeEvent[] = [];
	private _fireSoonHandle?: NodeJS.Timer;

	readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;
	// readDirectory, createDirectory, readFile, writeFile gibi metodları uygulamanız gerekecek.
	// Bu metodlar, .beve dosyalarına erişim ve işlem yapma mantığını içerecektir.
	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		// .beve dosyasını binary olarak okuyun
		return await vscode.workspace.fs.readFile(uri.with({ scheme: 'file' }));
	}
	async writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): Promise<void> {
		// .beve dosyasına binary olarak yazın
		await vscode.workspace.fs.writeFile(uri.with({ scheme: 'file' }), content);
	}
	async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		// .beve dosyasının içeriğini listelemek için kullanılabilir
		return [];
	}
	async createDirectory(uri: vscode.Uri): Promise<void> {
		// .beve dosyası oluşturmak için kullanılabilir
	}
	async delete(uri: vscode.Uri, options: { recursive: boolean }): Promise<void> {
		// .beve dosyasını silmek için kullanılabilir
	}
	async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): Promise<void> {
		// .beve dosyasını yeniden adlandırmak için kullanılabilir
	}
	async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
		// .beve dosyasının bilgilerini almak için kullanılabilir
		return {
			type: vscode.FileType.File,
			ctime: 0,
			mtime: 0,
			size: 0
		};
	}

	async copy?(source: vscode.Uri, destination: vscode.Uri, options: { overwrite: boolean }): Promise<void> {
		// .beve dosyasını kopyalamak için kullanılabilir
	}

	watch(uri: vscode.Uri, options: { recursive: boolean, excludes: string[] }): vscode.Disposable {
		// .beve dosyasını izlemek için kullanılabilir
		return new vscode.Disposable(() => { });
	}

}
export function activate(context: vscode.ExtensionContext) {
	console.log('BEVE eklentisi başlatılıyor...');
	const providerText = new BeveTextDocumentContentProvider();
	const registrationText = vscode.workspace.registerTextDocumentContentProvider('beve', providerText);
	context.subscriptions.push(registrationText);
	const providerFS = new BeveFileSystemProvider();
	const registrationFS = vscode.workspace.registerFileSystemProvider('beve', providerFS, {
		isCaseSensitive: true // Beve dosya adlarının büyük/küçük harf duyarlı olduğunu belirtin
	});
	context.subscriptions.push(registrationFS);

	vscode.workspace.onDidOpenTextDocument((document) => {
		if (document.uri.scheme !== 'beve' && document.fileName.endsWith('.beve')) {
			const jsonUri = document.uri.with({ scheme: 'beve' });
			vscode.window.showTextDocument(jsonUri);
		}
	});
	// const provider = new BeveTextDocumentContentProvider();
	// const registration = vscode.workspace.registerTextDocumentContentProvider('beve', provider);
	// context.subscriptions.push(registration);
	// console.log('BEVE eklentisi aktif!');
	// vscode.workspace.onDidOpenTextDocument(async (document) => {
	// 	if (document.languageId === 'beve' || document.fileName.endsWith('.beve')) {
	// 		console.log('BEVE dosyası açıldı!', document.languageId, document.fileName);
	// 		const watcher = await convertAndShowJson(document);
	// 		if (watcher) {
	// 			context.subscriptions.push(watcher);
	// 		}

	// 	}
	// });

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

