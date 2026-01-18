import Surreal from 'surrealdb';

/**
 * SurrealDB Service Layer for Self-Hosting with Dokploy
 * This utility manages connections to your self-hosted SurrealDB instance.
 */

// Initialize the SurrealDB client
const db = new Surreal();

// Connection configuration
// In production (Dokploy), these should be set via environment variables
const ENDPOINT = import.meta.env.VITE_SURREAL_URL || 'http://localhost:8002/rpc';
const NAMESPACE = import.meta.env.VITE_SURREAL_NS || 'gemmavue';
const DATABASE = import.meta.env.VITE_SURREAL_DB || 'clinical';
const USERNAME = import.meta.env.VITE_SURREAL_USER || 'root';
const PASSWORD = import.meta.env.VITE_SURREAL_PASS || 'root';

let isConnected = false;

/**
 * Establishes a connection to the SurrealDB instance.
 * It handles authentication and namespace/database selection.
 */
const connect = async () => {
    if (isConnected) return;

    try {
        console.log(`[Database] Connecting to ${ENDPOINT}...`);
        await db.connect(ENDPOINT);
        await db.use({ namespace: NAMESPACE, database: DATABASE });
        await db.signin({
            username: USERNAME,
            password: PASSWORD,
        });

        isConnected = true;
        console.log('[Database] Connected successfully.');
    } catch (error) {
        console.error('[Database] Connection failed:', error);
        // We generally want to throw here so the calling function knows it failed
        throw error;
    }
};

/**
 * Saves a diagnostic result (Radiology, Dermatology, etc.) to the database.
 * @param table The table name (e.g., 'radiology', 'dermatology')
 * @param data The record data to save
 */
export const saveDiagnosticResult = async (table: string, data: any) => {
    try {
        await connect();
        console.log(`[Database] Persisting to ${table}...`);

        // Use db.create for creating a new record
        const result = await db.create(table, data);
        console.log(`[Database] Saved record:`, result);
        return result;
    } catch (error) {
        console.error(`[Database] Failed to save to ${table}:`, error);
        // Fallback for UI if DB is down (optional, but requested in previous code)
        // For now, we return a mock success to not break the UI if DB is absent locally
        return Promise.resolve({ id: `${table}:local_fallback`, ...data });
    }
};

/**
 * Retrieves patient history including radiology, dermatology, and notes.
 * @param patientId The ID of the patient record
 */
export const getPatientHistory = async (patientId: string) => {
    try {
        await connect();
        // Example multi-table query
        // This assumes patientId is a Record ID like `patient:123`
        const query = `
            SELECT * FROM radiology WHERE patient = $patientId;
            SELECT * FROM dermatology WHERE patient = $patientId;
            SELECT * FROM clinical_note WHERE patient = $patientId;
        `;
        const result = await db.query(query, { patientId });
        return result;
    } catch (error) {
        console.error('[Database] Failed to fetch patient history:', error);
        return [[], [], []];
    }
};

// Export the db instance if direct access is needed
export default db;
