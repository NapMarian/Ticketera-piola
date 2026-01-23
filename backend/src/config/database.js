const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

// Use DATABASE_URL for production (PostgreSQL on Railway)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
  console.log('Using PostgreSQL database');
} else {
  // Use SQLite for local development
  const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
  console.log('Using SQLite database');
}

module.exports = sequelize;
