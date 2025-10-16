import * as assert from 'assert';
import * as vscode from 'vscode';
import { initializeLocalization, localize } from '../../i18n';

suite('Localization Helpers', () => {
	const originalLanguage = vscode.env.language;

	teardown(() => {
		initializeLocalization(originalLanguage);
	});

	test('uses English strings when locale is unsupported', () => {
		initializeLocalization('en');
		const expected = localize('error.selectBeveFile', 'Expected English string.');

		initializeLocalization('es');
		const actual = localize('error.selectBeveFile', 'Fallback value not used.');

		assert.strictEqual(actual, expected);
	});

	test('loads Turkish translations when requested', () => {
		initializeLocalization('tr');
		const actual = localize('error.selectJsonFile', 'Placeholder fallback');

		assert.strictEqual(actual, 'Lütfen bir .json dosyası seçin.');
	});

	test('replaces placeholders with provided arguments', () => {
		initializeLocalization('en');
		const message = localize('provider.errorMessage', 'An error occurred: {0}', 'boom');

		assert.strictEqual(message, 'An error occurred: boom');
	});
});
