const Pool = require('pg').Pool;

const dbURLForDev = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// postgresql://YYYYYY:XXXXX@localhost:5432/ZZZZZZ

const dbURLForProd = process.env.DATABASE_URL; //heroku addons

const connectionString = process.env.NODE_ENV === 'production' ? dbURLForProd : dbURLForDev;
console.log(connectionString);

const pool = new Pool({connectionString});

module.exports = pool;
