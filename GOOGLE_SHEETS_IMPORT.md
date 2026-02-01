# Google Sheets Import Guide

## How to Import Players from Google Sheets

### Step 1: Prepare Your Google Sheet

Create a Google Sheet with the following columns (case-insensitive):

| email                | name         | rollNumber | ign         |
| -------------------- | ------------ | ---------- | ----------- |
| john@iiitsurat.ac.in | John Doe     | 2023001    | JohnnyGamer |
| jane@iiitsurat.ac.in | Jane Smith   | 2023002    | JaneWarrior |
| mike@iiitsurat.ac.in | Mike Johnson | 2023003    | MikeTheKing |

### Required Columns:

- **email**: Student email address (required)
- **name**: Full name (required)

### Optional Columns:

- **rollNumber** (or "Roll Number" or "roll"): Student roll number
- **ign** (or "IGN" or "In-Game Name"): Gaming/participant name

### Step 2: Export as CSV

1. In Google Sheets, click **File** → **Download** → **Comma Separated Values (.csv)**
2. Save the file to your computer

### Step 3: Import to Spring Fiesta System

1. Navigate to **Admin Dashboard** → **Player Management**
2. Click the **Import CSV** button
3. Select your downloaded CSV file
4. Review the preview (first 5 rows will be shown)
5. Click **Import Players**

### Import Behavior:

- **Duplicates**: Players with existing emails will be skipped
- **Validation**: All rows must have valid email and name
- **Bulk Import**: Can import hundreds of players at once
- **Result**: You'll see a summary showing imported vs skipped players

### Alternative Column Names Supported:

The system automatically detects these variations:

- Email: `email`, `Email`, `EMAIL`
- Name: `name`, `Name`, `NAME`
- Roll Number: `rollNumber`, `Roll Number`, `roll`, `ROLL`
- IGN: `ign`, `IGN`, `In-Game Name`

### Example CSV Content:

```csv
email,name,rollNumber,ign
john@iiitsurat.ac.in,John Doe,2023001,JohnnyGamer
jane@iiitsurat.ac.in,Jane Smith,2023002,JaneWarrior
mike@iiitsurat.ac.in,Mike Johnson,2023003,MikeTheKing
```

### Tips:

- Remove any formatting or formulas before exporting
- Ensure emails are unique (no duplicates in the sheet)
- Use institutional email addresses (@iiitsurat.ac.in)
- Keep names in standard format (First Name Last Name)

### Troubleshooting:

**Import fails?**

- Check that CSV has header row with column names
- Verify all required columns (email, name) are present
- Ensure file is actual CSV format, not Excel (.xlsx)

**Some players skipped?**

- Duplicate emails are automatically skipped
- Check the import result message for details

**Need to update existing players?**

- Delete them first from Player Management
- Then re-import with updated data
- Or manually edit individual players
