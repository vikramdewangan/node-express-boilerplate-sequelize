const { Sequelize, DataTypes } = require('sequelize');
const setupTestDB = require('../../../utils/setupTestDB');
const paginate = require('../../../../src/models/plugins/paginate.plugin'); // Adapt this for Sequelize

// Initialize Sequelize
const sequelize = new Sequelize('sqlite::memory:'); // Use your actual database configuration

// Define Project model
const Project = sequelize.define('Project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define Task model
const Task = sequelize.define('Task', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER, // Use DataTypes.UUID if using UUIDs
    references: {
      model: Project,
      key: 'id',
    },
    allowNull: false,
  },
});

// Define associations
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Apply pagination plugin (make sure to adapt this for Sequelize)
Project.paginate = paginate(Project);
Task.paginate = paginate(Task);

// Setup test DB
setupTestDB();

describe('paginate plugin', () => {
  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      await sequelize.sync({ force: true });

      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', projectId: project.id });

      const taskPages = await Task.paginate({ where: { id: task.id }, include: [{ model: Project, as: 'project' }] });

      expect(taskPages.rows[0].project).toHaveProperty('id', project.id);
    });

    test('should populate nested fields', async () => {
      await sequelize.sync({ force: true });

      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', projectId: project.id });

      const projectPages = await Project.paginate({ where: { id: project.id }, include: [{ model: Task, as: 'tasks', include: [{ model: Project, as: 'project' }] }] });
      const { tasks } = projectPages.rows[0];

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toHaveProperty('id', task.id);
      expect(tasks[0].project).toHaveProperty('id', project.id);
    });
  });
});
