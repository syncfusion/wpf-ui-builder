# Stage 1: Intent Analysis

**Purpose:** Parse and validate the user's natural language request, identify WPF control type and requirements, resolve ambiguities.

**AI Should:**
- Read the user's raw query carefully
- Identify primary intent: `generate_window`, `generate_usercontrol`, `generate_dialog`, or `modify_existing`
- Extract control type (e.g., "login window" → Window/LoginView, "product grid" → UserControl/ProductGrid, "confirmation dialog" → Window/ConfirmDialog)
- Extract MVVM requirements (e.g., "with ViewModel" → MVVM:enabled, "code-behind" → MVVM:minimal)
- Extract Syncfusion controls needed (e.g., "data grid" → SfDataGrid, "chart" → SfChart, "scheduler" → SfScheduler)
- Extract styling/theme (e.g., "dark theme" → Theme:Dark, "Material Design" → Theme:Material)
- Identify target directory if specified (e.g., "in the Views folder" → targetDir:Views/)
- Identify required features (e.g., "with validation", "async/await", "data binding")

**Ambiguity Resolution:**
If the request is unclear, ask ONE clarifying question. Examples:

| Ambiguous Input | Clarifying Question |
|---|---|
| "Build me a form" | "What kind of form? (login, registration, contact, data entry, multi-step)" |
| "Add a control" | "What WPF control? (Window, UserControl, custom control, or Syncfusion control like SfDataGrid, SfChart)" |
| "Make it better" | "Which control and what aspect? (accessibility, MVVM structure, styling, performance)" |
| "Create a grid" | "Display local data or remote? Single-select or multi-select? With filtering/sorting?" |

**Output to User:**
One-line confirmation:
```
✓ Understood: Generating a dark-themed login form with "Remember Me" support.
Starting project detection...
```

**WPF-Specific Intent Examples:**

| User Request | Intent | controls | MVVM | Theme |
|---|---|---|---|---|
| "Create a login window" | generate_window | Window + UserControl | ViewModel required | Default |
| "Add a customer data grid" | generate_usercontrol | UserControl + SfDataGrid | ViewModel + ICommand | Fluent |
| "Build a product details dialog" | generate_dialog | Window/Dialog + Validation | ViewModel + IDataErrorInfo | Material |
| "Make a settings panel" | generate_usercontrol | UserControl + ResourceDictionary | ViewModel | Current theme |

**Reference:** For control type catalog, see stage-3-layout-analysis.md

**Status:** This stage requires NO user interaction for confirmation. AI decides intent based on pure reasoning.

