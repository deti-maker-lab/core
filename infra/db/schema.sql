-- =========================================================
-- DETI Maker Lab - PostgreSQL schema
-- =========================================================

-- How to run schema?
-- psql -U makerlab_app -d makerlab -f schema.sql

-- Optional: clean start
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS status_history CASCADE;
DROP TABLE IF EXISTS equipment_usage CASCADE;
DROP TABLE IF EXISTS equipment_request_items CASCADE;
DROP TABLE IF EXISTS equipment_request CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS equipment_models CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================================================
-- USERS
-- =========================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    nmec VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_role
        CHECK (role IN ('student', 'supervisor', 'lab_technician', 'admin'))
);

-- =========================================================
-- PROJECTS
-- =========================================================
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    course VARCHAR(100),
    academic_year VARCHAR(20),
    group_number INTEGER,
    created_by BIGINT NOT NULL,
    supervisor_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    tags TEXT,
    links TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

    CONSTRAINT fk_projects_supervisor
        FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE RESTRICT,

    CONSTRAINT chk_projects_status
        CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'completed', 'archived'))
);

-- =========================================================
-- PROJECT MEMBERS
-- =========================================================
CREATE TABLE project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',

    CONSTRAINT fk_project_members_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

    CONSTRAINT fk_project_members_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT uq_project_member UNIQUE (project_id, user_id),

    CONSTRAINT chk_project_members_role
        CHECK (role IN ('leader', 'member', 'supervisor'))
);

-- =========================================================
-- EQUIPMENT MODELS
-- =========================================================
CREATE TABLE equipment_models (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    family VARCHAR(100),
    sub_family VARCHAR(100),
    reference_code VARCHAR(100),
    supplier VARCHAR(150),
    price NUMERIC(10,2),
    snipeit_model_id BIGINT UNIQUE,
    last_synced_at TIMESTAMP
);

-- =========================================================
-- EQUIPMENT
-- =========================================================
CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    model_id BIGINT NOT NULL,
    snipeit_asset_id BIGINT UNIQUE,
    location VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    condition VARCHAR(50),
    last_synced_at TIMESTAMP,

    CONSTRAINT fk_equipment_model
        FOREIGN KEY (model_id) REFERENCES equipment_models(id) ON DELETE RESTRICT,

    CONSTRAINT chk_equipment_status
        CHECK (status IN ('available', 'reserved', 'checked_out', 'maintenance', 'retired')),

    CONSTRAINT chk_equipment_condition
        CHECK (condition IN ('new', 'good', 'fair', 'damaged', 'unusable'))
);

-- =========================================================
-- EQUIPMENT REQUEST
-- =========================================================
CREATE TABLE equipment_request (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_equipment_request_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

    CONSTRAINT fk_equipment_request_user
        FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT,

    CONSTRAINT chk_equipment_request_status
        CHECK (status IN ('pending', 'approved', 'rejected', 'partially_fulfilled', 'fulfilled', 'cancelled'))
);

-- =========================================================
-- EQUIPMENT REQUEST ITEMS
-- =========================================================
CREATE TABLE equipment_request_items (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    model_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,

    CONSTRAINT fk_equipment_request_items_request
        FOREIGN KEY (request_id) REFERENCES equipment_request(id) ON DELETE CASCADE,

    CONSTRAINT fk_equipment_request_items_model
        FOREIGN KEY (model_id) REFERENCES equipment_models(id) ON DELETE RESTRICT,

    CONSTRAINT chk_equipment_request_items_quantity
        CHECK (quantity > 0)
);

-- =========================================================
-- EQUIPMENT USAGE
-- =========================================================
CREATE TABLE equipment_usage (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    request_item_id BIGINT,
    checked_out_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMP,
    returned_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'checked_out',

    CONSTRAINT fk_equipment_usage_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT,

    CONSTRAINT fk_equipment_usage_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

    CONSTRAINT fk_equipment_usage_request_item
        FOREIGN KEY (request_item_id) REFERENCES equipment_request_items(id) ON DELETE SET NULL,

    CONSTRAINT chk_equipment_usage_status
        CHECK (status IN ('checked_out', 'returned', 'overdue', 'lost')),

    CONSTRAINT chk_equipment_usage_dates
        CHECK (
            due_at IS NULL OR due_at >= checked_out_at
        )
);

-- =========================================================
-- STATUS HISTORY
-- =========================================================
CREATE TABLE status_history (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,

    CONSTRAINT fk_status_history_user
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,

    CONSTRAINT chk_status_history_entity_type
        CHECK (entity_type IN ('project', 'equipment_request', 'equipment_usage', 'equipment'))
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT chk_notifications_type
        CHECK (type IN ('info', 'warning', 'request', 'approval', 'return', 'reminder')),

    CONSTRAINT chk_notifications_reference_type
        CHECK (
            reference_type IS NULL OR
            reference_type IN ('project', 'equipment_request', 'equipment_usage', 'equipment')
        )
);

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_supervisor_id ON projects(supervisor_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

CREATE INDEX idx_equipment_model_id ON equipment(model_id);
CREATE INDEX idx_equipment_status ON equipment(status);

CREATE INDEX idx_equipment_request_project_id ON equipment_request(project_id);
CREATE INDEX idx_equipment_request_requested_by ON equipment_request(requested_by);
CREATE INDEX idx_equipment_request_status ON equipment_request(status);

CREATE INDEX idx_equipment_request_items_request_id ON equipment_request_items(request_id);
CREATE INDEX idx_equipment_request_items_model_id ON equipment_request_items(model_id);

CREATE INDEX idx_equipment_usage_equipment_id ON equipment_usage(equipment_id);
CREATE INDEX idx_equipment_usage_project_id ON equipment_usage(project_id);
CREATE INDEX idx_equipment_usage_request_item_id ON equipment_usage(request_item_id);
CREATE INDEX idx_equipment_usage_status ON equipment_usage(status);

CREATE INDEX idx_status_history_entity ON status_history(entity_type, entity_id);
CREATE INDEX idx_status_history_changed_by ON status_history(changed_by);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =========================================================
-- OPTIONAL SAMPLE DATA
-- =========================================================
-- INSERT INTO users (name, email, role, nmec)
-- VALUES
-- ('Admin User', 'admin@example.com', 'admin', '00000'),
-- ('Supervisor User', 'supervisor@example.com', 'supervisor', '11111'),
-- ('Student User', 'student@example.com', 'student', '22222');