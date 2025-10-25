# Scripts Directory

## Import Candidates Script

### Files:
- `import_candidates_full.py` - Main import script for candidates data
- `electoral_districts.json` - Electoral districts data extracted from Excel files

### Requirements:
```bash
pip install supabase python-slugify pandas openpyxl
```

### Environment Variables:
```bash
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_KEY="your_service_role_key"
```

### Usage:
```bash
cd scripts
python3 import_candidates_full.py
```

### Data Sources:
- Individual candidates: `جميعالمرشحين.xls` (2,620 candidates)
- List candidates: `جميعمرشحيالقوائم.xls` (568 candidates)
- Total: 3,188 candidates

### Features:
- ✅ Creates auth users for each candidate
- ✅ Creates user profiles
- ✅ Creates deputy profiles with electoral district linkage
- ✅ Supports both individual and list candidates
- ✅ Dry-run mode for testing

### Notes:
- Script uses temporary emails for candidates: `{slug}-{type}-{random}@temp.naebak.com`
- Temporary passwords are generated automatically
- Candidates can activate their accounts later and change credentials
- Electoral districts are automatically created and linked to governorates

