# Syncfusion WPF Theming Resources

**⚠️ MANDATORY:** After selecting your WPF theme, you MUST consult **Skill: syncfusion-wpf-theming** for detailed implementation guidance before proceeding to Stage 5.

## Modern Theming with SfSkinManager (Recommended)

Syncfusion recommends using the **SfSkinManager** for modern WPF and .NET Standard projects. This allows for dynamic theme switching and unified styling of both Syncfusion and native WPF controls.

### Implementation Checklist:
1.  **Reference Assembly:** Ensure `Syncfusion.SfSkinManager.WPF` is installed via NuGet.
2.  **Theme Assembly:** Install the NuGet package for your specific theme (e.g., `Syncfusion.Themes.Windows11Light.WPF`).
3.  **Application Entry:** Use `SfSkinManager.ApplicationTheme` in `App.xaml.cs`.
4.  **Registration:** For custom themes, call `SfSkinManager.RegisterTheme()`.

## Quick Reference: Syncfusion WPF Themes

| Theme Name | Assembly/NuGet Package | Design System |
|-----------|------------------------|--------------|
| **Windows11Light** | `Syncfusion.Themes.Windows11Light.WPF` | Modern Windows 11 design |
| **Windows11Dark** | `Syncfusion.Themes.Windows11Dark.WPF` | Modern Windows 11 design |
| **FluentLight** | `Syncfusion.Themes.FluentLight.WPF` | Microsoft Fluent Design |
| **FluentDark** | `Syncfusion.Themes.FluentDark.WPF` | Microsoft Fluent Design |
| **Material3Light** | `Syncfusion.Themes.Material3Light.WPF` | Google Material Design 3 |
| **Material3Dark** | `Syncfusion.Themes.Material3Dark.WPF` | Google Material Design 3 |
| **Office2019Colorful**| `Syncfusion.Themes.Office2019Colorful.WPF`| Professional Office appearance |
| **SystemTheme** | `Syncfusion.Themes.SystemTheme.WPF` | Follows OS Light/Dark settings |

**Note:** When using `SfSkinManager`, you do not always need to manually merge `ResourceDictionary` files in `App.xaml`. Setting `ApplicationTheme` handles the resource loading automatically.

## By Use Case:

### Applying a Theme (SfSkinManager)
- Set `SfSkinManager.ApplyThemeAsDefaultStyle = true` in `OnStartup`.
- Use `SfSkinManager.SetTheme(myWindow, new Theme("Windows11Dark"))`.
- Refer to **Skill: syncfusion-wpf-theming** → **skin-manager-setup.md**.

### Implementing Dark Mode
- Use `Windows11Dark`, `FluentDark`, or `Material3Dark`.
- Observe dynamic updates when `SfSkinManager.ApplicationTheme` is changed at runtime.

### Customizing Colors (ThemeSettings)
- Each theme has a settings class (e.g., `FluentLightThemeSettings`).
- Customize the `Palette` property and register via `SfSkinManager.RegisterThemeSettings`.
- Refer to **Skill: syncfusion-wpf-theming** → **theme-customization.md**.

### Using Icons
- Refer to **Icon Library** for:
  - Setting up Syncfusion WPF icon fonts (Syncfusion MDL2 Assets)
  - TextBlock sizing with FontSize property (small, medium, large)
  - Icon customization via Foreground brush and FontSize binding

### Advanced Theming
- Refer to **Advanced Features** for:
  - Compact mode / Normal mode sizing
  - Font customization across WPF controls via ResourceDictionary tokens
  - Per-monitor DPI-aware theme scaling

