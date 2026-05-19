/**
 * CRA dev-server proxy middleware.
 * OAuth 2.0 was removed — no special COOP headers required.
 * The "proxy" field in package.json handles API forwarding to the gateway.
 * This file intentionally contains no configuration.
 * It can be deleted from the filesystem.
 */
module.exports = function (app) {
  // No proxy rules needed — all API calls use "proxy": "http://localhost:8080"
  // defined in package.json, which webpack-dev-server applies automatically.
};
