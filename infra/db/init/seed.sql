\c makerlab;

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
INSERT INTO users (name, email, role, nmec, course, academic_year) VALUES
    ('Prof. Maria Silva',     'maria.silva@ua.pt',       'professor',         NULL, NULL,                               NULL),
    ('Prof. Carlos Mendes',   'carlos.mendes@ua.pt',     'professor',         NULL, NULL,                               NULL),
    ('Prof. Ana Baptista',    'ana.baptista@ua.pt',      'professor',         NULL, NULL,                               NULL),
    ('Lab Technician',        'lab.tech@makerlab.pt',    'lab_technician',    NULL, NULL,                               NULL),
    ('João Santos',           'joao.santos@ua.pt',       'student',        '12001', 'Licenciatura em Eng. Informática', '3'),
    ('Ana Costa',             'ana.costa@ua.pt',         'student',        '12002', 'Licenciatura em Eng. Informática', '2'),
    ('Miguel Ferreira',       'miguel.ferreira@ua.pt',   'student',        '12003', 'Mestrado em Eng. Eletrónica',      '1'),
    ('Sofia Rodrigues',       'sofia.rodrigues@ua.pt',   'student',        '12004', 'Licenciatura em Eng. Informática', '3'),
    ('Tiago Oliveira',        'tiago.oliveira@ua.pt',    'student',        '12005', 'Mestrado em Eng. Informática',     '2'),
    ('Beatriz Alves',         'beatriz.alves@ua.pt',     'student',        '12006', 'Licenciatura em Eng. Eletrónica',  '1'),
    ('Rui Pereira',           'rui.pereira@ua.pt',       'student',        '12007', 'Licenciatura em Eng. Informática', '2'),
    ('Inês Martins',          'ines.martins@ua.pt',      'student',        '12008', 'Mestrado em Eng. Eletrónica',      '1'),
    ('Pedro Gomes',           'pedro.gomes@ua.pt',       'student',        '12009', 'Licenciatura em Eng. Informática', '3'),
    ('Marta Sousa',           'marta.sousa@ua.pt',       'student',        '12010', 'Mestrado em Eng. Informática',     '2'),
    ('Diogo Nunes',           'diogo.nunes@ua.pt',       'student',        '12011', 'Licenciatura em Eng. Informática', '1'),
    ('Catarina Lopes',        'catarina.lopes@ua.pt',    'student',        '12012', 'Licenciatura em Eng. Eletrónica',  '2');

-- =========================================================
-- PROJECTS
-- =========================================================
INSERT INTO projects (name, description, course, academic_year, group_number, created_by, status, tags, links, approved_at) VALUES
    (
        'Smart Irrigation System',
        'IoT-based irrigation system for monitoring soil humidity and automating water usage.',
        'Projeto em Engenharia Informática', '2025/2026', 3, 5,
        'active', 'iot,arduino,sensors',
        'https://github.com/example/smart-irrigation',
        CURRENT_TIMESTAMP - INTERVAL '20 days'
    ),
    (
        'Autonomous Delivery Rover',
        'Prototype of a small autonomous rover for indoor material delivery.',
        'Sistemas Embebidos', '2025/2026', 5, 6,
        'pending', 'robotics,raspberry-pi,navigation',
        'https://github.com/example/delivery-rover',
        NULL
    ),
    (
        'Air Quality Monitor',
        'Low-cost air quality monitoring station using particulate matter and CO2 sensors.',
        'Projeto em Engenharia Eletrónica', '2025/2026', 2, 7,
        'active', 'sensors,environment,esp32',
        'https://github.com/example/air-quality',
        CURRENT_TIMESTAMP - INTERVAL '15 days'
    ),
    (
        'Smart Door Lock',
        'RFID and fingerprint based smart door lock with web dashboard.',
        'Projeto em Engenharia Informática', '2025/2026', 1, 8,
        'completed', 'rfid,security,esp32',
        'https://github.com/example/smart-lock',
        CURRENT_TIMESTAMP - INTERVAL '60 days'
    ),
    (
        'Line Following Robot',
        'Autonomous line-following robot for warehouse logistics simulation.',
        'Robótica', '2025/2026', 4, 9,
        'rejected', 'robotics,motors,sensors',
        NULL,
        NULL
    );

-- =========================================================
-- PROJECT MEMBERS
-- =========================================================
INSERT INTO project_members (project_id, user_id, role) VALUES
    -- Smart Irrigation System
    (1, 5,  'leader'),
    (1, 6,  'member'),
    (1, 7,  'member'),
    (1, 1,  'supervisor'),
    -- Autonomous Delivery Rover
    (2, 6,  'leader'),
    (2, 7,  'member'),
    (2, 8,  'member'),
    (2, 2,  'supervisor'),
    -- Air Quality Monitor
    (3, 7,  'leader'),
    (3, 9,  'member'),
    (3, 10, 'member'),
    (3, 1,  'supervisor'),
    -- Smart Door Lock
    (4, 8,  'leader'),
    (4, 11, 'member'),
    (4, 3,  'supervisor'),
    -- Line Following Robot
    (5, 9,  'leader'),
    (5, 12, 'member'),
    (5, 13, 'member'),
    (5, 2,  'supervisor');

-- =========================================================
-- EQUIPMENT MODELS
-- (snipeit_model_id deve corresponder aos IDs criados no Snipe-IT)
-- =========================================================
INSERT INTO equipment_models (name, family, sub_family, reference_code, supplier, price, snipeit_model_id, last_synced_at) VALUES
    ('Arduino Uno R3',              'Microcontroller',       'Arduino',          'ARD-UNO-R3',  'Arduino Store',        25.00,  1, NOW()),
    ('Raspberry Pi 4 Model B 4GB',  'Single-board Computer', 'Raspberry Pi',     'RPI4-4GB',    'Raspberry Pi Store',   75.00,  2, NOW()),
    ('ESP32 DevKit V1',             'Microcontroller',       'Espressif',        'ESP32-DEVKIT', 'Mouser Electronics',   8.50,   3, NOW()),
    ('Ultrasonic Sensor HC-SR04',   'Sensor',                'Distance',         'HC-SR04',     'Electronics Supplier',  5.50,  4, NOW()),
    ('Soil Moisture Sensor v2',     'Sensor',                'Moisture',         'SMS-V2',      'Electronics Supplier',  7.20,  5, NOW()),
    ('MQ-135 Air Quality Sensor',   'Sensor',                'Gas/Air',          'MQ-135',      'Electronics Supplier',  4.80,  6, NOW()),
    ('RFID Reader RC522',           'Module',                'RFID',             'RC522',       'Electronics Supplier',  6.90,  7, NOW()),
    ('L298N Motor Driver',          'Module',                'Motor Control',    'L298N',       'Electronics Supplier',  5.20,  8, NOW()),
    ('16x2 LCD Display',            'Display',               'LCD',              'LCD-16X2',    'Electronics Supplier',  4.50,  9, NOW()),
    ('Breadboard 830 points',       'Prototyping',           'Breadboard',       'BB-830',      'Electronics Supplier',  3.20, 10, NOW());

-- =========================================================
-- EQUIPMENT
-- =========================================================
INSERT INTO equipment (model_id, snipeit_asset_id, location, status, condition, last_synced_at) VALUES
    (1,  1,  'Maker Lab Shelf A1',   'checked_out', 'good',    NOW()),
    (1,  2,  'Maker Lab Shelf A1',   'available',   'good',    NOW()),
    (1,  3,  'Maker Lab Shelf A1',   'available',   'fair',    NOW()),
    (2,  4,  'Maker Lab Shelf B2',   'available',   'new',     NOW()),
    (2,  5,  'Maker Lab Shelf B2',   'checked_out', 'good',    NOW()),
    (3,  6,  'Maker Lab Shelf B3',   'available',   'new',     NOW()),
    (3,  7,  'Maker Lab Shelf B3',   'available',   'good',    NOW()),
    (4,  8,  'Maker Lab Drawer C1',  'available',   'good',    NOW()),
    (4,  9,  'Maker Lab Drawer C1',  'checked_out', 'good',    NOW()),
    (5,  10, 'Maker Lab Drawer C2',  'reserved',    'new',     NOW()),
    (6,  11, 'Maker Lab Drawer C2',  'available',   'good',    NOW()),
    (7,  12, 'Maker Lab Drawer D1',  'available',   'new',     NOW()),
    (8,  13, 'Maker Lab Drawer D1',  'checked_out', 'good',    NOW()),
    (9,  14, 'Maker Lab Shelf A2',   'available',   'fair',    NOW()),
    (10, 15, 'Maker Lab Shelf A2',   'available',   'good',    NOW()),
    (10, 16, 'Maker Lab Shelf A2',   'available',   'good',    NOW());

-- =========================================================
-- EQUIPMENT REQUEST
-- =========================================================
INSERT INTO equipment_request (project_id, requested_by, status, approved_at, created_at) VALUES
    (1, 5, 'reserved',  CURRENT_TIMESTAMP - INTERVAL '18 days', CURRENT_TIMESTAMP - INTERVAL '20 days'),
    (2, 6, 'pending',   NULL,                                    CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (3, 7, 'reserved',  CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '12 days'),
    (4, 8, 'fulfilled', CURRENT_TIMESTAMP - INTERVAL '55 days', CURRENT_TIMESTAMP - INTERVAL '58 days'),
    (5, 9, 'rejected',  NULL,                                    CURRENT_TIMESTAMP - INTERVAL '5 days');

-- =========================================================
-- EQUIPMENT REQUEST ITEMS
-- =========================================================
INSERT INTO equipment_request_items (request_id, equipment_id) VALUES
    (1, 1),   -- Arduino para Smart Irrigation
    (1, 10),  -- Soil Moisture para Smart Irrigation
    (2, 4),   -- Raspberry Pi para Delivery Rover
    (2, 8),   -- Ultrasonic para Delivery Rover
    (2, 13),  -- Motor Driver para Delivery Rover
    (3, 6),   -- ESP32 para Air Quality
    (3, 11),  -- MQ-135 para Air Quality
    (4, 12),  -- RFID para Smart Door Lock
    (4, 9),   -- Ultrasonic para Smart Door Lock
    (5, 13);  -- Motor Driver para Line Following

-- =========================================================
-- EQUIPMENT USAGE
-- =========================================================
INSERT INTO equipment_usage (equipment_id, project_id, request_item_id, checked_out_at, due_at, returned_at, status) VALUES
    (1,  1, 1,  CURRENT_TIMESTAMP - INTERVAL '17 days', CURRENT_TIMESTAMP + INTERVAL '13 days', NULL,                                    'checked_out'),
    (10, 1, 2,  CURRENT_TIMESTAMP - INTERVAL '17 days', CURRENT_TIMESTAMP + INTERVAL '13 days', NULL,                                    'checked_out'),
    (6,  3, 6,  CURRENT_TIMESTAMP - INTERVAL '9 days',  CURRENT_TIMESTAMP + INTERVAL '21 days', NULL,                                    'checked_out'),
    (12, 4, 8,  CURRENT_TIMESTAMP - INTERVAL '54 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '12 days',  'returned'),
    (9,  4, 9,  CURRENT_TIMESTAMP - INTERVAL '54 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '11 days',  'returned');

-- =========================================================
-- STATUS HISTORY
-- =========================================================
INSERT INTO status_history (entity_type, entity_id, old_status, new_status, changed_by, changed_at, note) VALUES
    ('project',           1, 'pending',      'active',    4, CURRENT_TIMESTAMP - INTERVAL '20 days', 'Project approved.'),
    ('project',           3, 'pending',      'active',    4, CURRENT_TIMESTAMP - INTERVAL '15 days', 'Project approved.'),
    ('project',           4, 'pending',      'active',    4, CURRENT_TIMESTAMP - INTERVAL '60 days', 'Project approved.'),
    ('project',           4, 'active',       'completed', 4, CURRENT_TIMESTAMP - INTERVAL '5 days',  'Project completed.'),
    ('project',           5, 'pending',      'rejected',  4, CURRENT_TIMESTAMP - INTERVAL '3 days',  'Insufficient detail in proposal.'),
    ('equipment_request', 1, 'pending',      'reserved',  4, CURRENT_TIMESTAMP - INTERVAL '18 days', 'Approved by lab technician.'),
    ('equipment_request', 3, 'pending',      'reserved',  4, CURRENT_TIMESTAMP - INTERVAL '10 days', 'Approved by lab technician.'),
    ('equipment_request', 4, 'pending',      'reserved',  4, CURRENT_TIMESTAMP - INTERVAL '55 days', 'Approved.'),
    ('equipment_request', 4, 'reserved',     'fulfilled', 4, CURRENT_TIMESTAMP - INTERVAL '50 days', 'All items assigned.'),
    ('equipment_request', 5, 'pending',      'rejected',  4, CURRENT_TIMESTAMP - INTERVAL '4 days',  'Project was rejected.'),
    ('equipment_usage',   4, 'checked_out',  'returned',  4, CURRENT_TIMESTAMP - INTERVAL '12 days', 'Returned in good condition.'),
    ('equipment_usage',   5, 'checked_out',  'returned',  4, CURRENT_TIMESTAMP - INTERVAL '11 days', 'Returned in good condition.');

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, is_read, created_at) VALUES
    (1, 'New project awaiting review',   'The project "Autonomous Delivery Rover" is pending approval.',          'approval',  'project',           2,  FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (5, 'Equipment request approved',    'Your equipment request for "Smart Irrigation System" was approved.',    'approval',  'equipment_request', 1,  TRUE,  CURRENT_TIMESTAMP - INTERVAL '18 days'),
    (6, 'Equipment request submitted',   'Your request for "Autonomous Delivery Rover" was submitted.',           'info',      'equipment_request', 2,  FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (7, 'Equipment request approved',    'Your equipment request for "Air Quality Monitor" was approved.',        'approval',  'equipment_request', 3,  FALSE, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (8, 'Project completed',             'Your project "Smart Door Lock" has been marked as completed.',          'info',      'project',           4,  FALSE, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (9, 'Project rejected',              'Your project "Line Following Robot" was rejected.',                     'warning',   'project',           5,  FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    (4, 'Equipment overdue reminder',    'Please verify whether any checked out assets are approaching due date.','reminder',  'equipment_usage',   1,  FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (1, 'New project awaiting review',   'The project "Line Following Robot" was submitted for approval.',        'approval',  'project',           5,  TRUE,  CURRENT_TIMESTAMP - INTERVAL '5 days');