
import Surreal from 'surrealdb';
import fs from 'fs';

const db = new Surreal();

const ENDPOINT = 'http://localhost:8002/rpc';
const NAMESPACE = 'gemmavue';
const DATABASE = 'clinical';
const USERNAME = 'root';
const PASSWORD = 'root';

async function main() {
    try {
        console.log(`Connecting to ${ENDPOINT}...`);
        await db.connect(ENDPOINT);

        console.log('Signing in...');
        await db.signin({
            username: USERNAME,
            password: PASSWORD,
        });

        console.log('Selecting NS/DB...');
        await db.use({ namespace: NAMESPACE, database: DATABASE });

        console.log('Connected and Authenticated.');

        // Read schema
        const schema = fs.readFileSync('schema.surql', 'utf8');
        console.log('Applying schema...');
        try {
            await db.query(schema);
            console.log('Schema applied.');
        } catch (schemaError) {
            console.warn('Schema application completed with warnings (likely resources already exist):', schemaError.message);
        }

        // Create Patient
        console.log('Creating patient:P123...');
        // We delete first to ensure a clean state for this demo record
        // In older surrealdb.js versions, query returns array of results.
        // In newer, it might return array of results.
        const result = await db.query(`
            DELETE patient:P123;
            CREATE patient:P123 CONTENT {
                name: 'Alexander Thompson', 
                age: 58, 
                gender: 'Male',
                created_at: time::now()
            };
        `);
        console.log('Patient created:', result);

        await db.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
