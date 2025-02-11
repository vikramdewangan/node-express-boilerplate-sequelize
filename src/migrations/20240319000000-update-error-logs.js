module.exports = {
  async up(queryInterface, Sequelize) {
    // Add errorId column as nullable first
    await queryInterface.addColumn('ErrorLogs', 'errorId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Update existing records with generated errorIds
    await queryInterface.sequelize.query(`
      UPDATE "ErrorLogs"
      SET "errorId" = 'err_' || extract(epoch from "createdAt")::text || '_' || md5(random()::text)
      WHERE "errorId" IS NULL;
    `);

    // Make errorId not nullable
    await queryInterface.changeColumn('ErrorLogs', 'errorId', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ErrorLogs', 'errorId');
  },
}; 