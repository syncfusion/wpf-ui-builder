# Stage 6: Dependencies

**Purpose:** Detect required NuGet packages from skill files, resolve versions, deduplicate, and prepare installation commands.

---

## ⛔ MANDATORY RULE: No Assumptions — Skill Files ONLY

**Before adding ANY NuGet package:**
1. ✅ Read `skill-extraction.json` (produced by Stage — Control Skill Extraction) to access pre-extracted package data
2. ✅ Verify all controls in `skill-extraction.json` have `validation_status: "PASS"` 
3. ✅ Extract **exact** package name from `nuget_package` field (already verified in Stage — Control Skill Extraction)
4. ✅ Use **version from Stage 2 detection** (matching Syncfusion version in project)
5. ✅ Never assume, infer, or guess package names or versions

**Why this matters:**
- ❌ `syncfusion-wpf-textinputlayout` ≠ `Syncfusion.SfTextInputLayout.WPF` (actual: `Syncfusion.SfInput.WPF`)
- ❌ Guessing versions causes assembly mismatches and runtime failures
- ✅ Only `skill-extraction.json` (pre-validated) is authoritative for package resolution

**Rejection criteria:** 
- ❌ Any control missing from `skill-extraction.json`
- ❌ Any entry with `validation_status != "PASS"`
- ❌ Any package NOT explicitly in `nuget_package` field
- ❌ Any version mismatch from Stage 2 detection

**Consequence:** Do not proceed with installation if package source cannot be verified in `skill-extraction.json`.

---

## ⛔ ERROR HANDLING: Missing Syncfusion Control ('does not exist in namespace...')

**Common error in Stage 5-6:**
- ❌ `'SfTextInputLayout' does not exist in namespace 'http://schemas.syncfusion.com/wpf'`
- ❌ `XAML Compilation Error: Type X not found`

**Root cause:** NuGet package not installed OR package name guessed/assumed

**Mandatory fix:**
1. ✅ Read `control-mapping.json` to identify which controls are mapped
2. ✅ For each control, read the corresponding skill file (`getting-started.md`)
3. ✅ Extract EXACT NuGet package name (e.g., `Syncfusion.SfInput.WPF` for `SfTextInputLayout`)
4. ✅ Install package using latest stable version from NuGet registry
5. ⛔ If package name is unclear or missing from skill file → HALT. Do NOT attempt to install guessed names
6. ⛔ DO NOT fallback to Microsoft native controls (e.g., `TextBox`, `ComboBox`) — Syncfusion skill file is authoritative

**Verification:** After installation, run `dotnet build` to confirm namespace resolution before proceeding to Stage 7.

---

## 🔴 Stage 6 Entry Gate: Reject Non-Verified Controls

**BLOCKING check before any dependency resolution:**

```
IF skill-extraction.json missing:
  → ❌ HALT: "Stage — Control Skill Extraction not completed. Cannot identify NuGet packages."

FOR EACH control in skill-extraction.json:
  IF validation_status != "PASS":
    → ❌ HALT: "Control validation failed. Check Stage — Control Skill Extraction output."
  
  IF nuget_package == null OR nuget_package == "":
    → ❌ HALT: "NuGet package undefined for control. Skill file missing?"

ALL checks pass → ✅ Gate cleared. Proceed to Step 1.
ANY check fails → ❌ HALT. Do NOT proceed to dependency installation.
```

---

## 6-Step Dependency Workflow

### Step 1: Read `skill-extraction.json` & Identify Packages
- Load: `<project-root>/skill-extraction.json` (pre-validated from Stage — Control Skill Extraction)
- For each control entry:
  - Use `nuget_package` field directly (already extracted + verified in Stage — Control Skill Extraction)
  - Use `nuget_version` field to match project's Syncfusion version
- **Output:** Control → Official Package mapping (pre-verified, no re-extraction needed)

### Step 2: Scan Project .csproj
- Check existing Syncfusion packages and versions
- Identify framework target (net10.0, net462, etc.)
- List already-installed dependencies
- **Output:** Current project state

### Step 3: Resolve Versions

**Version detection priority (apply in order — stop at first success):**

```
1. Read Stage 2 output → syncfusion_version field
   IF version found AND non-empty → use it for ALL Syncfusion packages

2. Scan <ProjectName>.csproj for any existing Syncfusion package version
   IF found (e.g., <PackageReference Include="Syncfusion.Shared.WPF" Version="*" />)
   → extract that version → apply to ALL new Syncfusion packages

3. Query NuGet registry:
   dotnet package search Syncfusion.Shared.WPF --exact
   IF latest stable version returned → use it

4. IF version CANNOT be determined by any method above:
   ❌ Do NOT guess a version number
   ✅ Use version="*" — this resolves to the highest available stable version at install time

   Install command with wildcard:
   $ dotnet add package Syncfusion.SfDataGrid.WPF

   (omitting --version lets NuGet resolve the latest stable automatically)
```

**Wildcard (`*`) rule:**

| Scenario | Version Strategy |
|---|---|
| Stage 2 version locked | Use exact version (e.g., `--version 33.2.10`) for ALL packages |
| Existing Syncfusion package found in `.csproj` | Extract and reuse that version for ALL packages |
| NuGet registry query succeeds | Use returned latest stable version |
| Version unknown — cannot determine | Omit `--version` flag (NuGet defaults to latest stable) |

> ⚠️ **Uniformity rule:** Once a version is resolved by any method, ALL Syncfusion packages in the project MUST use that same version. Mixing versions across packages causes assembly mismatch errors at runtime.
> ⚠️ **No guessing:** Never hardcode a version number that was not retrieved from Stage 2, the `.csproj`, or the NuGet registry. An unknown version is not a reason to invent one — it is a reason to use the wildcard strategy above.

- **Output:** Resolved version string (e.g., `33.2.10`) OR wildcard strategy confirmed with reason logged

### Step 3A: 🔴 DETECT THEME PACKAGE (BLOCKING — CRITICAL)

**If SfSkinManager.Theme is used in any XAML file → theme package MUST be installed. Non-negotiable.**

```
SEARCH all generated XAML files for:
  • syncfusion:SfSkinManager.Theme="{...}"
  • SfSkinManager.SetTheme(...)
  
IF found:
  1. Extract locked theme name from Stage 4 output
     (e.g., ThemeName="MaterialDark", "Windows11Light", "Office2019Blue")
  2. Construct package name: Syncfusion.Themes.<ThemeName>.WPF
  3. Add to core dependencies list with REQUIRED flag
  
  IF theme name unknown or missing from Stage 4:
  → ❌ HALT: "Theme selected but name not recorded in Stage 4. 
               Cannot determine package name."
               
  IF package name cannot be constructed:
  → ❌ HALT: "Invalid theme name '<value>' — cannot map to NuGet package"
  
  ✅ Package identified → proceed to version resolution
     (use same version as all other Syncfusion packages)

THEME PACKAGE VALIDATION:
  • Package name format: Syncfusion.Themes.<ThemeName>.WPF (exact case-sensitive match)
  • Must match Syncfusion version
  • Common themes: Windows11Light, Windows11Dark, MaterialLight, MaterialDark, Office2019Blue, Fluent, Bootstrap5
```

**Common theme package mappings:**
| Theme Name (Stage 4) | NuGet Package |
|---|---|
| Windows11Light | Syncfusion.Themes.Windows11Light.WPF |
| Windows11Dark | Syncfusion.Themes.Windows11Dark.WPF |
| MaterialLight | Syncfusion.Themes.MaterialLight.WPF |
| MaterialDark | Syncfusion.Themes.MaterialDark.WPF |
| Fluent | Syncfusion.Themes.Fluent.WPF |

**Output:** Theme package name confirmed OR ⛔ HALT with reason

---

### Step 4: Add Required Core Packages (Always)
- `Syncfusion.Shared.WPF` — foundational package
- `Syncfusion.Licensing` — license registration
- `Syncfusion.SfSkinManager.WPF` — theme support
- Theme package (detected in Step 3A if SfSkinManager.Theme used, e.g., `Syncfusion.Themes.MaterialDark.WPF`)
- **Output:** Core dependencies confirmed

### Step 5: Deduplicate & Consolidate
- Remove duplicate package entries across controls
- Consolidate shared dependencies (e.g., `Syncfusion.Shared.WPF` used by multiple controls)
- List final unique packages with version
- **Output:** Final package list (no duplicates)

### Step 6: Prepare Installation Command
- Generate NuGet restore/install commands for new packages
- Include version for each package (matching Stage 2 version)
- Exclude already-installed packages
- **Output:** Ready-to-execute install command

---

## Validation Rules (MANDATORY)

| Check | Valid? | Action |
|-------|--------|--------|
| All package names verified in skill files? | ✅ Yes / ❌ No | Halt if not verified; re-read skill files |
| Version resolved (exact or wildcard)? | ✅ Yes / ❌ No | Use wildcard if version unknown — never guess a number |
| All Syncfusion packages same version? | ✅ Yes / ❌ No | Enforce uniform version; wildcard counts as uniform if no version known |
| Core packages included (Core, Licensing, SfSkinManager, Theme)? | ✅ Yes / ❌ No | Add missing core packages |
| **SfSkinManager.Theme detected AND theme package included?** | ✅ Yes / ❌ No | **⛔ HALT if theme used but package missing** |
| No duplicate packages in final list? | ✅ Yes / ❌ No | Remove duplicates |
| Package versions compatible with framework? | ✅ Yes / ❌ No | Suggest upgrade or compatible version |

---

## Output Format

```
✓ Dependency Analysis

Skill File → NuGet Package Mapping:
  • syncfusion-wpf-datagrid → Syncfusion.SfDataGrid.WPF (verified)
  • syncfusion-wpf-textinput → Syncfusion.SfInput.WPF (verified)
  • syncfusion-wpf-button → Syncfusion.Shared.WPF (verified)

Core Dependencies (Required):
  • Syncfusion.Shared.WPF
  • Syncfusion.Licensing
  • Syncfusion.SfSkinManager.WPF
  • Syncfusion.Themes.Windows11Light.WPF

Control Dependencies (From Skill Files):
  • Syncfusion.SfDataGrid.WPF(new)
  • Syncfusion.SfInput.WPF(new)

Already Installed:
  • Syncfusion.Shared.WPF ✓

Conflicts: None

Install Command (dotnet CLI — version unknown, wildcard strategy):
  $ dotnet add package Syncfusion.Shared.WPF
  $ dotnet add package Syncfusion.Licensing
  $ dotnet add package Syncfusion.SfSkinManager.WPF
  $ dotnet add package Syncfusion.Themes.Windows11Light.WPF
  $ dotnet add package Syncfusion.SfDataGrid.WPF
  $ dotnet add package Syncfusion.SfInput.WPF
  ⚠️ Run `dotnet restore` then verify all resolved versions match in .csproj before proceeding
```

---

## Critical Rules

⚠️ **ALWAYS:**
1. Read skill files BEFORE assuming package names
2. If version cannot be detected from Stage 2, `.csproj`, or NuGet registry → omit `--version` flag (wildcard); never invent a version number
3. Enforce uniform Syncfusion version across all packages
4. Include ALL core packages (Core, Licensing, SfSkinManager, Theme) regardless of controls
5. Validate package names exactly match skill file documentation

⚠️ **RUNTIME ISSUE PREVENTION:**
- **Missing Syncfusion.Shared.WPF** → "Type initializer threw exception"
- **Missing Syncfusion.Licensing** → License registration fails, watermark appears
- **Missing Syncfusion.SfSkinManager.WPF** → Theme initialization fails, "Type not found"
- **Missing theme package** → Controls render with generic styling, assembly load error
- **Version mismatch across Syncfusion packages** → "Type X in assembly Y does not match type in assembly Z"

---

## User Interaction

```
✓ All dependencies detected and validated
✓ No conflicts found
✓ Installation command ready

[✓ Install Now] [📋 Show Command] [⏭️ Skip for Later]
```

**Status:** Ready for Stage 7. User can install immediately or manually after code insertion in Stage 9.