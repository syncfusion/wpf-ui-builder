    # Stage 3: Layout Analysis & Control Mapping

**Purpose:** Analyze user requirements, create optimal control-mapping.json, execute mapping script, and produce Syncfusion WPF control assignments. **FULLY AUTOMATED WITH MANDATORY SCRIPT EXECUTION.**

---

## ⚠️ Critical: Skill Labels vs. NuGet Package Names

Reference labels in `controls.csv` (e.g., `syncfusion-wpf-datagrid`) are for BM25 search **only** — not official NuGet names.

| Control Class | Skill Label | Official NuGet |
|---|---|---|
| `SfDataGrid` | `syncfusion-wpf-datagrid` | `Syncfusion.SfDataGrid.WPF` |
| `SfTextInputLayout` | `syncfusion-wpf-textinputlayout` | `Syncfusion.SfInput.WPF` |
| `SfChart` | `syncfusion-wpf-chart` | `Syncfusion.SfChart.WPF` |
| `ButtonAdv` | `syncfusion-wpf-button` | `Syncfusion.Shared.WPF` |

Stage 3 generates skill labels. Stage 6 resolves them to official NuGet packages via control skill files (`.apm/skills/syncfusion-wpf-<name>/SKILL.md`).

---

## Workflow (Execute in Order)

### Step 1: Analyze User Requirements

- Identify & Validate All Views from Intent (MANDATORY)
- Read control type, views, and interactions from Stage 1 intent output
- List all distinct views/windows/pages (e.g., `LoginWindow`, `DashboardUserControl`)
- Document view hierarchy and navigation flow
- Identify all UI elements per view with their purpose

---

### Step 2: Pre-Mapping Completeness Checklist (MANDATORY)

Verify before creating `control-mapping.json`:

| Check | Rule |
|---|---|
| All views listed | Every view from Stage 1 intent must be named |
| No missing screens | Zero gaps between intent and mapping |
| Unique element IDs | No duplicate `id` values across all views |
| Type hints present | Every element has a descriptive `type_hint` |
| Naming consistent | Same suffix used throughout: `View`, `Window`, or `Control` |
| View definitions complete | Every view has `page_id`, `component_type`, `title`, and `elements`/`sections` |

⛔ **Do not proceed to Step 3 if any check fails.**

---

### Step 3: Classify Project Type & Create Mapping (MANDATORY)

1. **Determine Structure Type:**
   - Count distinct UI components from Stage 1
   - 1 component → `Simple` (use `elements[]` array)
   - 2+ components → `Complex` (use `pages[]` array with sections)

2. **Create `control-mapping.json` at project root (NOT in scripts folder)**
   - Add all UI elements with `type_hint` descriptions for BM25 matching
   - Preserve structure: `project_type`, `control_type`, `variant`

3. **Mandatory Fields per Element:**
   - `id` — unique identifier (lowercase, no spaces)
   - `name` — human-readable name
   - `description` — functional purpose
   - `type_hint` — space-separated keywords (e.g., "button primary action submit cta")
   - `control` — will be populated by script (leave empty initially)
   - `skill` — will be populated by script (leave empty initially)

---

### Step 4: Execute Control Mapping Script (MANDATORY)

#### Simple Layout Schema
```json
{
  "project_type": "Simple",
  "control_type": "Login Window",
  "variant": "Standard",
  "elements": [
    {
      "id": "email_input",
      "name": "Email Address",
      "description": "Email field with format validation",
      "type_hint": "textbox email form validation"
    },
    {
      "id": "password_input",
      "name": "Password",
      "description": "Masked password field",
      "type_hint": "passwordbox password form masked"
    },
    {
      "id": "remember_me",
      "name": "Remember Me",
      "description": "Keep user signed in",
      "type_hint": "checkbox form input"
    },
    {
      "id": "submit_button",
      "name": "Login",
      "description": "Submit credentials",
      "type_hint": "button primary action submit cta"
    }
  ]
}
```

#### Complex Layout Schema
```json
{
  "project_type": "Complex",
  "layout_variant": "Multi-Window Application",
  "pages": [
    {
      "page_id": "login_window",
      "component_type": "generate_window",
      "title": "Login Window",
      "elements": [
        { "id": "username_input", "name": "Username", "type_hint": "textbox account login" },
        { "id": "password_input", "name": "Password", "type_hint": "passwordbox password masked" },
        { "id": "login_button",   "name": "Login",    "type_hint": "button primary action submit" }
      ]
    },
    {
      "page_id": "admin_dashboard",
      "component_type": "generate_usercontrol",
      "title": "Admin Dashboard",
      "sections": [
        {
          "section_id": "header",
          "section_name": "Header",
          "responsive": "fixed",
          "elements": [
            { "id": "logo",      "name": "Logo",         "type_hint": "image logo titlebar header branding" },
            { "id": "user_menu", "name": "User Profile",  "type_hint": "combobox menu user profile titlebar" }
          ]
        },
        {
          "section_id": "content",
          "section_name": "Content",
          "responsive": "flexible",
          "elements": [
            { "id": "data_grid", "name": "Users Grid", "type_hint": "sfdatagrid table sortable filterable" }
          ]
        }
      ]
    }
  ]
}
```

#### `type_hint` Best Practices

- Use compound keywords: `"button icon notification"` scores better than `"notification"`
- Add context keywords: `titlebar`, `menu`, `sidebar`, `form`
- Add modifiers: `sortable`, `filterable`, `collapsible`, `paginated`
- Use lowercase for both `id` and `type_hint`

---

### Step 5: Control Substitution Strategy

Apply **only** when an exact Syncfusion match is unavailable.

| BM25 Score | Action |
|---|---|
| **> 20** | Accept — high confidence Syncfusion match |
| **10–20** | Verify control exists in official Syncfusion docs; use if confirmed |
| **< 10** | Use `NATIVE_XAML` fallback — do NOT accept a weak Syncfusion substitution |
| **0** | Use `NATIVE_XAML` with documented reason |

**Rules:**
- ✅ Map to the exact Syncfusion control class name
- ✅ Use `NATIVE_XAML` when no valid Syncfusion control exists (with `fallback_reason` + `equivalent_native`)
- ❌ Never substitute with a different Syncfusion control (e.g., do not use `SfToggleButton` in place of a missing checkbox)
- ❌ Never use native WPF controls when a valid Syncfusion control exists

**NATIVE_XAML fallback format:**
```json
{
  "element_id": "checkbox_example",
  "control": "NATIVE_XAML",
  "skill": "native-wpf-checkbox",
  "fallback_reason": "No Syncfusion checkbox control available",
  "equivalent_native": "System.Windows.Controls.CheckBox"
}
```

---

### Step 5: Execute Mapping Script (MANDATORY)

**Prerequisites:**
- Node.js 14+ installed
- `control-mapping.json` saved to project root
- `controls.csv` in scripts folder (contains control → skill mappings)
- Script: `<project-root>/.apm/skills/syncfusion-wpf-ui-builder/scripts/controls_search.cjs`

**Execution:**
```powershell
cd <project-root>\.apm\skills\syncfusion-wpf-ui-builder\scripts
node controls_search.cjs <project-root>\control-mapping.json
```

**What Script Does:**
1. Reads `control-mapping.json` (Simple or Complex structure)
2. Reads `controls.csv` for control → skill metadata
3. Executes BM25 semantic search on element `type_hint` values
4. Matches each control to best Syncfusion control + skill
5. Updates `control-mapping.json` with:
   - `control` — Syncfusion control class name (e.g., `SfMaskedTextBox`)
   - `skill` — Skill reference (e.g., `syncfusion-wpf-maskedtextbox`)
   - `score` — BM25 match confidence (0-100)
   - `validation` — "✓ VERIFIED" or "✗ FALLBACK"

**Output:**
- Enriched `control-mapping.json` with skill mappings (file updated automatically)
- Console prints execution metrics and validation results

**Output Schema (in `control-mapping.json` after script execution):**
```json
{
  "project_type": "Simple",
  "control_type": "Login Window",
  "variant": "Standard",
  "elements": [
    {
      "id": "email_input",
      "name": "Email Address",
      "type_hint": "textbox email form validation",
      "control": "SfMaskedTextBox",
      "skill": "syncfusion-wpf-maskedtextbox",
      "score": 18.5,
      "validation": "✓ VERIFIED"
    }
  ],
  "validation_status": "PASS",
  "execution_metrics": {
    "total_elements": 4,
    "successfully_mapped": 4,
    "fallback_controls": 0,
    "execution_time_ms": 125
  }
}
```

---

### Step 6: Validate Mapping Results (MANDATORY)

After script execution, verify all checks pass before proceeding to Stage 4:

| Check | Validation Rule | Fail Action |
|---|---|---|
| **View Completeness** | All Stage 1 views present in `control-mapping.json` | Re-run script or update JSON structure |
| **Element Count Match** | `total_elements` = `successfully_mapped` + `fallback_controls` | Re-run script |
| **Control Names** | All `control` values match official Syncfusion class names (exact casing) | Correct spelling/casing |
| **Skill Mapping** | All `skill` values resolve to valid Syncfusion packages (Stage 6) | Verify against controls.csv |
| **Score Validation** | Score > 10 for Syncfusion controls; Score 0 for NATIVE_XAML fallbacks | Review low-score mappings |
| **Fallback Documentation** | Fallback controls have `fallback_reason` explained | Add reason if missing |

**Pass Condition:** `validation_status: "PASS"` with 0 validation errors → Ready for Stage 4

---

## Critical Mapping Rules

| Rule | Why |
|---|---|
| **Skill labels ≠ NuGet packages** | Labels (e.g., `syncfusion-wpf-datagrid`) are search references only; NuGet resolution happens in Stage 6 |
| **All controls must map** | No "unmapped" elements allowed; use `NATIVE_XAML` fallback with documented reason |
| **Match from controls.csv** | Do NOT assume or infer control names; always match from official CSV |
| **Stage 3 = Single source of truth** | Stage 5 code generation follows Stage 3 mapping exactly (no deviations without documented override) |
| **Simple & Complex preserved** | Script maintains original JSON structure; only updates control/skill fields |

---

## Stage 3 Output Summary

**Artifact:** Updated `control-mapping.json` (project root)

**Contents:**
- Original structure (Simple or Complex) preserved
- Each element enriched with:
  - `control` — Syncfusion control class (e.g., `SfMaskedTextBox`)
  - `skill` — Skill reference for NuGet resolution (e.g., `syncfusion-wpf-maskedtextbox`)
  - `score` — BM25 match confidence (0-100)
  - `validation` — "✓ VERIFIED" or "✗ FALLBACK"
- Metadata: `validation_status`, `execution_metrics`

**Consumer:** Stage 4 (Theming), Stage 5 (Code Generation), Stage 6 (Dependencies)

**Status:** ✅ **Fully Automated** — Single script execution produces complete control-to-skill mapping