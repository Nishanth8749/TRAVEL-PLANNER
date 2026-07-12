require("dotenv").config();

const mssql = require("mssql");

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,

    options: {
        encrypt: true,
        trustServerCertificate: false
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const pool = new mssql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
    .then(() => console.log("✅ Azure SQL Connected"))
    .catch(err => console.error("❌ Azure SQL Error:", err));

module.exports = Object.assign(poolConnect, mssql);