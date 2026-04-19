-- infra/db/init/schema.sql

-- =========================================================
-- DETI Maker Lab - seed.sql
-- Sample test data for PostgreSQL
-- =========================================================

-- How to run schema?
-- psql 127.0.0.1 -U makerlab_app -d makerlab -f seed.sql

-- =========================================================
-- USERS
-- =========================================================
INSERT INTO users (name, email, role, nmec, ) VALUES
    ('Prof. Maria Silva',  'maria.silva@ua.pt',   'professor',      '10001'),
    ('Joao Santos',        'joao.santos@ua.pt',    'student',        '12001'),
    ('Ana Costa',          'ana.costa@ua.pt',       'student',        '12002'),
    ('Miguel Ferreira',    'miguel.ferreira@ua.pt', 'student',        '12003'),
    ('Lab Technician',     'lab.tech@makerlab.pt',  'lab_technician', '90001');

-- =========================================================
-- PROJECTS
-- =========================================================
INSERT INTO projects (name, description, course, academic_year, group_number, created_by, status, tags, links, approved_at) VALUES
    (
        'Smart Irrigation System',
        'IoT-based irrigation system for monitoring soil humidity and automating water usage.',
        'Project in Informatics Engineering', '2025/2026', 3, 2,
        'active', 'iot,arduino,sensors', 'https://github.com/example/smart-irrigation',
        CURRENT_TIMESTAMP - INTERVAL '20 days'
    ),
    (
        'Autonomous Delivery Rover',
        'Prototype of a small autonomous rover for indoor material delivery.',
        'Embedded Systems Project', '2025/2026', 5, 3,
        'pending', 'robotics,raspberry-pi,navigation', 'https://github.com/example/delivery-rover',
        NULL
    );

-- =========================================================
-- PROJECT MEMBERS
-- =========================================================
INSERT INTO project_members (project_id, user_id, role) VALUES
    (1, 2, 'leader'),
    (1, 3, 'member'),
    (1, 4, 'member'),
    (1, 1, 'supervisor'),
    (2, 3, 'leader'),
    (2, 4, 'member'),
    (2, 1, 'supervisor');

-- =========================================================
-- EQUIPMENT MODELS
-- =========================================================
INSERT INTO equipment_models (name, family, sub_family, reference_code, supplier, price, snipeit_model_id, last_synced_at) VALUES
    ('Arduino Uno R3',             'Microcontroller',      'Arduino Board',   'ARD-UNO-R3', 'Arduino Store',       25.00, 101, NOW()),
    ('Raspberry Pi 4 Model B 4GB', 'Single-board Computer','Raspberry Pi',    'RPI4-4GB',   'Raspberry Pi Store',  75.00, 102, NOW()),
    ('Ultrasonic Sensor HC-SR04',  'Sensor',               'Distance Sensor', 'HC-SR04',    'Electronics Supplier', 5.50, 103, NOW()),
    ('Soil Moisture Sensor v2',    'Sensor',               'Moisture Sensor', 'SMS-V2',     'Electronics Supplier', 7.20, 104, NOW());

-- =========================================================
-- EQUIPMENT
-- =========================================================
INSERT INTO equipment (model_id, snipeit_asset_id, location, status, condition, last_synced_at) VALUES
    (1, 1001, 'Maker Lab Shelf A1',   'checked_out', 'good', NOW()),
    (1, 1002, 'Maker Lab Shelf A1',   'available',   'good', NOW()),
    (2, 1003, 'Maker Lab Shelf B2',   'available',   'new',  NOW()),
    (2, 1004, 'Maker Lab Shelf B2',   'checked_out', 'good', NOW()),
    (3, 1005, 'Maker Lab Drawer C1',  'available',   'good', NOW()),
    (3, 1006, 'Maker Lab Drawer C1',  'checked_out', 'good', NOW()),
    (4, 1007, 'Maker Lab Drawer C2',  'reserved',    'new',  NOW()),
    (4, 1008, 'Maker Lab Drawer C2',  'available',   'good', NOW());

-- =========================================================
-- EQUIPMENT REQUEST
-- =========================================================
INSERT INTO equipment_request (project_id, requested_by, status, approved_at, created_at) VALUES
    (1, 2, 'reserved',  CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
    (2, 3, 'pending',   NULL,                                    CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (1, 3, 'fulfilled', CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '32 days');

-- =========================================================
-- EQUIPMENT REQUEST ITEMS
-- =========================================================
INSERT INTO equipment_request_items (request_id, equipment_id) VALUES
    (1, 1),  -- Arduino checked_out para projeto 1
    (1, 7),  -- Soil moisture sensor reservado para projeto 1
    (2, 3),  -- Raspberry Pi disponível requisitado para projeto 2
    (2, 5),  -- Ultrasonic sensor para projeto 2
    (3, 6);  -- Item do request fulfilled anterior

-- =========================================================
-- EQUIPMENT USAGE
-- =========================================================
INSERT INTO equipment_usage (equipment_id, project_id, request_item_id, checked_out_at, due_at, returned_at, status) VALUES
    (1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '9 days',  CURRENT_TIMESTAMP + INTERVAL '21 days', NULL, 'checked_out'),
    (7, 1, 2, CURRENT_TIMESTAMP - INTERVAL '9 days',  CURRENT_TIMESTAMP + INTERVAL '21 days', NULL, 'checked_out'),
    (6, 1, 5, CURRENT_TIMESTAMP - INTERVAL '28 days', CURRENT_TIMESTAMP - INTERVAL '7 days',  CURRENT_TIMESTAMP - INTERVAL '8 days', 'returned');
    
-- =========================================================
-- STATUS HISTORY
-- =========================================================
INSERT INTO status_history (
    entity_type,
    entity_id,
    old_status,
    new_status,
    changed_by,
    changed_at,
    note
)
VALUES
    (
        'project',
        1,
        'approved',
        'active',
        2,
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        'Project was approved and started.'
    ),
    (
        'equipment_request',
        1,
        'pending',
        'approved',
        6,
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        'Approved by lab technician after stock verification.'
    ),
    (
        'equipment_request',
        3,
        'approved',
        'fulfilled',
        6,
        CURRENT_TIMESTAMP - INTERVAL '28 days',
        'All requested items were assigned.'
    ),
    (
        'equipment_usage',
        3,
        'checked_out',
        'returned',
        6,
        CURRENT_TIMESTAMP - INTERVAL '8 days',
        'Equipment returned in good condition.'
    ),
    (
        'project',
        2,
        'draft',
        'pending',
        4,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        'Project submitted for approval.'
    );

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    reference_type,
    reference_id,
    is_read,
    created_at
)
VALUES
    (
        2,
        'New project awaiting review',
        'The project "Autonomous Delivery Rover" is waiting for supervisor review.',
        'approval',
        'project',
        2,
        FALSE,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        3,
        'Equipment request approved',
        'Your equipment request for "Smart Irrigation System" was approved.',
        'request',
        'equipment_request',
        1,
        TRUE,
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    ),
    (
        4,
        'Equipment request submitted',
        'Your request for "Autonomous Delivery Rover" was successfully submitted.',
        'info',
        'equipment_request',
        2,
        FALSE,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        6,
        'Equipment overdue reminder',
        'Please verify whether any checked out assets are overdue for return.',
        'reminder',
        'equipment_usage',
        1,
        FALSE,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );