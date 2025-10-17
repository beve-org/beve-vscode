import * as assert from 'assert';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import { promises as fsPromises } from 'fs';
import fs = require('fs');

type BeveModule = {
	readBeve(buffer: Uint8Array): unknown;
	writeBeve(data: unknown): Uint8Array;
};

const projectRoot = path.resolve(__dirname, '../../..');
const fixturesDir = path.join(projectRoot, 'test-fixtures');
const fixtureBevePath = path.join(projectRoot, 'collections.beve');
const fixtureJsonPath = path.join(fixturesDir, 'collections.json');

async function withTempDir(run: (tempDir: string) => Promise<void>): Promise<void> {
	const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'beve-tests-'));
	try {
		await run(tempDir);
	} finally {
		await fsPromises.rm(tempDir, { recursive: true, force: true });
	}
}

async function ensureExtensionActivated(): Promise<BeveModule> {
	const extension = vscode.extensions.getExtension('devloops.beve');
	if (!extension) {
		throw new Error('BEVE extension could not be found.');
	}
	if (!extension.isActive) {
		await extension.activate();
	}

	// Load the built extension bundle to access read/write helpers.
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const modulePath = path.join(projectRoot, 'dist', 'extension.js');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const extensionModule = require(modulePath) as Record<string, unknown>;
	const readBeve = extensionModule.readBeve;
	const writeBeve = extensionModule.writeBeve;

	if (typeof readBeve !== 'function' || typeof writeBeve !== 'function') {
		throw new Error(`BEVE extension module does not expose read/write helpers. Keys: ${Object.keys(extensionModule).join(', ')}`);
	}

	return extensionModule as BeveModule;
}

suite('BEVE Conversion Commands', () => {
	let beveModule: BeveModule;

	suiteSetup(async () => {
		beveModule = await ensureExtensionActivated();
	});

	test('beve.toJSON converts BEVE fixture to expected JSON', async () => {
		await withTempDir(async (dir) => {
			const beveCopyPath = path.join(dir, 'sample.beve');
			await fsPromises.copyFile(fixtureBevePath, beveCopyPath);
			const beveUri = vscode.Uri.file(beveCopyPath);

			await vscode.commands.executeCommand('beve.toJSON', beveUri);

			const jsonPath = beveCopyPath.replace('.beve', '.json');
			assert.ok(fs.existsSync(jsonPath), 'Expected JSON output file was not created.');

			const actualJson = JSON.parse(await fsPromises.readFile(jsonPath, 'utf8'));
			const expectedJson = JSON.parse(await fsPromises.readFile(fixtureJsonPath, 'utf8'));
			assert.deepStrictEqual(actualJson, expectedJson);
		});
	});

	test('beve.fromJSON produces BEVE that decodes back to the source JSON', async () => {
		await withTempDir(async (dir) => {
			const richData = {
				title: 'Telemetry Snapshot',
				measurements: {
					floats: [0.125, -42.5, 13.375],
					ints: [0, 1, -2, 32767],
					bools: [true, false, true, true],
					strings: ['alpha', 'beta', 'delta']
				},
				matrix: [
					[1, 2, 3],
					[4, 5, 6]
				],
				nested: {
					records: [
						{ id: 1, tags: ['one', 'two'] },
						{ id: 2, tags: ['three'], active: false }
					]
				}
			};

			const jsonPayload = JSON.stringify(richData, null, 2);
			const jsonPath = path.join(dir, 'fixture.json');
			await fsPromises.writeFile(jsonPath, jsonPayload, 'utf8');

			const jsonUri = vscode.Uri.file(jsonPath);
			await vscode.commands.executeCommand('beve.fromJSON', jsonUri);

			const bevePath = jsonPath.replace('.json', '.beve');
			assert.ok(fs.existsSync(bevePath), 'Expected BEVE output file was not created.');

			const beveBytes = await fsPromises.readFile(bevePath);
			const decoded = beveModule.readBeve(beveBytes);
			assert.deepStrictEqual(decoded, richData);
		});
	});

	test('writeBeve and readBeve round-trip numeric, boolean, and string arrays', () => {
		const source = {
			float32Values: Array.from(new Float32Array([1.5, -2.25, 0, 1024.5])),
			int16Values: Array.from(new Int16Array([-32768, -1, 0, 32767])),
			uint8Values: Array.from(new Uint8Array([0, 1, 127, 255])),
			boolValues: [true, false, true, true],
			stringValues: ['alpha', 'beta', 'gamma'],
			nested: {
				doubleValues: [Math.PI, Math.E, 0],
				matrix: [
					[0, 1],
					[2, 3]
				]
			}
		};

		const expected = JSON.parse(JSON.stringify(source));
		const bytes = beveModule.writeBeve(source);
		assert.ok(bytes.length > 0, 'Encoded BEVE buffer is empty.');

		const decoded = beveModule.readBeve(bytes);
		assert.deepStrictEqual(decoded, expected);
	});

	test('readBeve tolerates buffers padded with trailing zeros', () => {
		const payload = {
			metadata: { createdBy: 'test-suite', version: 1 },
			values: [1, 2, 3, 4]
		};
		const expected = JSON.parse(JSON.stringify(payload));
		const bytes = beveModule.writeBeve(payload);

		const padded = new Uint8Array(bytes.length + 16);
		padded.set(bytes);

		const decoded = beveModule.readBeve(padded);
		assert.deepStrictEqual(decoded, expected);
	});
});
