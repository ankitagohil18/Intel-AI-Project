from pathlib import Path
import json
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


