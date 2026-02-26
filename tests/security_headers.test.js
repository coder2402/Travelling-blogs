const { test, describe, mock } = require('node:test');
const assert = require('node:assert');
const Module = require('module');

const appMock = {
    set: mock.fn(),
    use: mock.fn(),
    listen: mock.fn(),
    disable: mock.fn()
};

const expressMock = mock.fn(() => appMock);
expressMock.static = mock.fn();
expressMock.urlencoded = mock.fn();

const originalRequire = Module.prototype.require;
Module.prototype.require = function(path) {
    if (path === 'express') {
        return expressMock;
    }
    if (path === './config/mongoose' || path === './models/safarSchema' || path === './routes/index') {
        return {};
    }
    // Ignore error for missing mongoose
    if (path === 'mongoose') {
        return {
            connect: () => ({ on: () => {} }),
            Schema: class {},
            model: () => ({})
        };
    }
    return originalRequire.apply(this, arguments);
};

describe('Index.js Security', () => {
    test('index.js should disable x-powered-by and use security headers', (t) => {
        // Clear cache if needed
        delete require.cache[require.resolve('../index')];

        // This will execute index.js
        require('../index');

        // Check if app.disable('x-powered-by') was called
        const disableCalls = appMock.disable.mock.calls;
        const xPoweredByDisabled = disableCalls.some(call => call.arguments[0] === 'x-powered-by');

        // Check if any middleware sets security headers
        // We'd have to inspect the middleware functions passed to app.use()
        const useCalls = appMock.use.mock.calls;
        let hasSecurityHeaders = false;

        for (const call of useCalls) {
            const middleware = call.arguments[0];
            if (typeof middleware === 'function') {
                const req = {};
                const res = {
                    setHeader: mock.fn()
                };
                middleware(req, res, () => {});

                const setHeaderCalls = res.setHeader.mock.calls;
                if (setHeaderCalls.some(c => c.arguments[0].toLowerCase() === 'x-content-type-options')) {
                    hasSecurityHeaders = true;
                    break;
                }
            }
        }

        assert.strictEqual(xPoweredByDisabled, true, 'x-powered-by should be disabled');
        assert.strictEqual(hasSecurityHeaders, true, 'security headers middleware should be used');
    });
});
