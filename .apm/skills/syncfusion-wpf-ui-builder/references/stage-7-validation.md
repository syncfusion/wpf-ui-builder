# Stage 7: Validation

**Purpose:** Validate generated code against WPF desktop standards. Binary pass/fail result.

**AI Should:**

1. **Validate Resource File & ResourceDictionary Handling (CRITICAL - Runtime Issue Prevention):**

   ⚠️ **Critical Runtime Issue:** Improper resource file handling is the PRIMARY cause of runtime errors in WPF Syncfusion applications during code generation.

   **A. Generated ResourceDictionary Files Validation:**
   - Check: If code generation created new `.xaml` ResourceDictionary files, do they exist in the correct output directory?
   - Check: Are all created ResourceDictionary files properly formatted with `xmlns` declarations?
   - Check: Does each generated ResourceDictionary have `x:Key` attributes on all resources (SolidColorBrush, Style, Template)?
   - Validate: No duplicate `x:Key` values within the same ResourceDictionary file
   - **Issue:** If generated ResourceDictionary file not created → "Resource not found" error when App.xaml tries to merge
   - **Issue:** If `x:Key` missing on resources → Resources inaccessible at runtime, StaticResource binding fails
   - **Issue:** If duplicate keys → Last definition wins, unpredictable styling behavior
   - **Fix:** Verify all generated ResourceDictionary files exist with correct XAML structure and unique keys

   **B. App.xaml ResourceDictionary Merge Validation:**
   - Check: Does App.xaml have `<Application.Resources>` with `<ResourceDictionary>` wrapper?
   - Check: Does App.xaml have `<ResourceDictionary.MergedDictionaries>` section for theme and custom resources?
   - Validate: All `<ResourceDictionary Source="...">` paths in MergedDictionaries are correct and exist
   - Validate: Merge order is correct:
     1. Syncfusion theme ResourceDictionaries FIRST (Colors.xaml, Styling.xaml)
     2. Custom control ResourceDictionaries SECOND (CustomStyles.xaml, ControlResources.xaml)
   - **Issue:** If `<ResourceDictionary.MergedDictionaries>` missing → App.xaml cannot load external theme resources
   - **Issue:** If merge paths are absolute file paths → Works on dev machine, fails on deployment
   - **Issue:** If merge order wrong (custom before theme) → Custom styles override theme, Syncfusion controls lose theme colors
   - **Issue:** If referenced ResourceDictionary file doesn't exist → "Cannot locate resource" XamlParseException at app startup
   - **Fix:** Update App.xaml with proper MergedDictionaries section and correct relative paths

   **C. Theme Resource Dictionary Path Validation:**
   - Check: All ResourceDictionary paths use `pack://` URIs or relative paths (never absolute file paths)
   - Validate: Theme file paths format:
     - ✅ Correct: `<ResourceDictionary Source="Themes/Windows11Light/Colors.xaml" />`
     - ✅ Correct: `<ResourceDictionary Source="pack://application:,,,/Themes/Colors.xaml" />`
     - ❌ Wrong: `<ResourceDictionary Source="C:\Users\Developer\Projects\Themes\Colors.xaml" />`
   - Validate: All theme ResourceDictionary files referenced in App.xaml actually exist in the project
   - **Issue:** If path uses backslashes or absolute paths → Works during development, fails on end-user machine
   - **Issue:** If theme file missing → "The resource ... cannot be found" error, app cannot start
   - **Fix:** Convert all paths to relative format or `pack://` URIs

   **D. SolidColorBrush & Color Resource Validation (Generated Resources):**
   - For each generated ResourceDictionary (Colors.xaml, Brushes.xaml, etc):
     - Validate: All `<SolidColorBrush>` elements have `x:Key` attribute
     - Validate: All color values are valid ARGB format (e.g., `#FFFFFFFF`, not `#ZZZZZZZZ`)
     - Validate: No duplicate `x:Key` values within same file
     - Validate: All referenced colors are defined (e.g., if using `{StaticResource PrimaryBrush}`, does `PrimaryBrush` exist?)
   - **Issue:** If ARGB invalid → XamlParseException during app startup
   - **Issue:** If `x:Key` missing → Resource not accessible, style binding fails
   - **Issue:** If duplicate keys → Last definition used, unpredictable theme behavior
   - **Fix:** Regenerate ResourceDictionary with valid color values and unique keys

   **E. StaticResource & DynamicResource Reference Validation (Generated Code):**
   - For each generated XAML file using `{StaticResource ...}` or `{DynamicResource ...}`:
     - Validate: All referenced resource keys are defined in App.xaml or merged ResourceDictionaries
     - Validate: Resource scope is correct (App-level vs control-level ResourceDictionary)
     - Validate: No circular references in StyleSetters or TemplateBindings
   - **Issue:** If resource key not defined → "Provide value on 'System.Windows.StaticResourceExtension' threw exception" at XAML parse time
   - **Issue:** If resource in wrong scope → StaticResource not found, control styling fails
   - **Issue:** If circular resource references → Infinite loop during theme loading
   - **Fix:** Verify all StaticResource/DynamicResource keys are defined in correct ResourceDictionary scope

   **F. Generated Style & Template ResourceDictionary Validation:**
   - Check: If code generation created new Style resources, are they properly defined with:
     - `x:Key` attribute with unique identifier
     - `TargetType` attribute matching intended control type
     - No conflicting properties (e.g., two different FontSize setters)
   - Validate: All StaticResource references in Setter elements point to defined resources
   - Validate: Template TargetType matches control type in Window/UserControl
   - **Issue:** If TargetType missing → Style not applied to intended control
   - **Issue:** If `x:Key` missing → Style not accessible via StaticResource binding
   - **Issue:** If property conflicts → Unpredictable property values, style behavior inconsistent
   - **Fix:** Ensure all generated styles have correct x:Key, TargetType, and no property conflicts

   **G. Image & Media Resource Paths Validation (Generated References):**
   - For each Image, MediaElement, or other media control in generated XAML:
     - Validate: Image Source paths use relative paths or URLs (never absolute file paths)
     - Validate: If local path, verify image file exists in project
     - Validate: Image URLs are valid and accessible (if web-based)
   - **Issue:** If image path absolute → Works on dev machine, fails on user machine
   - **Issue:** If image file missing → Image fails to load silently (no error, blank control)
   - **Issue:** If URL broken → Image fails to load at runtime
   - **Fix:** Convert image paths to relative or use verified web URLs

   **H. ResourceDictionary Circular Reference Prevention (Generated Resources):**
   - Check: Do any generated ResourceDictionary files have MergedDictionaries that reference each other?
   - Example: Colors.xaml → Brushes.xaml → Colors.xaml = CIRCULAR
   - **Issue:** Circular references cause infinite loop, app cannot start
   - **Fix:** Ensure flat dependency hierarchy (theme → custom, no cycles)

1. **Validate Syncfusion Integration & WPF Standards:**
   - **Namespace Validation:** Ensure no unused or invalid Syncfusion namespaces are present (e.g., remove `Syncfusion.UI.Xaml.Grid` if not using SfDataGrid to prevent "Undefined CLR namespace" errors).
   - **Namespace Duplication Check:** Verify no namespace prefix conflicts (e.g., two different CLR namespaces assigned to `syncfusion` prefix) which cause "Duplicate definition of namespace" errors
   - **API Match Validation:** Verify property names against current Syncfusion assemblies:
     - `SfDigitalGauge`: Do NOT use `CharacterCount` (calculated automatically from `Value`).
     - `ComboBoxAdv`: Use `IsEditable="True"` for filtering/searching (do NOT use `AllowFiltering`).
   - **XAML Syntax Check:** Verify all tags (`Grid`, `Window`, etc.) are correctly closed to prevent "Unexpected end of file" errors.
   - **Layout Property Validation:** Ensure properties are valid for the container (e.g., `StackPanel` does NOT support `Padding`; use `Margin` or `Grid` wrapper).
   - **SfSkinManager Check:** If Syncfusion controls used, verify code-behind calls `SfSkinManager.SetTheme()` after `InitializeComponent()` to prevent missing theme resources at runtime.
   - **License Registration Check:** Verify `SyncfusionLicenseProvider.RegisterLicense()` is called in `App.xaml.cs` before window creation to prevent evaluation watermarks.
   - **Binding Path Validation:** Verify all binding paths (e.g., `{Binding PropertyName}`) reference existing ViewModel properties to prevent Output window binding errors.
   - **ResourceDictionary Merge Order:** Verify theme ResourceDictionaries merged BEFORE control-specific styles in App.xaml to prevent style override issues at runtime.

2. **Compile & Build Validation:**
   - Run: `dotnet build` to compile generated code
   - Check: No C# compilation errors or warnings
   - Verify: All Syncfusion NuGet packages resolve correctly
   - Validate: XAML files parse without XamlParseException
   - **Issue:** If build fails → Generated code has syntax errors, missing dependencies, or XAML parse issues
   - **Fix:** Address compilation errors before proceeding to next stage

3. **Validate UI Automation Support & Accessibility:**

2. **Check Security:**
   - No XAML injection vulnerabilities (XamlReader.Parse with untrusted input)
   - No hardcoded secrets/API keys in code-behind or XAML
   - Input validated before processing (TextBox/PasswordBox validation)
   - No unsafe reflection or dynamic assembly loading

3. **Verify Performance:**
   - MVVM bindings correctly implemented (INotifyPropertyChanged)?
   - Virtualization enabled for large lists (SfDataGrid with VirtualizingStackPanel)?
   - No blocking UI operations on main thread?
   - Async/await used for long-running operations?

4. **Check Window Layout & DPI Awareness:**
   - Layout panels used for responsiveness (Grid/StackPanel/DockPanel)?
   - DPI-aware sizing applied (device-independent units, not pixels)?
   - Window scaling tested at 96, 120, 144, 192 DPI?
   - Touch targets ≥ 44x44 DIPs (device-independent pixels)?

**Validation Result:**

Binary: **PASS ✓** or **FAIL ✗**

**If PASS:**
```
✓ Validation Result: PASS

All standards met:
  ✓ UI Automation accessibility (AutomationProperties)
  ✓ Security checks (XAML injection, input validation)
  ✓ Performance standards (MVVM, virtualization, async/await)
  ✓ DPI-aware window layout and scaling
  ✓ Code quality (C#, type safety)

Ready to proceed to dependencies...
```

**If FAIL:**
```
✗ Validation Result: FAIL

Issues found:
  ✗ Color contrast on label text (3.2:1, need 4.5:1)
  ✗ TextBox controls missing AutomationProperties.Name

Auto-fixes applied:
  ✓ Increased font size for contrast
  ✓ Added AutomationProperties.Name to TextBox controls

Remaining issues: 0
Result: PASS (after fixes)
```

**User Interaction:** ⭐ **USER DECISION #2**

If result is PASS:
```
Ready to generate dependencies?
[Proceed] [Review] [Stop]
```

If result is FAIL (after fixing):
```
Validation failed with 2 issues (not auto-fixable):
  - DataGrid requires proper column virtualization configuration
  - Custom TextBox styling needs DPI-aware ResourceDictionary tokens

Override and proceed anyway?
[Override & Proceed] [Request Manual Fixes] [Stop]
```

**Status:** ⭐ **USER DECISION #2** - User confirms validation result or overrides.

**Reference:** See desktop-standards.md for complete validation rules and correction methods.
