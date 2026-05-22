---
name: syncfusion-wpf-ui-builder
description: Generates production-ready WPF desktop applications powered by Syncfusion WPF Controls. Orchestrates a structured workflow that handles design thinking, control picking, code generation, and validation with built-in UI Automation accessibility and DPI-aware responsive design. Use when the user asks to create WPF controls, build UI windows, design desktop interfaces, or generate code for WPF applications.
metadata:
  author: "Syncfusion Inc"
  version: "1.0.0"
---

# Syncfusion WPF UI Builder

## Overview

The **Syncfusion WPF UI Builder** skill is a desktop-only WPF control generator that orchestrates an AI agent through 8 stages to generate production-ready UI controls powered by Syncfusion.

## What This Skill Does

**✅ Generates:**
- WPF controls (C# code-behind with XAML markup)
- XAML layout files with proper namespaces
- C# interfaces and data models
- Syncfusion control integration with correct NuGet references
- Client-side form validation logic
- UI Automation accessibility markup (accessible controls)
- Responsive layouts with proper sizing and DPI-aware positioning
- Control and resource files with proper structure

**❌ Does NOT Generate:**
- Backend code (services, database handlers, middleware)
- Database schemas or ORM models
- Authentication/authorization logic
- Server-side validation
- Navigation configuration
- Environment secrets or infrastructure config

## Supported Controls

- **Forms**: Login windows, registration dialogs, data entry forms (using SfTextInputLayout for modern floating labels), multi-step wizards with progress indicators, data selection with ComboBoxAdv (tokens, multiselect, autocomplete)
- **Data Display**: DataGrid (SfDataGrid), TreeGrid, PivotGrid, Charts, HeatMaps, Kanban boards
- **Navigation**: Ribbon, MenuBar, Navigation Drawer, Tabs, Breadcrumb, TreeView
- **Common Patterns**: Dialogs, Toast notifications, Dropdowns, Carousels, Docking panels
- **Application Templates**: Dashboards, Data analysis tools, Business LOB applications, Creative design tools

## Skill Structure

```
syncfusion-wpf-ui-builder/
├── SKILL.md                                     # This file (Agent Skills spec compliant)
├── references/                                  # One-level-deep stage guides + support docs
│   ├── stage-1-intent-analysis.md              # Stage 1: Intent Analysis
│   ├── stage-2-project-detection.md            # Stage 2: Project Detection
│   ├── stage-3-layout-analysis.md              # Stage 3: Layout Analysis & Control Mapping
│   ├── stage-4-theming-and-design-system.md    # Stage 4: Theming & Design System Selection
│   ├── stage-5-code-generation.md              # Stage 5: Code Generation
│   ├── stage-6-dependencies.md                 # Stage 6: NuGet 
│   ├── stage-7-validation.md                   # Stage 7: Validation
Dependencies
│   ├── wpf-ui-build-orchestrator.agent.md      # Design thinking guide (WPF patterns & MVVM)
│   ├── wpf-dotnet-standards.md                 # UI Automation + security + performance rules
└── assets/                                     # Static resources
    └── validation-rules.md                     # Validation checklist for Stage 6
```

## Quick Start

### Prerequisites

1. **Active WPF project** (.NET Framework 4.6.2+ or .NET Core 8+)
2. **Visual Studio 2022+** with WPF development tools
3. **Syncfusion WPF controls library** (auto-installed if missing):
   ```bash
   dotnet add package Syncfusion.Core.WPF
   ```

### Basic Usage

**Example 1: Generate a Login Form**

```
User: "Create a login form with email, password, and remember me checkbox"

Skill executes:
  → Stage 1: Identifies login form control type
  → Stage 2: Detects project structure (WPF, .NET version, etc.)
  → Stage 3-4: AI creates optimal control-mapping.json → maps to Syncfusion controls
  → Stage 5: Generates LoginForm.xaml and LoginForm.xaml.cs with validation
  → Stage 6: Installs NuGet dependencies
  → Stage 7: Validates UI Automation compliance
  → Stage 8: Inserts code into project

Output:
  ✓ Views/LoginForm/LoginForm.xaml
  ✓ Views/LoginForm/LoginForm.xaml.cs
  ✓ Models/LoginFormModel.cs
```

**Example 2: Generate a Data Table**

```
User: "Build a customer data table with sorting and filtering"

Output:
  ✓ Views/CustomerTable/CustomerTable.xaml (with Syncfusion DataGrid)
  ✓ Models/CustomerModel.cs with sample data
  ✓ Responsive layout with DPI scaling
  ✓ UI Automation accessibility compliance
```

## How It Works: 8-Stage AI Orchestration (Stateless)

The skill orchestrates **8 stages of pure AI reasoning** with **two user decision points**.

**Key Architecture:**
- **Stateless design**: Conversation history maintains state
- **Pure AI reasoning**: Each stage reads guidance docs, analyzes context, makes decisions
- **2 user decision gates**: Stage 3 (control confirmation) + Stage 6 (validation result)
- **6 fully automated stages**: 1, 2, 4, 5, 7, and final code insertion
- **Dedicated theming stage**: Stage 4 locks design system before code generation

```
User Request
    ↓
[Stage 1: Intent Analysis] 
  AI reads query → identifies control type & features
    ↓
[Stage 2: Project Detection]
  AI scans project → detect .NET framework, C# language, XAML strategy, preferences
    ↓
[Stage 3: Layout Analysis & Control Mapping] ⭐ SCRIPT EXECUTION REQUIRED
  1. AI analyzes requirements → creates control-mapping.json (saved to project root)
  2. AI runs controls_search.cjs script (BM25 control semantic search)
  3. Script maps elements to Syncfusion WPF controls automatically
  4. Results captured in chat for Stage 4-5 processing
    ↓
[Stage 4: Theming & Design System] (NEW)
  AI locks Syncfusion WPF theme → color system mapping
  AI selects color system (XAML hex colors, Material/Fluent theme)
  AI confirms spacing/typography scale (4pt DIP grid, 1.25 ratio)
  Design system decisions locked before code generation
    ↓
[Stage 5: Code Generation]
  AI generates .xaml, .xaml.cs, C# ViewModels
  Uses control mapping from Stage 3 + theming from Stage 4
  With UI Automation + DPI-aware responsive design built-in
    ↓
[Stage 6: NuGet Dependencies]
  AI detects required packages (Syncfusion WPF + theme packages)
  Presents dotnet add command or runs it
    ↓
[Stage 7: Validation] ⭐ USER DECISION #1
  AI validates UI Automation + security + performance + theming
  Binary result: PASS ✓ or FAIL ✗
  User confirms or overrides
    ↓
[Stage 8: Code Insertion]
  AI inserts files into project
  Updates project references, verifies build
    ↓
✓ Complete
```

**Stage Descriptions:**

- **Stage 1 (Intent Analysis)**: Parse user query, identify control type and features. Read: `references/stage-1-intent-analysis.md`
- **Stage 2 (Project Detection)**: Auto-detect framework, .NET version, theming strategy, control directory. Read: `references/stage-2-project-detection.md`
- **Stage 3 (Layout Analysis & Control Mapping)**: AI analyzes requirements, creates optimal control-mapping.json, maps to Syncfusion controls. User confirms 3+ control selection. Read: `references/stage-3-layout-analysis.md`
- **Stage 4 (Theming & Design System)**: Lock design tokens, Syncfusion theme, color system, spacing (DPI-aware), typography. Read: `references/stage-4-theming-and-design-system.md`
- **Stage 5 (Code Generation)**: Generate WPF with design tokens from Stage 4 applied + accessibility + responsive design. Read: `references/stage-5-code-generation.md`
- **Stage 6 (Dependencies)**: Detect NuGet packages (Syncfusion + frameworks), resolve conflicts, prepare install command. Read: `references/stage-6-dependencies.md`
- **Stage 7 (Validation)**: Validate UI Automation, security, performance, theming integration. Binary pass/fail. Read: `references/stage-7-validation.md` + `assets/validation-rules.md` + `references/wpf-dotnet-standards.md`
- **Stage 8 (Code Insertion)**: AI inserts files, updates references, verifies build succeeds.

**User Interaction Summary:**

| Stage | Interaction |
|-------|-------------|
| 1 | None (AI analyzes) |
| 2 | Confirm auto-detected settings |
| 3 | ⭐ Confirm control selection (3+ Syncfusion WPF control) |
| 4 | Confirm theming decisions (Syncfusion WPF theme, colors, spacing, typography) |
| 5 | None (AI generates) |
| 6 | ⭐ Confirm validation result (pass/fail/override) |
| 7 | Optional (confirm dotnet add command) |
| 8 | None (AI executes) |

**Total user decision gates: 2** (Stage 3: controls, Stage 6: validation). Rest fully automated with AI reasoning + guidance docs.

---

## Scripts & Tools

### Stage 3: ControlMapper Script (`controls_search.cjs`)

**Purpose:** Automatically map UI elements to Syncfusion WPF controls using BM25 semantic search algorithm.

**Location:** `scripts/controls_search.cjs`

**What It Does:**
- Reads `control-mapping.json` with element descriptions and `type_hint` values
- Searches Syncfusion WPF control keywords using BM25 ranking algorithm
- Matches each element to the best-fit Syncfusion control
- Falls back to `NATIVE_XAML` for unmatched elements
- Returns control mapping with BM25 scores (0-100 range)

**Data Source:**
- `scripts/controls.csv` - 100+ Syncfusion WPF controls with keywords (auto-loaded)

**Execution Syntax:**

```powershell
# Navigate to scripts directory
cd <project-root>\.apm\skills\syncfusion-wpf-ui-builder\scripts

# Run with absolute path to control-mapping.json
node controls_search.cjs <project-root>\control-mapping.json
```

**Example (Windows):**

```powershell
cd d:\MyWpfApp\.apm\skills\syncfusion-wpf-ui-builder\scripts
node controls_search.cjs d:\MyWpfApp\control-mapping.json
```

**Prerequisites:**
- Node.js 14+ installed on system
- `control-mapping.json` must exist at specified path
- `controls.csv` must be in same directory as script

**Output:**
- JSON printed to console with mapped controls + BM25 scores
- Copy output into chat for Stage 4 (theming) and Stage 5 (code generation)
- Do NOT save output to file (keep in conversation only)

**Error Handling:**
- If `control-mapping.json` not found → Error message with full path
- If `controls.csv` not found → Error message
- If JSON parse error → Error with line number and context

**BM25 Algorithm Details:**
- **Tokenization:** Splits keywords on whitespace and commas
- **Term Frequency (TF):** Counts occurrences in each control
- **Inverse Document Frequency (IDF):** Ranks rare keywords higher
- **Saturation (k1=1.5):** Diminishing returns on term frequency
- **Length Normalization (b=0.75):** Adjusts for control keyword length

---

## Agent Instructions

### When User Requests UI Control Generation

1. **Validate scope**: Confirm request is for WPF controls (not backend/API)
2. **Load guidance**: Read `stage-1-intent-analysis.md` to understand Stage 1
3. **Execute 8-stage flow**: Follow the orchestration flow shown above
4. **Progressive disclosure**: Load stage guides on-demand; load support references only when needed
5. **Maintain conversation history**: Each stage reads previous decisions from conversation context (stateless)

### Stage Execution & Reference Loading

**Stage 1: Intent Analysis**
- Read: `references/stage-1-intent-analysis.md`
- Task: Parse user query, identify control type, resolve ambiguities
- Output: Control type + modifiers + target directory

**Stage 2: Project Detection**
- Read: `references/stage-2-project-detection.md`
- Task: Auto-detect framework, .NET version, theming strategy, formatting rules
- Output: Project configuration + user confirmation

**Stage 3: Layout Analysis & Control Mapping** ⭐ MANDATORY SCRIPT EXECUTION
- Read: `references/stage-3-layout-analysis.md`
- Task: Analyze user requirements → create optimal `control-mapping.json` → **RUN controls_search.cjs script** → map to Syncfusion controls
- Script: `scripts/controls_search.cjs` (uses BM25 algorithm for semantic control matching)
- Execution: `node controls_search.cjs <project-root>/control-mapping.json`
- Output: `control-mapping.json` (file) + Control mapping results (chat context) + Summary table

**Stage 4: Theming & Design System** (NEW)
- Read: `references/stage-4-theming-and-design-system.md`
- Task: Lock design tokens, Syncfusion theme, color system, spacing (DPI-aware), typography, responsive breakpoints
- Output: Design system decisions confirmed and ready for code generation

**Stage 5: Code Generation**
- Read: `references/stage-5-code-generation.md`
- Task: Generate WPF XAML, C#, data models using theming from Stage 4
- Ensure: UI Automation accessibility compliance, responsive design, token architecture applied
- Output: Generated files ready for review

**Stage 6: Dependencies**
- Read: `references/stage-7-dependencies.md`
- Task: Detect required NuGet packages (Syncfusion + frameworks), resolve version conflicts
- Output: dotnet add command or auto-install

**Stage 7: Validation** ⭐ USER DECISION #2
- Read: `references/stage-7-validation.md` + `assets/validation-rules.md` + `references/wpf-dotnet-standards.md`
- Task: Validate UI Automation, security, performance, theming integration standards
- Auto-apply fixes where possible
- Output: Binary result (PASS ✓ or FAIL ✗) → user confirms or overrides

**Stage 8: Code Insertion**
- Task: Insert generated files into project, update references, verify build
- Output: Success report with file paths



### Boundary Rules (CRITICAL)

**AI agents executing this skill MUST:**

1. **Frontend only**: Never generate backend code (services, database schemas, middleware)
2. **Mock data only**: Use hardcoded samples or simple data models; no real API calls
3. **No secrets**: Exception: `.env` or `appsettings.json` for `SYNCFUSION_LICENSE_KEY` when user provides
4. **WPF controls only**: Generate `.xaml`/`.xaml.cs` files in appropriate directories
5. **Redirect backend requests**: *"This skill generates WPF UI only. Backend integration is your app's responsibility. Ready to generate the UI?"*

### Error Handling

If any stage fails:

1. **Retry once** with same approach
2. **If retry fails**, attempt workaround or skip to next stage
3. **Notify user** with error message from stage output
4. **Offer recovery**: *"Would you like to go back to Stage 3 and choose a different layout?"*
5. **Reference**: `references/build.md` for common errors

### Resource Loading Strategy (Progressive Disclosure)

**Load SKILL.md first** (you're reading it now) ~400 lines

**Load stage guides on-demand** (each <200 lines):
- `stage-1-intent-analysis.md` → During Stage 1
- `stage-2-project-detection.md` → During Stage 2
- `stage-3-layout-analysis.md` → During Stage 3
- etc.

**Load support references only when needed**:
- `wpf-dotnet-standards.md` → When validating in Stage 5
- `build.md` → When errors occur
- `assets/validation-rules.md` → When validating in Stage 6

**Result**: Initial load ~400 lines (SKILL.md only). Full spec available on-demand, never exceeding Agent Skills context limits.

## Configuration & User Customization

### Auto-Detected Settings

During **Stage 2 (Project Detection)**, AI automatically detects:

- **Framework**: WPF, .NET 6+, Windows App SDK version
- **Language**: C# (.NET language)
- **Theming**: XAML theming, default Syncfusion theme, resource dictionaries
- **Formatting**: C# code style rules, naming conventions
- **Control Directory**: `Views/`, `Pages/`, `Controls/`, or similar

### User Override Options

In **Stage 2**, user can override any detected setting:

```
Detected Settings:
  Framework: WPF
  .NET Version: .NET 7
  Theming: XAML with Syncfusion theme
  Control Directory: Views/

[Confirm] [Override Each] [Cancel]
```

### Syncfusion License Configuration

The skill handles license key setup:

1. **Check** for existing `SYNCFUSION_LICENSE_KEY` in `appsettings.json` or environment
2. **If missing**, prompt user: *"Get a free Community License at https://www.syncfusion.com/account/manage-trials"*
3. **If provided**, write to `appsettings.json` + inject `registerLicense()` in app initialization
4. **If skipped**, proceed but warn that watermark will appear in controls

---

## Code Generation Standards

All generated code includes:

### Accessibility (WCAG 2.1 AA)
- ✅ Semantic XAML controls with proper naming
- ✅ AutomationProperties for screen readers
- ✅ Keyboard navigation support (tab order, focus management)
- ✅ Color contrast ≥ 4.5:1
- ✅ Focus indicators on interactive elements

### Responsive Design
- ✅ DPI-aware sizing (logical vs physical pixels)
- ✅ Relative layouts using Grid/StackPanel (no fixed widths)
- ✅ Adaptive breakpoints for different window sizes
- ✅ Touch-friendly controls (44x44 device-independent units minimum)

### Security
- ✅ Input validation in code-behind
- ✅ No hardcoded secrets in XAML
- ✅ Secure binding and command patterns
- ✅ Protection against code injection

### Performance
- ✅ Virtualization for large lists
- ✅ Event handler optimization
- ✅ Lazy loading for heavy resources
- ✅ Efficient data binding

### C# & Types
- ✅ Full type coverage (no dynamic types without reason)
- ✅ ViewModel/Model interfaces with XML docs
- ✅ Event handler signatures
- ✅ Proper INotifyPropertyChanged implementation

## Supported Use Cases

- **Login form**: TextBox (email), TextBox (password), CheckBox (remember), Button (submit)
- **Data table**: DataGrid with sorting, filtering, pagination, row selection
- **Dashboard**: Multiple controls orchestrated (header, sidebar, main content, footer)
- **Registration wizard**: Multi-step form with progress indicator and validation

## Troubleshooting

**Common Issues:**

| Issue | Solution |
|-------|----------|
| "Project type not detected" | Ensure `.csproj` exists with Windows App SDK dependency |
| "Syncfusion license watermark appears" | Add license key via Stage 2 prompt |
| "Build fails after insertion" | Check `references/build.md` for conflict resolution |
| "Control not rendering" | Verify namespace declarations and ensure parent control references correctly |

**Full guide**: See `references/build.md`

## Additional Resources

### Quick Reference by Use Case

| Need | Reference File |
|------|-----------------|
| Understanding workflow | This SKILL.md file |
| How Stage X works | `references/stage-X-*.md` |
| Validation rules | `assets/validation-rules.md` |
| Accessibility/security | `references/wpf-dotnet-standards.md` |
| Troubleshooting | `references/build.md` |

## Support

For issues or questions:
1. Check `references/build.md` for common problems
2. Verify your project meets prerequisites (.NET 6+, Windows App SDK 1.3+)
3. Ensure Syncfusion license is valid and registered
4. Review generated code compliance report for warnings

