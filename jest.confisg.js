module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/**/*spec.ts'],
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverage: true,
    globals: {
        'ts-jest': {
            diagnostics: {
                ignoreCodes: ['TS151001'],
            },
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
};