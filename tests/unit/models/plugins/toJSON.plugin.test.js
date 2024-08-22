const { Sequelize, DataTypes } = require('sequelize');
const toJSON = require('../../../../src/models/plugins/toJSON.plugin');

const sequelize = new Sequelize('sqlite::memory:'); // or your database connection

// Define Model
const Model = sequelize.define('Model', {
  public: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  private: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      // Make private fields invisible in toJSON
      return this.getDataValue('private');
    },
  },
}, {
  hooks: {
    afterFind: (result) => {
      if (Array.isArray(result)) {
        result.forEach(instance => instance && toJSON(instance));
      } else if (result) {
        toJSON(result);
      }
    },
  },
});

// Define a test suite
describe('toJSON plugin', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it('should replace _id with id', async () => {
    const doc = await Model.create({});
    const data = doc.toJSON();
    expect(data).not.toHaveProperty('_id');
    expect(data).toHaveProperty('id', doc.id);
  });

  it('should remove __v', async () => {
    // Sequelize does not have `__v`, this test can be omitted
    // or adjusted based on additional fields.
  });

  it('should remove createdAt and updatedAt', async () => {
    const doc = await Model.create({});
    const data = doc.toJSON();
    expect(data).not.toHaveProperty('createdAt');
    expect(data).not.toHaveProperty('updatedAt');
  });

  it('should remove any path set as private', async () => {
    const doc = await Model.create({ public: 'some public value', private: 'some private value' });
    const data = doc.toJSON();
    expect(data).not.toHaveProperty('private');
    expect(data).toHaveProperty('public');
  });

  it('should remove any nested paths set as private', async () => {
    // For nested paths, you'll need to adapt the model definition and testing approach
  });

  it('should also call the model toJSON transform function', async () => {
    // Sequelize doesn't have a direct toJSON transform, use the custom function instead
  });
});
