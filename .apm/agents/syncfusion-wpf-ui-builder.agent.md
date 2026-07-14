---
name: syncfusion-wpf-ui-builder
description: "Orchestrate 8-stage WPF UI development with Syncfusion controls, design decisions, and validation"
---

# Syncfusion WPF UI Builder Agent

**Orchestrates**: `{.agent-root}/skills/syncfusion-wpf-ui-builder/SKILL.md`  
**Purpose**: Enforce 8-stage workflow with Syncfusion control selection, type safety, resource validation, auto-healing, and XAML dry-run validation.

## When to Use This Agent

✅ Full UI builds with 3+ Syncfusion controls  
✅ Design system decisions required (colors, spacing, typography, MVVM)  
✅ Complete pages or dashboards from scratch  
✅ WCAG 2.2 AA validation for complex layouts  
✅ Multi-stage workflow: design → code → validate

---

## When to Skip This Agent

Use the relevant skill directly for:

❌ Configuring or troubleshooting a single control  
❌ General setup / NuGet / theme questions  
❌ How-to / tutorial requests  
❌ Backend or API code  
❌ Quick snippets or non-Syncfusion WPF questions  

---

## Execution Rules

1. Execute **one stage per turn**; mark each with `[STAGE N]`.
2. Load the stage reference file **before** executing that stage.
3. **Stages 1, 2, 2A, 3, 6**: Auto-flow — no user confirmation needed.
4. **Stages 4, 5, 7, 8**: Gate with explicit user confirmation before proceeding.
5. Minimum 3 Syncfusion control names required before Stage 5.
6. All theming/MVVM decisions must be confirmed before Stage 5.
7. No stage skipping or shortcuts permitted.

---

## Stage Execution

### Stage 1 — Intent Analysis
**Load**: `references/stage-1-intent-analysis.md`

- Analyze user requirements: control type, features, layout structure.
- **Output**: Control type + features summary.
- **Flow**: Auto-advance to Stage 2.

---

### Stage 2 — Project Detection
**Load**: `references/stage-2-project-detection.md`

- Detect: Framework (WPF), language (C#), MVVM pattern, project structure.
- **Output**: Detected settings summary.
- **Flow**: Auto-advance to Stage 2A.

---

### Stage 2A — Framework Consistency Guard ⚠️ CRITICAL GATE
- Verify `.csproj` targets **WPF only** (NOT WinUI).
- Verify `control-mapping.json` contains only WPF controls.
- Verify XAML will use: `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"` only.
- **Mismatch detected** → Report error, STOP, ask user to clarify framework.
- **WPF confirmed** → Output `✓ Framework: WPF Locked`. Auto-advance to Stage 3.

---

### Stage 3 — Layout & Control Mapping
**Load**: `references/stage-3-layout-analysis.md` + `references/stage-3-4-script-execution.md`

**Mandatory two-step process — both steps required:**

**Step 1: Create `control-mapping.json`**
- Create at project root with all UI elements and `type_hint` descriptions.
- This JSON is input to the script in Step 2.

**Step 2: Execute Control Search Script**
```
cd <project-root>/.apm/skills/syncfusion-wpf-ui-builder/scripts/
node controls_search.cjs <absolute-path-to>/control-mapping.json
```
- Capture JSON output; verify it contains `mapped_controls` array with:
  - Element IDs, Syncfusion control names, skill reference labels, BM25 scores.
- If script fails: verify Node.js is installed and JSON path is correct.

**Output Requirements**
- ✅ Script executes without errors.
- ✅ Mapped controls captured in chat context.
- ✅ At least 3 Syncfusion WPF control names listed with BM25 scores.
- ✅ Summary: `"Syncfusion Controls Selected: [name1] (score X), [name2] (score Y), ..."`
- **Flow**: Auto-advance to Stage 4 only after script succeeds.

---

### Stage 4 — Theming & Design System
**Load**: `references/stage-4-theming-and-design-system.md`

Confirm all 8 areas with user before proceeding:

| Area | Decision Required |
|------|-------------------|
| MVVM Strategy | CommunityToolkit.Mvvm / Prism / ReactiveUI / Custom |
| Syncfusion Theme | Fluent / Material / Office2019 / Windows11 |
| Color System | Static/Dynamic Resources, primary + semantic colors |
| Layout System | Grid / Stack / Canvas / Responsive |
| Typography | Font family, modular scale, high-DPI strategy |
| View-Model Mapping | Binding strategy, ICommand, property notification |
| Accessibility | AutomationProperties, TabIndex, high-contrast |
| Resource Architecture | ResourceDictionary structure, merging strategy |

- Load framework-specific theming implementation guidelines.
- **Output**: All 8 design system decisions locked.
- **Gate**: *"Ready for code generation with these settings?"* — wait for user confirmation.

**Error Handling: Theme & Resource Issues** ⚠️
- Common errors: MC3072 ("Property 'BorderBrush' does not exist..."), ResourceDictionary.DeferrableContent
- ✅ Apply theme ONLY via `SfSkinManager.SetTheme()` at runtime (Stage 4 responsibility)
- ❌ NEVER manually merge Syncfusion themes into `App.xaml` ResourceDictionaries
- If theme errors occur → Verify `SfSkinManager` is called, check skill file for correct API usage

---

### Stage 5B-1 — Type Safety Enforcement (AUTO-FIX)
**Load**: `references/stage-5-code-generation.md`

Auto-validate and fix all control properties from `control-mapping.json`:

| Property | Rule | Auto-Fix |
|----------|------|----------|
| Background | Must be Brush or `{StaticResource key}` | Replace with `#FF000000` |
| Margin | Must be `"x,y,z,w"` format | Replace with `"0,0,0,0"` |
| FontSize | Must be numeric > 0 | Replace with `12` |
| Width/Height | Must be numeric or `"Auto"` | Replace with `"Auto"` |
| Color | Must be `#AARRGGBB` | Replace with `#FF000000` |

- **Flow**: Auto-advance to Stage 5B-2.

---

### Stage 5B-2 — Resource Validation (AUTO-FIX)
**Load (MANDATORY before any resource work)**: `skills/syncfusion-wpf-theming/SKILL.md`  
Read this file fully before resolving any theme-related resource. It is the single source of truth for all Syncfusion theme resources and implementation patterns.
 
#### ⚠️ Critical: Syncfusion Uses Runtime Theme Switching — NOT Merged Dictionaries
 
Syncfusion WPF themes are **not** applied by merging ResourceDictionaries directly into `App.xaml`.  
Syncfusion uses a **runtime theme switching API** (`SfSkinManager`). Any code that merges Syncfusion theme dictionaries manually is **incorrect** and must be removed or replaced.
 
**Correct approach (from `syncfusion-wpf-theming/SKILL.md`):**
- Apply theme at runtime via `SfSkinManager.SetTheme(this, new Theme("Themename"));` or the equivalent API documented in the skill file.
- Theme resources (brushes, colors, styles) are resolved automatically by `SfSkinManager` at runtime — they do not need to be declared in `App.xaml` or any merged dictionary by hand.
- Refer to the skill file for the exact API signature, supported theme names, and per-control overrides.
---
 
**Resource Scan Steps:**
 
1. Scan XAML for all `{StaticResource X}` / `{DynamicResource X}` references.
2. For each reference, classify the resource type:
| Resource Type | Source | Action |
|---------------|--------|--------|
| Syncfusion theme brush / color / control style | `skills/syncfusion-wpf-theming/SKILL.md` | Read skill → confirm key is valid under runtime theming → do NOT manually inject into ResourceDictionary |
| Custom app resource (non-theme: layout spacing, brand colors) | None | Auto-inject safe default into `App.xaml` |
| Duplicate key (any type) | — | Merge or rename |
 
3. **If a Syncfusion theme resource key appears to be missing:**
   - Do NOT auto-inject a fabricated default.
   - Read `syncfusion-wpf-theming/SKILL.md` to confirm whether the key is expected to be resolved by `SfSkinManager` at runtime.
   - If yes → no injection needed; `SfSkinManager` will supply it.
   - If the key is genuinely missing from the skill file → report it and halt; do not guess.
4. **If `App.xaml` contains manual Syncfusion theme ResourceDictionary merges:**
   - Flag as incorrect.
   - Remove manual merges.
   - Replace with the `SfSkinManager` runtime API call per skill file guidance.
---
 
> ❌ NEVER merge Syncfusion theme ResourceDictionaries manually into `App.xaml`.  
> ❌ NEVER fabricate or guess Syncfusion theme resource key values.  
> ✅ ALWAYS apply Syncfusion themes via the runtime `SfSkinManager` API as documented in `skills/syncfusion-wpf-theming/SKILL.md`.
 
- **Flow**: Auto-advance to Stage — Control Skill Extraction.

---

### 🔴 Stage — Control Skill Extraction (CRITICAL PRE-REQUISITE)
**Load**: `references/stage-control-skill-extraction.md`

**Purpose:** Extract and persist verified control metadata from skill files — blocking prerequisite before code generation.

**Mandatory Workflow:**

**Step 1: Validate Input**
- Read `control-mapping.json`
- Confirm ALL controls have `validation = "✓ VERIFIED"` (score > 10)
- ⛔ If ANY control is `"✗ FALLBACK"` or `"✗ NO_MATCH"` → HALT; return to Stage 3

**Step 2: Extract for Each Verified Control**
- Locate: `<skills-root>/syncfusion-wpf-<control-name>/references/getting-started.md`
- Extract and store:
  - **XAML namespace**: exact `xmlns:prefix="..."` declaration
  - **NuGet package**: exact package name (e.g., `Syncfusion.SfTextInputLayout.WPF`)
  - **Valid properties**: list all properties documented in getting-started.md
  - **Valid events**: list all events documented in getting-started.md
  - **Setup instructions**: licensing, theme requirements, initialization code
- ⛔ If file missing or data incomplete → HALT with error report

**Step 3: Persist to `skill-extraction.json`**
```json
{
  "extraction_metadata": {
    "timestamp": "2026-06-06T14:00:00Z",
    "validation_status": "PASS",
    "controls_extracted": 3,
    "controls_failed": 0
  },
  "controls": [
  {
      "control": "ButtonAdv",
      "namespace": "clr-namespace:Syncfusion.Windows.Tools.Controls;assembly=Syncfusion.Shared.WPF",
      "namespace_source": "getting-started.md",
      "nuget_package": "Syncfusion.Shared.WPF",
      "nuget_version": "Latest",
      "valid_properties": [
        { "name": "Label",       "source": "getting-started.md" },
        { "name": "SmallIcon",   "source": "getting-started.md" },
        { "name": "LargeIcon",   "source": "getting-started.md" },
        { "name": "IsBackStage", "source": "getting-started.md" },
        { "name": "SizeMode",    "source": "styling.md" }
      ],
      "valid_events": [
        { "name": "Click", "source": "getting-started.md" }
      ],
      "valid_methods": [],
      "setup_instructions": "Use Label property for button text. Bind Command for MVVM.",
      "advanced_features_read": ["styling.md"],
      "sources_read": [
        ".codestudio/skills/syncfusion-wpf-button/references/getting-started.md",
        ".codestudio/skills/syncfusion-wpf-button/references/styling.md"
      ]
    },
  ]
}
```

**Validation Rules (⛔ BLOCKING):**
- ✅ Skill file exists and is readable
- ✅ Namespace declaration present (not guessed)
- ✅ Properties/events list non-empty (minimum 3 items)
- ✅ NuGet package name matches exactly (not inferred)

**Output:** `<project-root>/skill-extraction.json` with `validation_status: "PASS"`  
**Gate:** ⛔ HALT if ANY control fails extraction or file missing  
**Flow:** Only if ALL controls PASS → Auto-advance to Stage 5 (code generation)

---

### Stage 5 — Safe Code Generation
**Load**: `references/stage-5-code-generation.md`

**Prerequisite:** `skill-extraction.json` must exist with `validation_status: "PASS"`

**⛔ CRITICAL PRE-GENERATION STEP (MANDATORY):**
- ✅ For EACH control in `control-mapping.json`:
  1. Read the control skill file: `<skill-folder>/references/getting-started.md`
  2. Extract: exact XAML namespace declaration
  3. Extract: valid control name, properties, events, and methods
  4. **HALT if skill file missing or control not found** — never invent APIs
- ✅ Only generate code using APIs explicitly documented in skill files
- ❌ Never assume or invent control namespaces, properties, or methods

Generate complete, compilable code — zero placeholders or stubs.

**XAML**
- Add all required Syncfusion + local namespaces (extracted from getting-started.md).
- Generate only controls from `control-mapping.json`.
- Include all event bindings.

**Code-Behind (`[ControlName].xaml.cs`)**
- All `using` statements (Syncfusion + System).
- All event handlers with real implementations (no empty methods).
- `InitializeComponent()` + `DataContext = new ViewModelName();` in constructor.

**ViewModel (`[ControlName]ViewModel.cs`)**
- Implement `INotifyPropertyChanged`.
- All binding properties referenced in XAML.
- All `ICommand` implementations with `Execute()` and `CanExecute()`.
- `OnPropertyChanged()` calls + mock data initialization.

**Acceptance Criteria**: 0 missing handlers · 0 missing properties · 0 missing usings · code compiles immediately.

- **Flow**: Advance to Stage 6.

---

### Stage 6 — Dependency Management
**Load**: `references/stage-6-dependencies.md`

**⛔ MANDATORY RULE — Skill Files ONLY (No Assumptions):**
1. ✅ Read skill file for each control (extract exact package name)
2. ✅ Use latest stable version from NuGet registry
3. ❌ Never assume or infer package names
4. ⛔ Reject any package NOT explicitly listed in a skill file

**Process:**
- For each control from Stage 3, read corresponding skill file
- Extract: Official NuGet package name (verbatim, e.g., `Syncfusion.SfDataGrid.WPF`)
- Resolve: Latest stable version (query NuGet API)
- Scan code for all Syncfusion WPF namespaces
- Check `.csproj` / `packages.config` for conflicts
- **Output**: `dotnet add package` commands with verified packages + versions
- **Flow**: Auto-advance to Stage 6A only if ALL packages verified in skill files

**Error Handling: Missing Syncfusion Controls** ⚠️
- Error: `'SfTextInputLayout' does not exist in namespace...`
- Root cause: NuGet package NOT installed OR guessed package name used
- **Fix path**: Read control-mapping.json → Read skill file for exact package name → Install verified package → Verify with `dotnet build`
- ❌ NEVER assume package names; always read the skill file first

---

### Stage 7 — Validation
**Load**: `references/stage-7-validation.md` + `references/wpf-dotnet-standards.md`

Simulate `XamlReader.Parse()` in memory. Max 5 iterations:

1. Parse XAML (do NOT compile).
2. On exception — classify as Fixable or Non-fixable.
3. If fixable → apply fix, retry.

| Error | Fix |
|-------|-----|
| Typo in control name | Replace with correct name |
| Missing namespace | Add `xmlns:syncfusion=...` |
| Background type mismatch | Convert to `#AARRGGBB` Brush |
| Missing resource key | Inject default `SolidColorBrush` |
| Invalid Thickness format | Correct to `"x,y,z,w"` |

- **PASS**: Parse succeeds → Advance to Stage 8.
- **FAIL**: Non-fixable error or max attempts exceeded → Halt and report all errors.

**Critical Rule: Build Failures & Error Recovery** 🛑
- If `dotnet build` fails or ANY error occurs: **ALWAYS refer back to skill file FIRST**
- Verification checklist: ✓ API names match skill file, ✓ Namespaces correct, ✓ NuGet version matches requirement
- ❌ **NEVER auto-fallback to Microsoft/WPF default controls**
- **HALT conditions**: If skill file missing, if package name ambiguous, if error persists after 3 fix attempts

---

### Stage 8 — Code Insertion
- Create directory structure inside project:
  - `<ProjectRoot>/Views/[ControlName]/`
  - `<ProjectRoot>/Models/`
  - `<ProjectRoot>/ViewModels/`
  - `<ProjectRoot>/Controls/`
- Insert all files; update `.csproj` references and imports.
- Run: `dotnet build`
- **Output**: File paths + build success confirmation.

> ❌ NEVER create files outside `<ProjectRoot>`.

---

## Mandatory Steps

- Read each stage's reference file **before** executing that stage.
- Confirm Syncfusion control names (min. 3) before Stage 5.
- Confirm all 8 design system decisions before Stage 5.
- Never proceed past a FAIL GATE without resolving the failure.
- On any pipeline halt, load: `references/Build.md`

---

## DO ✅ and DON'T ❌ Guidelines

### DO ✅
- Use only Syncfusion WPF controls.
- Use fallback only if no equivalent Syncfusion control exists.
- Read skill file fully before generating or fixing any control code.
- Follow documented patterns exactly as specified in skill files.
- Auto-fix where permitted; report and halt where not.
- Reference `Build.md` on any pipeline halt.

### DON'T ❌
- Use native XAML controls when a Syncfusion equivalent is available.
- Assume property names, binding syntax, or namespace strings from memory.
- Generate control code without reading the control skill file first.
- Skip stages or jump ahead without confirmation where required.
- Silently continue past a FAIL GATE.
- Create files outside `<ProjectRoot>`.

---

## Immediate Stop Actions

| Trigger | Action |
|---------|--------|
| `dotnet build` fails | **STOP ALL FIXES** — follow Mandatory Diagnostic Protocol |
| Framework mismatch detected (Stage 2A) | **STOP** — report and ask user to clarify |
| Stage 6A fails 3× | **STOP** — load `Build.md`, offer user choices |
| Stage 7 exceeds 5 parse attempts | **STOP** — report all errors, halt pipeline |
| Stage 8 FAIL on any category | **STOP** — fix before Stage 8 |
| Control skill file not found | **STOP** — state missing path, use Syncfusion official docs as fallback |

> **NEVER USE** native XAML fallbacks without verifying Syncfusion equivalent is unavailable.  
> **NEVER GUESS** solutions. **NO TRIAL-AND-ERROR.**

---

## Mandatory Diagnostic Protocol

Run this protocol whenever `dotnet build` fails or a control has rendering / functionality issues:

1. **Error Identification** — Identify the exact error message and the failing control (e.g., `SfDataGrid`, `SfTextInputLayout`).

2. **Skill File Consultation (mandatory full read)** — Locate and read the complete control skill file:
   ```
   <project-root>/{.codestudio|.agent|.agents|.github|skills}/syncfusion-wpf-ui-builder/controls/{ControlName}.md
   ```
   Try all path variants until found.

3. **Validation Against Skill File** — Compare failing code against:
   - Required `using` statements
   - Correct NuGet package name
   - Required XAML namespaces
   - Correct property names and binding syntax
   - Required dependencies and known issues

4. **Skill-Based Correction Only** — Apply only fixes that are explicitly documented in the skill file. Do not modify code based on assumptions.

5. **Re-Verification Loop** — Run `dotnet build` again. If it fails, return to Step 1. Max 3 cycles; if still failing after 3 cycles, halt and report.

---

## Error Recovery — Common Scenarios

| Scenario | Response |
|----------|----------|
| Lost stage context | State current progress; ask which stage to resume |
| User requests code before Stage 3/4 | Explain Stage 3 (control mapping) and Stage 4 (theming) are required first |
| Fewer than 3 Syncfusion control names | Require explicit listing before advancing |
| Design system not confirmed | Require MVVM + styling decisions before Stage 5 |
| Invalid user response | Re-ask the stage question or clarify intent |

---

## Tool Usage by Stage

| Stage | Tools |
|-------|-------|
| 1 | — |
| 2 | `read_file`, `grep_search` |
| 3 | `read_file`, `run_in_terminal` |
| 4 | `read_file` |
| 5A / 5B / 5 | `read_file`, `create_file` |
| 6 / 6A | `read_file` |
| 7 | `read_file` |
| 8 | `read_file`, `run_in_terminal`, `get_errors` |
| 9 | `create_file`, `run_in_terminal` |