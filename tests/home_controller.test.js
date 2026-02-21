const { test, describe, mock } = require('node:test');
const assert = require('node:assert');
const Module = require('module');

// Mock mongoose before anything else requires it
const mongooseMock = {
    Schema: class {
        constructor() {
            this.index = () => {};
        }
    },
    model: mock.fn(() => ({
        create: mock.fn(),
        find: mock.fn(),
        findByIdAndDelete: mock.fn()
    }))
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function(path) {
    if (path === 'mongoose') {
        return mongooseMock;
    }
    return originalRequire.apply(this, arguments);
};

// Now require controller and model
const homeController = require('../controllers/home_controller');
const Safar = require('../models/safarSchema');

describe('Home Controller - Static Views', () => {
    test('home renders home view', () => {
        const req = {};
        const res = {
            render: mock.fn((view) => {})
        };
        homeController.home(req, res);
        assert.strictEqual(res.render.mock.callCount(), 1);
        assert.strictEqual(res.render.mock.calls[0].arguments[0], 'home');
    });

    test('about renders about view', () => {
        const req = {};
        const res = {
            render: mock.fn((view) => {})
        };
        homeController.about(req, res);
        assert.strictEqual(res.render.mock.callCount(), 1);
        assert.strictEqual(res.render.mock.calls[0].arguments[0], 'about');
    });

    test('review renders review view', () => {
        const req = {};
        const res = {
            render: mock.fn((view) => {})
        };
        homeController.review(req, res);
        assert.strictEqual(res.render.mock.callCount(), 1);
        assert.strictEqual(res.render.mock.calls[0].arguments[0], 'review');
    });
});

describe('Home Controller - add_review', () => {
    test('add_review creates a review and redirects to /explore', () => {
        const req = { body: { username: 'testuser' } };
        const res = {
            redirect: mock.fn((path) => {})
        };
        const createMock = mock.method(Safar, 'create', (data, callback) => {
            callback(null, { _id: '123' });
        });

        homeController.add_review(req, res);

        assert.strictEqual(createMock.mock.callCount(), 1);
        assert.deepStrictEqual(createMock.mock.calls[0].arguments[0], req.body);
        assert.strictEqual(res.redirect.mock.callCount(), 1);
        assert.strictEqual(res.redirect.mock.calls[0].arguments[0], '/explore');

        createMock.mock.restore();
    });

    test('add_review returns 500 on error', () => {
        const req = { body: { username: 'testuser' } };
        const res = {
            status: mock.fn((code) => res),
            send: mock.fn((msg) => {})
        };
        const createMock = mock.method(Safar, 'create', (data, callback) => {
            callback(new Error('Test Error'));
        });

        homeController.add_review(req, res);

        assert.strictEqual(createMock.mock.callCount(), 1);
        assert.strictEqual(res.status.mock.callCount(), 1);
        assert.strictEqual(res.status.mock.calls[0].arguments[0], 500);
        assert.strictEqual(res.send.mock.callCount(), 1);
        assert.strictEqual(res.send.mock.calls[0].arguments[0], 'Error in creating review');

        createMock.mock.restore();
    });
});

describe('Home Controller - explore', () => {
    test('explore fetches reviews and renders explore view', () => {
        const req = {};
        const res = {
            render: mock.fn((view, data) => {})
        };
        const reviews = [{ username: 'u1' }];

        const execMock = mock.fn((callback) => callback(null, reviews));
        const sortMock = mock.fn((field) => ({ exec: execMock }));
        const findMock = mock.method(Safar, 'find', () => ({ sort: sortMock }));

        homeController.explore(req, res);

        assert.strictEqual(findMock.mock.callCount(), 1);
        assert.strictEqual(sortMock.mock.callCount(), 1);
        assert.strictEqual(sortMock.mock.calls[0].arguments[0], '_id');
        assert.strictEqual(execMock.mock.callCount(), 1);
        assert.strictEqual(res.render.mock.callCount(), 1);
        assert.strictEqual(res.render.mock.calls[0].arguments[0], 'explore');
        assert.deepStrictEqual(res.render.mock.calls[0].arguments[1], { reviews: reviews });

        findMock.mock.restore();
    });

    test('explore returns 500 on error', () => {
        const req = {};
        const res = {
            status: mock.fn((code) => res),
            send: mock.fn((msg) => {})
        };

        const execMock = mock.fn((callback) => callback(new Error('Test Error')));
        const sortMock = mock.fn((field) => ({ exec: execMock }));
        const findMock = mock.method(Safar, 'find', () => ({ sort: sortMock }));

        homeController.explore(req, res);

        assert.strictEqual(res.status.mock.callCount(), 1);
        assert.strictEqual(res.status.mock.calls[0].arguments[0], 500);
        assert.strictEqual(res.send.mock.callCount(), 1);
        assert.strictEqual(res.send.mock.calls[0].arguments[0], 'Error in fetching reviews');

        findMock.mock.restore();
    });
});

describe('Home Controller - delete_review', () => {
    test('delete_review deletes a review and redirects to /explore', () => {
        const req = { query: { id: '123' } };
        const res = {
            redirect: mock.fn((path) => {})
        };
        const deleteMock = mock.method(Safar, 'findByIdAndDelete', (id, callback) => {
            callback(null);
        });

        homeController.delete_review(req, res);

        assert.strictEqual(deleteMock.mock.callCount(), 1);
        assert.strictEqual(deleteMock.mock.calls[0].arguments[0], '123');
        assert.strictEqual(res.redirect.mock.callCount(), 1);
        assert.strictEqual(res.redirect.mock.calls[0].arguments[0], '/explore');

        deleteMock.mock.restore();
    });

    test('delete_review returns 500 on error', () => {
        const req = { query: { id: '123' } };
        const res = {
            status: mock.fn((code) => res),
            send: mock.fn((msg) => {})
        };
        const deleteMock = mock.method(Safar, 'findByIdAndDelete', (id, callback) => {
            callback(new Error('Test Error'));
        });

        homeController.delete_review(req, res);

        assert.strictEqual(res.status.mock.callCount(), 1);
        assert.strictEqual(res.status.mock.calls[0].arguments[0], 500);
        assert.strictEqual(res.send.mock.callCount(), 1);
        assert.strictEqual(res.send.mock.calls[0].arguments[0], 'Error in deleting review');

        deleteMock.mock.restore();
    });
});
