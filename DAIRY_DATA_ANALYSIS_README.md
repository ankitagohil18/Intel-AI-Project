# Dairy Data Analysis Dashboard

## Overview

This project integrates comprehensive data analysis of the synthetic dairy dataset into your existing manufacturing intelligence dashboard. The analysis uses Python AI (pandas) to process and extract insights from 1,000 employee records.

## What Was Implemented

### 1. Python Analysis Script (`analyze_dairy_data.py`)

A comprehensive Python script using pandas that analyzes the dairy dataset and extracts:

- **Summary Statistics**: Total employees, attrition rate, average age, salary, and tenure
- **Demographics**: Department, job role, gender, marital status, age groups, and income distribution
- **Compensation Analysis**: Salary by department and job role
- **Performance Metrics**: Job satisfaction, performance ratings, work-life balance
- **Training Analysis**: Training sessions and employee development needs
- **Attrition Analysis**: Attrition patterns by department with rates
- **Skill Gap Analysis**: Operator skill levels vs required skills
- **Geographic Insights**: Distance from home and commute analysis
- **Tenure Metrics**: Years at company, in current role, since promotion
- **Correlation Analysis**: Relationships between key metrics

### 2. Analysis Results (`public/dairy_analysis_results.json`)

The Python script generates a comprehensive JSON file containing all analysis results, which is consumed by the frontend component.

### 3. Dairy Data Analysis Component (`src/components/DairyDataAnalysis.tsx`)

A React component with beautiful visualizations including:

#### **Summary Cards**

- Attrition Rate: 14.5%
- Average Monthly Salary: $68,951
- Average Tenure: 14.3 years
- Average Age: 40 years

#### **Interactive Tabs**

**Demographics Tab:**

- Department Distribution (Bar Chart)
- Gender Distribution (Pie Chart)
- Job Role Distribution (Top 9 roles)
- Education Field Distribution (Pie Chart)
- Age Group Distribution (Bar Chart)
- Income Group Distribution (Bar Chart)

**Compensation Tab:**

- Salary Analysis by Department (Mean vs Median)
- Top 5 Paying Job Roles

**Performance Tab:**

- Performance Metrics (Ratings, involvement)
- Training Analysis (Sessions, employees needing training)
- Work-Life Balance Distribution
- Skill Gap Analysis

**Attrition Tab:**

- Attrition by Department (Count and rates)
- Overtime Analysis

**Insights Tab:**

- Distance Analysis
- Tenure Insights
- Key Metrics Summary
- **AI-Powered Recommendations**:
  - High Risk: Attrition in Farm Operations & Maintenance (17.16% - above average)
  - Overtime Concerns (32.6% work overtime)
  - Training Opportunities (180 employees need training)
  - Positive: Operator skills exceed requirements
  - Compensation equity analysis

## Key Findings

### Highlights

- **Total Employees**: 1,000
- **Attrition Rate**: 14.5% (85.5% retention)
- **Skill Gap**: Negative (-9.6%) indicating operators are overqualified
- **Top Department**: Logistics (214 employees)
- **Highest Paid Role**: Dairy Quality Analyst ($72,405 average)

### Areas of Concern

1. **Attrition**: Farm Operations and Maintenance show 17.16% attrition (above company average)
2. **Overtime**: 32.6% of employees work overtime
3. **Training**: 180 employees need training (18% of workforce)

### Strengths

1. **Skills**: Operators' skills exceed required levels by 9.6%
2. **Compensation**: Relatively balanced across departments (±5%)
3. **Tenure**: Average 14.3 years indicates strong employee retention

## How to Use

### Running the Analysis

If you need to regenerate the analysis after updating the dataset:

```bash
python analyze_dairy_data.py
```

This will process `synthetic_dairy_dataset.csv` and generate `public/dairy_analysis_results.json`.

### Accessing the Dashboard

1. Start the development server: `npm run dev`
2. Navigate to the "Dairy Data Analysis" tab in the dashboard
3. Explore the different tabs for comprehensive insights

### Updating the Dataset

To analyze new data:

1. Replace `synthetic_dairy_dataset.csv` with your new dataset
2. Run `python analyze_dairy_data.py`
3. The dashboard will automatically load the new analysis results

## Technical Stack

- **Backend Analysis**: Python 3.x with pandas
- **Frontend**: React with TypeScript
- **Visualizations**: Recharts library
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Data Format**: JSON for seamless integration

## Future Enhancements

Potential improvements:

- Predictive modeling for attrition risk
- Machine learning for salary forecasting
- Real-time data integration
- Advanced filtering and search capabilities
- Export functionality (PDF, Excel)
- Customizable dashboard widgets

## Files Created/Modified

### New Files

- `analyze_dairy_data.py` - Python analysis script
- `src/components/DairyDataAnalysis.tsx` - Main dashboard component
- `public/dairy_analysis_results.json` - Analysis results
- `DAIRY_DATA_ANALYSIS_README.md` - This documentation

### Modified Files

- `src/pages/Index.tsx` - Added Dairy Data Analysis tab

### Data Files

- `synthetic_dairy_dataset.csv` - Source dataset (1,000 employee records)

## Dependencies

### Python

- pandas
- json (built-in)

### JavaScript/TypeScript

- All dependencies already present in package.json
- No additional installations required

## Dashboard Features

✅ **Interactive Visualizations**: Click, hover, and explore charts
✅ **Responsive Design**: Works on desktop, tablet, and mobile
✅ **Real-time Updates**: Loads fresh data on each view
✅ **AI-Powered Insights**: Actionable recommendations
✅ **Professional UI**: Modern design with intuitive navigation
✅ **Performance Optimized**: Fast loading and smooth interactions

## Support

For questions or issues:

1. Check the Python script output for analysis errors
2. Verify the JSON file is in the public folder
3. Check browser console for frontend errors
4. Ensure pandas is installed: `pip install pandas`

---

**Created**: January 2025  
**Last Updated**: January 2025  
**Version**: 1.0
