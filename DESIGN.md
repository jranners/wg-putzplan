# Shared Flat Management - Design System
> **Source Project**: Stitch `projects/16958235333042210139` (WG-Managment System)
> **Theme**: Dark Mode, Inter, Rounded (8px), Accent #13B6EC

This document outlines the comprehensive design system for the Shared Flat Management application. It is derived from the "WG-Managment System" Stitch project and is designed to provide a modern, clean, and highly usable interface for managing shared living spaces.

---

## 1. Core Visual Identity

### 1.1 Color Palette
The application uses a **Dark Mode** foundation with high-contrast content and a vibrant primary accent.

#### Primary Brand
- **Primary Cyan**: `#13B6EC` (Main action color, active states, highlights)
- **Primary Hover**: `#0EA5D9` (Interactable hover state)
- **Primary Surface**: `rgba(0, 0, 0, 0.15)` (Subtle backgrounds for active items)

#### Neutral / Backgrounds (Dark Theme)
- **Background Deep**: `#0F172A` (Main app background - Slate 900)
- **Background Surface**: `#1E293B` (Cards, Sidebars, Modals - Slate 800)
- **Background Elevated**: `#334155` (Hover states, Dropdowns - Slate 700)
- **Border**: `#334155` (Dividers, Borders - Slate 700)

#### Text & Content
- **Text Primary**: `#F8FAFC` (Headings, Primary Body - Slate 50)
- **Text Secondary**: `#94A3B8` (Subtitles, Metadata - Slate 400)
- **Text Disabled**: `#475569` (Placeholder, Disabled states - Slate 600)
- **Text Inverse**: `#0F172A` (Text on Primary Cyan buttons)

#### Semantic Colors
- **Success**: `#10B981` (Completed tasks, Positive balance)
- **Warning**: `#F59E0B` (Approaching deadlines, Alerts)
- **Error**: `#EF4444` (Overdue, Errors, Negative balance)
- **Info**: `#3B82F6` (Information tips)

### 1.2 Typography
**Font Family**: `Inter`, sans-serif. Clean, legible, and optimized for UI.

| Role | Size (px) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 32px | Bold (700) | 1.2 | -0.02em |
| **Heading 1** | 24px | SemiBold (600) | 1.3 | -0.01em |
| **Heading 2** | 20px | SemiBold (600) | 1.35 | -0.01em |
| **Heading 3** | 18px | Medium (500) | 1.4 | 0 |
| **Body Large** | 16px | Regular (400) | 1.5 | 0 |
| **Body Default** | 14px | Regular (400) | 1.5 | 0 |
| **Caption** | 12px | Medium (500) | 1.5 | 0.02em |
| **Button** | 14px | SemiBold (600) | 1.0 | 0.01em |

### 1.3 Spacing & Geometry
- **Base Unit**: `4px`
- **Grid System**: 8pt grid (`px-4`, `py-2`, `gap-4` etc.)
- **Corner Radius**:
    - **Small**: `4px` (Checkboxes, Tags, tiny inputs)
    - **Medium**: `8px` (Buttons, Inputs, Cards - **Default**)
    - **Large**: `12px` (Modals, Large Containers)
    - **Full**: `9999px` (Pills, Avatars)

---

## 2. Component library

### 2.1 Buttons
*   **Primary**: Solid `#13B6EC` background, `#0F172A` text. Radius `8px`. Hover brightness 90%.
*   **Secondary**: Transparent background, `#334155` border, `#F8FAFC` text. Hover background `#1E293B`.
*   **Ghost**: Transparent background, `#13B6EC` text. Hover background `rgba(19, 182, 236, 0.1)`.
*   **Icon Button**: 40x40px square or circle, usually Ghost or Secondary style.

### 2.2 Inputs & Forms
*   **Base Style**: Background `#0F172A`, Border `#334155` (1px), Text `#F8FAFC`.
*   **Focus State**: Border `#13B6EC`, Box-shadow `0 0 0 2px rgba(19,182,236, 0.2)`.
*   **Label**: Caption size, Text Secondary `#94A3B8`, placed above input.
*   **Placeholder**: Text Disabled `#475569`.

### 2.3 Cards (Surfaces)
*   **Background**: `#1E293B` (Surface color).
*   **Border**: Optional 1px `#334155`.
*   **Shadow**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`.
*   **Padding**: `16px` or `24px`.
*   **Usage**: Used for Dashboards, Task Items, Expense Entries.

### 2.4 Navigation
#### Sidebar (Desktop)
- Fixed width (e.g., 240-280px).
- Background: `#0F172A` or `#1E293B` (Darker or Surface).
- **Active Link**: Background `rgba(19, 182, 236, 0.1)`, Text `#13B6EC`, Left Border 3px solid `#13B6EC`.
- **Inactive Link**: Text Secondary `#94A3B8`, Hover Text Primary `#F8FAFC`.

#### Charts (Financial & Stats)
- Use the **Semantic Colors** for data series.
- **Tooltip**: Dark background `#0F172A` with white text.
- **Grid Lines**: Very subtle `#334155` (opacity 0.2).

---

## 3. Screen Specifications

### 3.1 Personal Cleaning Dashboard
> *Based on existing screens*
- **Layout**: Grid-based dashboard.
- **Widgets**:
    - "Your Next Tasks": High priority list.
    - "Contribution Chart": Bar or Donut chart showing user vs. flatmate effort.
    - "Upcoming Schedule": Calendar strip or list.
- **Interactions**: Swipe/Click to complete task.

### 3.2 Household Finance
- **Summary Cards**: "Total Balance", "You Owe", "Owed to You".
- **Expense List**: Detailed rows with Date, Payer, Amount (colored by status), and Split details.
- **Add Expense**: Modal or separate page form.

### 3.3 Add New Expense
- **Form Layout**: Single column, optimized for mobile data entry.
- **Fields**: Title, Amount (large font), Payer (Dropdown), Split Method (Equal/Percentage), Date.
- **Actions**: "Save Expense" (Primary), "Cancel" (Secondary).

---

## 4. Implementation Guidelines (CSS/Tailwind)
> This project uses Vanilla CSS or Tailwind. Recommended Tailwind configuration:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#13B6EC',
        background: '#0F172A',
        surface: '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      }
    }
  }
}
```
