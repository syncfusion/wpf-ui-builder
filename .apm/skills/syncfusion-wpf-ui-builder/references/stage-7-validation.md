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

   **E1. Resource Binding Best Practices:**
   
   - Verify all referenced resource keys exist in App.xaml or merged ResourceDictionaries before binding
   - When using `{StaticResource}` or `{DynamicResource}`, ensure the key is defined in the appropriate ResourceDictionary
   - For Effect properties, define Effect resources (DropShadowEffect, BlurEffect, etc.) with complete declarations:
     ```xaml
     <!-- Define in Themes/Effects.xaml -->
     <DropShadowEffect x:Key="MyShadow" Color="#000000" Opacity="0.5" />
     
     <!-- Merge into App.xaml -->
     <ResourceDictionary Source="Themes/Effects.xaml" />
     ```
   - Ensure all Effect elements have valid color formats (e.g., `#FFFFFFFF`) and proper closing tags
   - Verify color values use valid ARGB format; invalid formats prevent resource resolution at runtime
   - Keep ResourceDictionary paths relative or use `pack://` URIs; avoid absolute file paths that fail on deployment

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

**2. XAML Tag Structure & Runtime Validation (CRITICAL):**

   **A. Tag Matching & Structure:**
   - Ensure every opening tag `<Tag>` has a matching closing tag `</Tag>` or is self-closed with `<Tag />`
   - Verify nested tags close in correct order: `<Outer><Inner></Inner></Outer>` 
   - Validate opening and closing tag counts match in each file to prevent parse errors
   - Check ResourceDictionary files use correct root element with proper xmlns declarations:
     ```xaml
     <ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                         xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
         <SolidColorBrush x:Key="Key">#FF000000</SolidColorBrush>
     </ResourceDictionary>
     ```
   
   **B. Property Element Syntax:**
   - Property elements must match parent control: `<TextBlock.Foreground>` for TextBlock, not `<TextBlock.Foregron>`
   - Verify property names are spelled correctly (case-sensitive) to ensure elements are recognized
   - Ensure all property elements have proper closing tags matching the parent control name
   
   **C. Binding & Resource References:**
   - Quote all binding expressions: `Text="{Binding PropertyName}"` and `Background="{StaticResource BrushKey}"`
   - Unquoted bindings prevent proper XAML parsing
   - Validate referenced resource keys exist before runtime binding attempts
   
   **D. Special Characters & Escaping:**
   - Escape raw characters: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`
   - Ensure text content does not contain unescaped special characters that break XAML parsing

**3. Validate Syncfusion Integration & WPF Standards:**
   - **Namespace Validation:** Ensure no unused Syncfusion namespaces (remove if not using controls)
   - **Namespace Duplication:** Verify no prefix conflicts (one prefix = one namespace)
   - **API Match:** `SfDigitalGauge` - don't use `CharacterCount`; `ComboBoxAdv` - use `IsEditable="True"`
   - **XAML Syntax:** All tags properly closed (Grid, Window, etc.)
   - **Layout Properties:** `StackPanel` does NOT support `Padding` → use `Margin`
   - **SfSkinManager:** Call `SfSkinManager.SetTheme()` in code-behind after `InitializeComponent()`
   - **License:** Verify `SyncfusionLicenseProvider.RegisterLicense()` called in `App.xaml.cs`
   - **Binding Paths:** All `{Binding}` reference existing ViewModel properties
   - **Merge Order:** Theme ResourceDictionaries FIRST, then custom styles

4. **Compile & Build Validation:**
   - Run: `dotnet build` to compile generated code
   - Check: No C# compilation errors or warnings
   - Verify: All Syncfusion NuGet packages resolve correctly
   - Validate: XAML files parse without XamlParseException
   - **Issue:** If build fails → Generated code has syntax errors, missing dependencies, or XAML parse issues
   - **Fix:** Address compilation errors before proceeding to next stage

**Quick Reference: XamlParseException Runtime Issues & Fixes**

| Runtime Error | Root Cause | Quick Fix | Check |
|---|---|---|---|
| `StaticResourceHolder threw exception` | Key not found | Check App.xaml MergedDictionaries | All {StaticResource X} has X defined |
| `Set property Effect threw exception` | Effect missing/invalid | Add Effect to ResourceDictionary | Effect x:Key exists, merged, proper type |
| `Unexpected end of file` | Unclosed tag | Close all tags: `</Tag>` | `<count = </count` in file |
| `The text object not consumed` | Unquoted binding | Quote: `Text="{Binding}"` | All bindings have quotes |
| `does not exist in namespace` | Undefined prefix | Add `xmlns:prefix="..."` | All prefixes declared |
| `Cannot locate resource` | Wrong ResourceDictionary path | Use relative: `Themes/File.xaml` | No absolute paths, verify file exists |

**Common XAML Runtime Issues Checklist:**
- [ ] All `{StaticResource ...}` keys exist in App.xaml or MergedDictionaries
- [ ] All Effect properties reference existing Effect resources (DropShadowEffect, BlurEffect)
- [ ] Opening tag count = Closing tag count in each file
- [ ] All binding expressions quoted: `"{Binding ...}"` not `{Binding ...}`
- [ ] All namespace prefixes declared with `xmlns:prefix="..."`
- [ ] ResourceDictionary paths relative (never absolute C:\ paths)
- [ ] No duplicate `x:Key` values in same ResourceDictionary
- [ ] Style/Template elements have `x:Key` attribute
- [ ] Property elements match parent control: `<TextBlock.Foreground>` not `<TextBlock.Foregron>`

5. **Validate UI Automation & Security:**
   - AutomationProperties.AutomationId on interactive controls
   - No XAML injection vulnerabilities (XamlReader.Parse with untrusted input)
   - No hardcoded secrets/API keys in XAML or code-behind

6. **Check Performance & Layout:**
   - MVVM bindings with INotifyPropertyChanged implemented
   - Virtualization enabled for large lists (SfDataGrid)
   - Layout panels used (Grid/StackPanel/DockPanel)
   - DPI-aware sizing (device-independent units)
   - Touch targets ≥ 44x44 DIPs (device-independent pixels)

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
