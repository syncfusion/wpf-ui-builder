# Stage 4: Theming & Design System Selection

**Purpose:** Lock all design system decisions before Stage 5 code generation. This stage is decision-making only — no code is generated here.

**Input:** Stage 2 (project config, .NET version) + Stage 3 (control-mapping.json)
**Output:** All decisions below locked and ready for Stage 5 implementation.

---

## Table of Contents

1. [WPF Application Philosophy](#1-wpf-application-philosophy)
2. [Syncfusion WPF Theme Alignment](#2-syncfusion-wpf-theme-alignment)
3. [Color System Architecture](#3-color-system-architecture)
4. [Spacing & Typography Systems](#4-spacing--typography-systems)
5. [Responsive Strategy (DPI-Aware Scaling)](#5-responsive-strategy-dpi-aware-scaling)
6. [Motion & Accessibility Standards](#6-motion--accessibility-standards)
7. [XAML Styling Token Architecture](#7-xaml-styling-token-architecture)
8. [Syncfusion WPF Control Integration](#8-syncfusion-wpf-control-integration)
9. [MVVM Integration Bridge](#8a-mvvm-integration-bridge-critical)
10. [Load Your Application Reference (MANDATORY)](#9-load-your-application-reference-mandatory)
11. [Stage 4 Decision Checklist](#10-stage-4-decision-checklist)
12. [What Stage 5 Does With These Decisions](#11-what-stage-5-does-with-these-decisions)

---

## ⛔ ERROR HANDLING: Theme & Resource Issues (MC3072, ResourceDictionary Exceptions)

**Common errors in Stage 4-5:**
- ❌ `MC3072: Property 'BorderBrush' does not exist in namespace...`
- ❌ `ResourceDictionary.DeferrableContent exception`
- ❌ Build fails: "Type not found" for Syncfusion theme resources

**Root cause:** Manual Syncfusion theme merging or missing `SfSkinManager` initialization

**Mandatory fixes:**
1. ✅ Apply Syncfusion theme ONLY via `SfSkinManager.SetTheme(this, new Theme("<LockedThemeName>"))` in Window constructor
2. ✅ Set `SfSkinManager.ApplyStylesOnApplication = true` in `App.xaml.cs` `OnStartup()`
3. ❌ NEVER merge Syncfusion theme ResourceDictionaries manually into `Application.Resources`
4. ⛔ **MANDATORY: When using Syncfusion themes — DO NOT create or merge custom resources in `Themes/Colors.xaml`, `Themes/Spacing.xaml`, `Themes/Typography.xaml`**
5. ✅ If custom app resources needed (non-theme): Define ONLY in `App.xaml` or separate non-theme files
6. ⛔ If build fails: Check skill file for correct `SfSkinManager` API pattern before modifying code

---

## 1. WPF Application Philosophy

Confirm the application type detected in Stage 2. This choice drives all downstream theme, color, and layout decisions.

| Application Type | Design Priority | Syncfusion Theme Pairing |
|---|---|---|
| **Enterprise** | Data density, task efficiency | Material or Office2019 |
| **Consumer** | Clarity, modern aesthetics | FluentLight or Material3Light |
| **LOB** | Domain workflows, expert users | Office2019 or Material |
| **Creative/Tool** | Dark mode, visual customization | FluentDark or Material3Dark |

**Rules:**
- ✅ Confirm or override Stage 2's detected type — document the reason if overriding
- ❌ Do not mix application philosophies (e.g., consumer simplicity in an enterprise data grid)
- ✅ Proceed to Section 9 after confirming application type

---

## 2. Syncfusion WPF Theme Alignment

Select one Syncfusion theme. This choice is **locked** — it determines the NuGet package installed in Stage 6 and the `SfSkinManager` call generated in Stage 5.

### Theme Selection

| Scenario | Theme |
|---|---|
| Windows 11 native appearance | `Windows11Light` / `Windows11Dark` |
| Microsoft Fluent (reveal effects, rounded) | `FluentLight` / `FluentDark` |
| Material Design 3 (modern, expressive) | `Material3Light` / `Material3Dark` |
| Enterprise / Office-style | `Office2019Colorful` / `Office2019White` / `Office2019Black` |
| Follows OS light/dark preference | `SystemTheme` |

### Platform Compatibility

| Platform | Supported Themes | Min Syncfusion |
|---|---|---|
| .NET Framework 4.6.2 / 4.7.2 | All themes | 2023.3 |
| .NET 8.0+ | All themes | 2024.1 |
| .NET 6.0 – 7.0 | All except Material3 (partial) | 2024.1 for Material3 |

### Theme NuGet Packages

| Theme | NuGet Package |
|---|---|
| `Windows11Light` | `Syncfusion.Themes.Windows11Light.WPF` |
| `Windows11Dark` | `Syncfusion.Themes.Windows11Dark.WPF` |
| `FluentLight` | `Syncfusion.Themes.FluentLight.WPF` |
| `FluentDark` | `Syncfusion.Themes.FluentDark.WPF` |
| `Material3Light` | `Syncfusion.Themes.Material3Light.WPF` |
| `Material3Dark` | `Syncfusion.Themes.Material3Dark.WPF` |
| `Office2019Colorful` | `Syncfusion.Themes.Office2019Colorful.WPF` |

**Version rule:** Theme NuGet package version MUST match all other Syncfusion packages detected in Stage 2.

---

## 3. Color System Architecture

Define a semantic color palette. When using Syncfusion themes, colors are provided by `SfSkinManager` — do NOT create `Themes/Colors.xaml`. Custom colors are only needed for app-level branding elements not covered by the Syncfusion theme.

**Required color roles (custom overrides only — when NOT using Syncfusion theme colors):**
- **Primary** — brand color, CTAs, key actions
- **Semantic** — success (`#4CAF50`), warning (`#FFC107`), error (`#F44336`), info (`#2196F3`)
- **Neutral scale** — text, backgrounds, borders
- **Surface** — cards, containers (optional)

**Rules:**
- ✅ Use `{DynamicResource}` for all theme-dependent colors (supports runtime switching)
- ✅ Verify contrast ≥ 4.5:1 for all text and UI controls (WCAG AA)
- ❌ Do NOT hardcode hex values directly in XAML controls — always use resource keys
- ❌ Do NOT create `Themes/Colors.xaml` when Syncfusion theme is active — theme provides these
- ❌ Do NOT deviate from the selected theme's semantic naming

**Dark mode decision (make now):**
- Light only → no action needed
- Dark support → use matching dark theme name (e.g., `Windows11Dark`); apply via `SfSkinManager`

---

## 4. Spacing & Typography Systems

### Spacing (DPI-Aware)

Use a 4pt base grid defined in `Themes/Spacing.xaml`. WPF device-independent units (DIP) scale automatically with system DPI.

```xaml
<sys:Double x:Key="SpaceXSmall">4</sys:Double>
<sys:Double x:Key="SpaceSmall">8</sys:Double>
<sys:Double x:Key="SpaceMedium">12</sys:Double>
<sys:Double x:Key="SpaceLarge">16</sys:Double>
<sys:Double x:Key="SpaceXLarge">24</sys:Double>
```

- ❌ Never hardcode pixel values in XAML — always reference spacing resources

### Typography

Use a consistent modular scale defined in `Themes/Typography.xaml`. Recommended ratio: **1.25** (major third).

```xaml
<FontFamily x:Key="FontFamilyDefault">Segoe UI</FontFamily>
<sys:Double x:Key="FontSizeSmall">10</sys:Double>
<sys:Double x:Key="FontSizeBody">11</sys:Double>
<sys:Double x:Key="FontSizeLarge">13</sys:Double>
<sys:Double x:Key="FontSizeHeading">16</sys:Double>
<sys:Double x:Key="FontSizeTitle">20</sys:Double>
```

- Minimum body font: **10pt** (96 DPI baseline)
- Line height: **1.4–1.6** for body `TextBlock`; **1.2** for headings

---

## 5. Responsive Strategy (DPI-Aware Scaling)

**Design approach:** Fluid layouts — no fixed resolutions. Windows can be any size.

| Window Category | Min Size | Use Case |
|---|---|---|
| Small | 600×400 | Dialogs, utilities |
| Medium | 1024×768 | Standard business apps |
| Large | 1280×1024+ | Dashboards, multi-pane |

**Layout panel strategy:**
- `Grid` with `*` star sizing for flexible multi-column layouts
- `StackPanel` for single-column or narrow views
- `DockPanel` for fixed header/footer with flexible content
- ❌ Do not use hardcoded pixel widths for layout columns

**DPI awareness:**
- Enable per-monitor DPI awareness in `app.manifest` (supports multi-monitor setups)
- Set `MinWidth` / `MinHeight` in XAML only where minimum usability requires it

---

## 6. Motion & Accessibility Standards

### Animation Timing

| Duration | Use |
|---|---|
| 100ms | Hover states, instant feedback |
| 300ms | Transitions, dropdowns, state changes |
| 500ms | Major layout reveals |

- ✅ Respect `prefers-reduced-motion` — set animation duration to 0ms when enabled (WCAG requirement)
- ❌ Do not animate for aesthetics alone; every animation must communicate intent

### Accessibility

- Minimum touch/click target: **44×44 device-independent units**
- Minimum spacing between interactive targets: **8px**
- Color contrast: **≥ 4.5:1** for text and UI controls (WCAG 2.1 AA)
- Apply `AutomationProperties.Name` and `AutomationProperties.HelpText` on all interactive Syncfusion controls
- Keyboard navigation: correct tab order, visible focus ring on `SfButton` and `SfTextInputLayout`

---

## 7. XAML Styling Token Architecture

### Resource File Structure

**When using Syncfusion themes:**
❌ Do NOT create `Themes/Colors.xaml`, `Themes/Spacing.xaml`, `Themes/Typography.xaml`
❌ Do NOT merge theme resources into `<Application.Resources>`

**Instead:**
✅ Theme resources (colors, spacing, typography) are provided by `SfSkinManager` at runtime
✅ If custom app-level resources needed (non-theme): Define ONLY in `<Application.Resources>`
✅ Keep custom resources completely separate from Syncfusion theme application

**Do NOT add Syncfusion theme ResourceDictionaries to `MergedDictionaries`** — themes are applied at runtime via `SfSkinManager` only (see Section 8).

### Semantic Naming Convention (Mandatory)

Use role-based names, not value-based names:

| ❌ Descriptive (avoid) | ✅ Semantic (use) |
|---|---|
| `BlueColorBrush600` | `PrimaryColorBrush` |
| `PaddingValue16` | `SpaceLarge` |
| `Font14px` | `HeadingFontSize` |

### Resource Hierarchy

1. **Primitives** — base SolidColorBrush, Double spacing, FontSize values
2. **Semantic** — role-based resources composed from primitives (`TextColorBrush`, `ControlGap`)
3. **Control-level** — sparingly, only for control-specific overrides (`ButtonPadding`)

---

## 8. Syncfusion WPF Control Integration

### Theme Application via SfSkinManager (MANDATORY)

✅ Apply Syncfusion themes at runtime using `SfSkinManager`.
❌ Do NOT merge Syncfusion theme ResourceDictionaries into `Application.Resources`.

**App.xaml.cs — `OnStartup()`:**
```csharp
using Syncfusion.SfSkinManager;

protected override void OnStartup(StartupEventArgs e)
{
    base.OnStartup(e);
    SyncfusionLicenseProvider.RegisterLicense(Environment.GetEnvironmentVariable("SYNCFUSION_LICENSE_KEY"));
    SfSkinManager.ApplyStylesOnApplication = true;
}
```

**Per-Window (Window constructor):**
```csharp
using Syncfusion.SfSkinManager;

public MyWindow()
{
    InitializeComponent();
    SfSkinManager.SetTheme(this, new Theme("Windows11Light")); // Use locked theme name
}
```

**For further customization:** Refer to `skills/syncfusion-wpf-theming/SKILL.md` for `ThemeSettings`, palette overrides, and runtime theme switching.

### Custom Resource Coordination

- ✅ If custom app-level colors are needed (not covered by Syncfusion theme): define in `<Application.Resources>` directly — NOT in `Themes/Colors.xaml`
- ✅ Reference token resources in control styles — never hardcode values on controls
- ❌ Do not set `Background="#FF0000"` directly on controls — use a `SolidColorBrush` resource key
- ❌ Do not create separate theme files (`Themes/Colors.xaml`) when `SfSkinManager` is active

### Runtime Issue Prevention

| Issue | Prevention |
|---|---|
| Theme NuGet package not installed | Stage 6 MUST install `Syncfusion.Themes.<ThemeName>.WPF` matching locked theme |
| `SfSkinManager` assembly not found | Stage 6 MUST include `Syncfusion.SfSkinManager.WPF` in dependency list |
| Version mismatch between theme and control packages | All Syncfusion packages use the version detected in Stage 2 |

---

## 9. MVVM Integration Bridge (CRITICAL)

Every interactive UI element defined in Stage 4 must have a corresponding ViewModel connection declared here. Stage 5 uses this mapping to wire all bindings and commands — unbound controls will not function.

### Mandatory Binding Rules

| UI Element | Required MVVM Connection | Example |
|---|---|---|
| Input field (`SfTextInputLayout`, `TextBox`) | Two-way bound ViewModel property | `{Binding Email, Mode=TwoWay}` |
| Action button (`ButtonAdv`) | `ICommand` in ViewModel | `Command="{Binding LoginCommand}"` |
| Selection control (`ComboBoxAdv`, `SfDataGrid`) | Bound `SelectedItem` / `ItemsSource` | `ItemsSource="{Binding Items}"` |
| Toggle / checkbox | Bound bool property | `IsChecked="{Binding RememberMe}"` |
| Navigation (screen transition) | Triggered via ViewModel command, not code-behind | `Command="{Binding NavigateToDashboardCommand}"` |
| Error / status display | Bound read-only ViewModel property | `Text="{Binding ErrorMessage}"` |

**Validation gate:**
```
FOR EACH interactive UI element in control-mapping.json:
  IF no {Binding} or Command binding declared
  → FAIL: "No MVVM connection on '<elementId>' — UI interaction will not work
           Fix: add binding or command in Stage 5 code generation"

FOR EACH navigation flow (e.g., Login → Dashboard):
  IF navigation is not triggered via a ViewModel ICommand
  → FAIL: "Broken UI workflow: '<flow>' not wired via MVVM
           Fix: implement NavigationCommand in ViewModel; open target Window on execute"
```

### Common Scenario Checklist

| Scenario | MVVM Requirement |
|---|---|
| Login button → authenticate → navigate | `LoginCommand` in ViewModel; opens `DashboardWindow` on success |
| Form field → validate on change | Property setter raises validation; `ErrorMessage` property updated |
| Grid row selection → detail view | `SelectedItem` bound; command opens detail on selection changed |
| Cancel / close button | `CloseCommand` calls `Window.Close()` via ViewModel |

❌ Do NOT leave any Button, input, or navigation trigger without a ViewModel binding or command.

---

## 10. Load Your Application Reference (MANDATORY)

Based on the application type confirmed in Section 1, load the corresponding skill reference before proceeding to Stage 5. Reference files are located at any of:

```
<skills-root>/syncfusion-wpf-ui-builder/references/
<skills-root>/syncfusion-wpf-theming/SKILL.md
```

Where `<skills-root>` is one of: `.codestudio/skills`, `.agent/skills`, `.agents/skills`, `.github/skills`, `skills`

| Application Type | Theme Focus | Key Reference |
|---|---|---|
| **Enterprise** | Material or Office2019 — data density, professional | `references/syncfusion-themes.md` + `references/wpf-dotnet-standards.md` |
| **Consumer** | FluentLight or Material3Light — modern, approachable | `references/syncfusion-themes.md` |
| **LOB** | Office2019 or Material — expert workflows, productivity | `references/syncfusion-themes.md` + `references/wpf-dotnet-standards.md` |
| **Creative** | FluentDark or Material3Dark — dark mode, customization | `references/syncfusion-themes.md` |

⛔ **You cannot proceed to Stage 5 without loading your application reference.**

---

## 11. Stage 4 Decision Checklist

Confirm all items are locked before proceeding.

### Application & Theme
- ✅ Application type confirmed (Enterprise / Consumer / LOB / Creative)
- ✅ Syncfusion WPF theme selected and documented
- ✅ Theme NuGet package name recorded (e.g., `Syncfusion.Themes.Windows11Light.WPF`)
- ✅ Application reference file loaded (Section 9)

### Color System
- ✅ Primary, semantic, and neutral palette defined
- ✅ Custom colors (if any) defined in `<Application.Resources>` — NOT in `Themes/Colors.xaml` when Syncfusion theme active
- ✅ Dark mode decision made (light only / use matching dark theme name)
- ✅ WCAG contrast ≥ 4.5:1 verified

### Spacing & Typography
- ✅ 4pt base spacing grid defined (tokens or Syncfusion theme defaults)
- ✅ Typography modular scale (1.25 ratio recommended)
- ✅ Minimum body font ≥ 10pt; line height 1.4–1.6

### Responsive Design
- ✅ Fluid layout strategy confirmed (Grid with `*` sizing)
- ✅ Per-monitor DPI awareness enabled
- ✅ Minimum window size set only where required

### Accessibility
- ✅ Animation durations: 100ms / 300ms / 500ms
- ✅ Reduced motion: duration → 0ms when OS setting enabled
- ✅ Touch targets ≥ 44×44 DIP
- ✅ `AutomationProperties` plan confirmed for all interactive controls

### XAML Token Architecture
- ✅ Semantic resource naming applied (role-based, not value-based)
- ✅ Custom resources (if any) in `<Application.Resources>` only — no separate theme files when SfSkinManager active
- ✅ Syncfusion theme applied via `SfSkinManager` — NOT via `MergedDictionaries`

### MVVM Integration
- ✅ Every interactive control (button, input, grid) has a declared ViewModel binding or command
- ✅ Every navigation flow (e.g., Login → Dashboard) wired via `ICommand` in ViewModel
- ✅ Error/status display bound to ViewModel property
- ✅ No UI control left without a ViewModel connection

### Syncfusion Integration
- ✅ `SfSkinManager.ApplyStylesOnApplication = true` in `OnStartup()`
- ✅ `SfSkinManager.SetTheme(this, new Theme("<LockedThemeName>"))` per Window
- ✅ All Syncfusion package versions consistent with Stage 2 detection

---

## 12. What Stage 5 Does With These Decisions

Stage 5 generates implementation — not decisions. It uses Stage 4 output to produce:

| Stage 4 Decision | Stage 5 Output |
|---|---|
| Locked theme + SfSkinManager pattern | `SfSkinManager.SetTheme()` calls in every Window constructor |
| Custom color resources (if any) | `SolidColorBrush` entries in `<Application.Resources>` — no separate theme files |
| Semantic resource naming | All XAML controls reference token keys, never hardcoded values |
| Responsive layout strategy | Grid with `*` sizing; no hardcoded pixel widths |
| Accessibility standards | `AutomationProperties`, min touch targets, focus rings on all interactive controls |
| **MVVM integration map (Section 8A)** | Every button → `Command` binding; every input → `{Binding}` property; every navigation → `ICommand` in ViewModel |
| Application reference (Section 9) | Code patterns aligned to application type |

✅ All Stage 5 code is consistent with and traceable to decisions locked here.

**Output:** Production-ready WPF code aligned with Stage 4 design decisions