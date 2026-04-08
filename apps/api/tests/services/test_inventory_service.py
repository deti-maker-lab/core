# apps/api/tests/services/test_inventory_service.py

import pytest
from unittest.mock import patch
from sqlmodel import Session, create_engine, SQLModel
from datetime import datetime

from db.models import EquipmentModel, Equipment
from services.inventory_service import sync_equipment
from services.snipeit.mappers import SnipeITAsset, SnipeITRef

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@patch('services.inventory_service.get_asset')
def test_sync_equipment(mock_get_asset, session: Session):
    # Setup mock local DB
    model = EquipmentModel(name="Test Model", snipeit_model_id=1)
    session.add(model)
    session.flush()
    
    equip = Equipment(model_id=model.id, snipeit_asset_id=123, status="reserved")
    session.add(equip)
    session.commit()
    
    # Setup mock remote SnipeIT payload
    mock_get_asset.return_value = SnipeITAsset(
        id=123,
        name="MacBook Pro",
        asset_tag="A-0001",
        serial="SN-12345",
        status_label=SnipeITRef(id=5, name="Deployable")
    )
    
    # Act
    updated_equip = sync_equipment(session, equip.id)
    
    # Assert
    assert updated_equip.name == "MacBook Pro"
    assert updated_equip.asset_tag == "A-0001"
    assert updated_equip.serial == "SN-12345"
    assert updated_equip.status == "deployable"
