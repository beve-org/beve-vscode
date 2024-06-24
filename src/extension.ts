
import * as vscode from 'vscode';
import { readBeve, writeBeve } from './beve';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
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
	vscode.commands.executeCommand('setContext', 'beve:enabled', true);
	// .beve dosyaları binary olabilir, bu yüzden textDocumentContentProvider kullanılmaz. binary .beve dosyaları için FileSystemProvider kullanılır.
	context.subscriptions.push(registrationText);
	const providerFS = new BeveFileSystemProvider();
	const registrationFS = vscode.workspace.registerFileSystemProvider('beve', providerFS, {
		isCaseSensitive: true // Beve dosya adlarının büyük/küçük harf duyarlı olduğunu belirtin
	});
	context.subscriptions.push(registrationFS);

	vscode.workspace.onDidOpenTextDocument(async (document) => {
		if (document.fileName.endsWith('.beve')) {
			await convertAndShowJson(document.uri);
		}
	});


	// Komut için aynı işlevi kullan
	const editorDis = vscode.commands.registerCommand('beve.JSON_EDITOR', async (uri?: vscode.Uri) => {
		if (uri !== undefined && uri.fsPath.endsWith(".beve")) {
			console.log('BEVE dosyası ayrıştırılıyor...');
			await convertAndShowJson(uri);
		} else {
			vscode.window.showErrorMessage('Please select a .beve file.');
		}
	});
	const toJSONDis = vscode.commands.registerCommand('beve.toJSON', async (uri?: vscode.Uri) => {
		// open binary file
		if (uri === undefined || uri.scheme !== 'file' || !uri.fsPath.endsWith('.beve')) {
			vscode.window.showErrorMessage('Please select a .beve file.');
			return;
		}
		// @ts-ignore
		console.log('BEVE JSON dosyasına dönüştürülüyor...');
		try {
			const content = await vscode.workspace.fs.readFile(uri);
			const jsonData = readBeve(content);
			// .beve dosyasını .json dosyasına dönüştür
			const newFileName = uri.fsPath.replace('.beve', '.json');
			const jsonUri = vscode.Uri.file(newFileName);
			await vscode.workspace.fs.writeFile(jsonUri, Buffer.from(JSON.stringify(jsonData, null, 2)));
			vscode.window.showInformationMessage(newFileName.split("/")[0] + ' dosyası oluşturuldu.');
		} catch (error) {
			vscode.window.showErrorMessage('BEVE file could not be converted to JSON.');
		}
	});
	const fromJSONDis = vscode.commands.registerCommand('beve.fromJSON', async (uri?: vscode.Uri) => {
		if (uri === undefined || uri.scheme !== 'file' || !uri.fsPath.endsWith('.json')) {
			vscode.window.showErrorMessage('Please select a .json file.');
			return;
		}
		try {
			// @ts-ignore
			const content = await vscode.workspace.fs.readFile(uri);
			const jsonData = JSON.parse(content.toString()) as JSON;
			// .json dosyasını .beve dosyasına dönüştür
			const newFileName = uri.fsPath.replace('.json', '.beve');
			const beveToJSONUri = vscode.Uri.file(newFileName);
			console.log(beveToJSONUri.fsPath, jsonData);
			const beveData = writeBeve(jsonData);
			await vscode.workspace.fs.writeFile(beveToJSONUri, beveData);
			vscode.window.showInformationMessage(newFileName.split("/")[0] + ' dosyası oluşturuldu.');
		} catch (error) {
			vscode.window.showErrorMessage('JSON or BEVE file could not be converted.');
			console.error(error);
		}
	});

	context.subscriptions.push(editorDis, toJSONDis, fromJSONDis);

}

async function convertAndShowJson(uri: vscode.Uri) {
	try {
		const content = await vscode.workspace.fs.readFile(uri);
		const parsedData = readBeve(content);
		// create preview document
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		// create temporary JSON document
		console.log('BEVE dosyası ayrıştırıldı.', parsedData)
		// create temporary JSON document
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		const tempFilePath = path.join(os.tmpdir(), `temp_beve_${uri.fsPath.split("/").at(-1)?.replace(".beve", "")}.json`);
		// const tempFilePath = uri.fsPath.replace(".beve", "-temp.json");
		fs.writeFileSync(tempFilePath, JSON.stringify(parsedData, null, 2));

		// close beve tab
		const jsonDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(tempFilePath));

		await vscode.window.showTextDocument(jsonDocument, vscode.ViewColumn.Active, true);
		// handle onSave event
		const watcher = vscode.workspace.onDidSaveTextDocument(async (savedDocument) => {
			console.log('BEVE JSON dosyası güncelleniyor...', savedDocument.uri.fsPath)
			if (savedDocument === jsonDocument) {
				const beveData = writeBeve(JSON.parse(savedDocument.getText()));
				await vscode.workspace.fs.writeFile(uri, beveData);
				vscode.window.showInformationMessage(uri.fsPath + " file updated.");
			}
		});
		// dispose watcher when jsonDocument is closed
		return watcher;

	} catch (error) {
		console.log(error);
		if (error instanceof Error) {
			vscode.window.showErrorMessage(`BEVE parsing error: ${error.message}`);
		} else {
			// vscode.window.showErrorMessage('Bilinmeyen bir hata oluştu.');
			vscode.window.showErrorMessage('An unknown error occurred.');
		}
	}
}

