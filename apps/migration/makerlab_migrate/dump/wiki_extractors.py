# apps/migration/makerlab_migrate/dump/wiki_extractors.py

import re
import xml.etree.ElementTree as ET
from typing import Optional, List, Dict, Any
from decimal import Decimal
from .models import LegacyProjectMember


def parse_project_xml(content: str) -> Dict[str, Any]:
    """Parse project XML content to extract owner, members, and metadata."""
    result = {
        "owner_id": None,
        "members": [],
        "description": None,
        "course": None,
        "academic_year": None,
        "group_number": None
    }
    
    try:
        # Wrap content in a root element if not already wrapped
        if not content.strip().startswith("<"):
            # Content might be plain text or partial XML
            result["description"] = content[:500]  # Take first 500 chars as description
            return result
        
        # Try to parse as XML
        root = ET.fromstring(f"<root>{content}</root>")
        
        # Extract owner
        owner_elem = root.find(".//owner")
        if owner_elem is not None and owner_elem.text:
            try:
                result["owner_id"] = int(owner_elem.text.strip())
            except ValueError:
                pass
        
        # Extract members
        for member_elem in root.findall(".//member"):
            if member_elem.text:
                try:
                    member_id = int(member_elem.text.strip())
                    result["members"].append(
                        LegacyProjectMember(legacy_user_id=member_id, role="member")
                    )
                except ValueError:
                    pass
        
        # Extract mentors
        for mentor_elem in root.findall(".//mentor"):
            if mentor_elem.text:
                try:
                    mentor_id = int(mentor_elem.text.strip())
                    result["members"].append(
                        LegacyProjectMember(legacy_user_id=mentor_id, role="advisor")
                    )
                except ValueError:
                    pass
        
        # Extract description from <content> element
        content_elem = root.find(".//content")
        if content_elem is not None and content_elem.text:
            # Strip markdown, keep plain text
            desc = re.sub(r'[#*`\[\]]', '', content_elem.text)
            result["description"] = desc[:500]
        
        # Extract course
        course_elem = root.find(".//course")
        if course_elem is not None and course_elem.text:
            result["course"] = course_elem.text.strip()
        
        # Extract academic year
        year_elem = root.find(".//academic_year")
        if year_elem is not None and year_elem.text:
            result["academic_year"] = year_elem.text.strip()
        
        # Extract group number
        group_elem = root.find(".//group_number")
        if group_elem is not None and group_elem.text:
            try:
                result["group_number"] = int(group_elem.text.strip())
            except ValueError:
                pass
        
    except ET.ParseError:
        # If XML parsing fails, treat as plain text
        result["description"] = content[:500]
    
    return result


def parse_equipment_markdown(content: str) -> Dict[str, Any]:
    """Parse equipment markdown-like content to extract fields."""
    result = {
        "family": None,
        "sub_family": None,
        "codigo": None,
        "price": None,
        "supplier": None,
        "location": None,
        "quantity": None
    }
    
    # Regex patterns for equipment fields
    # Use non-greedy match with lookahead for end of value (newline or next field)
    patterns = {
        "family": r"\*\*\s*Família:\s*\*\*\s*(.+?)(?=\r?\n|\*\*|$)",
        "sub_family": r"\*\*\s*Sub-Família:\s*\*\*\s*(.+?)(?=\r?\n|\*\*|$)",
        "codigo": r"\*\*\s*Código:\s*\*\*\s*(.+?)(?=\r?\n|\*\*|$)",
        "price": r"\*\*\s*Preço\s*\(c/\s*IVA\):\s*\*\*\s*([\d.,]+)",
        "supplier": r"\*\*\s*Fornecedor:\s*\*\*\s*(.+?)(?=\r?\n|\*\*|$)",
        "location": r"\*\*\s*Localização:\s*\*\*\s*(.+?)(?=\r?\n|\*\*|$)",
    }
    
    for field, pattern in patterns.items():
        match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            if value:
                if field == "price":
                    # Parse price: remove € symbol, replace comma with dot, convert to Decimal
                    value = value.replace("€", "").replace(",", ".").strip()
                    try:
                        result[field] = Decimal(value)
                    except:
                        pass
                elif field == "location":
                    # Clean location: take only first line, remove wiki markup, truncate to 150 chars
                    # Remove common wiki markup patterns
                    value = re.sub(r'\r?\n#.*$', '', value, flags=re.MULTILINE)  # Remove headers
                    value = re.sub(r'\[image:.*?\]', '', value)  # Remove image tags
                    value = re.sub(r'</?[a-z]+>', '', value)  # Remove XML/HTML tags
                    value = re.sub(r'<type>.*</type>', '', value)  # Remove type tags
                    value = re.sub(r'<quantity>.*</quantity>', '', value)  # Remove quantity tags
                    value = re.sub(r'<active_requisitions>.*</active_requisitions>', '', value)  # Remove requisition tags
                    value = re.sub(r'<requisitions />', '', value)  # Remove requisition tags
                    value = re.sub(r'</wiki>', '', value)  # Remove wiki closing tag
                    value = value.strip()
                    # Truncate to 140 chars (safety margin for VARCHAR(150))
                    if len(value) > 140:
                        value = value[:140]
                    result[field] = value
                else:
                    result[field] = value
    
    # Try to extract quantity from various patterns
    quantity_patterns = [
        r"\*\*\s*Quantidade:\s*\*\*\s*(\d+)",
        r"Quantidade:\s*(\d+)",
        r"Qty:\s*(\d+)",
    ]
    for pattern in quantity_patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            try:
                result["quantity"] = int(match.group(1))
                break
            except ValueError:
                pass
    
    return result


def normalize_codigo(codigo: str) -> str:
    """Normalize código by removing spaces and special characters."""
    if not codigo:
        return ""
    # First remove literal \r\n sequences (common in markdown)
    normalized = codigo.replace('\\r\\n', '').replace('\\n', '').replace('\\r', '')
    # Then remove whitespace, hyphens, and underscores
    normalized = re.sub(r'[\s\-_]', '', normalized.strip())
    return normalized.upper()


def extract_nmec_from_username(username: str) -> Optional[str]:
    """Extract nmec (student number) from username if present.

    Common patterns:
    - a12345@...
    - up12345@...
    - ist12345@...
    - nmec12345@...
    """
    if not username:
        return None

    # Try to extract numeric part from username (before @)
    if "@" in username:
        username = username.split("@")[0]

    # Pattern: letters followed by digits (e.g., a12345, up12345, ist12345)
    match = re.match(r'^[a-zA-Z]*(\d+)$', username)
    if match:
        return match.group(1)

    # Pattern: nmec prefix (e.g., nmec12345)
    match = re.match(r'^nmec(\d+)$', username, re.IGNORECASE)
    if match:
        return match.group(1)

    # Pattern: any sequence of 5-10 digits
    match = re.match(r'^.*?(\d{5,10})$', username)
    if match:
        return match.group(1)

    return None
