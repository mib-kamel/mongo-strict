module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageReporters: ["json-summary", "text"],
    "transform": {
        "^.+\\.(t|j)sx?$": "ts-jest"
    },
    collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts', '!src/**/*.interface.ts'],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.spec.json',
        },
    },
};
