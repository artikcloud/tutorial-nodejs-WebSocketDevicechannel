module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "extends": "google",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": ["error", { allow: ["log", "warn", "error"] }] 
    }
};