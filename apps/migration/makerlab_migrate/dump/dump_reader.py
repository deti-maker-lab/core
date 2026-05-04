# apps/migration/makerlab_migrate/dump/dump_reader.py

import re
from pathlib import Path
from typing import List, Optional, Iterator
from datetime import datetime
from .models import LegacyUser, LegacyProject, LegacyEquipment, LegacyData
from .wiki_extractors import parse_project_xml, parse_equipment_markdown


class DumpReader:
    """Reads and parses PostgreSQL dump files."""
    
    def __init__(self, dump_path: Path):
        self.dump_path = dump_path
        self._raw_content: Optional[str] = None
    
    def _load_dump(self) -> str:
        """Load the entire dump file into memory."""
        if self._raw_content is None:
            self._raw_content = self.dump_path.read_text(encoding="utf-8")
        return self._raw_content
    
    def _extract_copy_block(self, table_name: str) -> List[List[str]]:
        """Extract COPY block for a specific table from the dump."""
        content = self._load_dump()
        
        # Pattern to match COPY statements
        # COPY table_name (col1, col2, ...) FROM stdin;
        # data rows
        # \.
        pattern = rf"COPY {table_name} \([^)]+\) FROM stdin;\n(.*?)\n\\\."
        match = re.search(pattern, content, re.DOTALL)
        
        if not match:
            return []
        
        data_section = match.group(1)
        rows = []
        
        for line in data_section.split("\n"):
            if line.strip():
                # Split by tab (PostgreSQL COPY format)
                rows.append(line.split("\t"))
        
        return rows
    
    def _parse_bool(self, val: str) -> bool:
        """Parse boolean from string."""
        return val.lower() in ("t", "true", "1", "yes")
    
    def _parse_datetime(self, val: str) -> Optional[datetime]:
        """Parse datetime from string."""
        if not val or val == "\\N":
            return None
        try:
            return datetime.fromisoformat(val)
        except (ValueError, TypeError):
            return None
    
    def _extract_article_type(self, content: str) -> Optional[str]:
        """Extract article type from XML content."""
        if not content:
            return None
        # Look for <type>equipment</type> or <type>project</type> in the content
        # Handle whitespace variations: <type> project </type>, <type>equipment</type>, etc.
        type_match = re.search(r'<type>\s*([^<]+?)\s*</type>', content)
        if type_match:
            return type_match.group(1).strip()
        return None
    
    def load_users(self, limit: Optional[int] = None, since_id: Optional[int] = None) -> List[LegacyUser]:
        """Load users from auth_user table."""
        rows = self._extract_copy_block("auth_user")
        users = []
        
        for row in rows:
            try:
                # Expected columns: id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined
                user_id = int(row[0])
                
                if since_id is not None and user_id < since_id:
                    continue
                
                user = LegacyUser(
                    id=user_id,
                    username=row[4],  # username is at index 4
                    first_name=row[5],  # first_name is at index 5
                    last_name=row[6],  # last_name is at index 6
                    email=row[7] if row[7] != "\\N" else None,  # email is at index 7
                    is_staff=self._parse_bool(row[8]),  # is_staff is at index 8
                    is_superuser=self._parse_bool(row[3]),  # is_superuser is at index 3
                    date_joined=self._parse_datetime(row[10])  # date_joined is at index 10
                )
                users.append(user)
                
                if limit is not None and len(users) >= limit:
                    break
                    
            except (IndexError, ValueError):
                continue  # Skip malformed rows
        
        return users
    
    def load_projects(self, limit: Optional[int] = None, since_id: Optional[int] = None) -> List[LegacyProject]:
        """Load projects from wiki_article and wiki_articlerevision tables."""
        # Get all articles and revisions
        article_rows = self._extract_copy_block("wiki_article")
        revision_rows = self._extract_copy_block("wiki_articlerevision")
        
        # Build article lookup map
        article_map = {int(row[0]): row[1] for row in article_rows}  # article_id -> title
        
        # Build map of article_id -> latest revision
        latest_revisions: dict[int, dict] = {}
        for row in revision_rows:
            try:
                rev_id = int(row[0])
                article_id = int(row[11])  # article_id is at index 11
                content = row[9] if len(row) > 9 else ""  # content is at index 9
                created = self._parse_datetime(row[6]) if len(row) > 6 else None  # created is at index 6
                title = row[10] if len(row) > 10 else ""  # title is at index 10
                
                if since_id is not None and article_id < since_id:
                    continue
                
                # Keep only the latest revision per article
                if article_id not in latest_revisions or (created and created > latest_revisions[article_id].get("created", datetime.min)):
                    latest_revisions[article_id] = {
                        "content": content,
                        "created": created,
                        "title": title
                    }
            except (IndexError, ValueError):
                continue  # Skip malformed rows
        
        # Process only latest revisions to find projects
        projects = []
        for article_id, revision in latest_revisions.items():
            try:
                content = revision.get("content", "")
                created = revision.get("created")
                title = revision.get("title", "")
                
                # Extract article type from content
                article_type = self._extract_article_type(content)
                
                if article_type != "project":
                    continue
                
                # Parse XML content
                try:
                    parsed = parse_project_xml(content)
                except Exception:
                    continue  # Skip malformed XML
                
                # Use title from revision if available, otherwise from article map
                project_title = title or article_map.get(article_id, f"Article {article_id}")
                
                project = LegacyProject(
                    id=article_id,
                    title=project_title,
                    content=content,
                    created_at=created,
                    updated_at=created,
                    owner_legacy_user_id=parsed.get("owner_id"),
                    members=parsed.get("members", []),
                    description=parsed.get("description"),
                    course=parsed.get("course"),
                    academic_year=parsed.get("academic_year"),
                    group_number=parsed.get("group_number")
                )
                projects.append(project)
                
                if limit is not None and len(projects) >= limit:
                    break
                    
            except (IndexError, ValueError):
                continue  # Skip malformed rows
        
        return projects
    
    def load_equipment(self, limit: Optional[int] = None, since_id: Optional[int] = None) -> List[LegacyEquipment]:
        """Load equipment from wiki_article and wiki_articlerevision tables."""
        # Get all articles and revisions
        article_rows = self._extract_copy_block("wiki_article")
        revision_rows = self._extract_copy_block("wiki_articlerevision")
        
        # Build article lookup map
        article_map = {int(row[0]): row[1] for row in article_rows}  # article_id -> title
        
        # Build map of article_id -> latest revision
        latest_revisions: dict[int, dict] = {}
        for row in revision_rows:
            try:
                rev_id = int(row[0])
                article_id = int(row[11])  # article_id is at index 11
                content = row[9] if len(row) > 9 else ""  # content is at index 9
                created = self._parse_datetime(row[6]) if len(row) > 6 else None  # created is at index 6
                title = row[10] if len(row) > 10 else ""  # title is at index 10
                
                if since_id is not None and article_id < since_id:
                    continue
                
                # Keep only the latest revision per article
                if article_id not in latest_revisions or (created and created > latest_revisions[article_id].get("created", datetime.min)):
                    latest_revisions[article_id] = {
                        "content": content,
                        "created": created,
                        "title": title
                    }
            except (IndexError, ValueError):
                continue  # Skip malformed rows
        
        # Process only latest revisions to find equipment
        equipment_list = []
        for article_id, revision in latest_revisions.items():
            try:
                content = revision.get("content", "")
                created = revision.get("created")
                title = revision.get("title", "")
                
                # Extract article type from content
                article_type = self._extract_article_type(content)
                
                if article_type != "equipment":
                    continue
                
                # Parse markdown content
                try:
                    parsed = parse_equipment_markdown(content)
                except Exception:
                    continue  # Skip malformed content
                
                # Use title from revision if available, otherwise from article map
                equipment_title = title or article_map.get(article_id, f"Article {article_id}")
                
                equipment = LegacyEquipment(
                    article_id=article_id,
                    title=equipment_title,
                    content=content,
                    created_at=created,
                    updated_at=created,
                    family=parsed.get("family"),
                    sub_family=parsed.get("sub_family"),
                    codigo=parsed.get("codigo"),
                    price=parsed.get("price"),
                    supplier=parsed.get("supplier"),
                    location=parsed.get("location"),
                    quantity=parsed.get("quantity")
                )
                equipment_list.append(equipment)
                
                if limit is not None and len(equipment_list) >= limit:
                    break
                    
            except (IndexError, ValueError):
                continue  # Skip malformed rows
        
        return equipment_list
    
    def load_all(
        self,
        limit: Optional[int] = None,
        since_id: Optional[int] = None
    ) -> LegacyData:
        """Load all legacy data."""
        return LegacyData(
            users=self.load_users(limit, since_id),
            projects=self.load_projects(limit, since_id),
            equipment=self.load_equipment(limit, since_id)
        )
