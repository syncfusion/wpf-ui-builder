# Stage 2: Project Detection & Setup

**Purpose:** Detect or create the WPF project, enforce standardized structure, read skill files to identify dependencies, install only validated packages, and confirm a clean build before Stage 3 begins.

---

## Step 1: Detect Existing Project

Scan workspace root and subdirectories for:
- `.sln` file
- `<ProjectName>.csproj`
- `App.xaml` and `App.xaml.cs`

| Result | Action |
|---|---|
| Solution + project found | → Proceed to Step 3 (Auto-Detection) |
| Not found | → Proceed to Step 2 (Create Project) |

---

## Step 2: Create New WPF Project (if missing)

### 2a. Collect Project Name
- Ask user for a project name (alphanumeric only; auto-replace spaces with underscores)

### 2b. Scaffold Project (Primary Command)

Navigate to the desired workspace root and run:
```bash
dotnet new wpf -n <ProjectName>
```

This single command scaffolds the complete WPF template:
```
<ProjectName>/
├── <ProjectName>.csproj
├── App.xaml
├── App.xaml.cs
├── MainWindow.xaml
└── MainWindow.xaml.cs
```

### 2c. Verify Created Files
- `<ProjectName>.csproj` exists at projectRoot
- `App.xaml`, `App.xaml.cs`, `MainWindow.xaml` exist

⛔ **If any file is missing → report dotnet CLI error and halt.**

---

## Step 3: Auto-Detect Project Settings

| Setting | How to Detect | Default |
|---|---|---|
| Framework | Read `<TargetFramework>` in `.csproj` | `net10.0-windows` |
| Language | Presence of `.cs` + `.xaml` files | C# with XAML |
| Styling strategy | Scan for `ResourceDictionary` `.xaml` files | XAML ResourceDictionary |
| Control directory | Scan for `Views/`, `Controls/`, `UserControls/` | `Views/` |
| Code style | Read `.editorconfig` / `.stylecop.json` | StyleCop defaults |
| Syncfusion version | Scan `.csproj` for `Syncfusion.Sf*.WPF` package version | Latest stable (Step 5) |

---

## Step 4: Validate WPF Compatibility

- Confirm `<UseWPF>true</UseWPF>` in `.csproj`
- Confirm target framework is `net462` or `net10.0-windows` (or newer)
- Confirm `App.xaml.cs` has `OnStartup()` method — flag for Stage 5 to generate if missing
- ⛔ **BLOCK** if project targets a non-Windows framework (WPF is Windows-only)

---

## Step 5: Apply MVVM Folder Structure

Create any missing folders inside `<ProjectName>/`:

```
<ProjectName>/
├── Models/           # Data models and DTOs
├── ViewModels/       # INotifyPropertyChanged ViewModels
├── Views/            # XAML Windows and UserControls
├── Services/         # Business logic and backend services
├── Repositories/     # Data access interfaces + in-memory implementations
└── Themes/           # Custom ResourceDictionary files (Colors, Spacing, Typography)
```

Verify / update `App.xaml`:
- `StartupUri` must point to an existing Window file
- ❌ Do NOT use `<ResourceDictionary.MergedDictionaries>` for Syncfusion themes — themes are applied in code via `SfSkinManager`
- ✅ Only custom resources (colors, brushes, spacing) go in `<Application.Resources>`
- Syncfusion theme is bootstrapped in `App.xaml.cs` `OnStartup()`:
  ```csharp
  SfSkinManager.ApplyStylesOnApplication = true;
  // Per-Window: SfSkinManager.SetTheme(this, new Theme("Windows11Light"));
  ```
- Refer to `references/stage-4-theming-and-design-system.md` for the full resource structure

---

## Step 6: Read Skill Files & Detect Dependencies (MANDATORY — Before Any Package Installation)

⛔ **CRITICAL RULE: Do NOT assume, guess, or hardcode package names. All dependencies MUST come from skill files.**

### 6a. Identify Required Skill Files
- Read `control-mapping.json` (from Stage 3 if already available) or infer from Stage 1 intent
- For each mapped control, locate the skill folder:
  `<skills-root>/syncfusion-wpf-<control-name>/`
  where `<skills-root>` is one of: `.codestudio/skills`, `.agent/skills`, `.agents/skills`, `.github/skills`, `skills`

### 6b. Extract from Each Skill File (Mandatory Pre-Installation Step)
**Do NOT proceed without completing all sub-steps:**
- Read: `<skill-folder>/SKILL.md` or `<skill-folder>/references/getting-started.md`
- Extract **exactly** as documented:
  - ✅ Official NuGet package name (copy verbatim, e.g., `Syncfusion.SfDataGrid.WPF`, NOT inferred names)
  - ✅ Minimum or pinned version (if skill file specifies)
  - ✅ Any dependent packages (listed under Prerequisites)
- If skill file is missing or package name is ambiguous → **HALT and report error**

### 6c. Validate & Resolve Version Strategy

| Scenario | Version Rule |
|---|---|
| Existing Syncfusion packages in `.csproj` | Compare to latest stable; suggest upgrade if gap > 2 minor versions; lock user's choice for ALL packages |
| No existing Syncfusion packages | Query latest stable: `dotnet package search Syncfusion.Shared.WPF --exact`; use that version for ALL packages |

- ❌ Do NOT install outdated versions
- ❌ Do NOT install packages not listed in a skill file
- ✅ All Syncfusion packages must use the **same resolved version**
- Log resolved version as: `resolved_syncfusion_version: "<version>"`

---

## Step 7: Install Validated Packages

Install only packages extracted from skill files in Step 6, using the resolved version:

```bash
# Core packages (always required — extracted from skill files)
dotnet add package Syncfusion.Shared.WPF      --version <resolved_version>
dotnet add package Syncfusion.Licensing        --version <resolved_version>

# Control-specific packages (from skill files only — examples)
dotnet add package Syncfusion.SfDataGrid.WPF  --version <resolved_version>
dotnet add package Syncfusion.SfInput.WPF     --version <resolved_version>

# Theme package (deferred — installed after Stage 4 confirms theme name)
# dotnet add package Syncfusion.Themes.<ThemeName>.WPF --version <resolved_version>
```

Syncfusion license handling:
- Check `App.xaml.cs` and `SYNCFUSION_LICENSE_KEY` env var
- Missing → prompt: *"Get a free Community License at https://www.syncfusion.com/account/manage-trials"*
- Provided → inject into `appsettings.json` + add `SyncfusionLicenseProvider.RegisterLicense()` to `OnStartup()`
- Skipped → warn that a watermark will appear on Syncfusion controls

Run restore and confirm no errors:
```bash
dotnet restore
```

⛔ **If restore fails → report error and halt.**

---

## Step 8: Validate Build

```bash
dotnet build
```

- **PASS (0 errors)** → Lock settings and proceed to Stage 3
- **FAIL** → Report errors, attempt auto-fix (missing references, namespace issues), retry once; halt if still failing

---

## Validation Checklist

| # | Check | Rule |
|---|---|---|
| 1 | `projectRoot` structure correct | `.sln` and `.csproj` both exist at projectRoot; `.sln` links the `.csproj` |
| 2 | Solution structure correct | `dotnet sln` links `.csproj`; no orphaned projects |
| 3 | WPF compatibility confirmed | `<UseWPF>true</UseWPF>` + Windows target framework |
| 4 | MVVM folders created | `Models/`, `ViewModels/`, `Views/`, `Services/`, `Repositories/`, `Themes/` |
| 5 | Skill files read before install | No package installed without reading its `getting-started.md` |
| 6 | Only skill-validated packages installed | Zero assumed or hardcoded package names |
| 7 | Single Syncfusion version locked | All packages use identical `resolved_syncfusion_version` |
| 8 | Latest stable version used | No outdated or pinned-to-old versions |
| 9 | Syncfusion theme NOT in `MergedDictionaries` | Applied via `SfSkinManager` only |
| 10 | Build passes | `dotnet build` exits with 0 errors |

> **Resource integrity checks** (StaticResource keys, ARGB color validity, DataContext assignments, binding paths) are flagged here and auto-fixed by Stage 5 during code generation.

---

## User Confirmation

Present locked settings before proceeding to Stage 3:

```
✓ Solution:            <ProjectName>/<ProjectName>.sln
✓ Project:             <ProjectName>/<ProjectName>.csproj
✓ Framework:           .NET 10 (net10.0-windows)
✓ Language:            C# with XAML
✓ Control Directory:   Views/
✓ Skill Files Read:    syncfusion-wpf-datagrid, syncfusion-wpf-textinputlayout, ...
✓ Syncfusion Version:  <resolved_version> (latest stable)
✓ App.xaml.cs:         OnStartup() present
✓ Folder Structure:    Models/ ViewModels/ Views/ Services/ Repositories/ Themes/
✓ Build:               PASS

[Confirm] [Override] [Cancel]
```

- **Confirm** → Stage 3 proceeds with all settings locked
- **Override** → User specifies custom values (version, directory, theme)
- **Cancel** → Halt; do not proceed