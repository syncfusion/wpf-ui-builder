# Validation Rules Reference

**Purpose:** Comprehensive checklist for Stage 7 validation. Used to validate WPF control against accessibility and quality standards.

## Binary Validation Result

Each control receives a **PASS ✓** or **FAIL ✗** result against these rules.

---

## Syncfusion API & Syntax Validation - Blocking

| Rule | Check | Pass/Fail |
|------|-------|-----------|
| **Namespace Accuracy** | No unused references (e.g., `Syncfusion.UI.Xaml.Grid` removed if unused) | |
| **SfDigitalGauge API** | `CharacterCount` property is NOT used (auto-calculated) | |
| **ComboBoxAdv API** | `IsEditable="True"` used for filtering (not `AllowFiltering`) | |
| **Container Properties** | `StackPanel` does not use `Padding` (use `Margin` or `Grid` wrapper) | |
| **XML Syntax** | All XAML tags correctly closed (no "Unexpected end of file") | |

---

## Accessibility (UI Automation) - Blocking

| Rule | Check | Pass/Fail |
|------|-------|-----------|
| **UI Automation Support** | All controls expose UI Automation properties | |
| **AutomationId** | All interactive elements have unique `AutomationId` | |
| **Accessible Names** | Controls have meaningful `AutomationProperties.Name` | |
| **Focus Indicator** | All interactive elements have visible focus outline | |
| **Keyboard Navigation** | Tab order follows visual flow (TabIndex), no keyboard traps | |
| **Color Contrast** | Text ≥ 4.5:1, focus indicator ≥ 3:1 contrast | |
| **Touch Targets** | Interactive elements ≥ 44x44px (DPI scaled) | |

---

## Security - Blocking

| Rule | Check | Pass/Fail |
|------|-------|-----------|
| **No Injection Attacks** | No dynamic XAML parsing or reflection misuse | |
| **Input Validation** | User input validated before use | |
| **No Secrets** | No hardcoded API keys, JWT, or database URLs | |
| **Syncfusion License** | License key in app.config or environment variable, not hardcoded | |

---

## Performance - Warning (Auto-fixable)

| Rule | Check | Status |
|------|-------|--------|
| **Virtual Layout** | ItemsControls use `VirtualizingStackPanel` for lists | ⚠️ Can auto-fix |
| **Binding Performance** | Compiled bindings used, no binding memory leaks | ⚠️ Can auto-fix |
| **Assembly Size** | No unnecessary dependencies or unused libraries | ⚠️ Can warn |

---

## Responsive Design - Warning (Auto-fixable)

| Rule | Check | Status |
|------|-------|--------|
| **XAML Layout** | Uses `Grid`, `StackPanel`, or `DockPanel` for responsive layout | ⚠️ Can auto-fix |
| **No Fixed Sizes** | Controls use relative sizing, not hardcoded pixel dimensions | ⚠️ Can auto-fix |
| **DPI Awareness** | Resources scale correctly on high DPI displays | ⚠️ Can auto-fix |

---

## Code Quality - Warning

| Rule | Check | Status |
|------|-------|--------|
| **C# Type Safety** | No `dynamic` types, full type coverage | ⚠️ Can auto-fix |
| **XML Documentation** | Public classes/methods have XML doc comments | ⚠️ Can add |
| **Error Handling** | Try-catch on async operations, user-friendly messages | ⚠️ Can auto-fix |

---

## Validation Logic (Stage 7)

### Step 1: Check Blocking Rules
If ANY blocking rule fails → **FAIL ✗**
- Missing UI Automation support or AutomationId
- Security vulnerability (injection, hardcoded secrets)
- Focus trap or broken keyboard navigation

**Action:** Auto-fix if possible. If not auto-fixable, ask user to override or request fixes.

### Step 2: Check Auto-Fixable Warnings
Apply auto-fixes:
- Missing color contrast → Adjust colors
- Missing AutomationProperties → Add accessible names
- Poor keyboard navigation → Fix TabIndex
- Missing touch target size → Increase button size
- Missing responsive layout → Use Grid/StackPanel

### Step 3: Check Non-Auto-Fixable Warnings
Report to user:
- Missing XML documentation comments
- Could benefit from VirtualizingStackPanel
- No error handling for async operations

**Action:** Warn but allow proceeding.

### Step 4: Output Result

**If all blocking rules pass + warnings auto-fixed:**
```
✓ VALIDATION PASS

All standards met:
  ✓ UI Automation accessibility
  ✓ Security checks
  ✓ Performance optimizations
  ✓ Responsive XAML layout
  
Auto-fixes applied: 3
  - Fixed color contrast on labels
  - Added AutomationProperties to inputs
  - Updated layout to use Grid

Ready to proceed to Stage 8...
```

**If blocking rule fails (not auto-fixable):**
```
✗ VALIDATION FAIL

Critical issues:
  ✗ Controls missing AutomationId attributes
  ✗ Hardcoded API key detected in code-behind

Auto-fixes NOT available for these issues.

Options:
  [Override & Proceed] [Request Manual Fixes] [Cancel]
```

---

## Override Behavior

If user overrides failed validation:
```
⚠️  Proceeding with known accessibility/security issues:
  - Color contrast: 3.8:1 (need 4.5:1)
  - Missing AutomationProperties on 2 controls

Code will be generated but flagged as non-compliant.
User assumes responsibility for fixing before production.
```

---

All validation rules ensure generated code is accessible, secure, and production-ready for WPF applications.

