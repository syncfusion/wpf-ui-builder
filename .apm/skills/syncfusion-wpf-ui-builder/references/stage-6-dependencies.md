# Stage 6: Dependencies

**Purpose:** Detect required NuGet packages, resolve version conflicts, prepare NuGet restore command.

---

## ⚠️ CRITICAL: Verify NuGet Packages from Skill Files BEFORE Installing

**The `skill_hint` values from Stage 3 (e.g., `syncfusion-wpf-datagrid`, `syncfusion-wpf-button`) are REFERENCE LABELS ONLY - NOT NuGet package names.**

**Before installing ANY NuGet package:**

1. **Look up the official NuGet package name** from the control skill file:
   - Path format: `.apm/WPF/skills/<skill-name>/SKILL.md`
   - Example: For `syncfusion-wpf-datagrid` → Read `.apm/WPF/skills/syncfusion-wpf-datagrid/SKILL.md`
   - The skill file contains the **official NuGet package name** (e.g., `Syncfusion.SfDataGrid.WPF`)

2. **Check the Getting Started section** in each skill file for:
   - Required NuGet package names
   - Version requirements
   - Dependencies between packages

3. **Skill File Discovery Paths** (check in order):
   - `.apm/WPF/skills/<skill-name>/SKILL.md`
   - `.codestudio/skills/<skill-name>/SKILL.md`
   - `.agent/skills/<skill-name>/SKILL.md`
   - `.agents/skills/<skill-name>/SKILL.md`
   - `.github/skills/<skill-name>/SKILL.md`
   - `skills/<skill-name>/SKILL.md`

---

## AI Should:

1. **Detect Required Packages:**
   - Scan generated XAML and C# code
   - List all `skill_hint` values from Stage 3 (e.g., `syncfusion-wpf-datagrid`, `syncfusion-wpf-chart`)
   - **Look up official NuGet package name** from corresponding skill file

2. **Check Project's .csproj file:**
   - What NuGet packages already installed?
   - What versions are currently in use?
   - Any version conflicts?

3. **Resolve Conflicts:**
   - If Syncfusion WPF package already installed:
     - Is version compatible with .NET target framework?
     - Suggest upgrade if needed
   - If framework dependencies conflict:
     - Recommend resolution (.NET Framework 4.6.2+ vs .NET Core 8+, upgrade Syncfusion.Licensing match)

4. **Prepare Installation Command:**
   - Generate NuGet restore command via dotnet CLI or Package Manager Console
   - List packages to add (using **official NuGet names from skill files**)
   - List packages to upgrade (if needed)

**Example Output:**

```
✓ Dependency Analysis

Control to NuGet Package Mapping (verified in skill files):
┌─────────────────────────────┬────────────────────────────┬──────────────────────┐
│ Skill Reference            │ Official NuGet Package      │ Source               │
├─────────────────────────────┼────────────────────────────┼──────────────────────┤
│ syncfusion-wpf-maskedtextbox│ Syncfusion.SfInput.WPF     │ skill file verified  │
│ syncfusion-wpf-button      │ Syncfusion.Shared.WPF       │ skill file verified  │
│ syncfusion-wpf-datagrid    │ Syncfusion.SfDataGrid.WPF  │ skill file verified  │
└─────────────────────────────┴────────────────────────────┴──────────────────────┘

New Packages to Install:
  - Syncfusion.SfInput.WPF (Latest)
  - Syncfusion.Shared.WPF (Latest)
  - Syncfusion.SfDataGrid.WPF (Latest)

Existing Packages:
  ✓ Syncfusion.Licensing (Latest) (compatible)
  ✓ CommunityToolkit.Mvvm (Latest) (compatible)

Conflicts: None

Install Command (NuGet Package Manager Console):
PM> Install-Package Syncfusion.SfInput.WPF
PM> Install-Package Syncfusion.Shared.WPF
PM> Install-Package Syncfusion.SfDataGrid.WPF

Alternatively with dotnet CLI:
$ dotnet add package Syncfusion.SfInput.WPF
$ dotnet add package Syncfusion.Shared.WPF
$ dotnet add package Syncfusion.SfDataGrid.WPF

Or restore entire project:
$ dotnet restore
```

**IMPORTANT:** Always verify NuGet package names in skill files before installing. Example:
- `syncfusion-wpf-textinputlayout` → NuGet: `Syncfusion.SfInput.WPF` (NOT `Syncfusion.SfTextInputLayout.WPF`)

**⚠️ CRITICAL RUNTIME ISSUE PREVENTION - NuGet Dependencies:**

1. **SfSkinManager Assembly Requirement (Runtime Fix):**
   - If using Syncfusion themes in Stage 5, MUST add: `Syncfusion.SfSkinManager.WPF`
   - Without this, `SfSkinManager.SetTheme()` call will result in "Type not found" runtime error
   - Add to dependency list BEFORE user installs

2. **Licensing Assembly Requirement (Runtime Fix):**
   - If using any Syncfusion control, MUST add: `Syncfusion.Licensing`
   - Without this, license registration code will not compile
   - Add to dependency list BEFORE user installs

3. **Theme Package Requirement (Runtime Fix):**
   - After selecting theme in Stage 4 (e.g., "Windows11Light"), MUST install corresponding theme package
   - Example mapping from Stage 4 decision:
     - Theme "Windows11Light" → Package: `Syncfusion.Themes.Windows11Light.WPF`
     - Theme "FluentDark" → Package: `Syncfusion.Themes.FluentDark.WPF`
     - Theme "Material3Light" → Package: `Syncfusion.Themes.Material3Light.WPF`
   - Without theme package, controls render with default styling and SfSkinManager.SetTheme() throws assembly load error
   - Add to dependency list matching Stage 4 theme selection

4. **Syncfusion.Core.WPF Base Package (Runtime Fix):**
   - This is the foundational package for all Syncfusion WPF controls
   - Always include in initial install to prevent "Type initializer threw exception" errors
   - Ensures all shared assemblies are available

5. **Version Compatibility (Runtime Fix):**
   - All Syncfusion WPF packages MUST use SAME version to prevent assembly mismatch errors
   - Example: If installing `Syncfusion.SfDataGrid.WPF@33.2.6`, then:
     - `Syncfusion.SfInput.WPF@33.2.6` (SAME version)
     - `Syncfusion.Themes.Windows11Light.WPF@33.2.6` (SAME version)
     - `Syncfusion.Licensing@33.2.6` (SAME version)
   - Mixed versions cause: "Type X in assembly Y does not match type in assembly Z" runtime error
   - AI must enforce: Extract base version from first Syncfusion package, apply to ALL others

**Updated NuGet Installation Command:**

```
Install Command (With Runtime Issue Fixes):
PM> Install-Package Syncfusion.Core.WPF -Version 33.2.6
PM> Install-Package Syncfusion.Licensing -Version 33.2.6
PM> Install-Package Syncfusion.SfSkinManager.WPF -Version 33.2.6
PM> Install-Package Syncfusion.Themes.Windows11Light.WPF -Version 33.2.6
PM> Install-Package Syncfusion.SfInput.WPF -Version 33.2.6
PM> Install-Package Syncfusion.SfDataGrid.WPF -Version 33.2.6

Alternatively with dotnet CLI:
$ dotnet add package Syncfusion.Core.WPF --version 33.2.6
$ dotnet add package Syncfusion.Licensing --version 33.2.6
$ dotnet add package Syncfusion.SfSkinManager.WPF --version 33.2.6
$ dotnet add package Syncfusion.Themes.Windows11Light.WPF --version 33.2.6
$ dotnet add package Syncfusion.SfInput.WPF --version 33.2.6
$ dotnet add package Syncfusion.SfDataGrid.WPF --version 33.2.6
```

**User Interaction:**
User confirms NuGet restore or does it manually:
```
Ready to restore NuGet packages?
[Restore] [Show Command] [Skip]
```

**Status:** AI detects and prepares with runtime issue fixes. User decides whether to restore now or later (typically done automatically on project load in Visual Studio).
