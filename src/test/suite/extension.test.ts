import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('uses targeted activation events', () => {
		const extension = vscode.extensions.getExtension('beve-org.beve-vscode');
		assert.ok(extension, 'Expected BEVE extension to be installed in the test host.');

		const activationEvents = extension.packageJSON.activationEvents as string[];
		assert.ok(Array.isArray(activationEvents), 'Expected activationEvents to be defined.');
		assert.ok(!activationEvents.includes('*'), 'Global "*" activation should not be used.');
		assert.deepStrictEqual(activationEvents, [
			'onLanguage:beve',
			'onCommand:beve.JSON_EDITOR',
			'onCommand:beve.toJSON',
			'onCommand:beve.fromJSON'
		]);
	});

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
