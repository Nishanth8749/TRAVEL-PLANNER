const sql = require('../config/sql');

exports.getGuides = async (req, res) => {
    try {

        const { location, specialty, language, search } = req.query;

        const pool = await sql;

        const request = pool.request();

        let query = `
            SELECT *
            FROM guides
            WHERE 1=1
        `;

        if (location) {
            request.input("location", sql.NVarChar(100), `%${location}%`);
            query += ` AND location LIKE @location`;
        }

        if (specialty) {
            request.input("specialty", sql.NVarChar(100), `%${specialty}%`);
            query += ` AND specialties LIKE @specialty`;
        }

        if (language) {
            request.input("language", sql.NVarChar(100), `%${language}%`);
            query += ` AND languages LIKE @language`;
        }

        if (search) {

            request.input("search", sql.NVarChar(100), `%${search}%`);

            query += `
                AND
                (
                    name LIKE @search
                    OR bio LIKE @search
                    OR location LIKE @search
                )
            `;

        }

        query += ` ORDER BY rating DESC`;

        const result = await request.query(query);

        const guides = result.recordset.map(item => ({

            ...item,

            languages: item.languages
                ? JSON.parse(item.languages)
                : [],

            specialties: item.specialties
                ? JSON.parse(item.specialties)
                : []

        }));

        res.json(guides);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch guides",

            error: error.message

        });

    }

};

exports.getGuideById = async (req, res) => {

    try {

        const pool = await sql;

        const result = await pool.request()

            .input("id", sql.Int, req.params.id)

            .query(`
                SELECT *
                FROM guides
                WHERE id=@id
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({

                message: "Guide not found"

            });

        }

        const guide = result.recordset[0];

        guide.languages = guide.languages
            ? JSON.parse(guide.languages)
            : [];

        guide.specialties = guide.specialties
            ? JSON.parse(guide.specialties)
            : [];

        res.json(guide);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to fetch guide",

            error: error.message

        });

    }

};

exports.createGuide = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            bio,
            experience,
            languages,
            specialties,
            location,
            price_per_day
        } = req.body;

        const avatar = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const pool = await sql;

        const languagesJson = Array.isArray(languages)
            ? JSON.stringify(languages)
            : (languages || "[]");

        const specialtiesJson = Array.isArray(specialties)
            ? JSON.stringify(specialties)
            : (specialties || "[]");

        const result = await pool.request()

            .input("name", sql.NVarChar(200), name)
            .input("avatar", sql.NVarChar(300), avatar)
            .input("email", sql.NVarChar(150), email)
            .input("phone", sql.NVarChar(30), phone)
            .input("bio", sql.NVarChar(sql.MAX), bio)
            .input("experience", sql.Int, experience)
            .input("languages", sql.NVarChar(sql.MAX), languagesJson)
            .input("specialties", sql.NVarChar(sql.MAX), specialtiesJson)
            .input("location", sql.NVarChar(150), location)
            .input("price", sql.Decimal(10,2), price_per_day)

            .query(`
                INSERT INTO guides
                (
                    name,
                    avatar,
                    email,
                    phone,
                    bio,
                    experience,
                    languages,
                    specialties,
                    location,
                    price_per_day
                )

                OUTPUT INSERTED.id

                VALUES
                (
                    @name,
                    @avatar,
                    @email,
                    @phone,
                    @bio,
                    @experience,
                    @languages,
                    @specialties,
                    @location,
                    @price
                )
            `);

        const guideId = result.recordset[0].id;

        const guideResult = await pool.request()

            .input("id", sql.Int, guideId)

            .query(`
                SELECT *
                FROM guides
                WHERE id=@id
            `);

        const guide = guideResult.recordset[0];

        guide.languages = JSON.parse(guide.languages || "[]");
        guide.specialties = JSON.parse(guide.specialties || "[]");

        res.status(201).json({

            message: "Guide created successfully",

            guide

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to create guide",

            error: error.message

        });

    }

};

exports.updateGuide = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            email,
            phone,
            bio,
            experience,
            languages,
            specialties,
            location,
            price_per_day,
            available
        } = req.body;

        const avatar = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const pool = await sql;

        // Check guide exists
        const existingResult = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT *
                FROM guides
                WHERE id=@id
            `);

        if (existingResult.recordset.length === 0) {
            return res.status(404).json({
                message: "Guide not found"
            });
        }

        const existing = existingResult.recordset[0];

        const languagesJson = Array.isArray(languages)
            ? JSON.stringify(languages)
            : (languages || existing.languages);

        const specialtiesJson = Array.isArray(specialties)
            ? JSON.stringify(specialties)
            : (specialties || existing.specialties);

        await pool.request()

            .input("id", sql.Int, id)
            .input("name", sql.NVarChar(200), name || existing.name)
            .input("email", sql.NVarChar(150), email || existing.email)
            .input("phone", sql.NVarChar(30), phone || existing.phone)
            .input("bio", sql.NVarChar(sql.MAX), bio || existing.bio)
            .input("experience", sql.Int, experience || existing.experience)
            .input("languages", sql.NVarChar(sql.MAX), languagesJson)
            .input("specialties", sql.NVarChar(sql.MAX), specialtiesJson)
            .input("location", sql.NVarChar(150), location || existing.location)
            .input("price", sql.Decimal(10,2), price_per_day || existing.price_per_day)
            .input("available", sql.Bit,
                available !== undefined ? available : existing.available)
            .input("avatar", sql.NVarChar(300),
                avatar || existing.avatar)

            .query(`
                UPDATE guides
                SET
                    name=@name,
                    avatar=@avatar,
                    email=@email,
                    phone=@phone,
                    bio=@bio,
                    experience=@experience,
                    languages=@languages,
                    specialties=@specialties,
                    location=@location,
                    price_per_day=@price,
                    available=@available
                WHERE id=@id
            `);

        const updatedResult = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT *
                FROM guides
                WHERE id=@id
            `);

        const guide = updatedResult.recordset[0];

        guide.languages = guide.languages
            ? JSON.parse(guide.languages)
            : [];

        guide.specialties = guide.specialties
            ? JSON.parse(guide.specialties)
            : [];

        res.json({
            message: "Guide updated successfully",
            guide
        });

    } catch (error) {

        console.error("Update Guide Error:", error);

        res.status(500).json({
            message: "Failed to update guide",
            error: error.message
        });

    }

};

exports.deleteGuide = async (req, res) => {

    try {

        const { id } = req.params;

        const pool = await sql;

        const result = await pool.request()

            .input("id", sql.Int, id)

            .query(`
                SELECT id
                FROM guides
                WHERE id=@id
            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({
                message: "Guide not found"
            });

        }

        await pool.request()

            .input("id", sql.Int, id)

            .query(`
                DELETE FROM guides
                WHERE id=@id
            `);

        res.json({
            message: "Guide deleted successfully"
        });

    } catch (error) {

        console.error("Delete Guide Error:", error);

        res.status(500).json({
            message: "Failed to delete guide",
            error: error.message
        });

    }

};