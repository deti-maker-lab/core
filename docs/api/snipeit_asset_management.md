# Snipe-IT Asset Management API

This document details the REST endpoints implemented in the DETI Maker Lab backend to manage the Snipe-IT inventory integration, equipment caching, and the asset requisition workflow.

## Overview

The integration uses a unidirectional authority model:
1. **Snipe-IT** is the source of truth for **Models** and **Physical Assets**.
2. **Maker Lab API** is the source of truth for **Projects**, **Requisitions**, and **Assignments**.

## 1. Equipment & Catalog Endpoints

These endpoints manage equipment capabilities, fetching available hardware scopes, and synchronizing core asset data locally. All paths are prefixed with `/api/equipment`.

### `GET /api/equipment/catalog`
- **Purpose**: Returns the natively cached catalog of `EquipmentModel`s. 
- **Use Case**: Used by the frontend UI to populate dropdowns and lists for students when they wish to create a requisition.
- **Workflow**: Reads directly from the local Postgres database. It does not hit the Snipe-IT API.

### `POST /api/equipment/catalog/sync`
- **Purpose**: Triggers a deep sync from Snipe-IT.
- **Use Case**: Used by administrators to update the Maker Lab system when new model types (e.g., "Raspberry Pi 5") are brought into Snipe-IT.
- **Workflow**: Queries Snipe-IT's `/api/v1/models`, fetches the latest shapes, and upserts them into the local `EquipmentModel` table. Updates native `last_synced_at` stamps.

### `GET /api/equipment/{equipment_id}`
- **Purpose**: Fetches instantaneous details of a locally tracked physical `Equipment` asset.
- **Use Case**: Used when displaying Project Dashboards to show exactly which physical device (Name, Asset Tag, Serial, Status) is currently assigned.
- **Workflow**: Reads directly from the local DB. *Note: `{equipment_id}` refers to the Maker Lab DB ID, not the Snipe-IT Asset ID. Physical asset instances only exist locally once they are assigned.*

### `POST /api/equipment/{equipment_id}/refresh`
- **Purpose**: Forces a real-time pull of an individual `Equipment` instance from Snipe-IT to the local cache.
- **Use Case**: Used when a lab technician suspects the Snipe-IT tags, names, or condition statuses might have drifted from the local cache.
- **Workflow**: Given a local `equipment_id`, the system references its underlying `snipeit_asset_id`, hits the Snipe-IT detail endpoint, updates local columns (`asset_tag`, `name`, `serial`, `status`), and returns the fresh profile.

---

## 2. Requisition Endpoints

These endpoints handle the lifecycle workflows. From a student requesting gear to a technician physically assigning available components. Mounted without prefix at `/api`.

### `POST /api/projects/{project_id}/requisitions`
- **Purpose**: A student or supervisor signals an intent to borrow equipment for a project.
- **Payload**: Requires target `model_id` (from the catalog) and the requested `quantity`.
- **Workflow**: Creates an `EquipmentRequest` with status `pending`. Emits a `StatusHistory` breadcrumb. No physical assets are touched yet.

### `POST /api/requisitions/{req_id}/approve`
- **Purpose**: Admin action to grant permission for a generic request.
- **Workflow**: Transitions `EquipmentRequest` status from `pending` to `approved`.

### `POST /api/requisitions/{req_id}/reject`
- **Purpose**: Admin action to decline a request.
- **Payload**: Requires a `reason` text block.
- **Workflow**: Transitions `EquipmentRequest` to `rejected`, stores the reason.

### `POST /api/requisitions/{req_id}/assign`
- **Purpose**: Physical assignment of a specific Snipe-IT asset to satisfy a project's requested capacity.
- **Payload**: A list of correlations `[{"req_item_id": 12, "snipeit_asset_id": 45}]`.
- **Workflow**: 
  1. Validates the physical Snipe-IT asset exists.
  2. Resolves the requesting user's email against a matched Snipe-IT User Profile.
  3. Checks out the physical asset instantaneously via the Snipe-IT API to the Snipe-IT User limit liability strictly.
  4. Creates or updates the local `Equipment` record (with tag, name, and serial fields deeply cached directly from Snipe-IT).
  5. Links local relations via a new `EquipmentUsage` assignment tracking record.

### `POST /api/requisitions/return`
- **Purpose**: Finalize the lifecycle when gear is returned to the physical lab window.
- **Payload**: A list of local `usage_ids` and an optional check-in `note`.
- **Workflow**: 
  1. Locates the `EquipmentUsage` mapping and correlates its underlying Snipe-IT IDs.
  2. Commits a `/checkin` action to the Snipe-IT API, releasing the asset.
  3. Fires a local `sync_equipment()` command automatically to ingest Snipe-IT's `available` states globally.
  4. Updates the local DB usage status to `returned` ensuring historical traces are frozen gracefully.
