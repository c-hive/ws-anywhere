module.exports = {
    "env": {
        "commonjs": true,
        "node": true,
        "browser": true
    },
    "plugins": [
        "prettier"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:node/recommended",
        "plugin:prettier/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules": {
        "node/no-unpublished-require": 0,
        "prettier/prettier": "error",
        "linebreak-style": ["error", (process.platform === "win32" ? "windows" : "unix")]
    }
}
