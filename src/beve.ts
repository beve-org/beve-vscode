import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __non_webpack_require__: NodeRequire | undefined;

type BeveWasmExports = {
	readonly ['json_to_beve']: (json: string) => Uint8Array;
	readonly ['beve_to_json']: (bytes: Uint8Array) => string;
};

let cachedWasm: BeveWasmExports | undefined;

function normalizeJsonText(text: string): string {
	const trimmed = text.trimEnd();
	if (trimmed === '' || trimmed === 'null') {
		return trimmed || 'null';
	}
	const sanitized = trimmed.replace(/(?:null\s*)+$/u, '');
	return sanitized === '' ? 'null' : sanitized;
}

function loadWasm(): BeveWasmExports {
	if (!cachedWasm) {
		const wasmModulePath = path.join(__dirname, 'beve_wasm_node.js');
		const nodeRequire =
			typeof __non_webpack_require__ === 'function'
				? __non_webpack_require__
				: (eval('require') as NodeRequire);
		cachedWasm = nodeRequire(wasmModulePath) as BeveWasmExports;
	}
	return cachedWasm;
}

export function readBeve(buffer: Uint8Array): any {
	if (!(buffer instanceof Uint8Array)) {
		throw new Error('Invalid buffer provided.');
	}

	const wasm = loadWasm();
	const jsonText = normalizeJsonText(wasm.beve_to_json(buffer));
	return JSON.parse(jsonText);
}

export function writeBeve(data: unknown): Uint8Array {
	const wasm = loadWasm();
	const jsonText = JSON.stringify(data);
	const beveBytes = wasm.json_to_beve(jsonText);
	return new Uint8Array(beveBytes);
}
