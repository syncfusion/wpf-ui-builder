# Stage 5: Code Generation

**Purpose:** Generate production-ready WPF code (XAML + C# + ViewModel + Services) that is fully wired, compilable, and feature-complete. Code generation begins only after all pre-validation steps pass.

**Inputs:** `control-mapping.json` (Stage 3) + `skill-extraction.json` (Stage — Control Skill Extraction) + locked design decisions (Stage 4)
**Output:** Complete UI + backend implementation — zero stubs, zero missing handlers. Only controls verified in `skill-extraction.json` appear in any generated file.

---

## Pre-Validation Workflow (MANDATORY — Complete Before Any Code)

Execute all steps in order. ⛔ Do not skip any step.

### Step 1: Read and Validate `control-mapping.json`

1. Locate: `<project-root>/control-mapping.json`
2. Validate structure:
   - `project_type`: `"Simple"` or `"Complex"`
   - Simple → `elements[]` present with all controls
   - Complex → `pages[]` with `page_id`, `component_type` (`generate_window` | `generate_usercontrol`), `elements` or `sections`
   - Every element has: `id`, `name`, `type_hint`, mapped control name
3. Extract all unique mapped Syncfusion controls (e.g., `SfDataGrid`, `ButtonAdv`, `SfTextInputLayout`)
4. Record page/window context per control (Simple = one context; Complex = per-page)

⛔ **If control-mapping.json is missing or invalid → HALT. Return to Stage 3.**

---

### Step 1A: 🔴 CONTROL VALIDATION GATE (BLOCKING — Before Skill Reading)

Inspect every entry in `mapped_controls[]`. Reject any control that is not a verified Syncfusion mapping before proceeding further.

```
FOR EACH entry in mapped_controls[]:

  CHECK control, validation, score, skill fields:

  IF control == "NATIVE_XAML"
  OR validation == "✗ FALLBACK"
  OR validation == "✗ NO_MATCH"
  OR skill == null OR skill == ""
  OR score < 10
  → ❌ HALT:
      "❌ HALT: <element_name> is not a verified Syncfusion control
       validation='<validation>', score=<score>
       No valid skill mapping found.
       Return to Stage 3 and refine user intent or control mapping."

  IF validation == "✓ VERIFIED" AND skill != null AND score >= 10
  → ✅ Control cleared for extraction and code generation
```

**Allowed (✅):**
```
✅ emailInput → SfTextInputLayout  (validation=✓ VERIFIED, score=18.2)
   Proceed to skill extraction and code generation.
```

**Blocked (❌):**
```
❌ HALT: emailInput  validation='✗ FALLBACK'  score=8.5 (< 10 threshold)
   No verified Syncfusion control found.
   Must return to Stage 3 for remapping.
```

ALL entries pass → ✅ Gate cleared — proceed to Step 2
ANY entry fails → ❌ HALT entire pipeline; list all failing elements before stopping

---

### Step 2: 🔴 ATOMIC PRE-GENERATION VALIDATION GATE (BLOCKING — No Exceptions)

Execute for **every** control extracted in Step 1. Each condition is a hard stop — no fallback, no assumption, no partial continuation.

```
FOR EACH control in control-mapping.json:

  1. LOCATE skill folder: `<skills-root>/syncfusion-wpf-<control-name>/`
     `<skills-root>` = `.codestudio/skills | .agent/skills | .agents/skills | .github/skills | skills`
     ❌ Folder NOT found → HALT: "Skill folder missing for <control-name> — cannot proceed"

  2. READ `<skill-folder>/SKILL.md`  ← PRIMARY — read before any reference file
     ❌ File NOT found → HALT: "SKILL.md missing for <control-name> — cannot proceed"
     EXTRACT:
       ✅ Control overview and purpose
       ✅ Which reference files cover which features (guides Step 3 reference scanning)
       ✅ Feature-level documentation structure
       ✅ High-level expected APIs (used to cross-validate extraction)
     ❌ Do NOT read reference files before SKILL.md is processed

  3. READ `<skill-folder>/references/getting-started.md`  ← MANDATORY (after SKILL.md)
     ❌ File NOT found → HALT: "getting-started.md missing for <control-name> — cannot proceed"

  4. EXTRACT namespace declaration (from getting-started.md or other reference files)
     ❌ Namespace NOT present → HALT: "Namespace undefined for <control-name> — invalid control usage"

  5. EXTRACT + VERIFY properties, events, methods (guided by SKILL.md structure)
     ❌ Required API NOT listed → HALT: "Unverified API for <control-name> — cannot generate code"

  6. EXTRACT NuGet package name + version
     ❌ Package NOT listed → HALT: "Unknown package for <control-name> — do NOT install"
     ❌ Version mismatches Stage 2 resolved version → HALT: "Version conflict for <control-name>"

  7. IF advanced features needed: READ relevant reference files identified in SKILL.md (Step 2)
     ❌ Referenced guide NOT found → HALT: "Feature guide missing — cannot implement advanced behavior"

ALL controls pass → ✅ Validation gate cleared
ANY control fails → ❌ HALT entire code generation; report all failed controls before stopping
```

**Read Syncfusion theme guidance** (also blocking):
- Read `<skills-root>/syncfusion-wpf-theming/SKILL.md`
- ❌ File NOT found → HALT: "Theme skill file missing — cannot apply SfSkinManager pattern"
- Extract locked theme name (from Stage 4) + `SfSkinManager` API pattern
- ✅ Apply theme via `SfSkinManager` only — ❌ do NOT merge Syncfusion theme ResourceDictionaries into `Application.Resources`

> **Skill files are the single source of truth. No code may be generated from memory, assumption, or inference.**

---

### Step 3: 🔴 READ `skill-extraction.json` + SKILL FILES BEFORE EVERY CONTROL (BLOCKING)

⛔ **This step is atomic and non-negotiable. No control may appear in generated code unless it passes both checks below.**

```
CONFIRM <project-root>/skill-extraction.json exists
  ❌ Missing → HALT: "skill-extraction.json not found — run Stage — Control Skill Extraction first"

CONFIRM skill-extraction.json → validation_status == "PASS"
  ❌ Not PASS → HALT: "Extraction not validated — fix and re-run Stage — Control Skill Extraction"

FOR EACH control that will appear in any generated file (XAML, code-behind, ViewModel):

  CHECK 1 — Present in skill-extraction.json:
    FIND entry in controls[] where control == "<ControlName>"
    ❌ Not found → HALT: "<ControlName> not in skill-extraction.json
                          Do NOT invent or assume this control.
                          Either add it to control-mapping.json and re-run Stage — Control Skill Extraction,
                          or remove it from the generated file entirely."

  CHECK 2 — Re-read the referred skill file before applying the control:
    READ source file listed in skill-extraction.json → controls[].sources_read[0]
    (minimum: getting-started.md; also read feature guides if listed in advanced_features_read[])
    ❌ File not readable → HALT: "Skill reference unreadable for <ControlName> — cannot safely generate"

  ONLY AFTER both checks pass:
    USE namespace   → exact value from controls[].namespace (do NOT modify or construct)
    USE properties  → only names in controls[].valid_properties[].name
    USE events      → only names in controls[].valid_events[].name
    USE methods     → only names in controls[].valid_methods[].name
    USE nuget       → controls[].nuget_package at controls[].nuget_version
```

**No-assumption rule (applies to every generated file):**
- ❌ Do NOT include any Syncfusion control not present in `skill-extraction.json → controls[]`
- ❌ Do NOT use a property, event, or method not listed in the corresponding entry
- ❌ Do NOT construct or guess a namespace — use the exact string from `controls[].namespace`
- ❌ Do NOT add controls "because they seem useful" — only controls explicitly mapped and extracted are allowed

---

### Step 3A: 🔴 READ STAGE 4 THEMING & DESIGN SYSTEM (MANDATORY — Before Any File is Written)

Load all design decisions locked in Stage 4. Stage 5 must not apply any theme, color, spacing, typography, or MVVM binding pattern that was not explicitly decided there.

```
READ Stage 4 output → extract and lock the following:

  THEME:
  ✅ locked_theme_name       (e.g., "Windows11Light")
  ✅ theme_nuget_package     (e.g., "Syncfusion.Themes.Windows11Light.WPF")
  ❌ theme_name empty/null → HALT: "No theme locked in Stage 4 — cannot generate SfSkinManager calls"

  APPLICATION TYPE:
  ✅ application_type        (Enterprise / Consumer / LOB / Creative)
  → Determines layout density, control sizing, and interaction patterns used in code

  COLOR SYSTEM:
  ✅ custom_colors_defined   (true / false)
  ✅ IF true: extract color resource keys from Stage 4 decisions
     → Use these keys in XAML: e.g., {StaticResource PrimaryColorBrush}
  ✅ IF false (Syncfusion theme provides colors): do NOT generate Themes/Colors.xaml

  SPACING & TYPOGRAPHY:
  ✅ custom_spacing_defined   (true / false)
  ✅ IF true: extract spacing token keys (SpaceSmall, SpaceLarge, etc.)
  ✅ IF false: use default WPF Margin values; do NOT generate Themes/Spacing.xaml

  MVVM INTERACTION MAP (Section 8A of Stage 4):
  ✅ Read every UI element → ViewModel binding declaration
  ✅ Read every navigation flow → ICommand declaration
  ❌ Any interactive control not in the MVVM map → HALT:
     "Control '<elementId>' has no MVVM connection defined in Stage 4
      Fix: add binding/command to Stage 4 Section 8A and re-confirm before generating"

  ACCESSIBILITY:
  ✅ touch_target_min_dip     (default: 44)
  ✅ wcag_contrast_ratio      (default: 4.5:1)
  → Apply to all interactive controls during generation

LOCK all extracted values — they are the authoritative source for every generated file.
❌ Do NOT override or deviate from Stage 4 decisions during code generation.
```

**Data consumed from Stage 4 per deliverable:**

| Deliverable | Stage 4 Data Used |
|---|---|
| Every Window `.xaml.cs` constructor | `locked_theme_name` → `SfSkinManager.SetTheme(this, new Theme("<name>"))` |
| `App.xaml.cs` `OnStartup()` | `SfSkinManager.ApplyStylesOnApplication = true` |
| XAML color references | Custom color resource keys → `{StaticResource PrimaryColorBrush}` |
| XAML spacing/margin | Spacing token keys or default WPF `Margin` |
| Every interactive control | MVVM map → `Command="{Binding <Command>}"` or `{Binding <Property>}` |
| Every navigation trigger | MVVM map → ICommand wired in ViewModel |
| `AutomationProperties` | Accessibility standards → applied to all interactive controls |

---

### Step 4: 🔴 DETECT TARGET FRAMEWORK & SDK (MANDATORY)

Read the project configuration locked in Stage 2 before generating any code.

```
READ Stage 2 output → resolved framework settings:
  target_framework   (e.g., net10.0-windows, net462)
  platform           (must be WPF)
  dotnet_version     (e.g., .NET 8, .NET Framework 4.6.2)

VALIDATE:
  ❌ target_framework is empty or null
     → HALT: "Target SDK unknown — cannot generate code. Re-run Stage 2."
  ❌ platform ≠ WPF
     → HALT: "Platform '<platform>' is not WPF — Stage 5 generates WPF only."
  ❌ target_framework contains 'winui', 'maui', 'uwp', or 'android'
     → HALT: "Non-WPF target framework detected: <value> — cannot proceed."

LOCK for code generation:
  ✅ WPF base namespace:   "http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  ✅ WPF XAML namespace:   "http://schemas.microsoft.com/winfx/2006/xaml"
  ✅ Syncfusion namespace: from skill-extraction.json → controls[].namespace only
  ✅ SDK property set:     WPF-supported properties only (validated in Step 5)
```

---

### Step 5: 🔴 NAMESPACE & PROPERTY COMPATIBILITY VALIDATION (CRITICAL)

Run for every XAML file before writing it. Each check is a hard block — no silent pass.

#### 5A — Namespace Validation

```
FOR EACH xmlns declaration that will appear in the XAML file:

  WPF base namespace:
  ✅ MUST be: xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  ❌ Any other value for the default xmlns → HALT: "Invalid WPF base namespace: <value>"

  Syncfusion namespaces:
  ✅ MUST come from: skill-extraction.json → controls[].namespace
  ❌ Namespace contains 'microsoft.ui', 'winui', 'uwp', 'maui', or 'windows.ui'
     → HALT: "WinUI/UWP/MAUI namespace detected in WPF file: <namespace>
              Mixed-framework namespaces are not allowed."

  ❌ Any namespace not in the WPF base set AND not in skill-extraction.json
     → HALT: "Unverified namespace: <namespace> — source unknown"
```

#### 5B — Property Compatibility Validation

```
FOR EACH property used on a WPF or Syncfusion control in the generated XAML:

  ── CHECK 1: Framework-level blocked properties ──────────────────────────────
  BLOCKED PROPERTIES (not valid in WPF at all):
  ├── RowSpacing, ColumnSpacing          → WinUI Grid only
  ├── Spacing (on StackPanel)            → WinUI only; WPF uses Margin
  ├── RelativePanel.*                    → WinUI only
  ├── x:Bind                             → WinUI only; WPF uses {Binding}
  ├── CommandBarFlyout, MenuFlyout       → WinUI/UWP only
  ├── SemanticZoom                       → WinUI/UWP only
  └── Any Windows.UI.* type              → WinUI/UWP namespace

  IF property is in the blocked list above
  → HALT: "Property '<name>' is not valid in WPF SDK (belongs to <framework>)"

  ── CHECK 2: Element-level property support (CRITICAL) ───────────────────────
  Not every WPF element exposes every common property.
  Before setting Padding, CornerRadius, or Background on any element, verify
  the property is declared on that specific class in the WPF SDK:

  PADDING — supported on:
  ✅ Control subclasses: Button, TextBox, Label, ListBox, ComboBox, etc.
  ✅ Border, Decorator subclasses
  ❌ NOT on: Grid, StackPanel, DockPanel, WrapPanel, Canvas, GroupBox (use Margin instead)
  ❌ NOT on: arbitrary Syncfusion layout containers unless listed in skill-extraction.json

  CORNERRADIUS — supported on:
  ✅ Border
  ❌ NOT on: Grid, Button, StackPanel, or any panel/control unless overridden in a ControlTemplate
  ❌ Do NOT set CornerRadius directly on any element whose class does not declare it

  BACKGROUND — supported on:
  ✅ Panel subclasses (Grid, StackPanel, etc.), Control, Window, Border
  ❌ NOT on: plain UIElement or FrameworkElement subclasses without a Background property

  IF property is set on an element that does not declare it in the WPF SDK
  → HALT: "Property '<name>' does not exist on '<ElementType>' in WPF
           (xmlns: http://schemas.microsoft.com/winfx/2006/xaml/presentation)
           Use a supported container (e.g., Border for CornerRadius, Margin for spacing on panels)"

  ── CHECK 3: Syncfusion property verification ────────────────────────────────
  IF property is on a Syncfusion control AND not in skill-extraction.json → valid_properties[].name
  → HALT: "Property '<name>' on <ControlName> not verified in skill file — do NOT use"

  ✅ All three checks pass → property is allowed
```

**Quick-fix reference for common violations:**

| Error Pattern | Cause | Fix |
|---|---|---|
| `Padding` on `Grid` | Grid has no Padding property | Wrap content in `Border` with `Padding`, or use `Margin` on child elements |
| `Padding` on `StackPanel` | StackPanel has no Padding | Add `Border` wrapper with `Padding` around the `StackPanel` |
| `CornerRadius` on `Button` | Button has no direct CornerRadius | Override `ControlTemplate` with a `Border` that has `CornerRadius` |
| `CornerRadius` on `Grid` | Grid has no CornerRadius | Wrap in `Border` with `CornerRadius` and `ClipToBounds="True"` |
| `Spacing` on `StackPanel` | WinUI-only property | Remove; use `Margin` on child elements instead |

---

## Implementation Validation Pattern (Pseudocode — MANDATORY)

Build three registries from `skill-extraction.json` before generating any code. Every gate in Steps 3 and 5B calls into these registries. A `BlockingException` thrown by any function halts generation entirely — no catch, no fallback.

### BlockingException Pattern
```
CLASS BlockingException:
  message: string
  control: string       // which control triggered the halt
  field:   string       // which field was invalid (property/event/namespace)
  valid:   string[]     // list of valid values (shown in error for quick fix)

FUNCTION halt(control, field, found, valid[]):
  THROW BlockingException {
    message: "❌ HALT: '" + found + "' is not a valid " + field + " for '" + control + "'\n"
           + "Valid " + field + "s: [" + join(valid, ", ") + "]\n"
           + "Source: skill-extraction.json → controls['" + control + "']." + field + "s",
    control: control,
    field:   field,
    valid:   valid
  }
```

### Registry 1 — Control Registry
```
// Build once from skill-extraction.json
validControls = SET of control.control for each control in controls[]
// e.g. { "SfDataGrid", "SfTextInputLayout", "ButtonAdv", "SfCircularProgressBar" }

FUNCTION validateControl(controlName):
  IF controlName NOT IN validControls:
    THROW BlockingException {
      message: "❌ HALT: Control '" + controlName + "' not in skill-extraction.json\n"
             + "Do NOT invent or assume this control.\n"
             + "Fix: (A) add to control-mapping.json and re-run Stage — Control Skill Extraction\n"
             + "     (B) remove from generated files entirely",
      control: controlName,
      field:   "control",
      valid:   LIST(validControls)
    }
```

### Registry 2 — Property Registry
```
// Build once from skill-extraction.json
propertyRegistry = MAP of controlName → SET of valid_properties[].name
// e.g. propertyRegistry["SfDigitalGauge"] = { "Value", "CharacterType", "CharacterCount" }
//      propertyRegistry["SfTextInputLayout"] = { "Hint", "LabelText", "ContainerType", ... }

FUNCTION validateProperty(controlName, propertyName):
  validProps = propertyRegistry.get(controlName)
  IF validProps == null:
    validateControl(controlName)   // will halt — control not registered
  IF propertyName NOT IN validProps:
    halt(controlName, "property", propertyName, LIST(validProps))

// Example halts:
// validateProperty("SfDigitalGauge", "CharacterCount")
//   → "CharacterCount" not in valid_properties for "SfDigitalGauge"
//   → "Valid properties: [Value, CharacterType, ...]"
//
// validateProperty("Button", "Content")
//   → "Button" NOT IN validControls → halt with control error first
```

### Registry 3 — Event Registry
```
// Build once from skill-extraction.json
eventRegistry = MAP of controlName → SET of valid_events[].name
// e.g. eventRegistry["SfDataGrid"] = { "SelectionChanged", "CurrentCellBeginEdit", "FilterChanged" }

FUNCTION validateEvent(controlName, eventName):
  validEvents = eventRegistry.get(controlName)
  IF validEvents == null:
    validateControl(controlName)
  IF eventName NOT IN validEvents:
    halt(controlName, "event", eventName, LIST(validEvents))
```

### Registry 4 — Namespace Registry
```
// Build once from skill-extraction.json
namespaceRegistry = MAP of controlName → namespace string
// e.g. namespaceRegistry["SfDataGrid"] = "http://schemas.syncfusion.com/wpf"

FUNCTION validateNamespace(controlName, usedXmlns):
  expected = namespaceRegistry.get(controlName)
  IF expected == null:
    validateControl(controlName)
  IF usedXmlns != expected:
    THROW BlockingException {
      message: "❌ HALT: Namespace mismatch for '" + controlName + "'\n"
             + "Expected: " + expected + "\n"
             + "Used:     " + usedXmlns + "\n"
             + "Source: skill-extraction.json → controls['" + controlName + "'].namespace",
      control: controlName,
      field:   "namespace",
      valid:   [expected]
    }
```

### Enforcement Call Points (MANDATORY — No Exceptions)
```
// ① Before writing any XAML element tag:
FOR EACH control element in planned XAML output:
  validateControl(control.className)

// ② Before writing any attribute on a Syncfusion control:
FOR EACH attribute on a Syncfusion control element:
  validateProperty(control.className, attribute.name)

// ③ Before wiring any event handler on a Syncfusion control:
FOR EACH event on a Syncfusion control element:
  validateEvent(control.className, event.name)

// ④ Before writing xmlns declarations:
FOR EACH Syncfusion xmlns in planned XAML output:
  validateNamespace(control.className, xmlns.value)

// Any BlockingException at ①–④ → HALT entire generation.
// Log full exception message. Do NOT continue or suppress.
```

**Concrete examples from reported errors:**
```
// Error: "Button not in skill-extraction.json"
validateControl("Button")
→ "Button" not in validControls (native MS control — not extracted)
→ FIX: Use "ButtonAdv" (the mapped Syncfusion control) or add Button to mapping

// Error: "Property 'CharacterCount' on SfDigitalGauge not verified"
validateProperty("SfDigitalGauge", "CharacterCount")
→ "CharacterCount" not in propertyRegistry["SfDigitalGauge"]
→ Valid properties shown in halt message for immediate correction
→ FIX: Check skill file for correct property name (e.g., "CharacterCount" vs "CharacterType")
```

---

## Code Generation (Execute ONLY After Steps 1A, 2, 3, 4, and 5 All Pass)

**GATE CHECK (mandatory before writing the first line of any file):**
```
✅ skill-extraction.json exists + validation_status == "PASS"
✅ Every control verified against its skill file (Step 3)
✅ No control absent from skill-extraction.json appears in output
✅ Stage 4 decisions loaded: locked_theme_name, MVVM map, color/spacing strategy (Step 3A)
✅ Every interactive control has an MVVM binding or command from Stage 4 Section 8A
✅ Target framework = WPF; platform confirmed (Step 4)
✅ All xmlns declarations validated — no WinUI/UWP/MAUI namespaces (Step 5A)
✅ All properties validated against WPF SDK + skill-extraction.json (Step 5B)
```

**Data source rules (absolute — no exceptions):**

| Data | Authoritative Source | ❌ Never From |
|---|---|---|
| XAML namespace (`xmlns:...`) | `controls[].namespace` in `skill-extraction.json` | Memory, training data, or inference |
| Properties on Syncfusion controls | `controls[].valid_properties[].name` | Assumption or prior usage patterns |
| Events on Syncfusion controls | `controls[].valid_events[].name` | Guessing based on similar controls |
| NuGet package + version | `controls[].nuget_package` + `nuget_version` | Any source not in the JSON |
| Theme name + SfSkinManager pattern | Stage 4 `locked_theme_name` | Hardcoded strings or defaults |
| Color resource keys | Stage 4 color system decisions | Hardcoded hex values on controls |
| Spacing / margin tokens | Stage 4 spacing decisions | Hardcoded pixel values |
| Command bindings per control | Stage 4 MVVM integration map (Section 8A) | Assumptions about what commands exist |
| Navigation wiring | Stage 4 MVVM interaction map | Code-behind navigation logic |

Generate all layers together as a single cohesive feature. Never generate UI without the corresponding backend.

---

### Folder Structure (MANDATORY)

```
Views/<Feature>/          # .xaml + .xaml.cs per Window or UserControl
ViewModels/               # INotifyPropertyChanged ViewModels
Services/                 # Business logic and backend services
Repositories/             # IRepository interface + in-memory implementation
Models/                   # Data models and DTOs
Themes/                   # Colors.xaml, Spacing.xaml, Typography.xaml (if no SfSkinManager)
```
Rules: MVVM separation strictly enforced; business logic in Services only; consistent naming `<Feature>Window.xaml`, `<Feature>ViewModel.cs`, `<Feature>Service.cs`; no business logic in code-behind.

---

### Deliverable 1: XAML File

- All namespaces from `skill-extraction.json → controls[].namespace` only (Step 3 + 5A enforced)
- One consistent prefix per namespace — no duplicates
- Only controls and properties verified by the four registries (Step 3 + 5B enforced)
- All interactive controls: event bindings or command bindings + `AutomationProperties.Name`
- Responsive layout: `Grid` with `*` star sizing; no hardcoded pixel widths for fluid areas

**App.xaml — resource strategy depends on theme approach:**

**If using Syncfusion theme (via `SfSkinManager`)** — custom `Themes/` files are **not needed**. `SfSkinManager` provides all color, spacing, and typography tokens through the installed theme package. `<Application.Resources>` should be empty or omitted:
```xaml
<Application.Resources />
```

**If NOT using a Syncfusion theme** — create and merge the three custom resource files so controls can reference token keys:
```xaml
<Application.Resources>
  <ResourceDictionary>
    <ResourceDictionary.MergedDictionaries>
      <ResourceDictionary Source="Themes/Colors.xaml" />
      <ResourceDictionary Source="Themes/Spacing.xaml" />
      <ResourceDictionary Source="Themes/Typography.xaml" />
    </ResourceDictionary.MergedDictionaries>
  </ResourceDictionary>
</Application.Resources>
```

> The theme choice is locked in Stage 4. If `SfSkinManager` is used, skip generating `Themes/Colors.xaml`, `Themes/Spacing.xaml`, and `Themes/Typography.xaml` entirely — these files have no effect when Syncfusion theming is active.

---

### Deliverable 2: Code-Behind (.xaml.cs)

- `InitializeComponent()` first
- `DataContext = new <Feature>ViewModel()` immediately after
- `SfSkinManager.SetTheme(this, new Theme("<LockedThemeName>"))` in constructor
- **All event handler methods fully implemented** (never empty stubs)
- UI-only logic only; delegate business logic to ViewModel or Service

**App.xaml.cs — license + theme bootstrap:**
```csharp
protected override void OnStartup(StartupEventArgs e)
{
    base.OnStartup(e);
    SyncfusionLicenseProvider.RegisterLicense(
        Environment.GetEnvironmentVariable("SYNCFUSION_LICENSE_KEY"));
    SfSkinManager.ApplyStylesOnApplication = true;
}
```

**Window constructor pattern:**
```csharp
public LoginWindow()
{
    InitializeComponent();
    this.DataContext = new LoginViewModel();
    SfSkinManager.SetTheme(this, new Theme("Windows11Light")); // locked theme from Stage 4
}
```

---

### Deliverable 3: ViewModel (.cs)

- Implements `INotifyPropertyChanged`
- All bound properties raise `OnPropertyChanged`
- All commands use `RelayCommand` pattern with `CanExecute` and `Execute`
- Input validation logic (required fields, format checks)
- Error message property bound to XAML for inline feedback
- Calls Service layer for business logic — no inline business logic in ViewModel

**RelayCommand:** Include a standard `ICommand` implementation once per project (see Stage — Control Skill Extraction `skill-extraction.json` setup instructions or copy from project template).

---

### Deliverable 4: Service & Repository

- Service class contains all business logic for the screen's actions (e.g., `AuthService.ValidateCredentials`)
- Repository interface + in-memory implementation for data access (e.g., `IUserRepository`, `InMemoryUserRepository`)
- Navigation logic: on success → open target Window and close current; on failure → surface error via ViewModel
- Server-side validation independent of UI (validates inputs within the service itself)

---

### Deliverable 5: ResourceDictionary Files

Only generated when NOT using `SfSkinManager` theming (see Deliverable 1 App.xaml rules):
```xaml
<!-- Themes/Colors.xaml -->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
  <SolidColorBrush x:Key="PrimaryColorBrush"    Color="#007ACC" />
  <SolidColorBrush x:Key="BackgroundColorBrush" Color="#FFFFFF" />
  <SolidColorBrush x:Key="ErrorColorBrush"      Color="#E81B23" />
</ResourceDictionary>
```
Rules: unique `x:Key` per file; valid ARGB colors; semantic key names (`PrimaryColorBrush` not `Blue600`); no Syncfusion theme dictionaries in `MergedDictionaries`.

---

## Login Feature Example (UI + Backend — Abbreviated)

> Values below are illustrative. All namespaces, properties, and events are resolved from `skill-extraction.json` via the four registries before any file is written.

### LoginWindow.xaml
```xaml
<Window x:Class="WpfApp.Views.LoginWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:sf="clr-namespace:Syncfusion.UI.Xaml.TextInputLayout;assembly=Syncfusion.SfTextInputLayout.WPF"
        xmlns:btn="clr-namespace:Syncfusion.Windows.Tools.Controls;assembly=Syncfusion.Shared.WPF"
        Title="Login" Height="340" Width="420" WindowStartupLocation="CenterScreen">
  <Grid>
    <StackPanel VerticalAlignment="Center" HorizontalAlignment="Center" Width="320">
      <sf:SfTextInputLayout Hint="Email" Margin="0,0,0,12"
                            AutomationProperties.Name="Email address">
        <TextBox Text="{Binding Email, Mode=TwoWay, UpdateSourceTrigger=PropertyChanged}" />
      </sf:SfTextInputLayout>
      <sf:SfTextInputLayout Hint="Password" Margin="0,0,0,8"
                            AutomationProperties.Name="Password">
        <PasswordBox x:Name="PasswordBox" />
      </sf:SfTextInputLayout>
      <btn:ButtonAdv Label="Login" Command="{Binding LoginCommand}"
                     AutomationProperties.Name="Login button" />
      <TextBlock Text="{Binding ErrorMessage}" Foreground="Red" TextWrapping="Wrap" />
    </StackPanel>
  </Grid>
</Window>
```

### LoginWindow.xaml.cs
```csharp
public LoginWindow()
{
    InitializeComponent();
    this.DataContext = new LoginViewModel(new AuthService());
    SfSkinManager.SetTheme(this, new Theme("Windows11Light"));
    PasswordBox.PasswordChanged += (s, e) =>
        ((LoginViewModel)DataContext).Password = PasswordBox.Password;
}
```

### LoginViewModel.cs
> Pattern: `INotifyPropertyChanged` properties for `Email`, `Password`, `RememberMe`, `ErrorMessage`; `RelayCommand` for `LoginCommand` with `CanExecute` guard (non-empty fields); `ExecuteLogin` calls `AuthService.ValidateCredentials`, surfaces errors via `ErrorMessage`, navigates to `DashboardWindow` on success.

---

## Post-Generation Validation Rules (MANDATORY)

Run all checks after generating code. Fix failures before passing to Stage 6.

| # | Check | Fail Condition |
|---|---|---|
| 1 | **Control scope** | Any XAML control not present in `skill-extraction.json → controls[]`; any control assumed or invented |
| 2 | **Namespace consistency** | Namespace not taken from `skill-extraction.json → controls[].namespace`; duplicate or constructed prefixes |
| 3 | **Property & event validity** | Property or event not in `skill-extraction.json → valid_properties/valid_events`; event in XAML with no handler |
| 4 | **No empty handlers** | Any event handler or command execute method is empty / stub only |
| 5 | **DataContext set** | Any Window or UserControl missing `DataContext` assignment |
| 6 | **Binding resolution** | Any `{Binding X}` where `X` is not a property in the ViewModel |
| 7 | **Command resolution** | Any `{Binding XCommand}` where `XCommand` is not an `ICommand` in the ViewModel |
| 8 | **Service completeness** | Any service method called from ViewModel that is not implemented in the service class |
| 9 | **Navigation wired** | Complex layout: success path does not open target Window and close current |
| 10 | **ResourceDictionary integrity** | Any `{StaticResource X}` key not defined; duplicate `x:Key` in same file; invalid ARGB color |
| 11 | **Theme applied** | `SfSkinManager.SetTheme()` not called in every Window constructor; theme name differs from Stage 4 locked value |
| 12 | **MVVM map coverage** | Any interactive control missing a command or binding that was declared in Stage 4 Section 8A |
| 13 | **Page/component type** | `generate_window` → must produce `Window` class; `generate_usercontrol` → must produce `UserControl` |

**⛔ Failure on any check → fix before Stage 6. Do not proceed with broken code.**

---

## Code Generation Standards

| Standard | Rule |
|---|---|
| **APIs** | Only use properties, events, and methods listed in `skill-extraction.json → valid_properties/valid_events/valid_methods` — never invent or assume |
| **Packages** | Only use `nuget_package` + `nuget_version` from `skill-extraction.json` — never guess |
| **Controls in scope** | Only controls present in `skill-extraction.json → controls[]` may appear in any generated file |
| **Theme** | `SfSkinManager.SetTheme()` per Window; `SfSkinManager.ApplyStylesOnApplication = true` in `OnStartup()` |
| **MVVM** | Business logic in Service; coordination in ViewModel; UI-only code in code-behind |
| **Accessibility** | `AutomationProperties.Name` + `HelpText` on all interactive controls; min 44×44 DIP touch target |
| **Bindings** | `Mode=TwoWay, UpdateSourceTrigger=PropertyChanged` for inputs; `Mode=OneWay` for display |
| **Responsive** | `Grid` with `*` sizing; `StackPanel` for vertical; never hardcode fluid column widths |
| **Performance** | `VirtualizingStackPanel` for large lists; `async/await` for I/O; no `Task.Wait()` on UI thread |
| **Security** | No hardcoded credentials or secrets in XAML or code-behind |

## Workflow Summary

```
Step 1:  Read control-mapping.json → extract all controls
    ↓
Step 1A: 🔴 CONTROL VALIDATION GATE (blocking)
         → NATIVE_XAML / ✗ FALLBACK / ✗ NO_MATCH / score < 10 → ❌ HALT
    ↓
Step 2:  🔴 ATOMIC SKILL VALIDATION GATE (blocking)
         For each control:
         → Locate skill folder               ❌ Missing → HALT
         → Read SKILL.md (PRIMARY)           ❌ Missing → HALT
         → Read getting-started.md           ❌ Missing → HALT
         → Extract namespace                 ❌ Not found → HALT
         → Verify properties/events          ❌ Not in file → HALT
         → Validate NuGet package            ❌ Not listed / version conflict → HALT
         → Read feature guides (from SKILL.md guidance) ❌ Missing → HALT
         → Read theme skill file             ❌ Missing → HALT
         ALL pass ✅ → gate cleared
    ↓
Step 3:  🔴 READ skill-extraction.json + skill files (blocking, per control)
         → JSON exists + PASS; every control has entry; SKILL.md + skill file re-read → ❌ else HALT
         → Only controls in JSON may appear in output
    ↓
Step 3A: 🔴 READ STAGE 4 THEMING & DESIGN SYSTEM (blocking)
         → Load: locked_theme_name, MVVM map, color/spacing strategy → ❌ empty theme → HALT
         → Every interactive control must have MVVM binding from Stage 4 Section 8A → ❌ else HALT
    ↓
Step 4:  🔴 DETECT TARGET FRAMEWORK (blocking)
         → Confirm WPF; reject WinUI/MAUI/UWP → ❌ HALT if mismatch
         → Lock WPF base namespace + Syncfusion namespace source
    ↓
Step 5:  🔴 NAMESPACE & PROPERTY COMPATIBILITY (blocking)
         → 5A: All xmlns = WPF base or skill-extraction.json → ❌ HALT on WinUI/UWP/MAUI namespace
         → 5B: Blocked WPF properties (RowSpacing, x:Bind, etc.) → ❌ HALT if detected
    ↓
Generate: XAML + Code-Behind + ViewModel + Service + Repository + ResourceDictionary
    ↓
Post-Validation: Run all 12 checks → fix failures
    ↓
✅ Pass to Stage 6 (NuGet dependency management)
```

**User Interaction:** Optional review. AI generates without blocking confirmation.