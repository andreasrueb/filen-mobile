#pragma once

// Minimal JSON → Nitro-type converter.
// Parses well-formed JSON (from Rust serde_json) into std::variant-based
// types that Nitro auto-converts to JSI objects on the JS thread.
// The parsing itself runs on a background thread (inside Promise::async),
// moving JSON parse work off the JS thread.

#include <string>
#include <vector>
#include <variant>
#include <unordered_map>
#include <stdexcept>
#include <cstdlib>
#include <cstring>

namespace margelo::nitro::filensdk {

// ── Nitro-compatible value types ────────────────────────────────────
// These compose into types that Nitro's JSIConverter handles natively:
//   JsScalar  → string | number | boolean | null
//   FlatObj   → Record<string, JsScalar>
//   ObjArray  → FlatObj[]
//   ResultVal → number | boolean | string | ObjArray
//   ResultObj → Record<string, ResultVal>

// Note: std::nullptr_t is not supported by Nitro's JSIConverter,
// so null JSON values are omitted from maps (→ undefined in JS).
using JsScalar = std::variant<bool, double, std::string>;
using FlatObj = std::unordered_map<std::string, JsScalar>;
using ObjArray = std::vector<FlatObj>;
using ResultVal = std::variant<bool, double, std::string, ObjArray>;
using ResultObj = std::unordered_map<std::string, ResultVal>;

// ── Minimal JSON parser ─────────────────────────────────────────────
// Recursive descent parser for well-formed JSON from serde_json.
// Only supports the subset needed: objects, arrays, strings, numbers, bools, null.

class JsonParser {
    const char* p_;
    const char* end_;

    void skipWs() {
        while (p_ < end_ && (*p_ == ' ' || *p_ == '\t' || *p_ == '\n' || *p_ == '\r')) ++p_;
    }

    char peek() {
        skipWs();
        if (p_ >= end_) throw std::runtime_error("JSON: unexpected end");
        return *p_;
    }

    char advance() {
        char c = peek();
        ++p_;
        return c;
    }

    void expect(char c) {
        char got = advance();
        if (got != c) {
            std::string msg = "JSON: expected '";
            msg += c;
            msg += "' got '";
            msg += got;
            msg += "'";
            throw std::runtime_error(msg);
        }
    }

    std::string parseString() {
        expect('"');
        std::string result;
        while (p_ < end_ && *p_ != '"') {
            if (*p_ == '\\') {
                ++p_;
                if (p_ >= end_) break;
                switch (*p_) {
                    case '"':  result += '"'; break;
                    case '\\': result += '\\'; break;
                    case '/':  result += '/'; break;
                    case 'b':  result += '\b'; break;
                    case 'f':  result += '\f'; break;
                    case 'n':  result += '\n'; break;
                    case 'r':  result += '\r'; break;
                    case 't':  result += '\t'; break;
                    case 'u': {
                        // Parse \uXXXX — simplified, handles BMP only
                        if (p_ + 4 < end_) {
                            char hex[5] = { p_[1], p_[2], p_[3], p_[4], 0 };
                            unsigned long cp = strtoul(hex, nullptr, 16);
                            p_ += 4;
                            if (cp < 0x80) {
                                result += static_cast<char>(cp);
                            } else if (cp < 0x800) {
                                result += static_cast<char>(0xC0 | (cp >> 6));
                                result += static_cast<char>(0x80 | (cp & 0x3F));
                            } else {
                                result += static_cast<char>(0xE0 | (cp >> 12));
                                result += static_cast<char>(0x80 | ((cp >> 6) & 0x3F));
                                result += static_cast<char>(0x80 | (cp & 0x3F));
                            }
                        }
                        break;
                    }
                    default: result += *p_;
                }
            } else {
                result += *p_;
            }
            ++p_;
        }
        if (p_ < end_) ++p_; // skip closing "
        return result;
    }

    double parseNumber() {
        const char* start = p_;
        if (*p_ == '-') ++p_;
        while (p_ < end_ && *p_ >= '0' && *p_ <= '9') ++p_;
        if (p_ < end_ && *p_ == '.') {
            ++p_;
            while (p_ < end_ && *p_ >= '0' && *p_ <= '9') ++p_;
        }
        if (p_ < end_ && (*p_ == 'e' || *p_ == 'E')) {
            ++p_;
            if (p_ < end_ && (*p_ == '+' || *p_ == '-')) ++p_;
            while (p_ < end_ && *p_ >= '0' && *p_ <= '9') ++p_;
        }
        return strtod(start, nullptr);
    }

    bool isNull() {
        skipWs();
        return p_ < end_ && *p_ == 'n';
    }

    void skipNull() { p_ += 4; } // skip "null"

    JsScalar parseScalar() {
        char c = peek();
        if (c == '"') return JsScalar{parseString()};
        if (c == 't') { p_ += 4; return JsScalar{true}; }
        if (c == 'f') { p_ += 5; return JsScalar{false}; }
        // null should not reach here — caller handles it
        return JsScalar{parseNumber()};
    }

    // Skip any JSON value (for null fields we don't include)
    void skipValue() {
        char c = peek();
        if (c == '"') { parseString(); return; }
        if (c == 't') { p_ += 4; return; }
        if (c == 'f') { p_ += 5; return; }
        if (c == 'n') { p_ += 4; return; }
        if (c == '[') {
            ++p_; // skip [
            if (peek() != ']') {
                do { skipValue(); } while (peek() == ',' && (++p_, true));
            }
            expect(']');
            return;
        }
        if (c == '{') {
            ++p_; // skip {
            if (peek() != '}') {
                do {
                    parseString(); // key
                    expect(':');
                    skipValue();
                } while (peek() == ',' && (++p_, true));
            }
            expect('}');
            return;
        }
        parseNumber(); // consumes the number
    }

    FlatObj parseFlatObject() {
        FlatObj obj;
        expect('{');
        if (peek() != '}') {
            do {
                std::string key = parseString();
                expect(':');
                if (isNull()) {
                    skipNull(); // omit null → undefined in JS
                } else {
                    obj[std::move(key)] = parseScalar();
                }
            } while (peek() == ',' && (++p_, true));
        }
        expect('}');
        return obj;
    }

    ObjArray parseFlatArray() {
        ObjArray arr;
        expect('[');
        if (peek() != ']') {
            do {
                arr.push_back(parseFlatObject());
            } while (peek() == ',' && (++p_, true));
        }
        expect(']');
        return arr;
    }

    ResultVal parseResultVal() {
        char c = peek();
        if (c == '[') return ResultVal{parseFlatArray()};
        if (c == '"') return ResultVal{parseString()};
        if (c == 't') { p_ += 4; return ResultVal{true}; }
        if (c == 'f') { p_ += 5; return ResultVal{false}; }
        // null → treat as empty string (variant doesn't support nullptr)
        if (c == 'n') { p_ += 4; return ResultVal{std::string("")}; }
        return ResultVal{parseNumber()};
    }

public:
    explicit JsonParser(const std::string& json)
        : p_(json.data()), end_(json.data() + json.size()) {}

    // Parse a JSON object whose values are scalars or arrays of flat objects.
    // Matches the shape of fetchTransfers result.
    ResultObj parseResultObject() {
        ResultObj obj;
        expect('{');
        if (peek() != '}') {
            do {
                std::string key = parseString();
                expect(':');
                obj[std::move(key)] = parseResultVal();
            } while (peek() == ',' && (++p_, true));
        }
        expect('}');
        return obj;
    }

    // Parse a JSON array of flat objects.
    // Matches fetchCloudItems / fetchChatMessages return shape.
    ObjArray parseArray() {
        return parseFlatArray();
    }

    // Parse a bare scalar (for simple returns like chatUnread → number)
    JsScalar scalar() {
        return parseScalar();
    }
};

} // namespace margelo::nitro::filensdk
