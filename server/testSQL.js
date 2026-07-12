const poolPromise = require("./config/sql");

(async () => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .query("SELECT GETDATE() AS CurrentTime");

        console.log(result.recordset);

    } catch (err) {
        console.error(err);
    }
})();