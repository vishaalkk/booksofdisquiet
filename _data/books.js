require('dotenv').config();
const Airtable = require('airtable');

module.exports = async function() {
    // We check if API key exists, otherwise we fall back to empty data
    // to prevent Eleventy build from failing locally without env variables.
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        console.warn("⚠️ Airtable credentials not found in .env. Returning an empty books array.");
        return [];
    }

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Books';

    const base = new Airtable({ apiKey }).base(baseId);
    let allRecords = [];

    console.log(`\nFetching books from Airtable...`);

    try {
        const records = await base(tableName).select({
            // You can optionally add a sort parameter here if you have a Last Modified column.
            // sort: [{field: "Last Modified", direction: "desc"}],
        }).all();

        records.forEach(record => {
            // Flattening the Airtable record so it acts exactly like a CSV row object
            // This ensures compatibility with your existing Eleventy templates
            allRecords.push({
                ...record.fields,
                airtable_id: record.getId()
            });
        });

        console.log(`✅ Successfully fetched ${allRecords.length} books from Airtable.\n`);
        return allRecords;

    } catch (err) {
        console.error("❌ Error fetching data from Airtable:", err);
        return [];
    }
};
