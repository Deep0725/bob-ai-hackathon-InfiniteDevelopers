# Solution Overview

## What We Built

We built a drug safety analysis application that helps users process safety-related data, identify potential safety signals using statistical methods such as Proportional Reporting Ratio (PRR), and assess regulatory submission readiness.

The application combines multiple analysis steps into a single workflow.

---

## How It Works

1. The user provides drug safety or adverse event data.
2. The application processes the input data.
3. PRR-based calculations are performed to identify potential safety signals.
4. Results are displayed through a dashboard interface.
5. The system provides a regulatory readiness assessment based on available information.

---

## Architecture Diagram

```text
User
   ↓
Web Interface
   ↓
Data Processing
   ↓
PRR Signal Detection
   ↓
Results Dashboard
   ↓
Regulatory Readiness Assessment
```

---

## Key Design Decisions

| Decision                                          | Rationale                             |
| ------------------------------------------------- | ------------------------------------- |
| Use a web interface                               | Easy accessibility                    |
| Use PRR analysis                                  | Widely used signal detection approach |
| Combine signal detection and readiness assessment | Provides a unified workflow           |
| Keep architecture lightweight                     | Suitable for hackathon implementation |

---

## IBM Technologies Used

* **IBM Bob:** Used as the development environment and coding assistant for building the prototype.
