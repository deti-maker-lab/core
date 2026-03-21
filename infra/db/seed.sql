-- =========================================================
-- DETI Maker Lab - seed.sql
-- Sample test data for PostgreSQL
-- =========================================================

-- =========================================================
-- USERS
-- =========================================================
INSERT INTO users (name, email, role, nmec)
VALUES
    ('System Admin', 'admin@makerlab.pt', 'admin', '00001'),
    ('Prof. Maria Silva', 'maria.silva@ua.pt', 'supervisor', '10001'),
    ('Joao Santos', 'joao.santos@ua.pt', 'student', '12001'),
    ('Ana Costa', 'ana.costa@ua.pt', 'student', '12002'),
    ('Miguel Ferreira', 'miguel.ferreira@ua.pt', 'student', '12003'),
    ('Lab Technician', 'lab.tech@makerlab.pt', 'lab_technician', '90001');

-- =========================================================
-- PROJECTS
-- =========================================================
INSERT INTO projects (
    name,
    description,
    course,
    academic_year,
    group_number,
    created_by,
    supervisor_id,
    status,
    tags,
    links,
    approved_at
)
VALUES
    (
        'Smart Irrigation System',
        'IoT-based irrigation system for monitoring soil humidity and automating water usage.',
        'Project in Informatics Engineering',
        '2025/2026',
        3,
        3,
        2,
        'active',
        'iot,arduino,sensors',
        'https://github.com/example/smart-irrigation',
        CURRENT_TIMESTAMP - INTERVAL '20 days'
    ),
    (
        'Autonomous Delivery Rover',
        'Prototype of a small autonomous rover for indoor material delivery.',
        'Embedded Systems Project',
        '2025/2026',
        5,
        4,
        2,
        'pending',
        'robotics,raspberry-pi,navigation',
        'https://github.com/example/delivery-rover',
        NULL
    );

-- =========================================================
-- PROJECT MEMBERS
-- =========================================================
INSERT INTO project_members (project_id, user_id, role)
VALUES
    (1, 3, 'leader'),
    (1, 4, 'member'),
    (1, 5, 'member'),
    (1, 2, 'supervisor'),
    (2, 4, 'leader'),
    (2, 5, 'member'),
    (2, 2, 'supervisor');

-- =========================================================
-- EQUIPMENT MODELS
-- =========================================================
INSERT INTO equipment_models (
    name,
    family,
    sub_family,
    reference_code,
    supplier,
    price,
    snipeit_model_id,
    last_synced_at
)
VALUES
    (
        'Arduino Uno R3',
        'Microcontroller',
        'Arduino Board',
        'ARD-UNO-R3',
        'Arduino Store',
        25.00,
        101,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'Raspberry Pi 4 Model B 4GB',
        'Single-board Computer',
        'Raspberry Pi',
        'RPI4-4GB',
        'Raspberry Pi Store',
        75.00,
        102,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'Ultrasonic Sensor HC-SR04',
        'Sensor',
        'Distance Sensor',
        'HC-SR04',
        'Electronics Supplier',
        5.50,
        103,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'Soil Moisture Sensor v2',
        'Sensor',
        'Moisture Sensor',
        'SMS-V2',
        'Electronics Supplier',
        7.20,
        104,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

-- =========================================================
-- EQUIPMENT
-- =========================================================
INSERT INTO equipment (
    model_id,
    snipeit_asset_id,
    location,
    status,
    condition,
    last_synced_at
)
VALUES
    (1, 1001, 'Maker Lab Shelf A1', 'checked_out', 'good', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (1, 1002, 'Maker Lab Shelf A1', 'available', 'good', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (2, 1003, 'Maker Lab Shelf B2', 'available', 'new', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (2, 1004, 'Maker Lab Shelf B2', 'checked_out', 'good', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (3, 1005, 'Maker Lab Drawer C1', 'available', 'good', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (3, 1006, 'Maker Lab Drawer C1', 'checked_out', 'good', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (4, 1007, 'Maker Lab Drawer C2', 'checked_out', 'new', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (4, 1008, 'Maker Lab Drawer C2', 'available', 'good', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- =========================================================
-- EQUIPMENT REQUEST
-- =========================================================
INSERT INTO equipment_request (
    project_id,
    requested_by,
    status,
    rejection_reason,
    approved_at,
    created_at
)
VALUES
    (
        1,
        3,
        'approved',
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        CURRENT_TIMESTAMP - INTERVAL '12 days'
    ),
    (
        2,
        4,
        'pending',
        NULL,
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        1,
        4,
        'fulfilled',
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP - INTERVAL '32 days'
    );

-- =========================================================
-- EQUIPMENT REQUEST ITEMS
-- =========================================================
INSERT INTO equipment_request_items (request_id, model_id, quantity)
VALUES
    (1, 1, 1),  -- Arduino for project 1
    (1, 4, 1),  -- Soil moisture sensor for project 1
    (2, 2, 1),  -- Raspberry Pi for project 2
    (2, 3, 2),  -- Ultrasonic sensors for project 2
    (3, 3, 1);  -- Previous fulfilled request item

-- =========================================================
-- EQUIPMENT USAGE
-- =========================================================
INSERT INTO equipment_usage (
    equipment_id,
    project_id,
    request_item_id,
    checked_out_at,
    due_at,
    returned_at,
    status
)
VALUES
    (
        1,
        1,
        1,
        CURRENT_TIMESTAMP - INTERVAL '9 days',
        CURRENT_TIMESTAMP + INTERVAL '21 days',
        NULL,
        'checked_out'
    ),
    (
        7,
        1,
        2,
        CURRENT_TIMESTAMP - INTERVAL '9 days',
        CURRENT_TIMESTAMP + INTERVAL '21 days',
        NULL,
        'checked_out'
    ),
    (
        6,
        1,
        5,
        CURRENT_TIMESTAMP - INTERVAL '28 days',
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        CURRENT_TIMESTAMP - INTERVAL '8 days',
        'returned'
    );

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