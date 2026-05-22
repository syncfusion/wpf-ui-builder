# Stage 5: Code Generation

**Purpose:** Generate production-ready WPF code (XAML + C#) and ResourceDictionary styling with accessibility and desktop standards compliance.

---

## Pre-Code Generation: Read Control Skills (MANDATORY)

**THIS STEP IS NOT OPTIONAL - Must be completed before writing any code.**

### Step 1: Identify Control Skills from Stage 3

Extract all Syncfusion WPF control skills (e.g., `syncfusion-wpf-datagrid`, `syncfusion-wpf-chart`, `syncfusion-wpf-schedule`).

### Step 2: Locate and Read Control Skills

For each control, use discovery paths (in order):
- `.codestudio/skills/<skill-name>/references/`
- `.agent/skills/<skill-name>/references/`
- `.agents/skills/<skill-name>/references/`
- `.github/skills/<skill-name>/references/`
- `skills/<skill-name>/references/`

**Read in this order:**

1. **getting-started.md** - Authoritative source for:
   - Exact XAML namespace (e.g., `xmlns:syncfusion="clr-namespace:Syncfusion.UI.Xaml.Grid;assembly=Syncfusion.SfDataGrid.WPF"`)
   - NuGet package name and version
   - ResourceDictionary/theme requirements
   - Initial setup code
   - **DO NOT generate XAML without reading this first**

2. **Feature-specific guides** (if needed):
   - `filtering.md`, `sorting.md`, `validation.md`, `styling.md`

3. **CRITICAL:** Do NOT assume control properties or APIs. Use exact syntax from documentation.

### Step 3: Read Syncfusion Themes Guide

Read `syncfusion-themes.md` for:
- Theme loading in App.xaml via MergedDictionaries
- Supported themes: Windows11, Fluent, Material3, Material, Office2019, SystemTheme
- NuGet version compatibility

### Step 4: Generate Code

Only after completing Steps 1-3, generate `.xaml` and `.xaml.cs` files with extracted namespaces.

**Key Principle:**
- ✅ Read getting-started FIRST → Extract namespaces → Generate code with all namespaces
- ❌ Generate code THEN add namespaces → Results in compilation errors

---

## Critical Runtime Issues & Fixes (MANDATORY)

**Address these before generating XAML:**

### 1. ResourceDictionary Structure & Validation

**Problem:** Missing structure causes "Resource not found" errors

**Solution:**
- Include XML namespaces: `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"` and `xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"`
- Use relative file paths in MergedDictionaries only
- Ensure ALL resources have unique `x:Key` attributes
- Validate colors are valid ARGB format (e.g., `#FFFFFFFF`)
- Group resources: Colors.xaml, Brushes.xaml, Styles.xaml, Templates.xaml

**Example ResourceDictionary:**
```xaml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
  <SolidColorBrush x:Key="PrimaryColorBrush" Color="#007ACC" />
  <SolidColorBrush x:Key="SecondaryColorBrush" Color="#50E3C2" />
  <Style x:Key="HeaderTextStyle" TargetType="TextBlock">
    <Setter Property="FontSize" Value="18" />
    <Setter Property="Foreground" Value="{StaticResource PrimaryColorBrush}" />
  </Style>
</ResourceDictionary>
```

**App.xaml Merge Order (Syncfusion theme FIRST):**
```xaml
<Application.Resources>
  <ResourceDictionary>
    <ResourceDictionary.MergedDictionaries>
      <ResourceDictionary Source="Themes/Windows11Light/Colors.xaml" />
      <ResourceDictionary Source="Themes/Windows11Light/Styling.xaml" />
      <ResourceDictionary Source="Resources/Colors.xaml" />
      <ResourceDictionary Source="Resources/Styles.xaml" />
    </ResourceDictionary.MergedDictionaries>
  </ResourceDictionary>
</Application.Resources>
```

**Validation Checklist:**
- ✅ All ResourceDictionary files have proper namespaces
- ✅ All `x:Key` attributes are unique within each file
- ✅ All color values are valid ARGB
- ✅ All StaticResource references point to defined keys
- ✅ Merge order: theme first, custom resources second
- ✅ All file paths are relative
- ✅ No circular references
- ✅ No resource duplication

### 2. Namespace Declaration & Conflict Prevention

- Use ONE consistent namespace prefix per control type
- Do NOT mix generic `xmlns:syncfusion="http://schemas.syncfusion.com/wpf"` with CLR-specific namespaces for same control
- If control missing from generic namespace, use explicit CLR namespace from getting-started.md
- Example error: Don't use both `<syncfusion:SfDataGrid />` AND `<sf:SfDataGrid />` in same XAML

### 3. Theme Initialization (SfSkinManager)

**Problem:** Generated XAML without theme initialization causes "Undefined CLR namespace" or missing styles

**Solution:**
```csharp
public partial class MyWindow : Window
{
    public MyWindow()
    {
        InitializeComponent();
        if (Application.Current.Resources.MergedDictionaries.Count == 0)
        {
            SfSkinManager.ApplyThemeAsDefaultStyle = true;
            SfSkinManager.SetTheme(this, new Theme("Windows11Light"));
        }
    }
}
```

### 4. License Registration

**Problem:** Syncfusion controls render with evaluation watermark if license not registered

**Solution:**
```csharp
public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        string licenseKey = ConfigurationManager.AppSettings["SyncfusionLicenseKey"];
        if (!string.IsNullOrEmpty(licenseKey))
            Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(licenseKey);
        base.OnStartup(e);
    }
}
```

### 5. Data Binding Validation

- All bindings must reference existing ViewModel properties
- Use: `{Binding PropertyName, Mode=TwoWay, UpdateSourceTrigger=PropertyChanged, ValidatesOnDataErrors=True}`

---

## Code Generation Deliverables

### 1. XAML File (.xaml)

- Window or UserControl with all namespaces in root element
- Namespace declarations from extracted getting-started.md files
- **MANDATORY**: Primary Syncfusion namespace: `xmlns:syncfusion="http://schemas.syncfusion.com/wpf"`
- **NOTE**: If using `SfTextInputLayout`: `xmlns:inputLayout="clr-namespace:Syncfusion.UI.Xaml.TextInputLayout;assembly=Syncfusion.SfTextInputLayout.WPF"`
- Proper Syncfusion WPF control declarations with exact syntax
- Data bindings to ViewModel properties
- Event handlers and command bindings
- Error handling via IDataErrorInfo or ValidationRule
- WCAG 2.1 AA accessibility: AutomationProperties, semantic controls, keyboard navigation
- XML comments for complex layouts
- All namespaces declared in root with NO conflicts

### 2. Code-Behind (.xaml.cs)

- Window/UserControl initialization
- ViewModel setup and DataContext binding
- Event handlers (non-bindable logic only)
- Theme initialization (if needed)
- UI-only logic, business logic stays in ViewModel

### 3. ViewModel (.cs) - if MVVM Pattern

- INotifyPropertyChanged implementation
- Properties with change notification
- ICommand implementations
- Data validation logic

### 4. ResourceDictionary Styling (.xaml)

- Custom Style resources for control appearance
- Color/Brush resources using design system tokens
- Template definitions if needed
- Light/dark theme support if needed

---

## Code Generation Standards

- **Control Declarations:** Use exact namespace syntax from getting-started.md. **CRITICAL**: If control missing from `http://schemas.syncfusion.com/wpf`, use explicit CLR namespace mapping instead.
- **Theme Resources:** Load via App.xaml MergedDictionaries (see syncfusion-themes.md)
- **Semantic Controls:** Window, StackPanel, Grid, SfButton, SfTextBox, etc.
- **Accessibility:** AutomationProperties.Name, AutomationProperties.AutomationId, keyboard navigation
- **C# Standards:** No unhandled exceptions, proper null checking, full type safety
- **Error Handling:** Try-catch blocks, user-friendly error messages
- **Responsive Layout:** Grid with star sizing, DockPanel for DPI-aware layouts
- **Performance:** VirtualizingStackPanel for large lists, async/await for I/O
- **Security:** No XamlReader on untrusted input, parameterized queries, no hardcoded secrets
- **Documentation:** XML comments on public members, explain complex logic
- **Reference Standards:** Follow desktop-standards.md and control skill feature guides

---

## Media Resources

- **Placeholder Images:** Use [Unsplash](https://unsplash.com) for high-quality images
  - Format: `<Image Source="https://images.unsplash.com/photo-[id]?w=[width]&h=[height]&fit=crop" />`
  - Example: `<Image Source="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop" />`
  - Always specify dimensions in URL
  - Set Width/Height on Image control to match URL dimensions

---

## Button Styling with Syncfusion WPF

**Principle:** Let Syncfusion WPF own button dimensions and styling. Use layout containers for positioning.

✅ **CORRECT - Syncfusion SfButton with layout panel:**
```xaml
<StackPanel Orientation="Horizontal" Spacing="12">
  <sf:SfButton Content="▶ Play" 
               Background="{StaticResource PrimaryColorBrush}"
               Padding="{StaticResource ButtonPaddingValue}" />
  <sf:SfButton Content="ℹ️ More Info"
               Background="Transparent"
               BorderBrush="{StaticResource BorderColorBrush}"
               BorderThickness="1" />
</StackPanel>
```

**Why This Works:**
- Syncfusion handles internal sizing via theme resources
- Icons embedded in Button.Content
- No padding override conflicts with tokens
- Consistent appearance across Syncfusion controls
- DPI scaling handled automatically

---

## ComboBox Selection with Syncfusion WPF

**Principle:** Use `ComboBoxAdv` for dropdown needs (advanced features: tokens, multiselect).

**Namespace:** `xmlns:syncfusion="http://schemas.syncfusion.com/wpf"`
**Assembly:** `Syncfusion.Shared.WPF`

✅ **CORRECT - Single Selection with Watermark:**
```xaml
<syncfusion:ComboBoxAdv ItemsSource="{Binding Categories}"
                        DisplayMemberPath="Name"
                        DefaultText="Select a Category..."
                        Height="30" Width="200" />
```

**Why This Works:**
- Supports professional patterns (tokens, suggestions)
- `DefaultText` provides built-in watermark
- `AllowMultiSelect` enables checkbox-based selection

---

## Control Reuse Across UI

**Principle:** One WPF control type can be reused with ResourceDictionary styles. Example: `SfButton` as Login, Forgot Password, and Sign Up with different styles.

**Example - Multiple Button Styles:**
```xaml
<!-- LoginWindow.xaml -->
<Window xmlns:sf="http://schemas.syncfusion.com/wpf">
  <sf:SfButton Content="Login" 
               Style="{StaticResource PrimaryButtonStyle}" />
  <sf:SfButton Content="Forgot Password?" 
               Style="{StaticResource LinkButtonStyle}" />
  <sf:SfButton Content="Sign Up Here" 
               Style="{StaticResource OutlineButtonStyle}" />
</Window>
```

**Themes/ButtonStyles.xaml:**
```xaml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:sf="http://schemas.syncfusion.com/wpf">
  <Style x:Key="PrimaryButtonStyle" TargetType="sf:SfButton">
    <Setter Property="Background" Value="{StaticResource PrimaryColorBrush}" />
    <Setter Property="Foreground" Value="White" />
    <Setter Property="Padding" Value="{StaticResource ButtonPaddingValue}" />
  </Style>
  
  <Style x:Key="LinkButtonStyle" TargetType="sf:SfButton">
    <Setter Property="Background" Value="Transparent" />
    <Setter Property="BorderBrush" Value="Transparent" />
    <Setter Property="TextDecoration" Value="Underline" />
  </Style>
  
  <Style x:Key="OutlineButtonStyle" TargetType="sf:SfButton">
    <Setter Property="Background" Value="Transparent" />
    <Setter Property="BorderBrush" Value="{StaticResource BorderColorBrush}" />
    <Setter Property="BorderThickness" Value="1" />
  </Style>
</ResourceDictionary>
```

**Why This Works:**
- ResourceDictionary styles centralize customization
- Token resources ensure consistency
- No hard-coded values in individual controls
- Easy to rebrand globally
- Respects DPI scaling

---

## Output File Structure

### Simple UI:
```
Controls/LoginForm/
  ├── LoginFormWindow.xaml
  ├── LoginFormWindow.xaml.cs
  ├── LoginFormViewModel.cs
  └── Resources/
      └── LoginFormResources.xaml
```

### Complex UI (Multiple Sections):
```
Controls/Dashboard/
├── Views/
│   ├── DashboardWindow.xaml
│   ├── DashboardWindow.xaml.cs
│   ├── DashboardViewModel.cs
│   ├── Header/
│   │   ├── HeaderView.xaml
│   │   ├── HeaderView.xaml.cs
│   │   └── HeaderViewModel.cs
│   ├── Sidebar/
│   │   ├── SidebarView.xaml
│   │   ├── SidebarView.xaml.cs
│   │   └── SidebarViewModel.cs
│   ├── MainContent/
│   │   ├── MainContentView.xaml
│   │   ├── MainContentView.xaml.cs
│   │   └── MainContentViewModel.cs
│   └── Footer/
│       ├── FooterView.xaml
│       ├── FooterView.xaml.cs
│       └── FooterViewModel.cs
└── Resources/
    └── DashboardStyles.xaml
```

**WPF Structure Rules:**
- Each section gets its own folder with `.xaml`, `.xaml.cs`, and `.cs` ViewModel
- Parent Window composes sections using `<local:HeaderView />`
- Syncfusion controls loaded via App.xaml MergedDictionaries
- Do NOT collapse multiple distinct sections into single file

---

## Control Integration & File Mapping

**Generated files MUST be wired to the app:**

### 1. Resource Dictionary Registration
```xaml
<!-- Resources/LoginFormResources.xaml -->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
  <Style x:Key="LoginFormStyle" TargetType="Window">
    <!-- Style definitions -->
  </Style>
</ResourceDictionary>
```

### 2. Register in App.xaml
```xaml
<Application.Resources>
  <ResourceDictionary>
    <ResourceDictionary.MergedDictionaries>
      <ResourceDictionary Source="Controls/LoginForm/Resources/LoginFormResources.xaml" />
    </ResourceDictionary.MergedDictionaries>
  </ResourceDictionary>
</Application.Resources>
```

### 3. Instantiate in App.xaml.cs
```csharp
LoginFormWindow window = new LoginFormWindow();
window.DataContext = new LoginFormViewModel();
window.Show();
```

### 4. Update StartupUri in App.xaml (if new entry point)
```xaml
<Application x:Class="MyApp.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="Controls/LoginForm/LoginFormWindow.xaml">
</Application>
```

**Without this mapping, control won't render.**

---

## Code Generation Workflow Summary

1. **Read control skills** (getting-started.md) → Extract namespaces
2. **Read theme guide** (syncfusion-themes.md) → Understand theme loading
3. **Generate XAML** with all namespaces included
4. **Generate code-behind** with ViewModel setup and theme initialization
5. **Generate ViewModel** with INotifyPropertyChanged and ICommand
6. **Generate ResourceDictionary** for custom styles
7. **Wire files** to App.xaml and App.xaml.cs for rendering
8. **Validate** against critical runtime issues checklist

**User Interaction:** Optional review. AI generates without blocking confirmation.
