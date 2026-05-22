# Syncfusion WPF UI Builder

**Syncfusion WPF UI Builder** is an AI-powered agent skill that transforms your UI requirements into production-ready WPF components through an automated 8-stage orchestration workflow. It leverages Syncfusion's extensive WPF component library to generate accessible, responsive, and theme-consistent user interfaces.

### Key Features

- **8-Stage AI Orchestration**: Intelligent workflow handling design thinking, control mapping, code generation, and validation
- **Syncfusion WPF Integration**: Access to professional WPF UI components (100+ controls)
- **UI Automation Accessibility**: WCAG 2.1 AA compliance with AutomationProperties and semantic XAML
- **DPI-Aware Responsive Design**: Logical vs physical pixels, touch-friendly controls (44x44 minimum)
- **MVVM Architecture**: Proper ViewModel/Model separation with INotifyPropertyChanged
- **NuGet Package Management**: Auto-detection and installation of required Syncfusion packages
- **Design System Support**: Syncfusion theming with Windows11 theme, Material theme, and Fluent theme support

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [How It Works](#how-it-works)
- [Usage](#usage)
- [Support](#support)

## Prerequisites

Before using Syncfusion WPF UI Builder, ensure your environment meets these requirements:

| Requirement | Description |
|-------------|-------------|
| **APM** | [Install APM](https://microsoft.github.io/apm/getting-started/installation/) - Agent Package Manager for skill installation |
| **WPF Project** | Active WPF project (.NET Framework 4.6.2+ or .NET Core/8+) |
| **Visual Studio 2022+** | Visual Studio 2022 or later With WPF development tools installed |
| **Syncfusion License** | [Commercial](https://www.syncfusion.com/sales/unlimitedlicense), [Free Community](https://www.syncfusion.com/products/communitylicense), or [Free Trial](https://www.syncfusion.com/account/manage-trials/start-trials) |

## Installation

```bash
# Install for GitHub Copilot
apm install syncfusion/wpf-ui-builder -t copilot

# Install for Claude Code
apm install syncfusion/wpf-ui-builder -t claude

# Install for Cursor
apm install syncfusion/wpf-ui-builder -t cursor

# Install for Codex
apm install syncfusion/wpf-ui-builder -t codex
```

## How It Works

The **Syncfusion WPF UI Builder** skill uses an **8-stage AI orchestration workflow** that transforms your requirements into production-ready WPF controls.

**Stage Descriptions:**

| Stage | Name | Description |
|-------|------|-------------|
| 1 | Intent Analysis | Parse user query, identify control type and features |
| 2 | Project Detection | Auto-detect framework, .NET version, theming strategy |
| 3 | Layout Analysis & Control Mapping | Create optimal control-mapping.json, map to Syncfusion controls |
| 4 | Theming & Design System | Lock design tokens, Syncfusion theme, color system, spacing |
| 5 | Code Generation | Generate wpf XAML, C#, data models with theming applied |
| 6 | Dependencies | Detect and install NuGet packages |
| 7 | Validation | Validate WCAG 2.1 AA, security, performance, theming |
| 8 | Code Insertion | Insert files into project, verify build |

## Usage

Invoke the skill through your AI assistant by describing what you want to build:

**Example 1: Generate a Login Form**
```
Create a login form with email, password, and remember me checkbox
```

**Example 2: Generate a Data Table**
```
Build a customer data table with sorting and filtering
```

**Example 3: Generate a WPF Dashboard**

Choose the `syncfusion-wpf-ui-builder` agent in the AI chat panel and invoke the skill through your AI assistant by describing what you want to build:

```
Create a WPF Admin Dashboard UI in XAML featuring a collapsible sidebar with navigation items for Dashboard, Content, Users, Analytics, and Settings; a top header (AppBar) showing the title "CMS Admin Dashboard" on the left and a user name with profile icon on the right; and a main content area that includes three compact summary cards in a single row displaying Total Content, Total Users, and Active Sessions (each card showing a label, relevant icon, prominent count value, and percentage change from last month), followed by a "Content Management" section with a filterable data grid containing columns for Title, Author, Status, Date, and Actions (with edit and delete buttons), and finally two charts displayed side by side—a bar chart titled "Content Over Time" and a donut chart titled "Content by Category"—using realistic sample data for both the grid (10–12 rows) and the charts.
```

Generated code follows best practices with WCAG 2.1 AA accessibility compliance, DPI-aware responsive design, secure input validation, and proper INotifyPropertyChanged implementation.

## Best Practices
- Maintain consistency in file structure, naming, and coding standards.
- Use advanced AI models (e.g., Claude Sonnet 4.6+) for better code quality.
- Review everything before production—replace placeholders and verify logic, security, and compatibility.

## Support

Product support is available through the following media.

- [Support ticket](https://support.syncfusion.com/support/tickets/create) - Guaranteed response in 24 hours | Unlimited tickets | Holiday support
- [Community forum](https://www.syncfusion.com/forums/wpf)
- [Request feature or report bug](https://www.syncfusion.com/feedback/WPF)
- [Live chat](https://www.syncfusion.com/support)