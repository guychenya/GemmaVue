import Surreal from 'surrealdb';

const ENDPOINT = 'https://db.gemmavue.xyz/rpc';
const NAMESPACE = 'gemmavue';
const DATABASE = 'clinical';
const USERNAME = 'root';
const PASSWORD = 'XmanSurreal@2026';

const db = new Surreal();

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    try {
        console.log(`Connecting to ${ENDPOINT}...`);
        await db.connect(ENDPOINT, {
            namespace: NAMESPACE,
            database: DATABASE,
            auth: {
                username: USERNAME,
                password: PASSWORD,
            }
        });

        console.log('Connected! Cleaning up old data...');

        // Use a transaction/batch query to clean and insert
        await db.query(`
            DELETE patient:P123;
            DELETE radiology WHERE patient = patient:P123;
            DELETE dermatology WHERE patient = patient:P123;
            DELETE clinical_note WHERE patient = patient:P123;
        `);

        console.log('Inserting Patient: Alexander Thompson...');
        await db.create('patient:P123', {
            name: 'Alexander Thompson',
            age: 58,
            gender: 'Male',
            mrn: 'MRN-8842-19',
            history: 'Hypertension, T2DM (Managed), Smoker (former)',
            created_at: new Date().toISOString()
        });

        console.log('Inserting Radiology Studies...');

        await db.query(`
            CREATE radiology CONTENT {
                patient: patient:P123,
                modality: 'CXR',
                region: 'Chest',
                image_url: 'https://prod-images-static.radiopaedia.org/images/157210/332ea677774c4244a04457c126600b_jumbo.jpg',
                status: 'Analyzed',
                findings: 'Right lower lobe consolidation consistent with pneumonia. No pleural effusion.',
                ai_confidence: 0.94,
                timestamp: time::now()
            };
            
            CREATE radiology CONTENT {
                patient: patient:P123,
                modality: 'CT',
                region: 'Head',
                status: 'Pending',
                findings: '',
                timestamp: time::now() - 2h
            };
        `);

        console.log('Inserting Dermatology Cases...');

        await db.query(`
            CREATE dermatology CONTENT {
                patient: patient:P123,
                lesion_type: 'Melanocytic Nevus',
                location: 'Left Forearm',
                image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Melanocytic_nevus.jpg',
                risk_score: 85,
                ai_analysis: 'High suspicion for dysplastic changes. Asymmetry noted in quadrant 3.',
                timestamp: time::now() - 1d
            };
        `);

        console.log('Inserting Clinical Notes...');
        await db.query(`
            CREATE clinical_note CONTENT {
                patient: patient:P123,
                author: 'Dr. Sarah Chen',
                content: 'Patient presents with persistent cough for 2 weeks. Vitals stable.',
                category: 'Consultation',
                timestamp: time::now() - 3d
            };
        `);

        console.log('✅ Seeding Complete!');
        await db.close();

    } catch (e) {
        console.error('❌ Seeding Failed:', e);
        // Sometimes the error object has details hidden
        if (e.cause) console.error('Cause:', e.cause);
    }
}

main();
