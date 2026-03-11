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

    fn assert_round_trip(value: serde_json::Value) {
        let json_str = value.to_string();
        let beve_bytes = json_to_beve(&json_str).expect("json->beve conversion");
        assert!(!beve_bytes.is_empty());
        let json_back = beve_to_json(&beve_bytes).expect("beve->json conversion");
        let converted: serde_json::Value =
            serde_json::from_str(&json_back).expect("parse json");
        assert_eq!(converted, value);
    }

    #[test]
    fn round_trip_object() {
        assert_round_trip(json!({
            "name": "delta",
            "values": [1, 2, 3],
            "is_active": true
        }));
    }

    #[test]
    fn round_trip_null() {
        assert_round_trip(json!(null));
    }

    #[test]
    fn round_trip_bool() {
        assert_round_trip(json!(true));
        assert_round_trip(json!(false));
    }

    #[test]
    fn round_trip_integers() {
        assert_round_trip(json!(0));
        assert_round_trip(json!(1));
        assert_round_trip(json!(-1));
        assert_round_trip(json!(i64::MAX));
        assert_round_trip(json!(i64::MIN));
    }

    #[test]
    fn round_trip_floats() {
        assert_round_trip(json!(3.14));
        assert_round_trip(json!(-0.001));
        assert_round_trip(json!(1.23e-4));
    }

    #[test]
    fn round_trip_strings() {
        assert_round_trip(json!(""));
        assert_round_trip(json!("hello world"));
        assert_round_trip(json!("line1\nline2\ttab"));
        assert_round_trip(json!("quotes: \"inside\""));
        assert_round_trip(json!("emoji: \u{1F600}"));
        assert_round_trip(json!("unicode: \u{00E9}\u{00F1}\u{00FC}"));
    }

    #[test]
    fn round_trip_empty_object() {
        assert_round_trip(json!({}));
    }

    #[test]
    fn round_trip_empty_array() {
        assert_round_trip(json!([]));
    }

    #[test]
    fn round_trip_nested() {
        assert_round_trip(json!({
            "a": {
                "b": {
                    "c": {
                        "d": [1, 2, 3]
                    }
                }
            }
        }));
    }

    #[test]
    fn round_trip_mixed_array() {
        assert_round_trip(json!([1, "two", true, null, 4.5, {"key": "value"}, []]));
    }

    #[test]
    fn round_trip_array_of_objects() {
        assert_round_trip(json!([
            {"id": 1, "name": "alice"},
            {"id": 2, "name": "bob"},
            {"id": 3, "name": "charlie"}
        ]));
    }

    #[test]
    fn round_trip_deeply_nested() {
        assert_round_trip(json!([[[[[[42]]]]]]));
    }

    #[test]
    fn invalid_json_returns_error() {
        assert!(beve::json_str_to_beve("{not valid json}").is_err());
        assert!(beve::json_str_to_beve("").is_err());
        assert!(beve::json_str_to_beve("{\"unterminated\":").is_err());
    }

    #[test]
    fn invalid_beve_returns_error() {
        assert!(beve::beve_slice_to_json_string(&[0xFF, 0xFE, 0xFD]).is_err());
    }
}
