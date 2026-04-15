# Kirana Remote Cash-Flow Underwriting - Winning System Blueprint

## 1) Win Strategy (Judge Lens First)

### 1.1 What judges reward most
- Real NBFC deployability over research-heavy novelty.
- Honest uncertainty with ranges and confidence, not fake precision.
- Fraud and adversarial resilience (most teams miss this).
- Explainability that underwriting teams can trust.
- End-to-end flow with clear business action output.

### 1.2 Positioning statement
Build a credit-intelligence layer for kirana lending where images + geo signals produce explainable cash-flow bands, fraud flags, and action-ready underwriting recommendations in under 90 seconds.

### 1.3 Scope boundary for hackathon win
- In scope: image quality checks, visual+geo features, fusion model, uncertainty ranges, fraud scoring, decision recommendation, analyst view.
- Out of scope: heavy custom deep learning training from scratch, branch core-system integration, full production KYC stack.

---

## 2) Product Definition

### 2.1 Inputs
- Mandatory:
  - 3-5 smartphone photos: shelves, counter, storefront, street context.
  - GPS coordinates from device.
- Optional:
  - 5-10 second walkthrough video.
  - Declared shop size, rent, years in operation.

### 2.2 Outputs (all range based)
- Daily sales range (INR).
- Monthly revenue range (INR).
- Monthly normalized income range (INR).
- Confidence score (0-1).
- Risk flags list.
- Recommendation: approve_for_offer, needs_verification, reject_or_hold.

### 2.3 SLA targets
- Inference response time: <= 90 sec for 5 images.
- Minimum confidence threshold for auto decision path: >= 0.65.
- Manual verification fallback for low confidence or high fraud score.

---

## 3) Complete System Architecture

```mermaid
flowchart LR
    A[Field Officer or Merchant App] --> B[Capture Service]
    B --> C[Upload API Gateway]
    C --> D[Object Storage Raw Media]
    C --> E[Session Metadata Store]

    D --> F[Image QA Service]
    E --> F

    F --> G[Visual Feature Service]
    F --> H[Geo Intelligence Service]
    H --> I[OSM and Public POI Connector]

    G --> J[Feature Store]
    H --> J

    J --> K[Fusion Scoring Engine]
    K --> L[Uncertainty Calibrator]
    K --> M[Fraud Rule Engine]

    L --> N[Decision Engine]
    M --> N

    N --> O[Underwriter Console]
    N --> P[Loan Origination Adapter]

    O --> Q[Feedback Labeling Tool]
    Q --> R[Model Monitoring and Retraining]
    R --> K
```

### 3.1 Layer responsibilities
- Capture layer: guided photo workflow with quality hints.
- Intelligence layer: extract visual and geo features.
- Decision layer: estimate ranges, confidence, fraud signals, recommendation.
- Learning layer: collect outcomes, monitor drift, retrain periodically.

---

## 4) End-to-End Workflow

```mermaid
sequenceDiagram
    autonumber
    participant U as User App
    participant API as Backend API
    participant QA as Image QA
    participant VIS as Visual Feature Service
    participant GEO as Geo Service
    participant FUS as Fusion Engine
    participant FRD as Fraud Engine
    participant DEC as Decision Engine
    participant UW as Underwriter Console

    U->>API: Start session + GPS + metadata
    API-->>U: Guided capture checklist
    U->>API: Upload 3-5 images (optional video)

    API->>QA: Validate blur, exposure, framing, duplication
    QA-->>API: Quality score + retake prompts if needed

    API->>VIS: Extract shelf occupancy, SKU diversity, store cues
    API->>GEO: Compute catchment, footfall proxy, competition density

    VIS-->>FUS: Visual feature vector
    GEO-->>FUS: Geo feature vector

    FUS->>FRD: Cross-signal consistency checks
    FRD-->>FUS: Fraud score + flags

    FUS->>DEC: Revenue, income ranges + confidence
    DEC-->>API: Recommendation + explanations

    API-->>UW: Case card for review or auto-path
    UW-->>API: Approve / verify / reject feedback
```

---

## 5) Feature Engineering Blueprint

```mermaid
flowchart TD
    A[Raw Images and GPS] --> B[Preprocessing]
    B --> C1[Shelf Segmentation]
    B --> C2[SKU Detection and Category Tagging]
    B --> C3[Counter Activity Proxies]
    B --> C4[Storefront and Street Context]

    A --> D1[Catchment Density]
    A --> D2[POI-based Footfall Proxy]
    A --> D3[Competition Density]
    A --> D4[Road Type and Accessibility]

    C1 --> E[Visual Features]
    C2 --> E
    C3 --> E
    C4 --> E

    D1 --> F[Geo Features]
    D2 --> F
    D3 --> F
    D4 --> F

    E --> G[Fusion Feature Vector]
    F --> G
```

### 5.1 Core visual features
- Shelf Density Index: occupied shelf area / visible shelf area.
- SKU Diversity Score: distinct category clusters detected.
- Estimated Inventory Value Band: quantity x category price proxy.
- Refill Signal: partially empty shelves in high-demand categories.
- Storefront Commercial Signal: signage quality, openness, frontage cues.

### 5.2 Core geo features
- Catchment density index within 300m/500m radius.
- Footfall proxy from POIs: schools, bus stops, offices, clinics.
- Competition density: similar store count near location.
- Access index: road class + junction proximity.

---

## 6) Fusion, Estimation, and Uncertainty Design

### 6.1 Model strategy (hackathon-practical)
- Base model: gradient boosting regressor or lightgbm/xgboost on fused features.
- Target outputs:
  - log(daily_sales)
  - monthly_revenue
  - monthly_income
- Range generation:
  - Quantile models for p10 and p90.
  - Confidence score from data quality + model stability + fraud penalty.

### 6.2 Scoring equations (interpretable)
- revenue_point = f(visual_features, geo_features)
- revenue_low = quantile_10(revenue_point, uncertainty_factors)
- revenue_high = quantile_90(revenue_point, uncertainty_factors)
- income_range = revenue_range x margin_band
- final_confidence = w1*image_quality + w2*geo_completeness + w3*model_confidence - w4*fraud_penalty

### 6.3 Margin band logic
- Category mix determines assumed gross margin range.
- Example:
  - staples-heavy stores: lower margin band.
  - FMCG and personal care mix: higher margin band.

---

## 7) Fraud and Adversarial Defense (Critical Winning Section)

```mermaid
flowchart LR
    A[Input Session] --> B[Image Integrity Checks]
    A --> C[Cross-image Consistency]
    A --> D[Geo-Visual Consistency]
    A --> E[Temporal and Metadata Checks]

    B --> F[Fraud Signal Store]
    C --> F
    D --> F
    E --> F

    F --> G[Fraud Score 0-100]
    G --> H{Score Threshold}
    H -- Low --> I[Proceed Auto Decision]
    H -- Medium --> J[Needs Verification]
    H -- High --> K[Reject or Field Recheck]
```

### 7.1 Fraud checks to implement immediately
- Duplicate-object pattern check across images (possible staged inventory).
- EXIF and timestamp inconsistency checks.
- Geo mismatch flag when storefront context does not match map density class.
- Coverage score: insufficient angles triggers low-confidence path.
- Inventory-footfall mismatch: very high stock in low-demand micro-market.

### 7.2 Risk flags examples
- limited_view_coverage
- inventory_footfall_mismatch
- suspicious_metadata_pattern
- high_competition_low_turnover_risk
- unusual_sku_distribution

---

## 8) Decision Policy Layer

```mermaid
flowchart TD
    A[Predicted Revenue and Income Ranges] --> D[Decision Policy]
    B[Confidence Score] --> D
    C[Fraud Score and Flags] --> D

    D --> E{Policy Rules}
    E -- Confidence >= 0.65 and Fraud <= 30 --> F[approve_for_offer]
    E -- Confidence 0.45-0.65 or Fraud 31-60 --> G[needs_verification]
    E -- Confidence < 0.45 or Fraud > 60 --> H[reject_or_hold]

    F --> I[Generate loan sizing guidance]
    G --> J[Request additional media or short field visit]
    H --> K[Hold case and escalate]
```

### 8.1 Loan sizing guidance logic
- max_emi_ratio = min(policy_cap, affordability_from_income)
- eligible_loan_range derived from monthly_income_low, monthly_income_high, and tenor assumptions.

---

## 9) Data Contract and APIs

### 9.1 Inference request
```json
{
  "session_id": "KRN-2026-00123",
  "lat": 18.5204,
  "lng": 73.8567,
  "images": ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"],
  "optional": {
    "shop_size_sqft": 220,
    "monthly_rent": 18000,
    "years_in_operation": 4,
    "video": "walkthrough.mp4"
  }
}
```

### 9.2 Inference response
```json
{
  "daily_sales_range": [6200, 8900],
  "monthly_revenue_range": [186000, 267000],
  "monthly_income_range": [29000, 47000],
  "confidence_score": 0.74,
  "fraud_score": 28,
  "risk_flags": [
    "moderate_competition_density",
    "limited_counter_visibility"
  ],
  "top_value_drivers": [
    "high_shelf_density",
    "strong_poi_footfall",
    "good_sku_diversity"
  ],
  "recommendation": "approve_for_offer"
}
```

---

## 10) Underwriter Experience (UX That Wins)

### 10.1 Case card sections
- Predicted ranges panel with confidence meter.
- Fraud and verification panel.
- Explainability panel with top 5 positive/negative drivers.
- What-if simulator:
  - lower shelf density by 20%
  - high competition scenario
  - quality re-capture scenario
- Final action panel with one-click decision.

### 10.2 Why this is judge-friendly
- Makes AI operationally usable, not just a model output.
- Demonstrates transparency and governance in one screen.

---

## 11) Deployment Architecture (Hackathon to Pilot)

```mermaid
flowchart TB
    subgraph Client
      A1[Mobile Web App]
      A2[Underwriter Dashboard]
    end

    subgraph Backend
      B1[API Gateway]
      B2[Session Service]
      B3[Inference Orchestrator]
      B4[Decision Service]
      B5[Notification Service]
    end

    subgraph Intelligence
      C1[Image QA Model]
      C2[Visual Feature Models]
      C3[Geo Feature Engine]
      C4[Fusion and Quantile Models]
      C5[Fraud Rules Engine]
    end

    subgraph Data
      D1[Object Store]
      D2[Postgres]
      D3[Feature Store]
      D4[Model Registry]
      D5[Monitoring]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2
    B2 --> D2
    B1 --> B3
    B3 --> C1
    B3 --> C2
    B3 --> C3
    B3 --> C4
    B3 --> C5
    C1 --> D3
    C2 --> D3
    C3 --> D3
    C4 --> B4
    C5 --> B4
    B4 --> D2
    B4 --> A2
    B2 --> D1
    B3 --> D4
    B4 --> D5
```

### 11.1 Recommended stack
- Frontend: Next.js or React + simple mobile-first capture UI.
- Backend: FastAPI or Node API.
- Models: Python services (PyTorch/TensorFlow optional, XGBoost for fusion).
- Data: Postgres + S3-compatible object store.
- Maps and POI: OpenStreetMap Overpass + optional Google Places fallback.

---

## 12) MLOps and Monitoring

```mermaid
flowchart LR
    A[Inference Logs] --> B[Data Quality Monitor]
    A --> C[Prediction Drift Monitor]
    A --> D[Fraud Pattern Monitor]
    E[Underwriter Feedback] --> F[Label Store]
    B --> G[Retraining Trigger]
    C --> G
    D --> G
    F --> G
    G --> H[Model Retrain and Validation]
    H --> I[Champion Challenger Deployment]
    I --> A
```

### 12.1 Metrics to track
- Coverage pass rate (input quality).
- Confidence distribution shift by region.
- Manual override rate by decision class.
- Post-disbursement delinquency proxy by model band.
- Fraud flag precision and review outcomes.

---

## 13) Security, Privacy, and Governance

- Consent and purpose disclosure before capture.
- PII minimization: store only required metadata.
- Signed URL uploads, encrypted at rest.
- Role-based access for underwriters and admins.
- Audit trail for every score and decision event.
- Explainability snapshot stored with each case decision.

---

## 14) Demo Script for Finals (7-8 minutes)

1. Open app and capture guided photos for Shop A.
2. Show instant quality checks and retake prompt.
3. Submit and display prediction card with ranges and confidence.
4. Open explainability tab, show top drivers and risk flags.
5. Run what-if simulation and show impact.
6. Run Shop B with adversarial inputs and show fraud flags.
7. Show decisioning difference: approve vs needs verification.
8. Close with NBFC impact metrics and deployment feasibility.

---

## 15) Business Impact Model

### 15.1 NBFC value hypothesis
- 40-60% faster first-level underwriting for small-ticket kirana loans.
- Better risk segmentation versus pure field heuristics.
- Lower cost-to-acquire through remote pre-screening.

### 15.2 Hackathon impact assumptions
- If median underwriting turnaround drops from 2 days to <2 hours, conversion and customer satisfaction improve materially.

---

## 16) Judge-Facing One-Liner

We built a practical underwriting co-pilot where visual inventory proxies and geo-demand signals are fused into confidence-aware cash-flow bands, with fraud defense and policy-ready decisions that an NBFC can deploy with minimal process change.
