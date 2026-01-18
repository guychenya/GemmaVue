-- Table definitions for GemmaVue Clinical Workstation

-- 1. Patient Profiles
DEFINE TABLE patient SCHEMAFULL;
DEFINE FIELD name ON patient TYPE string;
DEFINE FIELD age ON patient TYPE number;
DEFINE FIELD gender ON patient TYPE string;
DEFINE FIELD created_at ON patient TYPE datetime DEFAULT time::now();

-- 2. Radiology Studies (Links to Patient)
DEFINE TABLE radiology SCHEMAFULL;
DEFINE FIELD patient ON radiology TYPE record<patient>;
DEFINE FIELD modality ON radiology TYPE string; -- XR, CT, MRI
DEFINE FIELD body_part ON radiology TYPE string;
DEFINE FIELD report ON radiology TYPE string;
DEFINE FIELD image_url ON radiology TYPE string; -- Base64 or path
DEFINE FIELD tags ON radiology TYPE array<string>;
DEFINE FIELD created_at ON radiology TYPE datetime DEFAULT time::now();

-- 3. Dermatology Cases
DEFINE TABLE dermatology SCHEMAFULL;
DEFINE FIELD patient ON dermatology TYPE record<patient>;
DEFINE FIELD assessment ON dermatology TYPE string;
DEFINE FIELD risk_tier ON dermatology TYPE string;
DEFINE FIELD soap_note ON dermatology TYPE string;
DEFINE FIELD image_url ON dermatology TYPE string;
DEFINE FIELD created_at ON dermatology TYPE datetime DEFAULT time::now();

-- 4. Vector Search Ready Note Table (For Document Omnisearch)
DEFINE TABLE clinical_note SCHEMAFULL;
DEFINE FIELD patient ON clinical_note TYPE record<patient>;
DEFINE FIELD content ON clinical_note TYPE string;
DEFINE FIELD title ON clinical_note TYPE string;
DEFINE FIELD type ON clinical_note TYPE string;
