import * as vscode from 'vscode';
import enMessages from './locales/en.json';
import trMessages from './locales/tr.json';

type LocaleTable = Record<string, string>;

const SUPPORTED_LOCALES: Record<string, LocaleTable> = {
    en: enMessages,
    tr: trMessages
};

SUPPORTED_LOCALES['en-us'] = enMessages;

let activeMessages: LocaleTable = enMessages;

function resolveLocale(language: string | undefined): LocaleTable {
	if (!language) {
		return enMessages;
	}

	const normalized = language.toLowerCase();
	if (SUPPORTED_LOCALES[normalized]) {
		return SUPPORTED_LOCALES[normalized];
	}

	const [base] = normalized.split('-');
	return SUPPORTED_LOCALES[base] ?? enMessages;
}

export function initializeLocalization(languageOverride?: string): void {
	const language = languageOverride ?? vscode.env.language;
	activeMessages = resolveLocale(language);
}

export function localize(key: string, defaultMessage: string, ...args: Array<string | number>): string {
	const template = activeMessages[key] ?? defaultMessage;
	return template.replace(/\{(\d+)\}/g, (match, index) => {
		const argIndex = Number(index);
		const replacement = args[argIndex];
		return replacement !== undefined ? String(replacement) : match;
	});
}
