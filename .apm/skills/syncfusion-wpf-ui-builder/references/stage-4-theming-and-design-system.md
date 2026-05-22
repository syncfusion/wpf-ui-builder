# Stage 4: Theming & Design System Selection

**Purpose:** Understand design system trade-offs and lock theming decisions before code generation.

## Overview

This stage is about **decision-making clarity**, not code generation. You'll:

- **Confirm your .NET platform** (from Stage 2) and understand its design philosophy
- **Select a Syncfusion WPF theme** that aligns with your application type
- **Define color architecture** based on principles (perceptual uniformity, contrast, brand cohesion)
- **Establish spacing and typography scales** that respect readability and hierarchy (DPI-aware)
- **Plan responsive strategy** for window sizing and scaling
- **Document XAML styling patterns** so Stage 5 can generate consistent code

**Key Insight:** Your application type IS a design system choice. Enterprise applications, consumer-facing UIs, and internal tools have fundamentally different philosophies about spacing, color, and control behavior. Stage 4 ensures your Syncfusion WPF theme and custom XAML styling align with your application's intent.

**Output:** Design system decisions documented and ready for implementation in Stage 5.

---

## Table of Contents

1. [WPF Application Philosophy](#1-wpf-application-philosophy)
2. [Syncfusion WPF Theme Alignment](#2-syncfusion-wpf-theme-alignment)
3. [Color System Architecture](#3-color-system-architecture)
4. [Spacing & Typography Systems](#4-spacing--typography-systems)
5. [Responsive Strategy (DPI-Aware Scaling)](#5-responsive-strategy-dpi-aware-scaling)
6. [Motion & Accessibility Standards](#6-motion--accessibility-standards)
7. [XAML Styling Token Architecture](#7-xaml-styling-token-architecture)
8. [Syncfusion WPF control Integration](#8-syncfusion-wpf-control-integration)
9. [Load Your Application Reference (MANDATORY)](#9-load-your-application-reference-mandatory)
10. [Stage 4 Decision Checklist](#10-stage-4-decision-checklist)
11. [What Stage 5 Does With These Decisions](#what-stage-5-does-with-these-decisions)

---

## 1. WPF Application Philosophy

**Input:** .NET platform and application type detected in Stage 2

**Decision Point:** Your application type defines everything downstream. Understand what you're committing to:

### Understanding Your Application Type

**Enterprise Application**
- Philosophy: Data-heavy, task-oriented interfaces with grid-based layouts
- Design implication: Efficiency > aesthetics; information density is priority
- Syncfusion pairing: Use Material or Office2019 theme (professional, data-centric visual language)
- Trade-off: Consistent, professional look, but less distinctive branding

**Consumer Application**
- Philosophy: Task-focused with emphasis on clarity and user guidance
- Design implication: Balance efficiency with approachability; clean, modern aesthetics
- Syncfusion pairing: Use Fluent or Material theme (modern, accessible visual language)
- Trade-off: Visually appealing, but requires careful information prioritization

**LOB (Line of Business) Application**
- Philosophy: Specific workflows tailored to domain users
- Design implication: Optimize for expert users; domain-specific patterns
- Syncfusion pairing: Use Material or Office2019 theme (familiar, productivity-focused)
- Trade-off: Specialized, but less transferable to other contexts

**Creative/Design Tool**
- Philosophy: Heavy UI customization, dark theme preference, real-time feedback
- Design implication: Visual hierarchy matters; dark mode essential
- Syncfusion pairing: Use Fluent Dark or custom Material Dark (supports intense work)
- Trade-off: Distinctive but requires careful accessibility planning

### The Non-Obvious Truth

**You cannot mix design philosophies.** Don't use material design principles for enterprise data grids, or consumer-friendly simplicity for domain-specific workflows. Each application type makes specific assumptions about user expertise, task density, and interaction patterns. Mixing them creates confusing, unusable interfaces.

### Decision: Confirm Your Application Type

Review Stage 2's detection:
- What is the application's primary purpose?
- Who are the end users (enterprise staff, consumers, technical experts)?
- Is this a one-time task UI or long-use productivity tool?
- Does branding / visual distinctiveness matter?

If Stage 2 detected wrong, or you want to override: **Document why.** Design decisions need reasoning.

**→ MANDATORY:** After confirming, you MUST proceed to **Section 9** to load your application-specific implementation reference. Do not skip this step.

**Output:** WPF application philosophy understood and confirmed

---

## 2. Syncfusion WPF Theme Alignment

**Core Principle:** Syncfusion WPF controls must coordinate with your application design philosophy, not fight it.

### Why Theme Matching Matters

Syncfusion provides 17 professionally designed built-in themes for WPF across multiple design systems. When your Syncfusion WPF theme aligns with your application type, control styling integrates seamlessly. When they don't align, you'll spend Stage 5+ fighting style conflicts and writing excessive custom XAML.

**Example of alignment:**
- Windows 11 focused application + **Windows11Light/Dark** = Native Windows 11 appearance with clean, minimal design language.
- Modern high-end application + **FluentLight/Dark** = Reveal animations, acrylic effects, and rounded corners.
- Material Design application + **Material3Light/Dark** = Follows latest Material Design 3 guidelines with vibrant colors.
- Enterprise application + **Office2019Colorful/White** = Professional business appearance familiar to Office users.

### Theme Selection Decision Tree

**If you target Windows 11 users:**
→ Use **Windows11Light** or **Windows11Dark**
- Why: Native appearance, strong contrast for accessibility.

**If you want a polished, Microsoft-style appearance:**
→ Use **FluentLight** or **FluentDark**
- Why: Reveal animations and reveal-styled shadows.

**If you need cross-platform Material Design consistency:**
→ Use **Material3Light** or **Material3Dark** (preferred) or **MaterialLight/Dark** (Classic)
- Why: Expressive colors and modern Material components.

**If you are building an Enterprise/Office-style application:**
→ Use **Office2019Colorful/White/Black/DarkGray**
- Why: Familiar look and high visibility for business productivity.

**If you want to follow User OS Preferences:**
→ Use **SystemTheme**
- Why: Automatically follows OS settings (Light/Dark) and respects Windows accessibility settings.

### The Hard Rule

**Never pair a Syncfusion WPF theme with a mismatched application type.** If you do:
- Stage 5 code generation will be inconsistent
- Custom XAML will grow chaotic as you patch conflicts
- Your design system won't scale
- Users will feel the design doesn't fit their workflow

If your application type is unclear or mixed, document it now and choose the primary theme.

**→ REQUIRED:** Your theme choice is locked. This determines your **Section 9 application reference file**.

**Output:** Syncfusion WPF theme aligned with application type

---

## 3. Color System Architecture

### 3.1 Color Palette Principles (.NET Standard)
WPF applications should follow .NET coloring standards to ensure predictability and accessibility across Windows versions.

- **System Brushes:** Use `SystemColors` where possible for native interaction.
- **Dynamic Resources:** Always use `{DynamicResource}` for theme-dependent colors to support runtime switching.
- **Color Contrast:** Desktop standards require at least 4.5:1 for text.

### 3.2 Brand Color & Semantic Palette

**The Decision Point:** Your color palette must have clear roles.

Define:
1. **Primary color** (brand, CTAs, key actions)
2. **Semantic colors** (success, warning, error, info)
3. **Neutral scale** (text, backgrounds, borders)
4. **Surface colors** (cards, modals, containers) — optional if neutrals are sufficient

**Framework-Specific Consideration:**

- **Syncfusion WPF Theme users:** You'll configure colors in XAML ResourceDictionary files (Colors.xaml). Syncfusion themes follow standard semantic naming (Primary, Success, Warning, Danger, Info). Follow this pattern for consistent control styling.
- **Office2019 / Fluent users:** These design systems follow Microsoft's specific color token naming and behavior. Ensure your custom XAML resources respect their palette conventions to avoid visual debt.
- **Material3 users:** Material Design 3 has specific color token naming (Primary, Secondary, Tertiary, Error, Surface) with fixed roles. If using the Syncfusion Material3 theme, don't deviate from this schema.

**The Anti-Pattern:** Creating a palette that looks good in isolation but doesn't respect framework conventions. Your custom primary color might be beautiful, but if it breaks your framework's semantic system, it creates inconsistency.

### 3.3 Tinted Neutrals for Cohesion (WPF)

**Why tinted neutrals matter in WPF:**

Pure gray (zero saturation in HSL/HSV) feels lifeless next to a brand color in XAML SolidColorBrush resources. Adding a *tiny* saturation value and tinting toward your brand hue creates subconscious visual cohesion without reading as "tinted."

**Example (XAML):**
```xaml
<!-- Brand color: Teal -->
<SolidColorBrush x:Key="BrandColor" Color="#0DA5A5" />

<!-- Pure gray: Lifeless -->
<SolidColorBrush x:Key="PureGray" Color="#808080" />

<!-- Tinted gray: Cohesive (teal-tinted gray) -->
<SolidColorBrush x:Key="TintedGray" Color="#7A9999" />
```

**But avoid the reflex:** Don't always tint toward warm orange or cool blue. That's the laziest default. Tint toward *this specific project's* brand hue.

### 3.4 Dark Mode: Structural, Not Inverted (WPF)

**The Misconception:** Dark mode is just light mode inverted.

**The Reality:** Dark mode requires different design thinking in WPF:
- Light mode uses shadow (darker) for depth
- Dark mode uses lighter surfaces for depth (no harsh shadows)
- Light mode uses vibrant accents
- Dark mode desaturates accents slightly (vibrant colors feel aggressive on dark backgrounds)
- Light mode: text is dark on light background
- Dark mode: text is light on dark background, usually needs slightly reduced font weight

**WPF Implementation Consideration:**
- Dark mode uses separate ResourceDictionary files (e.g., `DarkTheme.xaml`)
- Toggle via `Application.Current.Resources.MergedDictionaries` at runtime
- Syncfusion WPF controls support Material Dark and Fluent Dark themes natively

**Decision Point:** Are you supporting dark mode?
- If **no**: You're done here
- If **yes**: Plan it now. It's not an afterthought, it's a design system choice

**📖 For Syncfusion WPF Themes:**
Refer to **Skill: syncfusion-wpf-theming** → **built-in-themes.md** for:
- Detailed characteristics of Windows11, Fluent, Material, and Office2019 themes.
- NuGet package names for all 17 documented themes.
- Best practices for choosing between Light/Dark variants.
- Visual characteristics of each design system.

**Output:** Color system architecture decided

---

## 4. Spacing & Typography Systems (WPF)

### 4.1 Spacing Grid: DPI-Aware Sizing

**Decision Point:** WPF spacing must account for DPI scaling. Unlike web pixels, WPF device-independent units (DIP) scale with system DPI.

**Standard DPI Grid (96 DPI = 100%):** 4px base unit
- Why: Matches standard Windows UI conventions
- When to override: If you need coarser granularity (8px grid: 8px, 16px, 24px...)

**At Different DPI Levels:**
- 100% DPI (96 DPI): Use 4px base units
- 125% DPI (120 DPI): 4px becomes 5px automatically (WPF handles scaling)
- 150% DPI (144 DPI): 4px becomes 6px automatically
- 200% DPI (192 DPI): 4px becomes 8px automatically

**WPF XAML Example:**
```xaml
<!-- Define spacing in device-independent units (DIP) -->
<sys:Double x:Key="SpaceXSmall">4</sys:Double>
<sys:Double x:Key="SpaceSmall">8</sys:Double>
<sys:Double x:Key="SpaceMedium">12</sys:Double>
<sys:Double x:Key="SpaceLarge">16</sys:Double>
<sys:Double x:Key="SpaceXLarge">24</sys:Double>
```

**The Anti-Pattern:** Using hard-coded pixel values in XAML. Always use ResourceDictionary resources so spacing scales with DPI automatically.

### 4.2 Typography Hierarchy: Modular Scale, Not Random (WPF)

**Non-Obvious Principle:** Too many font sizes that are too close together create muddy hierarchy in WPF UIs.

Compare:
- ❌ Muddy: 11pt, 12pt, 13pt, 14pt, 15pt (hard to distinguish hierarchy)
- ✅ Clear: 10pt, 12pt, 14pt, 16pt, 18pt, 22pt (obvious visual progression)

**Use a consistent ratio in WPF.** Common options:
- 1.25 (major third) — good balance, subtle but clear
- 1.33 (perfect fourth) — more contrast
- 1.5 (perfect fifth) — high contrast, for designs where hierarchy needs obvious

**Minimum Body Text Size (WPF):** Never smaller than 10pt on screen (96 DPI standard). Smaller than this strains eyes and fails accessibility standards.

**Line Height Rule (WPF):** 1.4-1.6 for body text in TextBlocks. Increase for light text on dark (add 0.05-0.1 because light text reads heavier). Decrease for headlines (1.2 is fine for short text).

**WPF XAML Typography Definition:**
```xaml
<!-- Define typography hierarchy in ResourceDictionary -->
<FontFamily x:Key="FontFamilyDefault">Segoe UI</FontFamily>
<sys:Double x:Key="FontSizeBody">11</sys:Double>
<sys:Double x:Key="FontSizeSmall">10</sys:Double>
<sys:Double x:Key="FontSizeLarge">13</sys:Double>
<sys:Double x:Key="FontSizeHeading">16</sys:Double>
<sys:Double x:Key="FontSizeTitle">20</sys:Double>
```

**Decision Point:** Are you using Syncfusion WPF theme defaults, or defining custom sizes?
- Default: Faster, proven, integrates with Syncfusion controls
- Custom: More control, but requires careful testing for hierarchy clarity

**Output:** Spacing and typography systems decided

---

## 5. Responsive Strategy (DPI-Aware Scaling)

### 5.1 Window-First Thinking (WPF)

**Principle:** Start with small window constraints, scale UP for larger monitors. Never design for fixed resolution.

Why: WPF windows can be any size. DPI-aware scaling ensures UI remains readable at 96, 120, 144, and 192 DPI. If you hardcode sizes, your UI will break on high-DPI displays or when windows are resized.

### 5.2 Size Categories (WPF Windows)

**Standard window size categories:**
- **Small (800×600):** Dialog-sized windows, small utilities
- **Medium (1024×768):** Standard business applications
- **Large (1280×1024+):** Data-heavy dashboards, multi-pane layouts

**DPI Awareness Decision:**
- **Per-Monitor DPI (WPF Default):** Each monitor's DPI is respected independently (correct for multi-monitor setups)
- **System DPI:** Single DPI setting for all monitors (simpler but less flexible)

**Recommendation:** Always enable per-monitor DPI awareness in your WPF application for multi-monitor support.

**Content-Driven Overrides:** If your application requires a minimum window size for usability, set `MinWidth` and `MinHeight` in XAML. Common patterns:
```xaml
<Window MinWidth="600" MinHeight="400" />
```

**Decision Point:** Are you designing for fixed window sizes or fluid layouts?
- Fixed sizes: Easier initial design, but poor experience on different screen sizes
- Fluid (Recommended): More effort initially, scales to any window size or DPI

### 5.3 Layout Panels for Responsive Behavior (WPF)

**WPF equivalent to CSS media queries: Layout Panels**

Instead of CSS breakpoints, use WPF's layout panels to respond to available space:
- **Grid:** Column/row definitions respond to window size
- **StackPanel:** Vertical stacking on narrow windows
- **DockPanel:** Header/footer fixed, content flexible
- **UniformGrid:** Equal-sized cells that scale with window

**Example - Responsive Layout (narrow to wide):**
```xaml
<!-- Narrow window: Single column -->
<StackPanel Orientation="Vertical" />

<!-- Wide window: Use Grid for multi-column -->
<Grid>
  <Grid.ColumnDefinitions>
    <ColumnDefinition Width="*" />
    <ColumnDefinition Width="*" />
  </Grid.ColumnDefinitions>
</Grid>
```

**Modern best practice:** Use `*` (star sizing) for flexible proportions, avoid hard-coded pixel widths for layout columns.

**Compatibility Note:** All WPF versions support layout panels natively. No fallbacks needed.

**Output:** Responsive strategy decided

---

## 6. Motion & Accessibility Standards

### 6.1 Motion Purpose and Timing

**Rule:** Animations serve specific purposes. Don't animate for aesthetics alone.

Good uses:
- **Transitions:** State changes (button press, hover)
- **Reveals:** Elements appearing (dropdown open, toast notification)
- **Feedback:** User actions acknowledged (loading spinner, success checkmark)

Bad uses:
- Decorative floating elements
- Parallax scrolling
- Anything that doesn't communicate intent

**Standard durations:**
- Micro (100ms): Hover feedback, immediate response
- Standard (300ms): Transitions, state changes, small reveals
- Slow (500ms): Major layout changes, important reveals

**The Non-Obvious Truth:** Slower isn't always better. 300ms feels responsive. 500ms feels sluggish. 100ms feels snappy but can feel jarring on slower devices.

### 6.2 Reduced Motion: Non-Negotiable

**WCAG Requirement:** Respect `prefers-reduced-motion: reduce` by removing animations.

This isn't optional accessibility—it's a legal requirement for accessible UI. Users with vestibular disorders experience motion sickness from animations.

**Implementation:** When a user has `prefers-reduced-motion` enabled, disable all animations (duration → 0ms).

### 6.3 Touch Targets

**Rule:** Interactive elements must be at least 44x44px (WCAG recommendation).

This includes:
- Buttons
- Form inputs
- Links
- Checkbox/radio areas

**Space them at least 8px apart** to prevent accidental touches.

**Visual vs Touch Size:** A button might *look* like 24x24px (visual icon), but its touch target should be 44x44px via padding or pseudo-elements.

### 6.4 Color Contrast

**WCAG 2.1 AA requirement:** 4.5:1 minimum contrast for text and UI controls.

This means:
- Dark text on light background must be dark enough
- Light text on dark background must be light enough
- Placeholder text counts—it needs contrast too

**Common fail:** Light gray placeholder text on white. It looks good but fails accessibility.

**Testing:** Don't trust your eyes. Use WCAG contrast checkers to verify.

**Decision Point:** Are you aiming for AA (minimum legal requirement) or AAA (higher standard, harder to achieve)?

**Output:** Motion & accessibility standards understood

---

## 7. XAML Styling Token Architecture

### 7.1 Resource Key Naming: Semantic, Not Descriptive

**The Problem with Descriptive Names:**
- `BlueColorBrush600`, `PaddingValue16` are hardcoded to specific values
- If you need to change "blue" to "purple," you rename every resource and break meaning
- New team members don't understand *why* a resource is used

**Semantic Naming (Recommended):**
- `PrimaryColorBrush` means "brand color" (value irrelevant)
- `LargeSpacingValue` means "large spacing" in context
- `HeadingFontSize` means "heading typography" (specific size irrelevant)

If you need to rebrand from blue to purple: change the value once in ResourceDictionary, everywhere understands the intent.

### 7.2 Resource Hierarchy (Levels)

**Level 1: Primitive Resources**
- Base colors (SolidColorBrush), spacing units (Double), font sizes (Double)
- Syncfusion WPF theme provides these; you customize via overrides
- Example: `PrimaryColorBrush`, `SpaceSmallValue`, `BodyFontSize`

**Level 2: Semantic Resources**
- Composed from primitives, role-based
- `TextColorBrush: {uses PrimaryColorBrush dark shade}` (semantic: "text should be dark primary")
- `controlGapValue: {uses LargeSpacingValue}` (semantic: "controls space by large units")
- `StateTransitionDuration: {animation duration}` (semantic: "standard state changes take X duration")

**Level 3: control Resources (Optional)**
- Highly specific to controls
- Example: `ButtonPaddingValue: {uses SmallSpacingValue}` (button-specific override)
- Only create if you have many control-specific values

**Why This Hierarchy Matters:**
- Primitives stay stable (Syncfusion WPF theme-specific)
- Semantics stay stable (intent-based, survives design changes)
- control resources are rare and explicit

### 7.3 Where Tokens Live (XAML)

**WPF uses ResourceDictionary files for token storage:**

**App-Level Themes:**
```xaml
<!-- App.xaml -->
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

**File Organization:**
- `Themes/Colors.xaml` - All color resources (SolidColorBrush)
- `Themes/Spacing.xaml` - All spacing resources (Double values for margins/padding)
- `Themes/Typography.xaml` - All font resources (FontSize, FontFamily, FontWeight)
- `Themes/DarkTheme.xaml` - Dark mode overrides (optional)

**Decision Point:** Are you using Syncfusion WPF theme defaults or creating custom token files?
- Default: Faster, integrates with Syncfusion controls
- Custom: More control, requires discipline to maintain consistency

**Output:** XAML token architecture understood

---

## 8. Syncfusion WPF control Integration

### 8.1 Inbuilt Theme Support (SfSkinManager)

**Principle:** Use Syncfusion's `SfSkinManager` for unified theming across all Syncfusion and native WPF controls. This is the recommended approach for modern WPF and .NET Standard projects.

- **Global Application Theme:** Set `SfSkinManager.ApplicationTheme` in `App.xaml.cs` to apply a theme across the entire application.
- **Default Styles:** Set `SfSkinManager.ApplyThemeAsDefaultStyle = true` to ensure all controls (including native ones) inherit the selected Syncfusion theme.
- **Individual Control Theme:** Use the `SfSkinManager.Theme` attached property in XAML or `SfSkinManager.SetTheme()` in C# for specific window or control overrides.

**MANDATORY: Install Theme Packages**
To apply a Syncfusion theme, you MUST install the corresponding NuGet package for the selected theme:

| Theme Name | NuGet Package |
|-----------|---------------|
| `Windows11Light` | `Syncfusion.Themes.Windows11Light.WPF` |
| `Windows11Dark` | `Syncfusion.Themes.Windows11Dark.WPF` |
| `FluentLight` | `Syncfusion.Themes.FluentLight.WPF` |
| `FluentDark` | `Syncfusion.Themes.FluentDark.WPF` |
| `Material3Light` | `Syncfusion.Themes.Material3Light.WPF` |
| `Material3Dark` | `Syncfusion.Themes.Material3Dark.WPF` |
| `Office2019Colorful`| `Syncfusion.Themes.Office2019Colorful.WPF`|

**C# Implementation (Window.xaml.cs):**
```csharp
using Syncfusion.SfSkinManager;
using Syncfusion.Themes.Material3.WPF; // Requires Syncfusion.Themes.Material3.WPF NuGet

public partial class MyGeneratedWindow : Window
{
    public MyGeneratedWindow()
    {
        InitializeComponent();

        // 1. Enable theme as default for all controls in this scope
        SfSkinManager.ApplyThemeAsDefaultStyle = true;
        
        // 2. Set the theme for this specific window instance (after installing package)
        SfSkinManager.SetTheme(this, new Theme("Material3Light"));
    }
}
```

### 8.1.1 WinForms Control Inbuilt Theme Support
Syncfusion provides inbuilt theme support for WinForms controls within WPF applications using the `SkinManager`.

- **Control Alignment:** Ensure `SfSkinManager.SetTheme(control, new Theme("ThemeName"))` is used for individual control skinning.
- **Visual Consistency:** Use the same theme name for both WPF and hosted WinForms controls to maintain UI harmony.

### 8.2 Theme Customization (Programmatic)

**Decision Point:** If the built-in themes don't match your brand perfectly, use `ThemeSettings` classes to customize the palette at runtime.

1. Create a theme settings instance (e.g., `Material3LightThemeSettings`).
2. Define a custom `Palette` (PrimaryColor, AccentColor, etc.).
3. Register the settings using `SfSkinManager.RegisterThemeSettings()`.

**📖 For Advanced Customization:**
Refer to **Skill: syncfusion-wpf-theming** → **skin-manager-setup.md** and **theme-customization.md** for technical implementation details.

### 8.3 Custom XAML Coordination

**Non-Obvious Pattern:** Don't override Syncfusion control colors directly in individual controls. Instead:

1. Define your color system in ResourceDictionary tokens
2. Syncfusion WPF theme provides base styling
3. Custom XAML styles layer on top, using your token resources

**Example thinking:**
- ❌ Set DataGrid header `Background="#FF0000"` directly
- ✅ Define `PrimaryColorBrush` in ResourceDictionary, then reference it in DataGrid style override

This keeps styling coordinated and maintainable.

### ⚠️ 8.4 Runtime Issue Prevention for Theme Integration

**Critical Theme-Related Runtime Errors (Prevent in Stage 5-7):**

1. **Theme Package Not Installed Runtime Error:**
   - **Problem:** If theme selected (e.g., "Windows11Light") but NuGet package `Syncfusion.Themes.Windows11Light.WPF` not installed → `System.IO.FileNotFoundException` when `SfSkinManager.SetTheme()` executes
   - **Prevention:** Stage 7 MUST include theme package matching this Stage 4 selection
   - **Example:** Stage 4 picks "Windows11Light" → Stage 7 installs `Syncfusion.Themes.Windows11Light.WPF` (EXACT package name from stage-4 decision)

2. **SfSkinManager Assembly Not Referenced Runtime Error:**
   - **Problem:** If stage-5 generates `SfSkinManager.SetTheme(this, new Theme("Windows11Light"))` but NuGet `Syncfusion.SfSkinManager.WPF` not installed → `Type 'Syncfusion.SfSkinManager.SfSkinManager' not found` compilation error
   - **Prevention:** Stage 7 MUST add `Syncfusion.SfSkinManager.WPF` to dependency list BEFORE user installs
   - **Check:** If theming is used, verify SfSkinManager package is in Stage 7 output

3. **ResourceDictionary Merge Order Runtime Error:**
   - **Problem:** If theme ResourceDictionary merged AFTER control styles in App.xaml → controls don't inherit theme colors (fallback to defaults)
   - **Prevention:** Verify App.xaml MergedDictionaries has theme first:
   ```xaml
   <Application.Resources>
     <ResourceDictionary>
       <ResourceDictionary.MergedDictionaries>
         <!-- Theme FIRST -->
         <ResourceDictionary Source="Themes/Windows11Light.xaml" />
         <!-- Then custom styles -->
         <ResourceDictionary Source="Styles/CustomStyles.xaml" />
       </ResourceDictionary.MergedDictionaries>
     </ResourceDictionary>
   </Application.Resources>
   ```
   - Stage 5 MUST generate code that follows this order

4. **Incompatible Syncfusion Version Runtime Error:**
   - **Problem:** If theme package version doesn't match control package version → `System.TypeLoadException: Type initializer threw exception` at runtime
   - **Prevention:** Stage 7 detects Syncfusion version from .csproj (Stage 2), applies SAME version to ALL packages:
     - `Syncfusion.Themes.Windows11Light.WPF@20.4.0.56` (matches control version)
     - `Syncfusion.SfDataGrid.WPF@20.4.0.56` (same)
     - `Syncfusion.Licensing@20.4.0.56` (same)
   - Stage 7 MUST enforce version consistency

**Application Type Exception:**
If building creative/design tools, you may need custom Syncfusion control styles aligned with your tool's visual language. Stage 5 will handle this based on your decisions here.

**📖 For Resource Customization:**
Refer to **Skill: syncfusion-wpf-themes** → **Resource Customization** for:
- XAML resource structure for each Syncfusion WPF theme
- Customizing primary, success, warning, danger, info color brushes
- Runtime theme switching with ResourceDictionary.MergedDictionaries
- Theme-specific resource formats (SolidColorBrush with ARGB values)

Skill file can be referenced from:
- `.codestudio/skills/syncfusion-wpf-themes/SKILL.md`
- `.agent/skills/syncfusion-wpf-themes/SKILL.md`
- `.agents/skills/syncfusion-wpf-themes/SKILL.md`
- `.github/skills/syncfusion-wpf-themes/SKILL.md`
- `skills/syncfusion-wpf-themes/SKILL.md`

**Output:** Syncfusion integration strategy decided

---

## 9. Load Your Application Reference (MANDATORY)

**REQUIRED STEP:** Your application type from Sections 1-2 now determines your implementation guide.

### Auto-Detected Application Reference

Based on your **WPF Application Philosophy** selection in Section 1 and **Syncfusion WPF Theme Alignment** in Section 2, your application reference is automatically locked:

**Enterprise Application Reference - What this reference provides:**
- .NET Framework and .NET Core WPF setup with Syncfusion WPF controls
- Material or Office2019 theme configuration
- Token architecture for professional, data-centric design
- DataGrid-heavy control patterns (SfDataGrid, SfChart, SfScheduler)
- DPI-aware layouts for multi-monitor enterprise environments
- Syncfusion Enterprise theme integration
- Stage 6 validation checklist for enterprise WPF projects

**Key principle:** You'll define professional color schemes and dense information layouts using Material or Office2019 themes. Syncfusion WPF data controls handle complex business workflows.

Refer to:
- `.codestudio/skills/syncfusion-wpf-ui-builder/references/syncfusion-themes.md` for all theme details
- `.agent/skills/syncfusion-wpf-ui-builder/references/wpf-dotnet-standards.md` for platform standards

---

**Consumer Application Reference - What this reference provides:**
- .NET Framework and .NET Core WPF setup with Syncfusion WPF controls
- Fluent or Material theme configuration (modern aesthetics)
- Token architecture for clarity and user guidance
- control patterns emphasizing task completion (buttons, forms, dialogs)
- Responsive window sizing with DPI scaling
- Syncfusion Consumer theme integration
- Stage 6 validation checklist for consumer WPF projects

**Key principle:** You'll balance efficiency with approachability using modern Fluent or Material themes. Focus on clear task flows and user guidance in XAML layouts.

Refer to skill files at:
- `.codestudio/skills/syncfusion-wpf-ui-builder/{.agent-root}/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.agent/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.agents/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.github/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `skills/syncfusion-wpf-ui-builder/SKILL.md`

---

**LOB Application Reference - What this reference provides:**
- .NET Framework and .NET Core WPF setup with Syncfusion WPF controls
- Office2019 or Material theme configuration (familiar productivity focus)
- Token architecture for domain-specific workflows
- control patterns for expert user optimization (menus, toolbars, docking panels)
- DPI-aware layouts preserving information density
- Syncfusion LOB theme integration
- Stage 6 validation checklist for LOB WPF projects

**Key principle:** You'll design for domain experts using Office2019 or Material themes. Syncfusion WPF controls enable complex workflow automation and specialized data visualization.

Refer to skill files at:
- `.codestudio/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.agent/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.agents/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.github/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `skills/syncfusion-wpf-ui-builder/SKILL.md`

---

**Creative Application Reference - What this reference provides:**
- .NET Framework and .NET Core WPF setup with Syncfusion WPF controls
- Fluent Dark or Material Dark theme configuration (dark mode first)
- Token architecture for dark mode with reduced eye strain
- control patterns supporting creative workflows (panels, docking, customization)
- DPI-aware canvas and precision controls
- Syncfusion Dark theme integration
- Stage 6 validation checklist for creative WPF projects

**Key principle:** You'll design for focused creative work using dark themes and custom XAML. Syncfusion WPF controls are customized heavily for creative interactions.

Refer to skill files at:
- `.codestudio/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.agent/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.agents/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `.github/skills/syncfusion-wpf-ui-builder/SKILL.md`
- `skills/syncfusion-wpf-ui-builder/SKILL.md`

---

**You cannot proceed to Stage 5 without reviewing your application reference.**

**Output:** Application implementation reference locked based on your Section 1-2 decisions

---

## 10. Stage 4 Decision Checklist

**Load Your Application Reference (MANDATORY)**

**Upon completion, confirm the following decisions are locked:**

### Application Type & Theme
- ✅ Application type confirmed (Enterprise/Consumer/LOB/Creative)
- ✅ Syncfusion WPF theme selected and documented (refer to **syncfusion-themes.md** for all variants: Windows11Light/Dark, FluentLight/Dark, Material3 variants, Material variants, Office2019 variants, SystemTheme)
- ✅ Application philosophy understood (why this theme for this application)
- ✅ Skill file discovery paths confirmed - can reference from:
  - `.codestudio/skills/syncfusion-wpf-ui-builder/SKILL.md`
  - `.agent/skills/syncfusion-wpf-ui-builder/SKILL.md`
  - `.agents/skills/syncfusion-wpf-ui-builder/SKILL.md`
  - `.github/skills/syncfusion-wpf-ui-builder/SKILL.md`
  - `skills/syncfusion-wpf-ui-builder/SKILL.md`

### Color System
- ✅ Color space decided (OKLCH or XAML hex colors)
- ✅ Primary/semantic colors defined (SolidColorBrush resources)
- ✅ Tinted neutrals strategy understood
- ✅ Dark mode decision made (light only / dark only / both)

### Spacing & Typography (DPI-Aware)
- ✅ Spacing grid confirmed (4px base units at 96 DPI standard)
- ✅ DPI scaling understood (4px → 5px at 125%, 6px at 150%, etc.)
- ✅ Typography hierarchy locked (modular scale ratio for font sizes)
- ✅ Line height rules applied (readability standards for XAML TextBlock)

### Responsive Design (Window-Based)
- ✅ Window sizing strategy decided (fluid layouts vs fixed minimum sizes)
- ✅ Layout panel strategy confirmed (Grid/StackPanel/DockPanel responsiveness)
- ✅ Per-monitor DPI awareness enabled
- ✅ Multi-monitor scaling tested

### Accessibility
- ✅ Motion standards applied (100ms / 300ms / 500ms animation durations)
- ✅ Reduced motion support confirmed (prefers-reduced-motion behavior)
- ✅ Focus targets sized (44x44px minimum device-independent units)
- ✅ Color contrast verified (WCAG AA or AAA goal)

### XAML Token Architecture
- ✅ Token storage location decided:
  - **ResourceDictionary files:** Themes/Colors.xaml, Themes/Spacing.xaml, Themes/Typography.xaml
  - **Theme organization:** Primitives → Semantic → control resources
  - **Dark mode:** Separate dark override ResourceDictionary (optional)
- ✅ Semantic resource naming understood (not descriptive)
- ✅ Implementation approach locked:
  - **All themes:** Use XAML ResourceDictionary (no CSS)
  - **Syncfusion controls:** Inherit from theme via MergedDictionaries
  - **Custom overrides:** Reference token resources, don't hard-code colors

### Syncfusion WPF Integration
- ✅ Theme registration confirmed (App.xaml ResourceDictionary.MergedDictionaries - see **syncfusion-themes.md** for XAML paths)
- ✅ Color coordination strategy understood (inherit from theme, don't override individual controls)
- ✅ NuGet package requirements confirmed (Syncfusion.Sf*.WPF packages match theme - verify in **syncfusion-themes.md** package table)

### Application Reference (MANDATORY)
- ✅ Application-specific reference file loaded (Enterprise/Consumer/LOB/Creative)
- ✅ Implementation guide understood for your application type
- ✅ Ready to proceed to Stage 5 with design system decisions locked

---

## What Stage 5 Does With These Decisions

Stage 5 (Code Generation) uses your Stage 4 decisions to generate:
- **WPF project setup** with correct Syncfusion WPF theme imports (App.xaml ResourceDictionary)
- **ResourceDictionary token files** in XAML format (Colors.xaml, Spacing.xaml, Typography.xaml)
- **Base control styles** following your accessibility standards (XAML Style resources)
- **Responsive layouts** using WPF layout panels aligned to your window-sizing strategy
- **Syncfusion WPF control integration** that respects your ResourceDictionary token system

Stage 5 generates *implementation*, not *decisions*. The decisions you locked in Stage 4 ensure Stage 5 output is consistent and coherent.

---

### For All WPF Projects:
- ✅ Syncfusion WPF imports match locked theme (Material/Fluent/Office2019/Windows11)
- ✅ WCAG 2.1 AA accessibility (contrast, focus states, keyboard navigation, AutomationProperties)
- ✅ DPI-aware sizing verified (96 DPI standard, 125%/150%/200% scaling supported)
- ✅ Window responsiveness tested (fluid layouts on resize)
- ✅ C# compilation without errors
- ✅ Build optimization (assembly trimming, resource compression)

**Output:** Production-ready WPF code aligned with Stage 4 design decisions

