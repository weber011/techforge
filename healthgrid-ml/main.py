from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np

app = FastAPI(title="HealthGrid ML API", description="AI/ML Pipeline for HealthGrid", version="1.0.0")

class DemandPredictionRequest(BaseModel):
    phc_id: str
    historical_patients: List[int]
    days_to_predict: int = 7

class DemandPredictionResponse(BaseModel):
    phc_id: str
    predicted_patients: List[int]
    risk_score: float

class StockoutPredictionRequest(BaseModel):
    phc_id: str
    medicine_id: str
    current_stock: int
    historical_consumption: List[int]
    predicted_demand_growth: float

class StockoutPredictionResponse(BaseModel):
    phc_id: str
    medicine_id: str
    days_remaining: float
    stockout_probability: float
    expected_stockout_date: str | None

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/predict/demand", response_model=DemandPredictionResponse)
def predict_demand(req: DemandPredictionRequest):
    # Dummy ML logic for hackathon prototype
    if not req.historical_patients:
        req.historical_patients = [50] * 7
    
    avg_patients = np.mean(req.historical_patients)
    trend = np.polyfit(range(len(req.historical_patients)), req.historical_patients, 1)[0] if len(req.historical_patients) > 1 else 0
    
    predictions = []
    current_val = req.historical_patients[-1]
    
    for i in range(req.days_to_predict):
        # Add some random noise and apply trend
        noise = np.random.normal(0, avg_patients * 0.1)
        current_val = max(0, int(current_val + trend + noise))
        predictions.append(current_val)
        
    risk_score = min(100.0, max(0.0, (np.mean(predictions) - avg_patients) / avg_patients * 100)) if avg_patients > 0 else 0.0
        
    return DemandPredictionResponse(
        phc_id=req.phc_id,
        predicted_patients=predictions,
        risk_score=risk_score
    )

@app.post("/predict/stockout", response_model=StockoutPredictionResponse)
def predict_stockout(req: StockoutPredictionRequest):
    if not req.historical_consumption:
        req.historical_consumption = [10] * 7
        
    avg_consumption = np.mean(req.historical_consumption)
    
    # Adjust for predicted demand growth
    adjusted_consumption = avg_consumption * (1 + req.predicted_demand_growth)
    
    if adjusted_consumption <= 0:
        return StockoutPredictionResponse(
            phc_id=req.phc_id,
            medicine_id=req.medicine_id,
            days_remaining=999.0,
            stockout_probability=0.0,
            expected_stockout_date=None
        )
        
    days_remaining = req.current_stock / adjusted_consumption
    
    # Calculate probability (heuristic)
    if days_remaining < 3:
        prob = 0.95
    elif days_remaining < 7:
        prob = 0.70
    elif days_remaining < 14:
        prob = 0.30
    else:
        prob = 0.05
        
    return StockoutPredictionResponse(
        phc_id=req.phc_id,
        medicine_id=req.medicine_id,
        days_remaining=round(days_remaining, 2),
        stockout_probability=prob,
        expected_stockout_date="TBD" # Will be calculated by backend using current date + days
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
