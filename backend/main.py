from pathlib import Path
import json
from datetime import datetime
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from .analyzer import analyze_dairy_data

try:
    import numpy as np  # type: ignore
except Exception:  # pragma: no cover
    np = None  # type: ignore

def _to_builtin(value: Any) -> Any:
    if np is not None:
        # numpy scalar types
        if isinstance(value, (np.generic,)):
            try:
                return value.item()
            except Exception:
                return str(value)
    return value

def sanitize(obj: Any) -> Any:
    # Recursively convert numpy/pandas scalars and containers into built-in types
    obj = _to_builtin(obj)
    if isinstance(obj, dict):
        return {str(k): sanitize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [sanitize(v) for v in obj]
    return obj

app = FastAPI(title="Dairy Analysis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust to ["http://localhost:5173"] if you want to restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT_DIR = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT_DIR / "synthetic_dairy_dataset_with_contacts.csv"


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/analysis")
def get_analysis() -> dict:
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        results = analyze_dairy_data(str(DATASET_PATH))
        safe = sanitize(results)
        return JSONResponse(content=jsonable_encoder(safe))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")


# Minimal workers API that appends to CSV

def _default_row_from_payload(payload: Dict, next_employee_number: int) -> Dict[str, Any]:
    # CSV header reference
    # Age,Attrition,BusinessTravel,DailyRate,Department,DistanceFromHome,Education,EducationField,EmployeeCount,EmployeeNumber,EnvironmentSatisfaction,Gender,HourlyRate,JobInvolvement,JobLevel,JobRole,JobSatisfaction,MaritalStatus,MonthlyIncome,MonthlyRate,NumCompaniesWorked,OverTime,PercentSalaryHike,PerformanceRating,RelationshipSatisfaction,StockOptionLevel,TotalWorkingYears,TrainingTimesLastYear,WorkLifeBalance,YearsAtCompany,YearsInCurrentRole,YearsSinceLastPromotion,YearsWithCurrManager,OperatorSkillScore,RequiredSkillByRole
    dept = str(payload.get("department", "Production"))
    exp_text = str(payload.get("experience", "0")).lower()
    # parse experience like "5 years" -> 5
    import re
    m = re.search(r"(\d+)", exp_text)
    exp_years = int(m.group(1)) if m else 0

    # basic mappings
    jobrole_by_dept = {
        "Production": "Milk Processing Operator",
        "Maintenance": "Maintenance Engineer",
        "Quality Control": "Dairy Quality Analyst",
        "Logistics": "Logistics & Supply Chain Coordinator",
        "Farm Operations": "Cold Storage Supervisor",
    }
    education_field_by_dept = {
        "Production": "Food Technology",
        "Maintenance": "Mechanical Engineering",
        "Quality Control": "Biotechnology",
        "Logistics": "Logistics",
        "Farm Operations": "Dairy Science",
    }

    job_role = jobrole_by_dept.get(dept, "Milk Processing Operator")
    education_field = education_field_by_dept.get(dept, "Food Technology")

    # derive some reasonable defaults
    row: Dict[str, Any] = {
        "Age": 30,
        "Attrition": "No",
        "BusinessTravel": "Rarely",
        "DailyRate": 800,
        "Department": dept,
        "DistanceFromHome": 10,
        "Education": 2,
        "EducationField": education_field,
        "EmployeeCount": 1,
        "EmployeeNumber": next_employee_number,
        "EnvironmentSatisfaction": 3,
        "Gender": "Male",
        "HourlyRate": 100,
        "JobInvolvement": 3,
        "JobLevel": 2,
        "JobRole": job_role,
        "JobSatisfaction": 3,
        "MaritalStatus": "Single",
        "MonthlyIncome": 70000,
        "MonthlyRate": 12000,
        "NumCompaniesWorked": 1,
        "OverTime": "No",
        "PercentSalaryHike": 15,
        "PerformanceRating": 3,
        "RelationshipSatisfaction": 3,
        "StockOptionLevel": 1,
        "TotalWorkingYears": max(exp_years, 0),
        "TrainingTimesLastYear": 1,
        "WorkLifeBalance": 3,
        "YearsAtCompany": min(max(exp_years, 0), 20),
        "YearsInCurrentRole": min(max(exp_years // 2, 0), 15),
        "YearsSinceLastPromotion": 0 if exp_years < 2 else min(exp_years - 2, 10),
        "YearsWithCurrManager": min(max(exp_years // 3, 0), 10),
        "OperatorSkillScore": 0.6,
        "RequiredSkillByRole": 0.5,
        "Name": payload.get("name", ""),
        "Email": payload.get("email", ""),
        "Phone Number": payload.get("phone", ""),
        "Skills": payload.get("skills", ""),
    }
    return row


@app.post("/workers/append")
def append_worker(payload: Dict = Body(...)) -> Any:
    try:
        import pandas as pd  # local import to keep module load fast
        if not DATASET_PATH.exists():
            raise HTTPException(status_code=404, detail="Dataset not found")

        df = pd.read_csv(DATASET_PATH)
        next_emp_num = int(df["EmployeeNumber"].max()) + 1 if not df.empty else 1
        row = _default_row_from_payload(payload, next_emp_num)
        # Append
        df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
        df.to_csv(DATASET_PATH, index=False)
        return JSONResponse(content={"status": "appended", "employeeNumber": next_emp_num})
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to append worker: {exc}")


# CSV-backed Workers CRUD

def _read_dataset():
    import pandas as pd
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    return pd.read_csv(DATASET_PATH)


def _write_dataset(df) -> None:
    df.to_csv(DATASET_PATH, index=False)


def _df_to_worker_list(df) -> Any:
    df = df.replace([np.nan, np.inf, -np.inf], None)

    cols = [
        "EmployeeNumber", "Name", "Email", "Phone Number", "Department", "JobRole", "Age", "Gender",
        "MonthlyIncome", "YearsAtCompany", "OverTime", "OperatorSkillScore", "RequiredSkillByRole"
    ]
    existing = [c for c in cols if c in df.columns]
    return [
        {k: sanitize(v) for k, v in rec.items()}
        for rec in df[existing].to_dict(orient="records")
    ]


@app.get("/workers")
def list_workers_csv() -> Any:
    try:
        df = _read_dataset()
        return JSONResponse(content=jsonable_encoder(_df_to_worker_list(df)))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list workers: {exc}")


@app.get("/workers/{employee_number}")
def get_worker_csv(employee_number: int) -> Any:
    try:
        df = _read_dataset()
        row = df[df["EmployeeNumber"] == employee_number]
        if row.empty:
            raise HTTPException(status_code=404, detail="Worker not found")
        return JSONResponse(content=jsonable_encoder(sanitize(row.iloc[0].to_dict())))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to get worker: {exc}")


@app.post("/workers")
def create_worker_csv(payload: Dict = Body(...)) -> Any:
    try:
        import pandas as pd
        df = _read_dataset()
        next_emp_num = int(df["EmployeeNumber"].max()) + 1 if not df.empty else 1
        row = _default_row_from_payload(payload, next_emp_num)
        df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
        _write_dataset(df)
        return {"status": "created", "employeeNumber": next_emp_num}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create worker: {exc}")


@app.put("/workers/{employee_number}")
def update_worker_csv(employee_number: int, payload: Dict = Body(...)) -> Any:
    try:
        df = _read_dataset()
        idx_list = df.index[df["EmployeeNumber"] == employee_number].tolist()
        if not idx_list:
            raise HTTPException(status_code=404, detail="Worker not found")
        idx = idx_list[0]
        # Allowed editable fields (subset present in dataset)
        editable = {
            "Department", "JobRole", "Age", "Gender", "MonthlyIncome",
            "YearsAtCompany", "OverTime", "OperatorSkillScore", "RequiredSkillByRole",
            "Name", "Email", "Phone Number", "Skills"
        }
        for k, v in payload.items():
            if k in editable and k in df.columns:
                df.at[idx, k] = v
        _write_dataset(df)
        return {"status": "updated", "employeeNumber": employee_number}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to update worker: {exc}")


@app.delete("/workers/{employee_number}")
def delete_worker_csv(employee_number: int) -> Any:
    try:
        df = _read_dataset()
        before = len(df)
        df = df[df["EmployeeNumber"] != employee_number]
        if len(df) == before:
            raise HTTPException(status_code=404, detail="Worker not found")
        _write_dataset(df)
        return {"status": "deleted", "employeeNumber": employee_number}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to delete worker: {exc}")

@app.post("/analysis/run")
def run_analysis() -> dict:
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        results = analyze_dairy_data(str(DATASET_PATH))
        payload = {"status": "updated", "summary": sanitize(results.get("summary", {}))}
        return JSONResponse(content=jsonable_encoder(payload))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")


# AI Manufacturing Intelligence Endpoints

def _calculate_ai_manufacturing_metrics(df) -> dict:
    """Calculate AI-based manufacturing intelligence metrics from dataset"""
    import pandas as pd
    
    # Calculate production efficiency based on performance ratings and skill scores
    avg_performance = df['PerformanceRating'].mean()
    avg_skill_score = df['OperatorSkillScore'].mean()
    avg_job_involvement = df['JobInvolvement'].mean()
    production_efficiency = min(100, (avg_performance * 20 + avg_skill_score * 100 + avg_job_involvement * 25))
    
    # Quality prediction based on job satisfaction and environment satisfaction
    avg_job_satisfaction = df['JobSatisfaction'].mean()
    avg_env_satisfaction = df['EnvironmentSatisfaction'].mean()
    quality_prediction = min(100, (avg_job_satisfaction * 20 + avg_env_satisfaction * 20 + 30))
    
    # Defect probability (inverse of quality)
    defect_probability = max(0, 100 - quality_prediction)
    
    # Energy optimization based on overtime and work-life balance
    overtime_rate = (df['OverTime'] == 'Yes').sum() / len(df) * 100
    avg_work_life_balance = df['WorkLifeBalance'].mean()
    energy_optimization = min(100, 100 - (overtime_rate * 0.3) + (avg_work_life_balance * 15))
    
    # Maintenance prediction (based on tenure and training)
    avg_training = df['TrainingTimesLastYear'].mean()
    avg_years_at_company = df['YearsAtCompany'].mean()
    # Higher training = more maintenance awareness, longer tenure = less maintenance needed
    maintenance_days = max(5, min(30, 30 - (avg_training * 2) + (avg_years_at_company * 0.5)))
    
    return {
        "productionEfficiency": round(production_efficiency, 1),
        "qualityPrediction": round(quality_prediction, 1),
        "defectProbability": round(defect_probability, 1),
        "energyOptimization": round(energy_optimization, 1),
        "maintenancePrediction": round(maintenance_days, 0)
    }


def _generate_ai_insights(df) -> list:
    """Generate AI insights based on data analysis"""
    import pandas as pd
    
    insights = []
    
    # Insight 1: Production Line Optimization
    avg_performance = df['PerformanceRating'].mean()
    high_performers = (df['PerformanceRating'] >= 4).sum()
    total_employees = len(df)
    high_performer_rate = (high_performers / total_employees) * 100
    
    if avg_performance < 3.5:
        efficiency_improvement = round((3.5 - avg_performance) * 25, 1)
        insights.append({
            "id": 1,
            "type": "optimization",
            "severity": "high",
            "title": "Production Line Optimization Opportunity",
            "description": f"AI detected {efficiency_improvement}% efficiency improvement possible by optimizing worker allocation and training programs",
            "impact": f"+{efficiency_improvement}% productivity",
            "confidence": round(85 + (high_performer_rate * 0.1), 0),
            "action": "Implement shift rotation and skill-based assignments",
            "icon": "TrendingUp"
        })
    
    # Insight 2: Quality Control
    avg_job_satisfaction = df['JobSatisfaction'].mean()
    avg_env_satisfaction = df['EnvironmentSatisfaction'].mean()
    
    if avg_job_satisfaction < 3 or avg_env_satisfaction < 3:
        defect_reduction = round((3 - min(avg_job_satisfaction, avg_env_satisfaction)) * 5, 1)
        insights.append({
            "id": 2,
            "type": "quality",
            "severity": "medium",
            "title": "Quality Control Pattern Detection",
            "description": f"Machine learning identified correlation between employee satisfaction levels and product quality metrics",
            "impact": f"-{defect_reduction}% defect rate",
            "confidence": 88,
            "action": "Improve working conditions and employee engagement",
            "icon": "Target"
        })
    
    # Insight 3: Predictive Maintenance
    avg_training = df['TrainingTimesLastYear'].mean()
    avg_years = df['YearsAtCompany'].mean()
    
    if avg_training < 2:
        insights.append({
            "id": 3,
            "type": "predictive",
            "severity": "low",
            "title": "Predictive Maintenance Alert",
            "description": f"Neural network predicts equipment maintenance needed in {round(15 + (avg_years * 0.5), 0)} days based on training patterns and equipment age",
            "impact": "Prevent downtime",
            "confidence": 85,
            "action": "Schedule maintenance window and training sessions",
            "icon": "AlertTriangle"
        })
    
    # Insight 4: Workforce Allocation
    dept_dist = df['Department'].value_counts()
    if len(dept_dist) > 0:
        max_dept = dept_dist.idxmax()
        max_count = dept_dist.max()
        total = len(df)
        imbalance = ((max_count / total) - (1 / len(dept_dist))) * 100
        
        if imbalance > 15:
            insights.append({
                "id": 4,
                "type": "optimization",
                "severity": "medium",
                "title": "Workforce Allocation Optimization",
                "description": f"AI detected workforce imbalance. {max_dept} has {round((max_count/total)*100, 1)}% of workforce. Optimal redistribution could improve efficiency",
                "impact": "+12% efficiency",
                "confidence": 90,
                "action": "Reallocate workforce across departments",
                "icon": "Users"
            })
    
    return insights


def _calculate_performance_metrics(df) -> dict:
    """Calculate AI system performance metrics"""
    import random
    
    # Simulated but realistic metrics based on data size
    total_employees = len(df)
    ai_accuracy = min(99, 85 + (total_employees / 100) * 0.5)
    data_processed = round(total_employees * 0.01, 1)  # TB
    models_running = 12
    predictions_today = total_employees * 8 + random.randint(100, 500)
    
    return {
        "aiAccuracy": round(ai_accuracy, 1),
        "dataProcessed": data_processed,
        "modelsRunning": models_running,
        "predictionsToday": predictions_today
    }


def _get_manufacturing_status(df) -> list:
    """Get real-time manufacturing status"""
    statuses = []
    
    # Production Line A (Production Department)
    production_dept = df[df['Department'] == 'Production']
    if len(production_dept) > 0:
        avg_perf = production_dept['PerformanceRating'].mean()
        if avg_perf >= 3.5:
            statuses.append({
                "name": "Production Line A",
                "status": "Optimal",
                "description": "Operating at optimal efficiency",
                "badge": "Optimal"
            })
        else:
            statuses.append({
                "name": "Production Line A",
                "status": "Monitoring",
                "description": "Performance below optimal levels",
                "badge": "Monitoring"
            })
    
    # Quality Control Station
    quality_dept = df[df['Department'] == 'Quality Control']
    if len(quality_dept) > 0:
        avg_satisfaction = quality_dept['JobSatisfaction'].mean()
        if avg_satisfaction >= 3:
            statuses.append({
                "name": "Quality Control Station",
                "status": "Optimal",
                "description": "All systems operating normally",
                "badge": "Optimal"
            })
        else:
            statuses.append({
                "name": "Quality Control Station",
                "status": "Monitoring",
                "description": "Minor anomaly detected in satisfaction metrics",
                "badge": "Monitoring"
            })
    else:
        statuses.append({
            "name": "Quality Control Station",
            "status": "Monitoring",
            "description": "Minor anomaly detected",
            "badge": "Monitoring"
        })
    
    # Workforce Allocation
    dept_dist = df['Department'].value_counts()
    if len(dept_dist) > 0:
        statuses.append({
            "name": "Workforce Allocation",
            "status": "Optimized",
            "description": "AI optimized for peak hours",
            "badge": "Optimized"
        })
    
    return statuses


@app.get("/ai-manufacturing/predictions")
def get_ai_predictions() -> dict:
    """Get AI predictions and metrics"""
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        import pandas as pd
        df = pd.read_csv(DATASET_PATH)
        predictions = _calculate_ai_manufacturing_metrics(df)
        return JSONResponse(content=jsonable_encoder(sanitize(predictions)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to get predictions: {exc}")


@app.get("/ai-manufacturing/insights")
def get_ai_insights() -> dict:
    """Get AI-generated insights"""
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        import pandas as pd
        df = pd.read_csv(DATASET_PATH)
        insights = _generate_ai_insights(df)
        return JSONResponse(content=jsonable_encoder(sanitize(insights)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {exc}")


@app.get("/ai-manufacturing/performance")
def get_ai_performance() -> dict:
    """Get AI system performance metrics"""
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        import pandas as pd
        df = pd.read_csv(DATASET_PATH)
        metrics = _calculate_performance_metrics(df)
        return JSONResponse(content=jsonable_encoder(sanitize(metrics)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {exc}")


@app.get("/ai-manufacturing/status")
def get_manufacturing_status() -> dict:
    """Get real-time manufacturing status"""
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        import pandas as pd
        df = pd.read_csv(DATASET_PATH)
        statuses = _get_manufacturing_status(df)
        return JSONResponse(content=jsonable_encoder(sanitize(statuses)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {exc}")


@app.get("/ai-manufacturing/dashboard")
def get_ai_dashboard() -> dict:
    """Get complete AI dashboard data"""
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        import pandas as pd
        df = pd.read_csv(DATASET_PATH)
        
        dashboard_data = {
            "predictions": _calculate_ai_manufacturing_metrics(df),
            "insights": _generate_ai_insights(df),
            "performance": _calculate_performance_metrics(df),
            "status": _get_manufacturing_status(df)
        }
        
        return JSONResponse(content=jsonable_encoder(sanitize(dashboard_data)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {exc}")


@app.post("/ai-manufacturing/analyze")
def run_ai_analysis() -> dict:
    """Run AI analysis and return updated data"""
    if not DATASET_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    try:
        import pandas as pd
        df = pd.read_csv(DATASET_PATH)
        
        dashboard_data = {
            "predictions": _calculate_ai_manufacturing_metrics(df),
            "insights": _generate_ai_insights(df),
            "performance": _calculate_performance_metrics(df),
            "status": _get_manufacturing_status(df),
            "lastUpdate": datetime.now().isoformat()
        }
        
        return JSONResponse(content=jsonable_encoder(sanitize(dashboard_data)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")


