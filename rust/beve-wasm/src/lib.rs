use wasm_bindgen::prelude::*;
use wasm_bindgen::JsError;

fn to_js_error(err: beve::Error) -> JsValue {
    JsError::new(&err.to_string()).into()
}

/// Convert a JSON string to BEVE bytes.
#[wasm_bindgen]
pub fn json_to_beve(json: &str) -> Result<Vec<u8>, JsValue> {
    beve::json_str_to_beve(json).map_err(to_js_error)
}

/// Convert BEVE bytes to a JSON string.
#[wasm_bindgen]
pub fn beve_to_json(beve_bytes: &[u8]) -> Result<String, JsValue> {
    beve::beve_slice_to_json_string(beve_bytes).map_err(to_js_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn round_trip_json() {
        let original = json!({
            "name": "delta",
            "values": [1, 2, 3],
            "is_active": true
        });
        let json_str = original.to_string();

        let beve_bytes = json_to_beve(&json_str).expect("json->beve conversion");
        assert!(!beve_bytes.is_empty());

        let json_back = beve_to_json(&beve_bytes).expect("beve->json conversion");
        let converted: serde_json::Value = serde_json::from_str(&json_back).expect("parse json");

        assert_eq!(converted, original);
    }
}
