# Desktop Standards & Compliance Reference

**Version:** 2.0.0  
**Last Updated:** May 5, 2026  
**Purpose:** UI Automation, security, performance, and code quality standards enforced during Stage 6 validation

---

## Table of Contents

1. [Accessibility Standards (UI Automation)](#accessibility-standards-ui-automation)
2. [Security Standards](#security-standards)
3. [Performance Standards](#performance-standards)
4. [Code Quality Standards](#code-quality-standards)
5. [Validation Checklist](#validation-checklist)
6. [Auto-Fix Rules](#auto-fix-rules)

---

## Accessibility Standards (UI Automation)

### Desktop Accessibility Principles

| Principle | Description |
|-----------|-------------|
| **Perceivable** | UI elements can be perceived through different senses (text alternatives, contrast, high DPI scaling) |
| **Operable** | Interface can be operated by all users (keyboard navigation, tooltip support, touch target size) |
| **Understandable** | Interface behavior is predictable (consistent navigation, clear error guidance via IDataErrorInfo) |
| **Robust** | Controls work with assistive technologies (UI Automation patterns, proper AutomationId) |

---

### Perceivable: Content Must Be Perceivable

#### 1.1 Text Alternatives

**Images require descriptive names in AutomationProperties:**

```xaml
<!-- ❌ Missing accessibility name -->
<Image Source="chart.png" />

<!-- ✅ Descriptive names for informative image -->
<Image Source="chart.png" 
       AutomationProperties.Name="Bar chart showing 40% increase in Q3 sales" />

<!-- ✅ Decorative image (hidden from automation) -->
<Image Source="decorative-border.png" 
       AutomationProperties.IsSkipCharacter="True" />

<!-- ✅ Complex image with detailed description -->
<StackPanel>
  <Image Source="infographic.png" 
         AutomationProperties.Name="2024 market trends infographic" 
         AutomationProperties.HelpText="Detailed market analysis showing growth trends across sectors" />
</StackPanel>
```

**Icon buttons need accessible names via AutomationProperties:**

```xaml
<!-- ❌ No accessible name -->
<sf:ButtonAdvContent="{StaticResource MenuIcon}" />

<!-- ✅ Using AutomationProperties.Name -->
<sf:ButtonAdvContent="{StaticResource MenuIcon}" 
             AutomationProperties.Name="Open menu"
             AutomationProperties.AutomationId="MenuBtn" />

<!-- ✅ Using ToolTip for accessibility -->
<sf:ButtonAdvContent="{StaticResource MenuIcon}" 
             ToolTip="Open navigation menu"
             AutomationProperties.Name="Open menu" />
```

**Validation Rules:**
- [ ] All informative images/icons have `AutomationProperties.Name`
- [ ] Decorative elements marked with `AutomationProperties.IsSkipCharacter="True"`
- [ ] Icon-only buttons have `AutomationProperties.Name` or `ToolTip`
- [ ] Complex images have `AutomationProperties.HelpText` with detailed description

> 🔴 **BLOCKING:** IF any informative image or icon-only button is missing `AutomationProperties.Name` → **FAIL** — `"Accessibility violation: missing AutomationProperties.Name on <element>"`

---

#### 1.2 Tooltip & Help Text Support

**Provide meaningful tooltips and help text for complex controls:**

```xaml
<!-- ✅ SfTextBox with ToolTip for accessibility -->
<sf:SfTextBox x:Name="EmailInput"
              ToolTip="Enter your email address (example: name@domain.com)"
              AutomationProperties.Name="Email"
              AutomationProperties.HelpText="Enter your email address (example: name@domain.com)" />

<!-- ✅ ButtonAdvwith ToolTip -->
<sf:ButtonAdvContent="Submit"
             ToolTip="Click to submit the form"
             AutomationProperties.Name="Submit form" />

<!-- ✅ SfComboBox with help text -->
<sf:SfComboBox x:Name="CountrySelector"
          ToolTip="Select your country of residence"
          AutomationProperties.HelpText="Use arrow keys to navigate, Enter to select" />
```

**Validation Rules:**
- [ ] Complex controls have meaningful `ToolTip` text
- [ ] ToolTip text accessible via `AutomationProperties.HelpText`
- [ ] Help text describes how to use the control
- [ ] Keyboard navigation instructions provided where needed

> 🔴 **BLOCKING:** IF interactive control is missing both `ToolTip` and `AutomationProperties.HelpText` → **FAIL** — `"Accessibility violation: no help text on <control>"`

---

#### 1.4 Color Contrast

**Minimum Ratios (Desktop Standards):**

| Text Type | Minimum Ratio |
|-----------|---------------|
| Normal text (< 12pt) | 4.5:1 |
| Large text (≥ 12pt or bold) | 3:1 |
| UI controls & graphics | 3:1 |
| Focus indicators | 3:1 |

```xaml
<!-- ✓ GOOD - High contrast resources in ResourceDictionary -->
<SolidColorBrush x:Key="PrimaryTextBrush" Color="#000000" />
<SolidColorBrush x:Key="PrimaryBackgroundBrush" Color="#FFFFFF" />

<!-- ❌ BAD - Low contrast (fails accessibility) -->
<SolidColorBrush x:Key="HintTextBrush" Color="#CCCCCC" />
<SolidColorBrush x:Key="HintBackgroundBrush" Color="#FFFFFF" />

<!-- ✓ GOOD - Focus indicator with high contrast -->
<SolidColorBrush x:Key="FocusBorderBrush" Color="#0066CC" />
```

**Don't rely on color alone to convey information:**

```xaml
<!-- ❌ Only color indicates error -->
<sf:SfTextBox BorderBrush="Red" BorderThickness="2" />

<!-- ✅ Color + icon + text -->
<StackPanel Orientation="Horizontal">
    <sf:SfTextBox AutomationProperties.Name="Email"
                  x:Name="EmailInput" />
    <Path Data="{StaticResource ErrorIcon}" Fill="Red" 
          ToolTip="Please enter a valid email address"
          Visibility="{Binding HasError, Converter={StaticResource BoolToVisibility}}" />
    <TextBlock Text="Please enter a valid email address" Foreground="Red" />
</StackPanel>
```

**Validation Rules:**
- [ ] All text has contrast ≥ 4.5:1 (normal) or 3:1 (large)
- [ ] Focus indicators (FocusVisualStyle) have contrast ≥ 3:1
- [ ] Icons conveying status have 3:1 contrast
- [ ] High Contrast Theme supported via DynamicResources
- [ ] Information not conveyed by color alone (use text + icon)

> 🔴 **BLOCKING:** IF any text contrast < 4.5:1 or UI control contrast < 3:1 → **FAIL** — `"WCAG 2.1 AA violation: contrast ratio <ratio> on <element> (minimum: <required>)"`
> 🔴 **BLOCKING:** IF state change (error, success, warning) communicated by color only → **FAIL** — `"Accessibility violation: color-only state indicator on <element>"`

---

### Operable: Users Must Be Able to Operate the Interface

#### 2.1 Keyboard Accessibility

**All functionality must be accessible via keyboard—no mouse-only actions:**

```csharp
// ❌ BAD - Only handles mouse click
private void Element_MouseDown(object sender, MouseButtonEventArgs e) 
{ 
    ExecuteAction(); 
}

// ✅ GOOD - WPF Buttons handle Enter/Space natively
// For custom controls, override keyboard handling:
protected override void OnKeyDown(KeyEventArgs e)
{
    if (e.Key == Key.Enter || e.Key == Key.Space)
    {
        ExecuteAction();
        e.Handled = true;
    }
    base.OnKeyDown(e);
}
```

**No keyboard traps—users must be able to Tab out of every control:**

```xaml
<!-- ✓ GOOD - Dialog properly manages focus and Escape -->
<Window x:Class="MyApp.ConfirmDialog"
        PreviewKeyDown="Window_PreviewKeyDown">
    <!-- content -->
</Window>

<!-- ✗ BAD - Prevents tabbing out (keyboard trap) -->
<sf:SfTextBox PreviewKeyDown="TextBox_PreviewKeyDown" />
<!-- In code-behind: if (e.Key == Key.Tab) e.Handled = true; -->
```

**Validation Rules:**
- [ ] All interactive elements have KeyboardNavigation.IsTabStop = True
- [ ] Tab order is logical (TabIndex set correctly, left-to-right, top-to-bottom)
- [ ] Can Tab into and out of every control (no keyboard traps)
- [ ] Escape key closes dialogs and popups
- [ ] Enter key activates default buttons
- [ ] Arrow keys work for ListBox, ComboBox, and TabControl navigation

> 🔴 **BLOCKING:** IF any interactive control has `KeyboardNavigation.IsTabStop = False` without justification → **FAIL** — `"Keyboard accessibility violation: <element> is not keyboard reachable"`
> 🔴 **BLOCKING:** IF keyboard trap detected (Tab key handled and swallowed in code-behind) → **FAIL** — `"Keyboard trap violation on <element>"`

---

#### 2.4 Focus Management

**Users must see where keyboard focus is—FocusVisualStyle must be visible:**

```xaml
<!-- ❌ NEVER set FocusVisualStyle to null (accessibility violation) -->
<Setter Property="FocusVisualStyle" Value="{x:Null}" />

<!-- ✅ GOOD - Default WPF focus visual is visible -->
<sf:ButtonAdvContent="Click me" />

<!-- ✅ GOOD - Custom focus style with high contrast -->
<Style x:Key="MyFocusStyle" TargetType="sf:SfButton">
    <Setter Property="FocusVisualStyle">
        <ControlTemplate>
            <Rectangle Stroke="Black" StrokeDashArray="1 2" 
                       StrokeThickness="2" Margin="-2" />
        </ControlTemplate>
    </Setter>
</Style>
```

**Manage focus when opening Windows or Popups:**

```csharp
public partial class ConfirmDialog : Window
{
    public ConfirmDialog()
    {
        Initializecontrol();
        this.Loaded += (s, e) => {
            // Focus the primary action button when dialog opens
            OkButton.Focus();
        };
    }
    
    private void Window_PreviewKeyDown(object sender, KeyEventArgs e)
    {
        // Escape key closes dialog
        if (e.Key == Key.Escape)
        {
            this.DialogResult = false;
            e.Handled = true;
        }
    }
}
```

**Validation Rules:**
- [ ] Focus indicators always visible (never FocusVisualStyle = null)
- [ ] Focus outline ≥ 2px thick, ≥ 3:1 contrast
- [ ] Focus order logical (top-to-bottom, left-to-right)
- [ ] Focus managed when opening Windows/Popups (focus primary element)
- [ ] Focused element not obscured by other UI elements

> 🔴 **BLOCKING:** IF `FocusVisualStyle="{x:Null}"` found on any control → **FAIL** — `"Accessibility violation: focus indicator removed on <element>"`

---

#### 2.5 Touch Target Size

**Interactive targets must be at least 24 × 24 device-independent pixels (for mouse/touch):**

```xaml
<!-- ✓ GOOD - Minimum target size -->
<sf:ButtonAdvWidth="24" Height="24" Content="+" />

<!-- ✓ GOOD - Comfortable target size (recommended 44×44 for touch input) -->
<sf:ButtonAdvWidth="44" Height="44" 
             AutomationProperties.Name="Submit"
             Content="Submit" />

<!-- ✗ BAD - Too small -->
<sf:ButtonAdvWidth="16" Height="16" Content="X" />
```

**Validation Rules:**
- [ ] All buttons ≥ 24×24 device-independent pixels
- [ ] All interactive controls ≥ 24×24 device-independent pixels
- [ ] Adequate spacing to prevent accidental activation (at least 8px padding)
- [ ] Consider high-DPI scaling (multiply by DPI factor)

---

### Understandable: Content Must Be Understandable

#### 3.1 Predictable Behavior

**Users must be able to predict what happens when they interact:**

```xaml
<!-- ✓ GOOD - Buttons trigger expected actions -->
<sf:ButtonAdvContent="Submit" Click="Submit_Click" />
<sf:ButtonAdvContent="Cancel" Click="Cancel_Click" />

<!-- ❌ BAD - Unexpected side effects -->
<sf:ButtonAdvContent="Save" PreviewMouseDown="UnexpectedAction_Handler" />

<!-- ✓ GOOD - Focus change only highlights -->
<sf:SfTextBox Text="{Binding Name}" GotFocus="TextBox_GotFocus" />

<!-- ❌ BAD - Unexpected data submission on focus -->
<sf:SfComboBox SelectionChanged="SubmitData" />
```

**Consistent navigation and help—help mechanisms appear in same relative order:**

```xaml
<!-- Help consistently placed in menus/toolbars across all Windows -->
<Menu>
  <MenuItem Header="File">
    <MenuItem Header="Exit" Click="Exit_Click" />
  </MenuItem>
  <MenuItem Header="Help">
    <MenuItem Header="Contact Support" Click="Contact_Click" />
    <MenuItem Header="FAQs" Click="ShowFAQs_Click" />
    <MenuItem Header="About" Click="ShowAbout_Click" />
  </MenuItem>
</Menu>
```

**Validation Rules:**
- [ ] Button actions match their labels
- [ ] Focus change doesn't trigger unexpected data submission
- [ ] Navigation is consistent across all windows
- [ ] Help mechanisms always in same relative order

---

#### 3.3 Forms & Data Validation

**Every input needs an associated descriptive label:**

```xaml
<!-- ❌ No label association -->
<sf:SfTextBox x:Name="EmailInput" />

<!-- ✅ Explicit Label with Target -->
<Label Content="Email address" Target="{Binding ElementName=EmailInput}" />
<sf:SfTextBox x:Name="EmailInput" 
              AutomationProperties.Name="Email address"
              AutomationProperties.IsRequiredForForm="True" />

<!-- ✅ With instruction text and validation -->
<Label Content="Password" Target="{Binding ElementName=PasswordInput}" />
<sf:SfTextBox x:Name="PasswordInput"
              AutomationProperties.Name="Password"
              AutomationProperties.HelpText="At least 8 characters with one number" />
<TextBlock Text="At least 8 characters with one number" 
           Foreground="Gray" FontSize="10" />
```

**Error messages must be clear and validated via IDataErrorInfo:**

```xaml
<!-- ❌ No error feedback -->
<sf:SfTextBox Text="{Binding Email}" />

<!-- ✅ Clear error with Validation ErrorTemplate -->
<sf:SfTextBox Text="{Binding Email, UpdateSourceTrigger=PropertyChanged, ValidatesOnDataErrors=True}"
              Validation.ErrorTemplate="{StaticResource ErrorTemplate}"
              AutomationProperties.Name="Email"
              ToolTip="{Binding RelativeSource={RelativeSource Self}, 
                               Path=(Validation.Errors)[0].ErrorContent}" />

<!-- ✓ Error display -->
<TextBlock Text="{Binding RelativeSource={RelativeSource Self},
                         Path=(Validation.Errors)[0].ErrorContent}"
           Foreground="Red"
           FontSize="12" />
```

**Validation Rules:**
- [ ] Every input has associated Label or `AutomationProperties.Name`
- [ ] Required fields marked with * or `IsRequiredForForm` property
- [ ] Error messages clear and specific
- [ ] Errors displayed via Validation.ErrorTemplate
- [ ] Error messages include how to fix
- [ ] Validation on PropertyChanged or LostFocus (not only Submit)
- [ ] Information validated for correctness before processing

---

### Robust: Content Must Work with Assistive Technologies

#### 4.1 UI Automation & Native Controls

**Prefer native WPF controls—they have UI Automation support built in:**

```xaml
<!-- ❌ Custom control without proper AutomationPeer -->
<local:CustomSubmitButton Click="Submit_Click" />

<!-- ✅ Native ButtonAdv(automatic UIA support, keyboard, focus) -->
<sf:ButtonAdvContent="Submit" Click="Submit_Click"
             AutomationProperties.Name="Submit form"
             AutomationProperties.AutomationId="SubmitBtn" />

<!-- ❌ Custom checkbox without UIA -->
<local:CustomCheckBox IsChecked="{Binding Option}" />

<!-- ✅ Native Microsoft CheckBox (simple, fully accessible) -->
<CheckBox Content="I agree to terms"
          IsChecked="{Binding AgreedToTerms}"
          AutomationProperties.Name="I agree to terms" />

<!-- ✗ Non-semantic layout -->
<StackPanel Orientation="Vertical">
    <StackPanel Orientation="Horizontal">
        <TextBlock Text="Email:" />
        <sf:SfTextBox x:Name="EmailInput" />
    </StackPanel>
</StackPanel>

<!-- ✓ Semantic layout with labels -->
<StackPanel Orientation="Vertical">
    <Label Content="Email address" Target="{Binding ElementName=EmailInput}" />
    <sf:SfTextBox x:Name="EmailInput"
                  AutomationProperties.Name="Email address"
             AutomationProperties.IsRequiredForForm="True" />
</StackPanel>
```

**Use AutomationProperties when native controls don't provide necessary metadata:**

```xaml
<!-- ✓ GOOD - Custom TabControl with proper UIA -->
<TabControl x:Name="ProductTabs">
    <TabItem Header="Description" 
              AutomationProperties.Name="Product Description">
        <!-- Content -->
    </TabItem>
    <TabItem Header="Reviews"
             AutomationProperties.Name="Customer Reviews">
        <!-- Content -->
    </TabItem>
</TabControl>

<!-- ✓ GOOD - AutomationProperties for icon buttons -->
<sf:ButtonAdvContent="{StaticResource CloseIcon}"
             AutomationProperties.Name="Close dialog"
             Click="Close_Click" />

<!-- ✓ GOOD - AutomationProperties for error feedback -->
<sf:SfTextBox Text="{Binding Email, ValidatesOnDataErrors=True}"
              AutomationProperties.Name="Email"
              Validation.ErrorTemplate="{StaticResource ErrorTemplate}" />
```

**Validation Rules:**
- [ ] Use native Microsoft or Syncfusion WPF controls where possible (Button, TextBox, CheckBox, etc.)
- [ ] Custom controls implement OnCreateAutomationPeer()
- [ ] All interactive controls have `AutomationProperties.AutomationId`
- [ ] Controls have `AutomationProperties.Name` (or associated Label)
- [ ] Error fields marked with `Validation.ErrorTemplate`
- [ ] Required fields marked with `AutomationProperties.IsRequiredForForm`

---

## Testing Accessibility

**Automated tools:**
```bash
# Inspect.exe (Windows SDK - included with Visual Studio)
# -> Inspect UIA tree and properties
# -> Set focus to elements, verify names and roles

# Narrator (built into Windows)
# -> Settings > Ease of Access > Narrator
# -> Listen to how app reads content

# JAWS Screen Reader (professional testing)
# https://www.freedomscientific.com/products/software/jaws/

# Windows High Contrast Mode
# -> Settings > Ease of Access > High Contrast
```

**Manual testing—test with assistive technologies:**
- [ ] **Keyboard navigation:** Tab through entire interface (no traps)
- [ ] **Screen reader (Narrator/JAWS/NVDA):** Listen to control names and roles
- [ ] **Inspect.exe:** Verify AutomationId, Name, and control pattern
- [ ] **High Contrast Mode:** Enable and verify visibility
- [ ] **Display Scaling:** Test at 150% and 200% DPI
- [ ] **Touch input:** Test touch target sizes on touch-enabled devices

---

## Security Standards

### 2.1 Input Validation & Safety

**Requirement:** Prevent injection attacks and unsafe code execution

**What to Check:**

```csharp
// ✗ BAD - Unsanitized user input in XAML parsing
string xaml = textboxUserInput.Text;
UIElement elem = XamlReader.Load(new StringReader(xaml)); // DANGEROUS!

// ✓ GOOD - User input displayed as text only
textBlock.Text = userInput;

// ✓ GOOD - Validate input before use in queries
string query = "SELECT * FROM Users WHERE Email = @email";
SqlCommand cmd = new SqlCommand(query, connection);
cmd.Parameters.AddWithValue("@email", userEmail); // Parameterized

// ✗ BAD - SQL Injection
string query = $"SELECT * FROM Users WHERE Email = '{userEmail}'"; // DANGEROUS!
```

**Validation Rules:**
- [ ] No `XamlReader.Load()` on unsanitized user input
- [ ] No `Activator.CreateInstance()` on untrusted types
- [ ] SQL queries use parameterized queries (SqlParameter)
- [ ] User input validated before use in file paths
- [ ] No reflection misuse on untrusted data

> 🔴 **BLOCKING:** IF `XamlReader.Load()` or `XamlReader.Parse()` called with user-supplied input → **FAIL** — `"Security violation: unsanitized XAML execution in <class>"`
> 🔴 **BLOCKING:** IF unparameterized SQL string interpolation detected → **FAIL** — `"Security violation: SQL injection risk in <method>"`

---

### 2.2 Secrets & Configuration

**Requirement:** Never hardcode secrets in code or XAML

**What to Check:**

```csharp
// ✗ BAD - Hardcoded API key
string apiKey = "sk_live_12345abcde";
var client = new HttpClient { DefaultRequestHeaders = { Authorization = ... } };

// ✓ GOOD - Configuration file (App.config)
string apiKey = ConfigurationManager.AppSettings["ApiKey"];

// ✓ GOOD - Environment variable
string apiKey = Environment.GetEnvironmentVariable("API_KEY");

// ✓ GOOD - Secrets Manager (for sensitive deployments)
var credentials = new ManagedIdentityCredential();
```

**App.config example:**
```xml
<configuration>
  <appSettings>
    <add key="SyncfusionLicenseKey" value="XXXXX" />
    <add key="ApiEndpoint" value="https://api.example.com" />
  </appSettings>
  <connectionStrings>
    <add name="DefaultConnection" value="Server=...;User=...;Password=..." />
  </connectionStrings>
</configuration>
```

**Validation Rules:**
- [ ] No hardcoded API keys in code
- [ ] No hardcoded connection strings in code
- [ ] No hardcoded credentials (usernames, passwords)
- [ ] Configuration stored in App.config or environment variables
- [ ] Secrets stored in secure vaults (Keyvault, etc.)
- [ ] Never commit secrets to source control

> 🔴 **BLOCKING:** IF any string literal matches secret pattern (API key, password, connection string) in `.cs` or `.xaml` file → **FAIL** — `"Security violation: hardcoded secret detected in <file> at line <n>"`

---

### 2.3 NuGet Dependency Security

**Requirement:** Use trustworthy, well-maintained NuGet packages

**What to Check:**

```xml
<!-- .csproj or packages.config -->
<ItemGroup>
    <PackageReference Include="Syncfusion.SfGrid.WPF" Version="20.0.0" />
    <PackageReference Include="Syncfusion.SfChart.WPF" Version="20.0.0" />
</ItemGroup>
```

**Validation Rules:**
- [ ] All packages from official NuGet.org
- [ ] Syncfusion packages only from official Syncfusion org
- [ ] Run `dotnet list package --vulnerable` regularly
- [ ] No outdated or abandoned packages
- [ ] Verify package signatures where available

---

## Performance Standards

### 3.1 Layout & Rendering Optimization

**Requirement:** Prevent UI thread freezing and smooth rendering

**What to Check:**

```xaml
<!-- ✗ BAD - No virtualization on large lists (UI freeze) -->
<ListBox ItemsSource="{Binding LargeList}">
    <ListBox.ItemTemplate>
        <DataTemplate>
            <Border Padding="10">
                <TextBlock Text="{Binding Name}" />
            </Border>
        </DataTemplate>
    </ListBox.ItemTemplate>
</ListBox>

<!-- ✓ GOOD - Virtualization enabled for large lists -->
<ListBox ItemsSource="{Binding LargeList}"
         VirtualizingStackPanel.IsVirtualizing="True"
         VirtualizingStackPanel.VirtualizationMode="Recycling">
    <ListBox.ItemsPanel>
        <ItemsPanelTemplate>
            <VirtualizingStackPanel />
        </ItemsPanelTemplate>
    </ListBox.ItemsPanel>
    <ListBox.ItemTemplate>
        <DataTemplate>
            <Border Padding="10">
                <TextBlock Text="{Binding Name}" />
            </Border>
        </DataTemplate>
    </ListBox.ItemTemplate>
</ListBox>
```

**Validation Rules:**
- [ ] Large ItemsControls use `VirtualizingStackPanel`
- [ ] Heavy computations performed on background threads (Task/async)
- [ ] No memory leaks in Event Handlers (use WeakEventManager or unsubscribe)
- [ ] Proper use of `Mode=OneWay` for read-only bindings
- [ ] No blocking operations on UI thread (use async/await)

> 🔴 **BLOCKING:** IF `ItemsSource` bound list > 100 items and `VirtualizingStackPanel.IsVirtualizing` is not `True` → **FAIL** — `"Performance violation: virtualization disabled on large list <element>"`
> 🔴 **BLOCKING:** IF `Task.Wait()` or `Task.Result` called on UI thread → **FAIL** — `"Performance violation: UI thread blocked in <method>"`

---

### 3.2 Assembly & Memory Optimization

**Requirement:** Keep assembly size and memory footprint reasonable

**Validation Rules:**
- [ ] Assembly size reasonable for deployment
- [ ] No unnecessary dependencies included
- [ ] No duplicate NuGet packages
- [ ] Unused code removed (no dead code)
- [ ] Proper resource cleanup in Dispose() methods

---

## Code Quality Standards

### 4.1 C# & XAML Standards

**Requirement:** Full type safety and proper MVVM architecture

**What to Check:**

```csharp
// ✗ BAD - Code-behind with business logic
public partial class UserWindow : Window
{
    public UserWindow()
    {
        Initializecontrol();
    }
    
    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        // Business logic in code-behind (BAD!)
        var user = new User { Name = NameTextBox.Text };
        var db = new DatabaseContext();
        db.Users.Add(user);
        db.SaveChanges();
    }
}

// ✓ GOOD - MVVM pattern with logic in ViewModel
public class UserViewModel : INotifyPropertyChanged
{
    private readonly IUserService _userService;
    
    public string Name { get; set; }
    public ICommand SaveCommand { get; set; }
    
    public UserViewModel(IUserService userService)
    {
        _userService = userService;
        SaveCommand = new RelayCommand(async () => await SaveUserAsync());
    }
    
    private async Task SaveUserAsync()
    {
        var user = new User { Name = this.Name };
        await _userService.SaveUserAsync(user);
    }
}
```

**Validation Rules:**
- [ ] No business logic in code-behind
- [ ] MVVM pattern strictly followed (Logic in ViewModel)
- [ ] ViewModels implement `INotifyPropertyChanged`
- [ ] Commands (`ICommand`) used instead of Click events
- [ ] No `dynamic` types or `object` casting
- [ ] Nullable reference types enabled (#nullable enable)
- [ ] XAML resources organized in ResourceDictionaries

> 🔴 **BLOCKING:** IF business logic (service calls, data access, computation) found in code-behind → **FAIL** — `"MVVM violation: business logic in code-behind of <file>"`
> 🔴 **BLOCKING:** IF ViewModel does not implement `INotifyPropertyChanged` → **FAIL** — `"Binding violation: <ViewModel> missing INotifyPropertyChanged"`
> 🔴 **BLOCKING:** IF `{Binding PropertyName}` references a property not defined in the ViewModel → **FAIL** — `"Binding error: <PropertyName> not found in <ViewModel>"`

---

### 4.2 Code Hygiene

**Requirement:** Clean, maintainable code

**What to Check:**

```csharp
// ✗ BAD - Debug code left in production
private void SaveButton_Click(object sender, RoutedEventArgs e)
{
    Debug.WriteLine("Button clicked"); // BAD in production
    System.Diagnostics.Debugger.Break(); // NEVER ship!
    
    var result = SomeFunction();
}

// ✓ GOOD - Clean production code
private void SaveButton_Click(object sender, RoutedEventArgs e)
{
    var result = SomeFunction();
    if (result.IsSuccess)
    {
        MessageBox.Show("Saved successfully");
    }
}
```

**Validation Rules:**
- [ ] No `Debug.WriteLine()` or `MessageBox` in production
- [ ] No `System.Diagnostics.Debugger.Break()`
- [ ] No commented-out code blocks
- [ ] No unused variables or `using` statements
- [ ] Consistent indentation (4 spaces)
- [ ] Consistent naming conventions (PascalCase for properties, _camelCase for private fields)
- [ ] XML documentation on public methods and classes

> 🔴 **BLOCKING:** IF `Debugger.Break()` or `Debug.WriteLine()` found in any non-test file → **FAIL** — `"Code quality violation: debug statement in production code at <file> line <n>"`

---

## Validation Checklist

**Run for every generated WPF screen. Each item is a binary gate — PASS or FAIL. No partial credit. No silent pass.**

> 🔴 **GLOBAL RULE:** Any single FAIL blocks Stage 8 insertion. All items must reach PASS before proceeding.

```
ACCESSIBILITY (UI AUTOMATION)
  [ ] All images/icons have AutomationProperties.Name
      ❌ FAIL: "Missing AutomationProperties.Name on <element>"
  [ ] Decorative images marked with IsSkipCharacter="True"
      ❌ FAIL: "Decorative image not hidden from automation: <element>"
  [ ] Icon buttons have AutomationProperties.Name or ToolTip
      ❌ FAIL: "Icon-only button missing accessible name: <element>"
  [ ] All interactive controls have unique AutomationId
      ❌ FAIL: "Duplicate or missing AutomationId on <element>"
  [ ] Complex controls have AutomationProperties.HelpText
      ❌ FAIL: "Missing HelpText on complex control: <element>"
  [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
      ❌ FAIL: "Contrast ratio <ratio> on <element> — minimum <required>"
  [ ] Information not conveyed by color alone
      ❌ FAIL: "Color-only state indicator on <element>"
  [ ] High Contrast Theme supported via DynamicResources
      ❌ FAIL: "Static resource used where DynamicResource required: <key>"

KEYBOARD NAVIGATION
  [ ] All interactive elements are keyboard reachable (IsTabStop = True)
      ❌ FAIL: "Keyboard inaccessible control: <element>"
  [ ] Tab order logical (left-to-right, top-to-bottom)
      ❌ FAIL: "Illogical tab order detected — verify TabIndex values"
  [ ] No keyboard traps
      ❌ FAIL: "Keyboard trap on <element> — Tab key swallowed in handler"
  [ ] Focus indicators always visible (FocusVisualStyle ≠ null)
      ❌ FAIL: "Focus indicator removed on <element>"
  [ ] Escape closes dialogs; Enter activates default buttons
      ❌ FAIL: "Escape/Enter key handling missing on <window/dialog>"

CONTROLS & FORMS
  [ ] Every input has Label or AutomationProperties.Name
      ❌ FAIL: "Unlabelled input control: <element>"
  [ ] Required fields marked with AutomationProperties.IsRequiredForForm
      ❌ FAIL: "Required field not marked: <element>"
  [ ] Error messages displayed via Validation.ErrorTemplate
      ❌ FAIL: "No error feedback on validated field: <element>"
  [ ] Touch targets ≥ 44×44 device-independent pixels
      ❌ FAIL: "Touch target too small on <element>: <actual> (min 44×44)"

SECURITY
  [ ] No XamlReader.Load/Parse on user input
      ❌ FAIL: "Unsafe XAML execution in <class>"
  [ ] No SQL string interpolation
      ❌ FAIL: "SQL injection risk in <method>"
  [ ] No hardcoded secrets (API keys, passwords, connection strings)
      ❌ FAIL: "Hardcoded secret in <file> at line <n>"
  [ ] All NuGet packages from official NuGet.org
      ❌ FAIL: "Unverified package source: <package>"

PERFORMANCE
  [ ] Large lists (> 100 items) use VirtualizingStackPanel
      ❌ FAIL: "Virtualization disabled on large list: <element>"
  [ ] No Task.Wait() or Task.Result on UI thread
      ❌ FAIL: "UI thread blocked in <method>"
  [ ] Event handlers unsubscribed on Unloaded
      ❌ FAIL: "Potential memory leak — handler not unsubscribed in <class>"

MVVM & CODE QUALITY
  [ ] No business logic in code-behind
      ❌ FAIL: "Business logic in code-behind of <file>"
  [ ] ViewModels implement INotifyPropertyChanged
      ❌ FAIL: "<ViewModel> missing INotifyPropertyChanged"
  [ ] All {Binding} paths resolve to defined ViewModel properties
      ❌ FAIL: "<PropertyName> not found in <ViewModel>"
  [ ] No debug statements in production code
      ❌ FAIL: "Debug statement in <file> at line <n>"
  [ ] Syncfusion theme applied via SfSkinManager (not MergedDictionaries)
      ❌ FAIL: "Syncfusion theme loaded via MergedDictionaries in <file>"
```

---

## Auto-Fix Rules

**Stage 7 automatically applies fixes only when the rule is well-defined and the fix is deterministic and safe.**

> 🔴 **BLOCKING:** IF an issue cannot be auto-fixed safely (ambiguous, requires human judgment, or would change behavior) → **FAIL** — do NOT apply a guess-based correction. Report the issue for manual resolution.

| Issue | Auto-Fix | Safe? |
|-------|----------|-------|
| Missing `AutomationId` | Generate unique ID from control name + type | ✅ Yes |
| Missing `AutomationProperties.Name` | Infer from associated `Label.Content` or `ToolTip` | ✅ Yes (if source is unambiguous) |
| Virtualization disabled on `SfListView` / `SfDataGrid` | Enable `VirtualizingStackPanel.IsVirtualizing="True"` | ✅ Yes |
| Missing `TabIndex` | Calculate logical order (top-to-bottom, left-to-right by Grid position) | ✅ Yes |
| Missing `ToolTip` on icon-only button | ✅ Only if `AutomationProperties.Name` exists — copy as ToolTip | ✅ Conditional |
| Hardcoded `Margin`/`Padding` values | Convert to token resource key if exact match exists in `Themes/Spacing.xaml` | ✅ Conditional |
| Missing `Mode=OneWay` on read-only binding | Add `Mode=OneWay` where property has no setter | ✅ Yes |
| Missing `FocusVisualStyle` | Add standard 2px dashed rectangle focus style | ✅ Yes |
| Color contrast too low | ❌ **Cannot auto-fix** — color choice is a design decision | ❌ FAIL — report to user |
| Hardcoded secrets | ❌ **Cannot auto-fix** — replacement value unknown | ❌ FAIL — report to user |
| Business logic in code-behind | ❌ **Cannot auto-fix** — requires architectural refactor | ❌ FAIL — report to user |
| Missing `INotifyPropertyChanged` | ❌ **Cannot auto-fix** — property raise logic must be authored | ❌ FAIL — report to user |

---

**End of Desktop Standards Reference**  
Updated for **WPF UI Automation** and **MVVM Compliance**  
Aligned with Windows Accessibility Standards and Syncfusion WPF Guidelines  