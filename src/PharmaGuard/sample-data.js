/* =====================================================================
   sample-data.js — Synthetic Demo Data — Not Real Pharmacovigilance Data
   ===================================================================== */

const SAMPLE_ADVERSE_EVENTS = [
  // --- Lisinopril (focused demo drug) ---
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L001",age:45,sex:"Female",report_date:"2026-01-05",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L002",age:52,sex:"Male",  report_date:"2026-01-08",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L003",age:61,sex:"Female",report_date:"2026-01-12",country:"Canada",seriousness:"Non-Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L004",age:48,sex:"Male",  report_date:"2026-01-15",country:"UK",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L005",age:53,sex:"Female",report_date:"2026-02-03",country:"India",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L006",age:60,sex:"Male",  report_date:"2026-02-20",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L007",age:47,sex:"Female",report_date:"2026-03-10",country:"Canada",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L008",age:56,sex:"Male",  report_date:"2026-04-01",country:"UK",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L009",age:39,sex:"Female",report_date:"2026-04-22",country:"India",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Cough",report_id:"L010",age:65,sex:"Male",  report_date:"2026-05-10",country:"USA",seriousness:"Non-Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Angioedema",report_id:"L011",age:51,sex:"Female",report_date:"2026-02-25",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Angioedema",report_id:"L012",age:63,sex:"Male",  report_date:"2026-03-01",country:"Canada",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Angioedema",report_id:"L013",age:46,sex:"Female",report_date:"2026-03-04",country:"UK",seriousness:"Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Angioedema",report_id:"L014",age:58,sex:"Male",  report_date:"2026-03-07",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Angioedema",report_id:"L015",age:49,sex:"Female",report_date:"2026-04-20",country:"India",seriousness:"Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Angioedema",report_id:"L016",age:62,sex:"Male",  report_date:"2026-05-02",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Hyperkalemia",report_id:"L017",age:68,sex:"Male",  report_date:"2026-02-02",country:"USA",seriousness:"Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Hyperkalemia",report_id:"L018",age:72,sex:"Female",report_date:"2026-02-05",country:"USA",seriousness:"Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Hyperkalemia",report_id:"L019",age:64,sex:"Male",  report_date:"2026-02-09",country:"UK",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Hyperkalemia",report_id:"L020",age:70,sex:"Female",report_date:"2026-02-14",country:"Canada",seriousness:"Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Hyperkalemia",report_id:"L021",age:59,sex:"Male",  report_date:"2026-03-18",country:"India",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Hyperkalemia",report_id:"L022",age:75,sex:"Female",report_date:"2026-04-03",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Hyperkalemia",report_id:"L023",age:73,sex:"Male",  report_date:"2026-04-29",country:"UK",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Hyperkalemia",report_id:"L024",age:76,sex:"Female",report_date:"2026-05-08",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Renal impairment",report_id:"L025",age:69,sex:"Male",  report_date:"2026-03-20",country:"USA",seriousness:"Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Renal impairment",report_id:"L026",age:73,sex:"Female",report_date:"2026-03-23",country:"UK",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Renal impairment",report_id:"L027",age:65,sex:"Male",  report_date:"2026-04-23",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Dizziness",    report_id:"L028",age:57,sex:"Female",report_date:"2026-01-18",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Dizziness",    report_id:"L029",age:66,sex:"Male",  report_date:"2026-01-20",country:"India",seriousness:"Non-Serious",outcome:"Recovering"},
  {drug_name:"Lisinopril",adverse_event:"Dizziness",    report_id:"L030",age:50,sex:"Male",  report_date:"2026-04-11",country:"UK",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Headache",     report_id:"L031",age:39,sex:"Female",report_date:"2026-01-23",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Headache",     report_id:"L032",age:44,sex:"Male",  report_date:"2026-01-27",country:"Canada",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Fatigue",      report_id:"L033",age:42,sex:"Female",report_date:"2026-03-10",country:"India",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Fatigue",      report_id:"L034",age:55,sex:"Male",  report_date:"2026-03-12",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Nausea",       report_id:"L035",age:36,sex:"Female",report_date:"2026-03-15",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Lisinopril",adverse_event:"Nausea",       report_id:"L036",age:49,sex:"Male",  report_date:"2026-03-18",country:"Canada",seriousness:"Non-Serious",outcome:"Recovered"},

  // --- Metformin ---
  {drug_name:"Metformin",adverse_event:"Nausea",         report_id:"M001",age:55,sex:"Female",report_date:"2026-01-15",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Metformin",adverse_event:"Nausea",         report_id:"M002",age:62,sex:"Male",  report_date:"2026-01-20",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Metformin",adverse_event:"Nausea",         report_id:"M003",age:48,sex:"Female",report_date:"2026-02-05",country:"UK",seriousness:"Non-Serious",outcome:"Not Recovered"},
  {drug_name:"Metformin",adverse_event:"Diarrhea",       report_id:"M004",age:51,sex:"Male",  report_date:"2026-02-10",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Metformin",adverse_event:"Diarrhea",       report_id:"M005",age:67,sex:"Female",report_date:"2026-03-01",country:"Canada",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Metformin",adverse_event:"Diarrhea",       report_id:"M006",age:58,sex:"Male",  report_date:"2026-04-15",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Metformin",adverse_event:"Lactic Acidosis",report_id:"M007",age:72,sex:"Male",  report_date:"2026-03-15",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Metformin",adverse_event:"Lactic Acidosis",report_id:"M008",age:68,sex:"Female",report_date:"2026-04-20",country:"UK",seriousness:"Serious",outcome:"Fatal"},
  {drug_name:"Metformin",adverse_event:"Lactic Acidosis",report_id:"M009",age:75,sex:"Male",  report_date:"2026-05-10",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Metformin",adverse_event:"Vomiting",       report_id:"M010",age:45,sex:"Male",  report_date:"2026-04-10",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Metformin",adverse_event:"Headache",       report_id:"M011",age:50,sex:"Female",report_date:"2026-05-01",country:"Germany",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Metformin",adverse_event:"Fatigue",        report_id:"M012",age:58,sex:"Male",  report_date:"2026-05-15",country:"USA",seriousness:"Non-Serious",outcome:"Not Recovered"},
  {drug_name:"Metformin",adverse_event:"Stomach Cramps", report_id:"M013",age:42,sex:"Male",  report_date:"2026-06-02",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},

  // --- Atorvastatin ---
  {drug_name:"Atorvastatin",adverse_event:"Myalgia",               report_id:"A001",age:60,sex:"Female",report_date:"2026-01-22",country:"USA",seriousness:"Non-Serious",outcome:"Not Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Myalgia",               report_id:"A002",age:55,sex:"Male",  report_date:"2026-02-08",country:"USA",seriousness:"Non-Serious",outcome:"Not Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Myalgia",               report_id:"A003",age:62,sex:"Female",report_date:"2026-03-05",country:"UK",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Myalgia",               report_id:"A004",age:48,sex:"Male",  report_date:"2026-04-15",country:"Canada",seriousness:"Non-Serious",outcome:"Not Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Myalgia",               report_id:"A005",age:57,sex:"Female",report_date:"2026-05-20",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Rhabdomyolysis",        report_id:"A006",age:65,sex:"Male",  report_date:"2026-03-25",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Rhabdomyolysis",        report_id:"A007",age:58,sex:"Female",report_date:"2026-04-30",country:"UK",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Rhabdomyolysis",        report_id:"A008",age:70,sex:"Male",  report_date:"2026-05-18",country:"USA",seriousness:"Serious",outcome:"Fatal"},
  {drug_name:"Atorvastatin",adverse_event:"Elevated Liver Enzymes",report_id:"A009",age:52,sex:"Female",report_date:"2026-05-10",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Headache",              report_id:"A010",age:44,sex:"Male",  report_date:"2026-06-01",country:"Germany",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Atorvastatin",adverse_event:"Insomnia",              report_id:"A011",age:48,sex:"Female",report_date:"2026-06-28",country:"USA",seriousness:"Non-Serious",outcome:"Not Recovered"},

  // --- Warfarin ---
  {drug_name:"Warfarin",adverse_event:"Bleeding",           report_id:"W001",age:70,sex:"Male",  report_date:"2026-01-30",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Warfarin",adverse_event:"Bleeding",           report_id:"W002",age:65,sex:"Female",report_date:"2026-02-15",country:"UK",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Warfarin",adverse_event:"Bleeding",           report_id:"W003",age:72,sex:"Male",  report_date:"2026-03-08",country:"USA",seriousness:"Serious",outcome:"Fatal"},
  {drug_name:"Warfarin",adverse_event:"Bleeding",           report_id:"W004",age:60,sex:"Female",report_date:"2026-04-01",country:"Canada",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Warfarin",adverse_event:"Bleeding",           report_id:"W005",age:68,sex:"Male",  report_date:"2026-05-10",country:"Germany",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Warfarin",adverse_event:"Bleeding",           report_id:"W006",age:75,sex:"Female",report_date:"2026-06-05",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Warfarin",adverse_event:"Skin Necrosis",      report_id:"W007",age:55,sex:"Female",report_date:"2026-03-20",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Warfarin",adverse_event:"Skin Necrosis",      report_id:"W008",age:60,sex:"Male",  report_date:"2026-04-28",country:"UK",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Warfarin",adverse_event:"Purple Toe Syndrome",report_id:"W009",age:67,sex:"Male",  report_date:"2026-05-25",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Warfarin",adverse_event:"Bruising",           report_id:"W010",age:72,sex:"Female",report_date:"2026-07-01",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},

  // --- Ibuprofen ---
  {drug_name:"Ibuprofen",adverse_event:"GI Bleeding",  report_id:"I001",age:58,sex:"Male",  report_date:"2026-02-01",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Ibuprofen",adverse_event:"GI Bleeding",  report_id:"I002",age:62,sex:"Female",report_date:"2026-03-12",country:"UK",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Ibuprofen",adverse_event:"GI Bleeding",  report_id:"I003",age:55,sex:"Male",  report_date:"2026-04-18",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Ibuprofen",adverse_event:"Renal Failure",report_id:"I004",age:70,sex:"Female",report_date:"2026-05-05",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Ibuprofen",adverse_event:"Renal Failure",report_id:"I005",age:65,sex:"Male",  report_date:"2026-06-12",country:"Canada",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Ibuprofen",adverse_event:"Nausea",       report_id:"I006",age:30,sex:"Female",report_date:"2026-02-20",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Ibuprofen",adverse_event:"Headache",     report_id:"I007",age:42,sex:"Male",  report_date:"2026-03-28",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Ibuprofen",adverse_event:"Hypertension", report_id:"I008",age:50,sex:"Female",report_date:"2026-05-18",country:"Germany",seriousness:"Non-Serious",outcome:"Not Recovered"},
  {drug_name:"Ibuprofen",adverse_event:"Edema",        report_id:"I009",age:58,sex:"Male",  report_date:"2026-07-05",country:"UK",seriousness:"Non-Serious",outcome:"Recovered"},

  // --- Acetaminophen (Paracetamol) ---
  {drug_name:"Acetaminophen",adverse_event:"Hepatotoxicity",   report_id:"P001",age:45,sex:"Male",  report_date:"2026-01-28",country:"USA",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Acetaminophen",adverse_event:"Hepatotoxicity",   report_id:"P002",age:50,sex:"Female",report_date:"2026-03-15",country:"UK",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Acetaminophen",adverse_event:"Hepatotoxicity",   report_id:"P003",age:55,sex:"Male",  report_date:"2026-04-22",country:"USA",seriousness:"Serious",outcome:"Fatal"},
  {drug_name:"Acetaminophen",adverse_event:"Hepatotoxicity",   report_id:"P004",age:62,sex:"Female",report_date:"2026-05-30",country:"Canada",seriousness:"Serious",outcome:"Recovered"},
  {drug_name:"Acetaminophen",adverse_event:"Nausea",           report_id:"P005",age:35,sex:"Female",report_date:"2026-02-10",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Acetaminophen",adverse_event:"Rash",             report_id:"P006",age:28,sex:"Male",  report_date:"2026-04-08",country:"Canada",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Acetaminophen",adverse_event:"Thrombocytopenia", report_id:"P007",age:60,sex:"Female",report_date:"2026-05-28",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Acetaminophen",adverse_event:"Allergic Reaction",report_id:"P008",age:32,sex:"Female",report_date:"2026-07-08",country:"USA",seriousness:"Serious",outcome:"Recovered"},

  // --- Omeprazole ---
  {drug_name:"Omeprazole",adverse_event:"Headache",            report_id:"O001",age:40,sex:"Female",report_date:"2026-01-25",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Omeprazole",adverse_event:"Nausea",              report_id:"O002",age:35,sex:"Male",  report_date:"2026-02-12",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Omeprazole",adverse_event:"Abdominal Pain",      report_id:"O003",age:50,sex:"Female",report_date:"2026-03-18",country:"UK",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Omeprazole",adverse_event:"Fracture",            report_id:"O004",age:68,sex:"Female",report_date:"2026-04-25",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Omeprazole",adverse_event:"Fracture",            report_id:"O005",age:72,sex:"Male",  report_date:"2026-05-30",country:"USA",seriousness:"Serious",outcome:"Not Recovered"},
  {drug_name:"Omeprazole",adverse_event:"Vitamin B12 Deficiency",report_id:"O006",age:65,sex:"Female",report_date:"2026-06-10",country:"Canada",seriousness:"Non-Serious",outcome:"Not Recovered"},
  {drug_name:"Omeprazole",adverse_event:"Dizziness",           report_id:"O007",age:55,sex:"Male",  report_date:"2026-06-20",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"},
  {drug_name:"Omeprazole",adverse_event:"Diarrhea",            report_id:"O008",age:45,sex:"Male",  report_date:"2026-06-30",country:"USA",seriousness:"Non-Serious",outcome:"Recovered"}
];

/* =====================================================================
   CTD Expected Structure (ICH M4)
   ===================================================================== */
const EXPECTED_CTD_STRUCTURE = {
  "Module 1": {
    name: "Module 1 — Administrative Information and Prescribing Information",
    sections: [
      "Administrative Information",
      "Application Form",
      "Prescribing Information",
      "Labeling",
      "Patent Information",
      "Data Exclusivity"
    ],
    priority: "critical"
  },
  "Module 2": {
    name: "Module 2 — Common Technical Document Summaries",
    sections: [
      "Quality Overall Summary (QOS)",
      "Clinical Overview",
      "Clinical Summary",
      "Nonclinical Overview",
      "Nonclinical Written and Tabulated Summaries",
      "Introduction to CTD"
    ],
    priority: "critical"
  },
  "Module 3": {
    name: "Module 3 — Quality",
    sections: [
      "Drug Substance",
      "Drug Product",
      "Manufacturing Information",
      "Stability Data",
      "Appendices",
      "Regional Information"
    ],
    priority: "critical"
  },
  "Module 4": {
    name: "Module 4 — Nonclinical Study Reports",
    sections: [
      "Pharmacology Studies",
      "Pharmacokinetic Studies",
      "Toxicology Studies",
      "Literature References"
    ],
    priority: "high"
  },
  "Module 5": {
    name: "Module 5 — Clinical Study Reports",
    sections: [
      "Clinical Study Reports",
      "Clinical Trial Data",
      "Integrated Summaries of Safety and Efficacy",
      "Literature References"
    ],
    priority: "critical"
  }
};

/* =====================================================================
   Sample dossier outlines
   ===================================================================== */
const SAMPLE_DOSSIER = `Module 1
- Administrative Information
- Application Form
- Prescribing Information
- Labeling

Module 2
- Quality Overall Summary (QOS)
- Clinical Overview
- Clinical Summary

Module 3
- Drug Substance
- Drug Product
- Manufacturing Information

Module 4
- Pharmacology Studies
- Pharmacokinetic Studies
- Toxicology Studies

Module 5
- Clinical Study Reports
- Clinical Trial Data
- Literature References`;

const SAMPLE_DOSSIER_COMPLETE = `Module 1
- Administrative Information
- Application Form
- Prescribing Information
- Labeling
- Patent Information
- Data Exclusivity

Module 2
- Quality Overall Summary (QOS)
- Clinical Overview
- Clinical Summary
- Nonclinical Overview
- Nonclinical Written and Tabulated Summaries
- Introduction to CTD

Module 3
- Drug Substance
- Drug Product
- Manufacturing Information
- Stability Data
- Appendices
- Regional Information

Module 4
- Pharmacology Studies
- Pharmacokinetic Studies
- Toxicology Studies
- Literature References

Module 5
- Clinical Study Reports
- Clinical Trial Data
- Integrated Summaries of Safety and Efficacy
- Literature References`;
