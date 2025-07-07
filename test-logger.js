// Quick test to verify logger behavior in different environments
require("dotenv").config();

// Test production mode by overriding env vars
process.env.NODE_ENV = "production";
process.env.ENABLE_CONSOLE_LOGGING = "false";

const { logger } = require("./dist/utils/logger");

console.log("\n=== Testing Logger in Production Mode ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("ENABLE_CONSOLE_LOGGING:", process.env.ENABLE_CONSOLE_LOGGING);
console.log("\nTrying to log messages (should be silent):");

logger.error("This error should NOT appear");
logger.warn("This warning should NOT appear");
logger.info("This info should NOT appear");
logger.debug("This debug should NOT appear");

console.log("\n=== Testing Logger in Development Mode ===");
process.env.NODE_ENV = "development";
process.env.ENABLE_CONSOLE_LOGGING = "true";

// Force logger to reload configuration
delete require.cache[require.resolve("./dist/utils/logger")];
const { logger: devLogger } = require("./dist/utils/logger");

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("ENABLE_CONSOLE_LOGGING:", process.env.ENABLE_CONSOLE_LOGGING);
console.log("\nTrying to log messages (should appear):");

devLogger.error("This error SHOULD appear");
devLogger.warn("This warning SHOULD appear");
devLogger.info("This info SHOULD appear");
devLogger.debug("This debug SHOULD appear");

console.log("\n=== Logger Test Complete ===");
