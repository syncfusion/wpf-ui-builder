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

**✅ Generates (UI Layer):**
- WPF XAML using Syncfusion controls + C# code-behind with MVVM pattern
- UI Automation accessibility markup (WCAG 2.1 AA)
- DPI-aware responsive layouts
- Client-side input validation and event handling

**✅ Generates (Backend Layer):**
- Service classes with business logic (e.g., `AuthService`, `CustomerService`)
- Repository interfaces and in-memory implementations
- Navigation / screen-transition logic
- Data models, DTOs, and ViewModel interfaces

**❌ Does NOT Generate:**
- Real database schemas, ORM migrations, or SQL
- Live third-party API integrations
- Authentication infrastructure (OAuth, JWT issuing)
- Environment secrets beyond `SYNCFUSION_LICENSE_KEY`

> **Full-feature rule:** Every generated screen must be end-to-end functional — UI wired to backend logic, validation active, and navigation working. Partial logic or stub-only output is not acceptable.

---

## Quick Start

### Prerequisites
1. WPF project targeting .NET Framework 4.6.2+ or .NET 8+
2. Visual Studio 2022+ with WPF workload
3. Syncfusion WPF library (auto-installed if missing):
   ```bash
   dotnet add package Syncfusion.SfGrid.WPF
   ```
4. Node.js 14+ (required for Stage 3 BM25 control-mapping script)

### Examples

**Login Form**
```
User: "Create a login form with email, password, and remember me checkbox"
Output:
  ✓ Views/LoginForm/LoginForm.xaml              — SfTextInputLayout + SfButton
  ✓ Views/LoginForm/LoginForm.xaml.cs           — event handling, navigation on success
  ✓ ViewModels/LoginViewModel.cs                — INotifyPropertyChanged, ICommand
  ✓ Services/AuthService.cs                     — credential validation logic
  ✓ Models/LoginModel.cs                        — email, password, rememberMe fields
```

**Customer Data Table**
```
User: "Build a customer data table with sorting and filtering"
Output:
  ✓ Views/CustomerTable/CustomerTable.xaml      — SfDataGrid with sort/filter
  ✓ ViewModels/CustomerTableViewModel.cs        — ObservableCollection, filter logic
  ✓ Services/CustomerService.cs                 — data retrieval, search logic
  ✓ Models/CustomerModel.cs                     — typed model with sample data
```

---

## Reusable Workflow Instructions

### Key Architecture

| Property | Detail |
|----------|--------|
| Design | Stateless — conversation history is sole state store |
| Stages | 8 total (6 automated, 2 user-gated) |
| User gates | Stage 3 (control confirmation) + Stage 4 (theming) |
| Auto-healing | Stages 5A, 5B, 6A, 7 auto-fix errors before passing downstream |
| Hard block | Stage 2A blocks on WPF/WinUI framework mismatch |
| Code scope | Both UI and backend generated together as one complete feature |

### Stage Execution Flow (Mandatory Order)

```
User Request
    ↓
[Stage 1] Intent Analysis
  → Parse query, identify control type & features, resolve ambiguities
  → Identify backend requirements (services, validation, navigation) implied by the screen
  → Read: references/stage-1-intent-analysis.md
  → Output: Control type + modifiers + target directory + backend scope summary
    ↓
[Stage 2] Project Detection
  → Auto-detect framework, .NET version, theming, project structure
  → Detect existing service/repository patterns to match generated backend style
  → Read: references/stage-2-project-detection.md
  → Output: Project config + user confirmation (with override option)
    ↓
[Stage 2A] Framework Consistency Guard  ⛔ FAIL-FAST
  → Enforce WPF namespace: xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  → BLOCK if WPF/WinUI controls or namespaces are mixed
  → Output: Confirmed namespace declarations or halt with mismatch report
    ↓
[Stage 3] Layout Analysis & Control Mapping  ⭐ USER GATE #1 + SCRIPT REQUIRED
  → Read: references/stage-3-layout-analysis.md
  → Read control-mapping.json to identify:
      • Relevant Syncfusion controls for each UI element
      • Associated skill reference files per control
  → Run BM25 script: node controls_search.cjs <project-root>/control-mapping.json
    (cd <project-root>\.apm\skills\syncfusion-wpf-ui-builder\scripts first)
  → Map backend actions to each control (e.g., ButtonAdv[Login] → AuthService.ValidateAsync)
  → Output: control-mapping.json + Syncfusion control map + backend action map + user confirmation
    ↓
[Stage 4] Theming & Design System  ⭐ USER GATE #2
  → Read: references/stage-4-theming-and-design-system.md
  → Lock: Syncfusion theme, hex color system, 4pt DIP grid spacing, 1.25 type ratio
  → Select: Material / Fluent / custom XAML theme
  → Output: Design tokens confirmed; locked before any code generation
    ↓
[Stage — Control Skill Extraction] Control Skill Extraction  🔴 BLOCKING PRE-REQUISITE — Before Code Generation
  → Validate: ALL controls in control-mapping.json have validation='✓ VERIFIED' (score > 10)
  → For each control: Read skill file → Extract namespace, NuGet package, properties, events
  → Persist to: <project-root>/skill-extraction.json with validation_status="PASS"
  → Halt if: Skill file missing OR namespace/package/properties incomplete
  → Output: skill-extraction.json (pre-validated control metadata for Stage 5 code generation)
    ↓
[Stage 5B-1] Type Safety Enforcement  🔒 CRITICAL — runs BEFORE XAML generation
  → Validate Background → must be Brush type (SolidColorBrush, LinearGradientBrush, etc.)
  → Validate Margin → must be "double,double,double,double"
  → Validate FontSize → must be double > 0
  → Validate Width/Height → must be double > 0 or Auto
  → Validate Colors → must be #AARRGGBB or named color
  → Auto-fix: Replace invalid values with safe defaults
    ↓
[Stage 5B-2] Resource Validation  🔒 CRITICAL — runs BEFORE XAML generation
  → Scan all {StaticResource X} and {DynamicResource X} in XAML
  → Verify each key X exists in merged ResourceDictionary
  → Auto-inject missing keys with fallback values (e.g., SolidColorBrush #FF000000)
  → Check for duplicate x:Key values
    ↓
[Stage 5] Safe Code Generation  🔒 COMPLETE IMPLEMENTATION — UI + BACKEND
  **Prerequisite:** skill-extraction.json exists with validation_status="PASS" (from Stage — Control Skill Extraction)
  **Data source:** All namespaces/properties/events/packages from skill-extraction.json (never guessed)
  **Pre-Generation Analysis (Mandatory):**
  → Read: references/stage-5-code-generation.md
  → Read control-mapping.json FIRST → identify all Syncfusion controls, events, commands
  → Read corresponding Syncfusion skill file → extract required properties & behaviors
  → Map XAML controls ↔ control-mapping.json ↔ skill directives for alignment

  **Code Generation Principles (Strict Adherence):**
  → Generate ONLY methods, properties, events explicitly required by mapped controls
  → No generic boilerplate, utility methods, or unused stub code
  → Preserve existing codebase structure; avoid overwriting unrelated members
  → Tight alignment: every control + event + binding traces back to skill directive

  **UI Generation (Complete Implementation):**
  → XAML: all Syncfusion namespaces, all mapped controls, all event bindings per skill
  → .xaml.cs: full event handler implementations, DataContext binding, all using statements
  → ViewModel: ALL bound properties (INotifyPropertyChanged), ALL ICommand bindings (RelayCommand)

  **Backend Generation (Skill-Driven):**
  → Service classes: implement only business logic declared in control map + skill file
  → Repository + in-memory data: only if skill directives require data access
  → Navigation: open/close windows per skill success/failure paths
  → Validation: required fields + format checks per skill specification
  → Error propagation: surface errors from service → ViewModel → XAML display

  **Functional Completeness & Safety:**
  → Every control must be fully wired to backend logic (no dead buttons or stub properties)
  → Output: complete, compilable, tested code — zero missing implementations
  → Constraints: no overwritten code, no unused members, minimal-but-full functionality
    ↓
[Stage 6] NuGet Dependency Management
  → Read: references/stage-6-dependencies.md
  → Detect required Syncfusion WPF + theme NuGet packages
  → Verify all XAML Syncfusion namespaces have corresponding packages
  → Output: dotnet add command(s) or auto-install
    ↓
[Stage 7] XAML Dry-Run Validation
  → Read: references/stage-7-validation.md + assets/validation-rules.md
  → Simulate XamlReader.Parse() on generated XAML
  → Auto-fix: invalid tags, missing namespaces, type mismatches
  → Loop until parse succeeds (max 5 iterations)
  → Abort on: circular reference, unsupported control type, licensing error
  → Output: PASS ✓ or FAIL ✗
    ↓
[Stage 8] Code Insertion
  → Insert all validated files (UI + backend) into project
  → Update project references, verify build
  → STOP on errors; report all inserted file paths on success
    ↓
✓ Complete
```

### Stage Gate Summary

| Stage | Interaction | Behavior |
|-------|-------------|----------|
| 1–2 | Auto-detect | Auto-flow |
| 2A | Framework check | ⛔ BLOCK on mismatch |
| 3 | Control + backend action confirmation | ⭐ User gate |
| 4 | Theming confirmation | ⭐ User gate |
| **5A** | **Skill extraction + validation** | **⛔ BLOCK if file missing or extraction fails** |
| 5B-1–5B-2 | Property + resource validation | Auto-fix |
| 5 | UI + backend code generation + skill alignment | Auto-flow (only if Stage — Control Skill Extraction passed) |
| 6 | Dependency validation gate | ⛔ BLOCK if skill-extraction.json missing |
| 6–6A | Dependency + binding + service validation | Auto-fix / Fail gate |
| 7 | XAML dry-run validation | Auto-fix loop |
| 8 | Code insertion + build verification | Auto-flow |

---

## Agent Instructions

1. **Validate scope**: Confirm request is for a WPF screen. Generate both UI and backend together — never UI alone.
2. **Stage — Control Skill Extraction is mandatory**: Before ANY code generation, execute Stage — Control Skill Extraction (Control Skill Extraction). Halt if skill-extraction.json cannot be created or validated.
3. **Read control-mapping.json before Stage 5**: Identify which controls appear, which events fire, and which backend actions are implied. Generate only what those controls need.
4. **Follow stage order strictly**: Never skip or reorder stages. Stage — Control Skill Extraction must complete before Stage 5 (code generation).
5. **Load references on-demand**: Read each stage's `.md` file immediately before executing that stage.
6. **Stateless execution**: Read all prior decisions from conversation context at each stage start.
7. **License key handling**:
   - Check for `SYNCFUSION_LICENSE_KEY` in `appsettings.json` or environment
   - If missing, prompt: *"Get a free Community License at https://www.syncfusion.com/account/manage-trials"*
   - If provided, inject into `appsettings.json` + call `registerLicense()` in app init
   - If skipped, warn that a watermark will appear

---

## Code Generation Rules (Mandatory)

### ⛔ Stage — Control Skill Extraction Prerequisite (CRITICAL)
- **Before ANY code generation in Stage 5**: Execute Stage — Control Skill Extraction
- Confirm `skill-extraction.json` exists with `validation_status: "PASS"`
- **All code generation must use data from `skill-extraction.json`** (namespaces, properties, events, packages)
- ❌ Never guess or assume APIs; ❌ Never infer package names
- ✅ All control metadata must be pre-extracted and verified

### Control-Mapping-Driven Generation
- **Before generating any code**, read `control-mapping.json` to identify:
  - Every Syncfusion control required by the screen
  - The associated skill reference file for each control
  - The backend action (service method) mapped to each interactive control
- Generate **only** the methods, properties, commands, and events that are directly required by the mapped controls in XAML
- Do not add unrelated utility methods, extra services, or placeholder code not tied to a mapped control

### Minimal-but-Complete Rule
Every generated file must be:
- **Context-aware**: driven by the specific skill and its control map, not a generic template
- **Feature-complete**: all controls in XAML are fully wired to logic (no dead buttons or unbound fields)
- **Minimal**: no boilerplate beyond what the mapped controls require

### Screen Completeness Checklist
Before finalizing Stage 5 output, verify each screen satisfies:

| Requirement | Example (Login Screen) |
|-------------|------------------------|
| Input handling | Email → `SfTextInputLayout`, Password → `PasswordBox` bound to ViewModel properties |
| Client-side validation | Required field check, email regex, password min-length |
| Event handling | Login `ButtonAdv` → `LoginCommand.Execute` → `AuthService.ValidateCredentials` |
| Backend logic | `AuthService.ValidateCredentials(email, password)` returns success/failure |
| Navigation on success | Opens `DashboardWindow`, closes `LoginWindow` |
| Error display | Failure message shown via `MessageBox` or inline `SfTextInputLayout` error hint |
| Server-side validation | `AuthService` rejects empty or malformed inputs independently of UI |

---

## Boundary Rules (Critical)

| Rule | Detail |
|------|--------|
| UI + backend together | Always generate both layers as one complete feature; never UI-only |
| Syncfusion controls only | Use only Syncfusion WPF controls; never native MS controls (TextBox → `SfTextInputLayout`, Button → `ButtonAdv`, ComboBox → `ComboBoxAdv`, DataGrid → `SfDataGrid`, MessageBox → `MessageBox`, ProgressBar → `SfLinearProgressBar`, TreeView → `SfTreeView`, TabControl → `SfTabControl`, Calendar → `CalendarEdit`, DatePicker → `SfDatePicker`, TimePicker → `SfTimePicker`) |
| Skill file + control-mapping.json first | **Mandatory pre-generation:** Read the Syncfusion skill file to extract required properties, behaviors, and constraints BEFORE any code generation in Stage 5. Cross-reference with control-mapping.json to ensure all controls, events, and backend actions align with skill directives. |
| Dependency rule: Skill files ONLY | **Before adding ANY NuGet package:** (1) Read skill file, (2) Extract exact package name, (3) Use latest stable version, (4) Never assume/infer names. Only packages documented in skill files are permitted. Reject all others. |
| Mock data only | Use in-memory repositories with sample data; no live DB or real API calls |
| No secrets | Only `SYNCFUSION_LICENSE_KEY` when user explicitly provides it |
| Minimal-but-complete | Generate exactly what the mapped controls need — no extra boilerplate |
| Compilation guaranteed | Stage 6A must pass ALL checks (UI + backend) before any file is inserted |
| Framework purity | Never mix WPF and WinUI controls or namespaces in same project |

---

## DO ✅ / DON'T ❌ Guidelines

**DO:**
- ✅ Read the Syncfusion skill file FIRST to identify required properties, behaviors, and constraints
- ✅ Read `control-mapping.json` SECOND to identify mapped controls, events, and backend actions
- ✅ Cross-reference skill file + control-mapping.json + XAML for tight alignment before any code generation
- ✅ Generate both UI and backend in Stage 5 as a single cohesive output
- ✅ Implement full event handler logic (login → validate → navigate), never stubs
- ✅ Wire every control in XAML to a ViewModel property, command, or event handler
- ✅ Use `MessageBox` for dialogs, `SfTextInputLayout` for text inputs, `ButtonAdv` for buttons
- ✅ Use `SfDataGrid` for all tabular data; never native `DataGrid`
- ✅ Lock design tokens in Stage 4 before generating any code in Stage 5
- ✅ Run the BM25 `controls_search.cjs` script in Stage 3
- ✅ Apply `AutomationProperties` for all interactive controls
- ✅ Use `SfSkinManager` for theme application
- ✅ Use relative layouts (Grid/StackPanel); never hardcode widths for responsive areas

**DON'T:**
- ❌ Generate code without reading the Syncfusion skill file first
- ❌ Skip reading both skill file AND `control-mapping.json` before Stage 5
- ❌ Generate UI without the corresponding backend service and navigation logic
- ❌ Use native MS controls (`TextBox`, `Button`, `ComboBox`, `DataGrid`, `MessageBox`, etc.)
- ❌ Generate code not directly required by mapped controls or skill directives (no unused helpers or empty stubs)
- ❌ Skip Stage 2A framework guard
- ❌ Generate XAML before Stage — Control Skill Extraction/5B validation passes
- ❌ Insert code before Stage 6A compilation gate passes
- ❌ Use `dynamic` types without explicit justification
- ❌ Hardcode secrets in XAML or code-behind

---

## Error Handling & Validation

**Per-stage recovery:**
1. Retry once with same approach
2. If retry fails → apply workaround or skip to next stage
3. Notify user with error message
4. Offer: *"Would you like to go back to Stage 3 and choose a different layout?"*
5. Reference `references/Build.md` for common errors

**Compilation fail gate (Stage 6A):**
- Missing event handler → HALT, regenerate Stage 5
- Missing binding property → HALT, regenerate Stage 5
- Missing service method called from ViewModel → HALT, regenerate Stage 5
- Missing `using` statement → HALT, regenerate Stage 5

**XAML parse loop (Stage 7):**
- Max 5 auto-fix iterations
- Abort on: circular reference, unsupported control, licensing error

---

## ⛔ MANDATORY ERROR HANDLING PROTOCOL

**If ANY build error or validation failure occurs:**

### Issue 1 & 3: Theme / Resource Errors
**Errors:** `MC3072: Property 'BorderBrush' does not exist...` or `ResourceDictionary.DeferrableContent exception`
- ✅ **Fix:** Stage 4 + Stage 7
- ✅ Apply Syncfusion theme ONLY via `SfSkinManager.SetTheme(this, new Theme("<LockedThemeName>"))` in Window constructor
- ✅ Set `SfSkinManager.ApplyStylesOnApplication = true` in `App.xaml.cs` `OnStartup()`
- ❌ NEVER merge Syncfusion theme ResourceDictionaries manually into `Application.Resources`
- ✅ Custom resources ONLY: `Themes/Colors.xaml`, `Themes/Spacing.xaml`, `Themes/Typography.xaml`

### Issue 2: Missing Syncfusion Control
**Error:** `'SfTextInputLayout' does not exist in namespace...`
- ✅ **Fix:** Stage 6 (Dependencies)
- ✅ Read `control-mapping.json` → identify mapped control
- ✅ Read skill file (`syncfusion-wpf-[control]/SKILL.md`) → extract exact NuGet package name
- ✅ Install package: latest stable version matching Stage 2 version
- ❌ NEVER assume or infer package names

### Critical Rule: ALWAYS Read Skill Files First
**If build fails OR control error occurs:**
1. ✅ Refer back to control's skill file FIRST
2. ✅ Verify: API names, namespace declarations, NuGet package version
3. ❌ DO NOT fallback automatically to Microsoft/WPF default controls (e.g., `TextBox`, `ComboBox`)
4. ⛔ HALT if skill file missing or ambiguous — no silent corrections
5. ✅ Retry build with skill-verified changes before next stage

---

## Resource Loading Strategy (Mandatory)

Load files **on-demand only** — never preload all references.

| When | Load |
|------|------|
| Before Stage 1 | `references/stage-1-intent-analysis.md` |
| Before Stage 2 | `references/stage-2-project-detection.md` |
| Before Stage 3 | `references/stage-3-layout-analysis.md` |
| Before Stage 4 | `references/stage-4-theming-and-design-system.md` |
| **Before Stage — Control Skill Extraction** | **`control-mapping.json` (validate ALL controls are ✓ VERIFIED)**<br/>**For each control: read `<skills-root>/syncfusion-wpf-<control>/references/getting-started.md`** |
| After Stage — Control Skill Extraction | ✅ Confirm `skill-extraction.json` exists with `validation_status: "PASS"` before proceeding |
| Before Stage 5 | `references/stage-5-code-generation.md` + `skill-extraction.json` (pre-extracted data source) |
| Before Stage 6 | `references/stage-6-dependencies.md` + verify `skill-extraction.json` present |
| Before Stage 7 | `references/stage-7-validation.md` + `assets/validation-rules.md` |
| Before Stage 8 | `references/wpf-dotnet-standards.md` |
| On error | `references/Build.md` |

**Initial load:** SKILL.md only. Full spec available on-demand.

**Critical:** Stage — Control Skill Extraction must complete successfully (producing `skill-extraction.json`) before Stage 5 code generation can begin. This is NOT optional.

---

## Code Generation Standards

### Accessibility (WCAG 2.1 AA)
- `AutomationProperties.Name` and `AutomationProperties.HelpText` on all Syncfusion controls
- Keyboard navigation: correct tab order, focus management
- Color contrast ≥ 4.5:1; visible focus indicators on `SfButton` and `SfTextInputLayout`

### Responsive & DPI
- DPI-aware sizing using logical (device-independent) units
- Grid/StackPanel layouts; no fixed pixel widths for fluid areas
- Touch targets ≥ 44×44 device-independent units

### Security
- Input validation in ViewModel and service layer; no hardcoded secrets in XAML
- Secure binding and command patterns; no code injection vectors

### Performance
- `SfDataGrid` virtualization enabled for large datasets
- Lazy loading for heavy resources; efficient `ObservableCollection` binding

### C# Quality
- Full type coverage (no unexplained `dynamic`)
- `INotifyPropertyChanged` with correct property-change notifications
- XML doc comments on all public service interfaces and models
- `RelayCommand` pattern for all ICommand bindings

---

## Supported Use Cases

| Request Type | Key Syncfusion Controls | Backend Generated |
|---|---|---|
| Login form | `SfTextInputLayout`, `ButtonAdv`, `SfCheckBox`, `MessageBox` | `AuthService`, `LoginViewModel` |
| Registration wizard | `SfTextInputLayout`, `ComboBoxAdv`, `ButtonAdv` | `UserRegistrationService`, step validators |
| Customer data table | `SfDataGrid` (sort, filter, paginate) | `CustomerService`, `ICustomerRepository` |
| Dashboard | `SfChart`, `SfDataGrid`, `SfTabControl`, `SfLinearProgressBar` | Aggregation services, summary DTOs |
| Kanban board | `SfKanban` with swimlanes | `TaskService`, status-transition logic |
| Data analysis tool | `SfChart`, `SfDataGrid`, `SfDatePicker` | Filter/query service, export logic |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Project type not detected | Ensure `.csproj` has correct WPF target framework entry |
| Syncfusion watermark appears | Add license key during Stage 2 prompt |
| Build fails after insertion | See `references/Build.md` |
| Control not rendering | Verify `xmlns` namespace declarations match installed NuGet packages |
| XAML parse error loops | Check Stage 7 abort conditions; report control type to user |
| Missing binding at runtime | Re-run Stage 6A validation; ensure ViewModel DataContext is set |
| Service method not found | Confirm Stage 5 backend generation included the service; re-run Stage 6A |
| Navigation not working | Verify success handler in event method opens target Window and closes current |

**Full guide:** `references/Build.md`

## Additional Resources

### Quick Reference by Use Case

| Need | Reference File |
|------|-----------------|
| Understanding workflow | This SKILL.md file |
| How Stage X works | `references/stage-X-*.md` |
| Validation rules | `assets/validation-rules.md` |
| Accessibility/security | `references/wpf-dotnet-standards.md` |

## Support

For issues or questions:
1. Verify your project meets prerequisites (.NET 6+, Windows App SDK 1.3+)
2. Ensure Syncfusion license is valid and registered
3. Review generated code compliance report for warnings