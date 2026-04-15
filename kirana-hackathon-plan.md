# Kirana Hackathon Execution Plan - First Place Playbook

## 1) Team Structure (4-6 members)
- Product and Story Lead: judging narrative, deck, demo script.
- Frontend Lead: mobile capture flow + underwriter dashboard.
- Backend Lead: APIs, orchestration, data contracts.
- Data and Model Lead: feature extraction, fusion model, uncertainty.
- Risk and Fraud Lead: fraud rules, policy logic, explainability.
- Optional Growth Lead: impact model and business metrics.

## 2) 48-Hour Delivery Plan

### Phase 0 (Hour 0-2) - Lock requirements
- Freeze scope: one robust flow over many weak flows.
- Finalize mandatory outputs and thresholds.
- Define sample test cases (normal, edge, fraud).

### Phase 1 (Hour 2-10) - Backbone build
- Implement session and media upload APIs.
- Build image quality checks and retake prompts.
- Integrate GPS capture and map context retrieval.
- Set up database tables and object storage paths.

### Phase 2 (Hour 10-20) - Intelligence pipeline
- Extract core visual features (shelf density, category diversity).
- Build geo features (catchment, POIs, competition density).
- Implement fusion estimator and quantile ranges.
- Implement confidence score formula.

### Phase 3 (Hour 20-30) - Fraud and policy
- Add fraud checks and fraud score.
- Add decision engine thresholds.
- Add explainability panel payload.

### Phase 4 (Hour 30-40) - UX and demo polish
- Build underwriter case card UI.
- Add what-if simulation controls.
- Add 3 curated demo scenarios.
- Ensure full flow works in one click path.

### Phase 5 (Hour 40-48) - Final mile
- Dry-run demo 5 times.
- Finalize deck with clear business impact.
- Create backup offline demo video.
- Prepare judge Q&A answers.

## 3) Must-Have Deliverables
- Working prototype with complete input-to-decision flow.
- 3 scenario dataset:
  - High confidence healthy shop.
  - Medium confidence needs verification.
  - High fraud suspicion case.
- Architecture diagram and feature logic diagram.
- 8-10 slide deck.

## 4) Technical Shortcuts That Save Time
- Use pretrained detection models and rule-based post-processing.
- Use OSM/POI APIs with cached responses.
- Use weighted scoring + quantile calibration over heavy end-to-end deep models.
- Use simple SHAP/top-feature importance for explainability.

## 5) Demo Scenario Matrix

| Scenario | Expected Output | Judge Message |
|---|---|---|
| Shop A: dense shelves, strong POIs | higher sales range, high confidence, approve_for_offer | model captures demand and inventory signals |
| Shop B: partial visibility, average demand | mid range, moderate confidence, needs_verification | responsible uncertainty and controlled risk |
| Shop C: staged inventory pattern | high fraud flags, lower confidence, hold/reject | adversarial resilience beyond basic CV |

## 6) Judge Questions and Winning Answers

### Q1: Why trust your estimates without transaction history?
Answer: We use economically grounded proxies, calibrated ranges, and explicit confidence bands. The system is designed as decision support, not a blind replacement.

### Q2: How do you prevent gaming?
Answer: Multi-image consistency, metadata checks, geo-visual mismatch detection, and fraud scoring route suspicious cases to verification.

### Q3: Is this deployable tomorrow?
Answer: Yes. It needs smartphone capture, map APIs, and a lightweight backend. It fits existing NBFC underwriting workflows via an API.

### Q4: What is your moat versus other teams?
Answer: We combine range-based underwriting, fraud resilience, and explainability in one operational decision layer.

## 7) Slide Deck Blueprint (8-10 slides)
1. Problem and underwriting gap in kirana lending.
2. Proposed solution and value proposition.
3. System architecture.
4. Feature engineering and fusion logic.
5. Fraud defense strategy.
6. Product UX and decision workflow.
7. Demo outcomes across 3 scenarios.
8. Business impact and deployment roadmap.
9. Risks and mitigation.
10. Ask and next steps.

## 8) Final Checklist Before Submission
- All outputs are ranges, not point values.
- Confidence score always present.
- Risk flags visible and interpretable.
- At least one adversarial case demonstrated.
- Decision recommendation follows documented rules.
- Demo script timed and rehearsed.
