import pandas as pd
import json
from pathlib import Path

# Load the dataset
df = pd.read_csv('synthetic_dairy_dataset.csv')

# Basic statistics
total_employees = len(df)
attrition_rate = (df['Attrition'] == 'Yes').sum() / total_employees * 100
avg_age = df['Age'].mean()
avg_monthly_income = df['MonthlyIncome'].mean()
avg_years_at_company = df['YearsAtCompany'].mean()

# Department distribution
department_dist = df['Department'].value_counts().to_dict()

# Job role distribution
job_role_dist = df['JobRole'].value_counts().to_dict()

# Gender distribution
gender_dist = df['Gender'].value_counts().to_dict()

# Marital status distribution
marital_dist = df['MaritalStatus'].value_counts().to_dict()

# Skill analysis
avg_skill_score = df['OperatorSkillScore'].mean()
avg_required_skill = df['RequiredSkillByRole'].mean()
skill_gap = avg_required_skill - avg_skill_score

# Education field distribution
education_field_dist = df['EducationField'].value_counts().to_dict()

# Job satisfaction distribution
job_satisfaction_dist = df['JobSatisfaction'].value_counts().sort_index().to_dict()

# Salary by department
salary_by_dept = df.groupby('Department')['MonthlyIncome'].agg(['mean', 'median', 'std']).to_dict('index')

# Salary by job role (top 10)
salary_by_role = df.groupby('JobRole')['MonthlyIncome'].mean().sort_values(ascending=False).head(10).to_dict()

# Training analysis
training_analysis = {
    'avg_training_last_year': df['TrainingTimesLastYear'].mean(),
    'total_training_sessions': df['TrainingTimesLastYear'].sum(),
    'employees_needing_training': (df['TrainingTimesLastYear'] == 0).sum()
}

# Performance metrics
performance_metrics = {
    'avg_performance_rating': df['PerformanceRating'].mean(),
    'high_performers': (df['PerformanceRating'] >= 4).sum(),
    'avg_job_involvement': df['JobInvolvement'].mean()
}

# Work-life balance
work_life_balance = df['WorkLifeBalance'].value_counts().sort_index().to_dict()

# Distance from home analysis
distance_analysis = {
    'avg_distance': df['DistanceFromHome'].mean(),
    'max_distance': df['DistanceFromHome'].max(),
    'remote_workers': (df['DistanceFromHome'] > 30).sum()
}

# Overtime analysis
overtime_analysis = df['OverTime'].value_counts().to_dict()

# Attrition by department
attrition_by_dept = df.groupby('Department')['Attrition'].apply(lambda x: (x == 'Yes').sum()).to_dict()

# Attrition rate by department
attrition_rate_by_dept = df.groupby('Department').apply(lambda x: (x['Attrition'] == 'Yes').sum() / len(x) * 100).to_dict()

# Tenure analysis
tenure_analysis = {
    'avg_years_at_company': df['YearsAtCompany'].mean(),
    'avg_years_in_role': df['YearsInCurrentRole'].mean(),
    'avg_years_since_promotion': df['YearsSinceLastPromotion'].mean(),
    'avg_years_with_manager': df['YearsWithCurrManager'].mean()
}

# Age groups
df['AgeGroup'] = pd.cut(df['Age'], bins=[0, 25, 35, 45, 55, 100], labels=['18-25', '26-35', '36-45', '46-55', '55+'])
age_group_dist = df['AgeGroup'].value_counts().to_dict()

# Income groups
df['IncomeGroup'] = pd.cut(df['MonthlyIncome'], bins=[0, 30000, 50000, 75000, 100000, float('inf')], 
                            labels=['<30K', '30K-50K', '50K-75K', '75K-100K', '>100K'])
income_group_dist = df['IncomeGroup'].value_counts().to_dict()

# Correlation analysis (key metrics)
correlation_data = df[['Age', 'MonthlyIncome', 'YearsAtCompany', 'JobSatisfaction', 
                       'EnvironmentSatisfaction', 'OperatorSkillScore', 'TotalWorkingYears']].corr()

# Prepare the final JSON output
results = {
    'summary': {
        'total_employees': int(total_employees),
        'attrition_rate': round(attrition_rate, 2),
        'avg_age': round(avg_age, 2),
        'avg_monthly_income': round(avg_monthly_income, 2),
        'avg_years_at_company': round(avg_years_at_company, 2)
    },
    'department_distribution': department_dist,
    'job_role_distribution': job_role_dist,
    'gender_distribution': gender_dist,
    'marital_status_distribution': marital_dist,
    'skill_analysis': {
        'avg_operator_skill': round(avg_skill_score, 3),
        'avg_required_skill': round(avg_required_skill, 3),
        'skill_gap': round(skill_gap, 3)
    },
    'education_field_distribution': education_field_dist,
    'job_satisfaction_distribution': job_satisfaction_dist,
    'salary_by_department': {k: {kk: round(vv, 2) for kk, vv in v.items()} for k, v in salary_by_dept.items()},
    'salary_by_role': {k: round(v, 2) for k, v in salary_by_role.items()},
    'training_analysis': {k: round(v, 2) if isinstance(v, float) else int(v) for k, v in training_analysis.items()},
    'performance_metrics': {k: round(v, 2) for k, v in performance_metrics.items()},
    'work_life_balance': work_life_balance,
    'distance_analysis': {k: round(v, 2) if isinstance(v, float) else int(v) for k, v in distance_analysis.items()},
    'overtime_analysis': overtime_analysis,
    'attrition_by_department': attrition_by_dept,
    'attrition_rate_by_department': {k: round(v, 2) for k, v in attrition_rate_by_dept.items()},
    'tenure_analysis': {k: round(v, 2) for k, v in tenure_analysis.items()},
    'age_group_distribution': age_group_dist,
    'income_group_distribution': income_group_dist,
    'correlation_matrix': correlation_data.where(pd.notna(correlation_data), 0).to_dict()
}

# Save to JSON file
with open('dairy_analysis_results.json', 'w') as f:
    json.dump(results, f, indent=2, default=str)

print("Analysis complete! Results saved to dairy_analysis_results.json")
print(f"\nKey Findings:")
print(f"- Total Employees: {total_employees}")
print(f"- Attrition Rate: {attrition_rate:.2f}%")
print(f"- Average Skill Gap: {skill_gap:.3f}")
print(f"- Top Department: {max(department_dist, key=department_dist.get)}")

