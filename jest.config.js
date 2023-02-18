module.exports = {
  "globals": {
    "ts-jest": {
      "tsconfig": "<rootDir>/tsconfig.json"
    }
  },
  "preset": "ts-jest",
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.(ts)?$": "ts-jest",
    "^.+\\.css$": "<rootDir>/cssTransform.js"
  },
  "transformIgnorePatterns": [
    "[/\\\\]node_modules[/\\\\].+\\.(js|ts)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  "modulePaths": [],
  "moduleNameMapper": {
    //"^(components|config|constants|actions|reducers|styles|api|hooks|utils|store|storage|schemas|tests)$": "<rootDir>/src/$1",
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    '\\.(css|scss)$': 'identity-obj-proxy'
  },
  "moduleFileExtensions": [
    "ts",
    "js",
    "json",
    "node"
  ],
  "testPathIgnorePatterns": [
    "<rootDir>/src",
    "<rootDir>/(build|node_modules)/"
  ],
  "testEnvironment": "jsdom"
};
