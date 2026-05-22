# Stage 2: Project Detection

**Purpose:** Auto-detect project structure, framework, language, and configuration to ensure generated code integrates seamlessly.

## Pre-Detection Check: Project Existence Validation

**Step 1: Scan for Existing WPF Project**
- Search for `.csproj` file in workspace root and subdirectories
- Search for `.sln` file (solution file)
- Search for `App.xaml` and `App.xaml.cs` files
- **Result:** Project found → Proceed to auto-detect project settings
- **Result:** Project NOT found → Proceed to Step 2

**Step 2: If NO Project Found - Create New WPF Template**

**Command Execution Steps:**
1. **Determine Project Name** 
   - Ask user for desired project name (e.g., "MyWpfApp", "AdminDashboard")
   - Validate: Name contains only alphanumeric characters and no spaces
   - Sanitize: Replace spaces with underscores if needed
   
2. **Create WPF Template Using dotnet CLI**
   - Navigate to workspace root directory
   - Execute: `dotnet new wpf -n <projectname>`
   - **Example:** `dotnet new wpf -n MyWpfApp`
   - **Expected Output:** 
     - `.csproj` file created with WPF project structure
     - `App.xaml` and `App.xaml.cs` created
     - `MainWindow.xaml` and `MainWindow.xaml.cs` created
     - Default folder structure initialized
   
3. **Post-Creation Verification**
   - Verify `.csproj` file exists: `<ProjectName>.csproj`
   - Verify `App.xaml.cs` with `OnStartup()` method exists
   - Verify `MainWindow.xaml` exists
   - **If verification FAILS:** Troubleshoot dotnet CLI installation or permissions
   - **If verification SUCCEEDS:** Project ready for auto-detection
   
4. **Restore NuGet Dependencies**
   - Execute: `dotnet restore`
   - Verify: No errors in restore process
   - **Expected:** `obj/project.assets.json` created
   
5. **Proceed to Auto-Detection**
   - Continue to detection steps 1-10 below with newly created project

## Project Auto-Detection (After Project Verification)

**Once project exists (either pre-existing or newly created), proceed with auto-detection:**

1. **Framework Type**
   - Scan for: `.csproj`, `packages.config`, `.sln`
   - Detect: .NET Framework 4.6.2+, .NET Core 8+, WPF structure
   - Create template: `dotnet new wpf -n <projectname>`
   
2. **Language Preference**
   - Check for: `.csproj` → C# enabled
   - Check for: `.cs` vs `.xaml` files in project or src/
   - Default: C# with XAML markup
   
3. **Styling Strategy**
   - Check for: `ResourceDictionary` files (`.xaml`)
   - Check for: Theme files (Fluent, Material, Office2019)
   - Default: XAML ResourceDictionary with theme support
   
4. **Control Directory**
   - Common paths: `Views/`, `Controls/`, `UserControls/`
   - Find existing UserControl/Window patterns
   
5. **Code Style Rules**
   - Read `.editorconfig` for indent, line length
   - Read `.stylecop.json` for C# style rules
   - Apply same rules to generated XAML and C# code
   
6. **Syncfusion License & NuGet Versioning**
   - Check: Is Syncfusion license key registered in `App.xaml.cs` or `App.config`?
   - Check: Is license key available from environment variables (`SYNCFUSION_LICENSE_KEY`)?
   - Check: Does project already reference `Syncfusion.Licensing` NuGet?
   - Prompt: If missing, ask user for license key or set environment variable
   
7. **Syncfusion NuGet Version Detection**
   - **Scan `.csproj` or `packages.config` for existing Syncfusion packages:**
     - If `Syncfusion.Sf*.WPF` exists: Extract version (e.g., `20.4.0.56`)
     - Use SAME version for all new Syncfusion packages → Prevents version conflicts
   - **If NO existing Syncfusion packages found:**
     - Use latest stable version for all new packages: `Syncfusion.SfGrid.WPF@20.4.0.56`
   - **Document version decision:** Log detected version in stage output
   
8. **App.xaml.cs Verification (Runtime Issue Prevention)**
   - Check: Does `App.xaml.cs` exist with proper OnStartup() method?
   - Required for: License registration, SfSkinManager initialization
   - If missing or incomplete: Flag for Stage 5 to generate template

9. **Project Structure Validation (Runtime Issue Prevention)**
   - Check: Does project have `Themes/` folder or similar for ResourceDictionaries?
   - Check: Does project have `Views/` or `Controls/` folder for generated controls?
   - Check: Does App.xaml have `<Application.Resources>` section ready for theme MergedDictionaries?
   - If any missing: Generate folder structure or update App.xaml to prevent runtime resource loading errors

10. **Resource File & ResourceDictionary Validation (CRITICAL - Runtime Issue Resolution)**
    
    **⚠️ Critical Runtime Issue:** Improper resource file handling is the PRIMARY cause of runtime errors in WPF Syncfusion applications. During code generation, agents MUST verify resource files are properly created, formatted, and referenced.
    
    **A. App.xaml Resource Dictionary Structure Audit:**
    - Check: Does `App.xaml` have `<Application.Resources>` with `<ResourceDictionary>` wrapper?
    - Check: Are theme ResourceDictionaries properly merged via `<ResourceDictionary.MergedDictionaries>`?
    - Check: Is merge order correct? (Theme MUST be first, custom styles second)
    - Document: All merged ResourceDictionary sources and their file paths
    - **Issue:** If `<ResourceDictionary.MergedDictionaries>` missing or empty → Theme colors/brushes not available at runtime
    - **Issue:** If merge order wrong (custom before theme) → Custom styles override theme, breaking Syncfusion controls
    - **Issue:** If App.xaml missing `<Application.Resources>` entirely → All controls render with hardcoded defaults
    - **Fix:** Generate/update App.xaml with proper ResourceDictionary structure during Stage 5
    
    **B. Generated ResourceDictionary Files Structure Validation:**
    - Check: For each ResourceDictionary file created during code generation:
      - Does file have proper XML namespaces? (`xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"`, `xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`)
      - Are all resources defined with unique `x:Key` attributes?
      - Are all resource values properly formatted (SolidColorBrush colors as valid ARGB, etc.)?
      - Are there NO duplicate `x:Key` values within the same file?
    - **Issue:** If ResourceDictionary file malformed (missing namespaces) → XamlParseException at app startup
    - **Issue:** If `x:Key` missing on resources → Resources not accessible, StaticResource bindings fail
    - **Issue:** If duplicate keys → Last definition wins, unpredictable resource values
    - **Issue:** If generated file not actually created on disk → "Cannot locate resource" error when App.xaml tries to merge
    - **Fix:** Verify generated ResourceDictionary files exist on disk with correct XAML structure
    
    **C. Theme Resource Dictionary Files Validation:**
    - Check: Do all theme files referenced in App.xaml actually exist in project directory?
    - Check: Are theme file paths correct format? 
      - ✅ Correct: `pack://application:,,,/Themes/Colors.xaml` or `Themes/Colors.xaml`
      - ❌ Wrong: `C:\Users\Developer\Projects\Themes\Colors.xaml` (absolute file path)
    - List all referenced theme files and verify they exist: `Colors.xaml`, `Spacing.xaml`, `Typography.xaml`, `DarkTheme.xaml` (if used)
    - **Issue:** If theme file missing → `XamlParseException: No matching key found` at runtime
    - **Issue:** If path is absolute file path → Works on dev machine, fails when deployed to user machine
    - **Issue:** If path uses backslashes incorrectly → File not found in some .NET versions
    - **Fix:** Validate all theme files exist and use relative paths or pack:// URIs
    
    **D. SolidColorBrush & Resource Key Validation (Theme & Custom Resources):**
    - For each ResourceDictionary file (both generated and existing):
      - Check: Are all `<SolidColorBrush>` resources defined with `x:Key` attributes?
      - Validate: All color values are valid ARGB format (e.g., `#FFFFFFFF`, `#FF007ACC`)
      - Validate: No duplicate `x:Key` values across the same file (unique keys within file OK, duplicates across files checked in merge order)
      - Check: All referenced SolidColorBrush keys in StaticResource bindings are defined
      - **Issue:** If `x:Key` missing → Brush not accessible, Syncfusion controls fail to apply color at runtime
      - **Issue:** If ARGB invalid (e.g., `#ZZZZZZZZ`) → XamlParseException during XAML parse, app crashes at startup
      - **Issue:** If duplicate keys within same file → Last definition wins (unpredictable behavior)
      - **Issue:** If StaticResource references undefined key → Runtime binding error, control renders without style
      - **Fix:** Validate all resource definitions, ensure unique keys, use valid color values
    
    **E. Generated Resource References in XAML Files:**
    - Check: All generated .xaml control files using `{StaticResource ...}` or `{DynamicResource ...}` references
    - Validate: All referenced resource keys are actually defined in App.xaml merged ResourceDictionaries
    - Validate: Resource key names match exactly (case-sensitive in WPF)
    - Document: Which resources each generated control depends on
    - **Issue:** If StaticResource key not defined → "Provide value on 'System.Windows.StaticResourceExtension' threw exception"
    - **Issue:** If resource in wrong ResourceDictionary → Key not found during merge or reference order
    - **Issue:** If key name case mismatch → Resource not found (WPF resource keys are case-sensitive)
    - **Fix:** Ensure all generated controls only reference defined resources, verify exact case matching
    
    **F. Syncfusion Theme Package Resource Dependencies:**
    - Check: For selected Syncfusion theme (Windows11, Fluent, Material3, Material, Office2019):
      - Will corresponding NuGet theme package be installed? (e.g., `Syncfusion.Themes.Windows11Light.WPF`)
      - Are theme resources properly loaded from package? (verified in Stage 7)
      - Which theme assemblies provide the ResourceDictionary resources?
    - **Issue:** If theme NuGet package missing → Syncfusion controls render with generic look, no theme colors applied
    - **Issue:** If theme assembly not referenced in .csproj → "Assembly not found" error in XAML designer
    - **Fix:** Ensure Stage 7 includes theme NuGet package with matching version
    
    **G. DataContext & Binding Resource Issues:**
    - Check: Does each Window/UserControl have proper DataContext assignment?
    - Check: Does App.xaml have StartupUri pointing to correct Window?
    - Check: Do all binding paths reference existing ViewModel properties?
    - **Issue:** If DataContext unset → Bindings fail silently, controls show no data
    - **Issue:** If StartupUri points to non-existent file → App fails to start
    - **Issue:** If binding path references undefined property → Binding errors in Output window
    - **Fix:** Validate all DataContext assignments and binding paths reference defined properties
    
    **H. Image & Media Resource Path Validation:**
    - Check: Do Image controls reference local/web images?
    - Validate: Are image paths relative (correct) or absolute file paths (wrong)?
    - Check: Do local image files exist in project directory?
    - **Issue:** If image path absolute → Works on dev machine, fails when app deployed to user machine
    - **Issue:** If BitmapImage path broken → Image fails to load at runtime (no error, just blank control)
    - **Issue:** If image file missing → Runtime "Cannot locate resource" error
    - **Fix:** Use relative paths or verified web URLs (Unsplash) for all images
    
    **I. Generated Style & Template ResourceDictionary Validation:**
    - Check: Do all generated Style resources have `x:Key` and `TargetType` attributes?
    - Check: Do all ControlTemplates have `TargetType` attributes matching control type?
    - Validate: All StaticResource references in Setters point to defined resources (Colors, Brushes, etc.)
    - **Issue:** If TargetType missing → Style not applied to intended control
    - **Issue:** If `x:Key` missing → Style not accessible via StaticResource binding
    - **Issue:** If StaticResource in Setter references undefined key → Style rendering fails
    - **Fix:** Ensure all generated styles have correct x:Key, TargetType, and valid resource references
    
    **J. ResourceDictionary Circular Reference Prevention:**
    - Check: Do any ResourceDictionary files reference each other in MergedDictionaries?
    - Validate: No circular dependencies (e.g., Colors.xaml → Brushes.xaml → Colors.xaml)
    - **Issue:** Circular references cause infinite loop at app startup, app hangs or crashes
    - **Fix:** Ensure flat dependency hierarchy (Syncfusion theme → custom resources, no cycles)

**User Interaction:**
Ask user to confirm or override detected settings:
```
✓ Framework: .NET Framework 4.6.2 / .NET 8+
✓ Language: C# with XAML
✓ Styling: XAML ResourceDictionary
✓ Control Dir: Views/
✓ Code Style: StyleCop rules detected
✓ Syncfusion Version: 20.4.0.56 (detected from .csproj)
  OR
✓ Syncfusion Version: * (latest - no existing packages)
✓ App.xaml.cs Status: Valid startup method detected (ready for license registration)
✓ Project Structure: Themes/ folder exists (ready for ResourceDictionary merging)

[Confirm] [Override] [Cancel]
```

**Status:** User decides whether to accept detected settings or override them.
- If confirmed: Stage 5-7 will use detected version + folder structure for ALL new Syncfusion packages
- If overridden: User can specify custom version or `*` for latest
- If structure issues: AI flags recommendations for Stage 5 code generation
- Runtime Fix: All detected paths prevent "Resource not found" and "Folder does not exist" errors at stage-8 insertion
