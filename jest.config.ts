import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    verbose: true,
    testEnvironment: "node",
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};

export default config;