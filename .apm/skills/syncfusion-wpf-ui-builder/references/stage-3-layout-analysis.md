# Stage 3: Layout Analysis & Control Mapping

**Purpose:** Analyze user requirements, create optimal control-mapping.json, execute mapping script, and produce Syncfusion WPF control assignments. **FULLY AUTOMATED WITH MANDATORY SCRIPT EXECUTION.**

---

## ⚠️ CRITICAL: Control Skill Names vs. Official NuGet Packages

**Reference labels** in controls.csv (e.g., `syncfusion-wpf-button`, `syncfusion-wpf-datagrid`) are for BM25 semantic search ONLY - NOT official NuGet package names.

**Conversion Process (Stage 5):**
- Stage 3 generates mappings using reference labels
- Stage 5 converts reference labels → Official NuGet packages from control skill files (`.apm/skills/syncfusion-wpf-<name>/SKILL.md`)

**Examples:**
- `SfDataGrid` (control) + `syncfusion-wpf-datagrid` (skill label) → `Syncfusion.SfDataGrid.WPF` (official NuGet)
- `SfChart` (control) + `syncfusion-wpf-chart` (skill label) → `Syncfusion.SfChart.WPF` (official NuGet)
- `SfTextInputLayout` (control) + `syncfusion-wpf-textinputlayout` (skill label) → `Syncfusion.SfInput.WPF` (official NuGet)

**MANDATORY:** Verify each NuGet package in control skill files or official Syncfusion docs before use.

---

## Stage 3 Workflow

### AI Actions

1. **Read Control Type** from Stage 1 intent analysis
2. **Analyze user query** for specific requirements
3. **Determine optimal layout variant** (no user choice needed)
4. **Create structured `control-mapping.json`** with elements (save to project root - MANDATORY)
5. **Execute controls_search.cjs script** to map elements to Syncfusion WPF controls (REQUIRED)
6. **Output results** in chat for Stage 4 theming + Stage 5 code generation

### Decision Framework

AI selects the **best** layout based on context and best practices (not multiple options):

| Control Type | Decision Criteria | Best Variant |
|---|---|---|
| **Login Window** | Enterprise? 2FA needed? Social auth? | Minimal/Standard/Advanced |
| **Data Grid** | Read-only or editable? Sorting/filtering? | Simple/Interactive/Full-featured |
| **Dashboard** | Internal or customer-facing? Complexity? | Focused/Standard/Enterprise |
| **Navigation** | Multi-level menu? Docking support? | Simple/Sidebar/Progressive |
| **Form** | Single-step or multi-step? Validation level? | Basic/Standard/Advanced |

---

## Output: Structured control-mapping.json

**Location:** `<project-root>/control-mapping.json` (NOT in scripts folder)

**Simple Layout Example:**
```json
{
  "control_type": "Login Window",
  "variant": "Standard",
  "elements": [
    {
      "id": "email_input",
      "name": "Email Address",
      "description": "Email TextBox with validation",
      "type_hint": "textbox email form validation"
    },
    {
      "id": "password_input",
      "name": "Password",
      "description": "PasswordBox field, masked",
      "type_hint": "passwordbox password form masked"
    },
    {
      "id": "remember_me",
      "name": "Remember Me",
      "description": "Keep me logged in",
      "type_hint": "checkbox form input"
    },
    {
      "id": "submit_button",
      "name": "Submit",
      "description": "Login button",
      "type_hint": "button primary action submit cta"
    }
  ]
}
```

**JSON Structure:**
- `control_type`: WPF control being built (e.g., "Login Window", "Data Grid", "Dashboard")
- `variant`: Chosen variant based on requirements (e.g., "Standard", "Advanced", "Minimal")
- `sections` (optional): For complex layouts, group elements into logical sections
  - `section_id`: Unique identifier (e.g., "header_section")
  - `section_name`: Display name (e.g., "Header")
  - `responsive`: Layout behavior (fixed/collapsible/flexible)
  - `elements`: Array of elements within section
- `elements`: Array of control elements
  - `id`: Unique identifier (snake_case)
  - `name`: Display name for UI
  - `description`: What this element does
  - `type_hint`: UI element type for BM25 search (e.g., "text input", "button", "dropdown", "table", "chart")

**MANDATORY ACTIONS:**
- ✅ Save JSON as `control-mapping.json` in project root
- ✅ `type_hint` is CRITICAL for BM25 search accuracy
- ✅ Run controls_search.cjs script after creating JSON
- ✅ Keep descriptions concise
- ✅ Use lowercase for `id` and `type_hint`

---

## Complex Layouts (Multi-Section Example)

```json
{
  "control_type": "Admin Dashboard",
  "variant": "Classic Admin Dashboard",
  "layout_grid": "2-column",
  "sections": [
    {
      "section_id": "titlebar",
      "section_name": "Title Bar",
      "description": "Fixed window title bar",
      "responsive": "fixed",
      "elements": [
        {
          "id": "logo",
          "name": "Company Logo",
          "description": "Brand logo in title bar",
          "type_hint": "image logo titlebar header branding"
        },
        {
          "id": "notification_bell",
          "name": "Notifications",
          "description": "Bell icon with count",
          "type_hint": "button icon notification titlebar menu"
        },
        {
          "id": "user_menu",
          "name": "User Profile",
          "description": "User avatar dropdown",
          "type_hint": "combobox button menu user profile titlebar"
        }
      ]
    },
    {
      "section_id": "sidebar",
      "section_name": "Sidebar",
      "description": "Left navigation panel",
      "responsive": "collapsible",
      "elements": [
        {
          "id": "nav_menu",
          "name": "Navigation Menu",
          "description": "Main navigation TreeView",
          "type_hint": "treeview navigation collapsible"
        }
      ]
    },
    {
      "section_id": "main_content",
      "section_name": "Main Content",
      "responsive": "flexible",
      "elements": [
        {
          "id": "kpi_cards",
          "name": "KPI Cards",
          "description": "Metric cards displaying statistics",
          "type_hint": "stackpanel grid statistics dashboard metrics kpi"
        },
        {
          "id": "data_grid",
          "name": "Users Grid",
          "description": "SfDataGrid with sorting and filtering",
          "type_hint": "sfdatagrid grid table sortable filterable paging"
        }
      ]
    }
  ]
}
```

---

## Type Hint Best Practices

**For Title Bar / Menu Elements:**
- Always include `titlebar` or `menu` keyword in type_hint
- Examples:
  - Logo: `"image logo titlebar header branding"`
  - Notifications: `"button icon notification titlebar menu"`
  - User Menu: `"combobox button menu user profile titlebar"`

**General Guidelines:**
- Use **compound keywords**: `"button icon notification"` scores better than `"notification"`
- Include **context keywords**: titlebar/menu/sidebar improves matching
- Add **modifiers**: sortable, filterable, collapsible, paginated
- Use **exact WPF control keywords** from controls.csv for best BM25 matching

**BM25 Scoring Guide:**
- **40+** = Excellent match (multiple keywords + context)
- **20-40** = Good match (several keywords)
- **<20** = Weak match (fallback to native WPF control)
- **0** = No match (unrelated keywords)

---

## Script Execution (MANDATORY)

### Prerequisites
- Node.js 14+ installed
- `control-mapping.json` created in project root
- Script located at: `<project-root>/.apm/skills/syncfusion-wpf-ui-builder/scripts/controls_search.cjs`

### Execution Command (Windows - Absolute Path REQUIRED)

```powershell
cd <project-root>\<skills-dir>\syncfusion-wpf-ui-builder\scripts
node controls_search.cjs <project-root>\control-mapping.json
```

**Replace placeholders:**
- `<project-root>` = WPF project directory (e.g., `d:\MyWpfApp`)
- `<skills-dir>` = Skills directory name (`.codestudio\skills`, `.agent\skills`, `.agents\skills`, `.github\skills`, or `skills`)

### Real Examples

```powershell
# With .codestudio skills directory
cd d:\MyWpfApp\.codestudio\skills\syncfusion-wpf-ui-builder\scripts
node controls_search.cjs d:\MyWpfApp\control-mapping.json

# With .agents skills directory
cd d:\MyWpfApp\.agents\skills\syncfusion-wpf-ui-builder\scripts
node controls_search.cjs d:\MyWpfApp\control-mapping.json

# With visible skills directory
cd d:\MyWpfApp\skills\syncfusion-wpf-ui-builder\scripts
node controls_search.cjs d:\MyWpfApp\control-mapping.json
```

### Path Resolution

- ✅ **Absolute paths work best** - Full path from C:\ or D:\ (most reliable)
- ✅ **IDE-agnostic** - Works with ANY skills directory structure
- ✅ **Editor-independent** - Not tied to specific IDE conventions
- ✅ Script validates path exists before processing
- ❌ Avoid relative paths (can cause "file not found" errors)

### Skill File Discovery Paths

Control skill files can be located in any standard path:
- `.codestudio/skills/<skill-name>/SKILL.md`
- `.agent/skills/<skill-name>/SKILL.md`
- `.agents/skills/<skill-name>/SKILL.md`
- `.github/skills/<skill-name>/SKILL.md`
- `skills/<skill-name>/SKILL.md`

### Expected Output

Script outputs JSON with `mapped_controls` array:
- Each element mapped to Syncfusion control + BM25 score
- Unmatched elements → fallback to `NATIVE_XAML`
- **Capture output in chat context ONLY** (do NOT save to file)

### Output Handling

**Actions:**
- ✅ Script outputs control mapping JSON to terminal
- ✅ Copy output into chat context
- ✅ Reference mapping in Stage 4 (theming) & Stage 5 (code generation)
- ✅ Do NOT save script output to file (keep in conversation only)

**Why:**
- Token efficiency - only control results in chat
- Clean context for reasoning stages
- Avoid file proliferation

---

## Output: Control Mapping Results

### Example Output

```json
{
  "control_type": "Login Window",
  "variant": "Standard",
  "mapped_controls": [
    {
      "element_id": "email_input",
      "element_name": "Email Address",
      "control": "SfMaskedTextBox",
      "skill": "syncfusion-wpf-maskedtextbox",
      "score": 13.24,
      "validation": "✓ VERIFIED in controls.csv"
    },
    {
      "element_id": "password_input",
      "element_name": "Password",
      "control": "PasswordBox",
      "skill": "syncfusion-wpf-passwordbox",
      "score": 12.87,
      "validation": "✓ VERIFIED in controls.csv"
    },
    {
      "element_id": "remember_me",
      "element_name": "Remember Me",
      "control": "SfCheckBox",
      "skill": "syncfusion-wpf-checkbox",
      "score": 11.45,
      "validation": "✓ VERIFIED in controls.csv"
    },
    {
      "element_id": "submit_button",
      "element_name": "Submit",
      "control": "ButtonAdv",
      "skill": "syncfusion-wpf-button",
      "score": 10.89,
      "validation": "✓ VERIFIED in controls.csv"
    }
  ]
}
```

### Output Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `element_id` | string | Unique identifier (snake_case) |
| `element_name` | string | Display name |
| `control` | string | **Official Syncfusion WPF control name from controls.csv** (e.g., SfMaskedTextBox, ButtonAdv, SfDataGrid) - used in XAML |
| `skill` | string | Skill reference label (e.g., `syncfusion-wpf-datagrid`) - used for NuGet lookup |
| `score` | number | BM25 relevance score (40+ = excellent) |
| `validation` | string | "✓ VERIFIED in controls.csv" or "✗ NOT FOUND in controls.csv" |

### Critical: `control` vs `skill`

- ✅ `control`: **Official Syncfusion WPF control name** (e.g., `SfMaskedTextBox`, `SfDataGrid`) - used directly in XAML
- ✅ `skill`: **Reference label** (e.g., `syncfusion-wpf-maskedtextbox`) - used to find official NuGet packages
- ⚠️ **These are DIFFERENT values** - `control` is for XAML, `skill` is for NuGet lookup in Stage 5
- ✅ Stage 5 converts: `syncfusion-wpf-maskedtextbox` → `Syncfusion.SfInput.WPF`

**Conversion Examples:**
- `control: SfMaskedTextBox` + `skill: syncfusion-wpf-maskedtextbox` → NuGet: `Syncfusion.SfInput.WPF`
- `control: SfDataGrid` + `skill: syncfusion-wpf-datagrid` → NuGet: `Syncfusion.SfDataGrid.WPF`
- `control: ButtonAdv` + `skill: syncfusion-wpf-button` → NuGet: `Syncfusion.Shared.WPF`

---

## BM25 Search Algorithm

The controlMapper uses **BM25 (Best Matching 25)** for semantic relevance:

1. **Tokenizes** type_hint and control keywords
2. **Calculates** term frequency (TF) in each control
3. **Calculates** inverse document frequency (IDF) across all controls
4. **Applies** BM25 formula for semantic ranking
5. **Returns** ranked results with scores

**Quality:** Only controls with score > 0 are matched; unmatched → NATIVE_XAML

---

## Workflow Benefits

| Aspect | Benefit |
|--------|---------|
| **Automation** | Single script run maps all controls instantly |
| **Accuracy** | BM25 algorithm ranks best Syncfusion control per element |
| **Persistence** | `control-mapping.json` stays in project (version control + auditing) |
| **Token Efficiency** | Filesystem I/O avoids re-passing JSON to chat |
| **Scriptability** | Node.js script is IDE-agnostic and platform-independent |
| **Reusability** | Mapping can be re-run if requirements change |

---

## Architecture

- **Input**: User requirements + control type from Stage 1
- **Processing**: 
  - Control analysis → JSON structure with `type_hint`
  - BM25 semantic search on 100+ Syncfusion WPF controls
- **Output**: 
  - `control-mapping.json` (project root) - layout structure for Stage 4 & 5
  - Chat summary - element count, controls mapped
- **Data Sources**: 
  - `scripts/controls.csv` (Syncfusion WPF controls)
  - `scripts/controls_search.cjs` (BM25 mapper - Node.js)
- **Artifacts**: `control-mapping.json` (persistent, reused by Stage 5)
- **Context**: Control mapping results in conversation only (no file)

---

## Stage 3-5 Workflow Summary

| Stage | Task | Input | Output | Artifact |
|-------|------|-------|--------|----------|
| **Stage 3** | Analyze requirements, create control-mapping.json | User requirements + control type | `control-mapping.json` with element structure | ✅ `control-mapping.json` |
| **Stage 4** | Map elements to Syncfusion WPF controls (script-based) | `control-mapping.json` | Control mapping results with BM25 scores | Context only (no file) |
| **Stage 5** | Generate code with controls | `control-mapping.json` + control mapping from context | WPF `.xaml` + `.xaml.cs` with styling | ✅ Control files |

---

## Status

✅ **FULLY AUTOMATED** - No user interaction needed
✅ **Single pass** - `control-mapping.json` created once, controls mapped immediately
✅ **Token efficient** - No duplication or variant selection overhead
✅ **Data-driven** - BM25 semantic search on 100+ Syncfusion WPF controls
✅ **Ready for Stage 4-5** - Control mapping feeds directly to subsequent stages
