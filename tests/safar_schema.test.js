const { test, describe, mock, after } = require('node:test');
const assert = require('node:assert');
const Module = require('module');

let capturedSchemaDefinition;

// We must mock mongoose because the environment lacks node_modules and internet access.
// This mock captures the schema definition and provides a simple validation simulator.
const mongooseMock = {
    Schema: class {
        constructor(definition) {
            this.definition = definition;
            capturedSchemaDefinition = definition;
        }
    },
    model: mock.fn((name, schema) => {
        return {
            name,
            schema,
            // Simulator for Mongoose's validateSync logic based on the schema definition
            validateSync: (data) => {
                const errors = {};
                for (const [key, rules] of Object.entries(schema.definition)) {
                    if (rules.required && (data[key] === undefined || data[key] === null || data[key] === '')) {
                        errors[key] = { message: `${key} is required` };
                    }
                }
                if (Object.keys(errors).length > 0) {
                    return { errors };
                }
                return null;
            }
        };
    })
};

// Use monkey-patching carefully, restoring the original require after tests.
const originalRequire = Module.prototype.require;
Module.prototype.require = function(path) {
    if (path === 'mongoose') {
        return mongooseMock;
    }
    return originalRequire.apply(this, arguments);
};

// Require the model which will trigger the mock and capture the schema
const Safar = require('../models/safarSchema');

// Restore original require immediately after loading the model to minimize side effects.
Module.prototype.require = originalRequire;

describe('Safar Schema Validation', () => {
    test('should pass if all required fields are present', () => {
        const validData = {
            username: 'testuser',
            location: 'testlocation',
            image: 'testimage.jpg',
            experience: 'testexperience',
            rating: 5,
            places: 'testplaces',
            expenditure: 100
        };
        const error = Safar.validateSync(validData);
        assert.strictEqual(error, null, 'Should not have validation errors');
    });

    test('should fail if required fields are missing', () => {
        const invalidData = {
            username: 'testuser'
            // other fields missing
        };
        const result = Safar.validateSync(invalidData);
        assert.notStrictEqual(result, null, 'Should have validation errors');
        assert.ok(result.errors.location, 'location should be required');
        assert.ok(result.errors.image, 'image should be required');
        assert.ok(result.errors.experience, 'experience should be required');
        assert.ok(result.errors.rating, 'rating should be required');
        assert.ok(result.errors.places, 'places should be required');
        assert.ok(result.errors.expenditure, 'expenditure should be required');
    });

    test('schema should have correct types', () => {
        assert.strictEqual(capturedSchemaDefinition.username.type, String);
        assert.strictEqual(capturedSchemaDefinition.location.type, String);
        assert.strictEqual(capturedSchemaDefinition.image.type, String);
        assert.strictEqual(capturedSchemaDefinition.experience.type, String);
        assert.strictEqual(capturedSchemaDefinition.rating.type, Number);
        assert.strictEqual(capturedSchemaDefinition.places.type, String);
        assert.strictEqual(capturedSchemaDefinition.expenditure.type, Number);
    });

    test('all fields should be required', () => {
        for (const [key, rules] of Object.entries(capturedSchemaDefinition)) {
            assert.strictEqual(rules.required, true, `${key} should be required`);
        }
    });
});
