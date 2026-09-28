const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  client.query("SELECT id FROM interview_sessions WHERE status='PLANNING' LIMIT 1").then(res => {
    console.log("SESSION_ID:", res.rows[0]?.id);
    client.end();
  });
});
