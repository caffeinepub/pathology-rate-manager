import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Data Models ─────────────────────────────────────────────────────────────

export type Machine = {
  id: string;
  name: string;
  ipAddress: string;
  port: string;
  protocol: "HL7" | "ASTM" | "Custom";
  description: string;
  isActive: boolean;
  createdAt: string;
};

export type LdmsSoftware = {
  id: string;
  name: string;
  ipAddress: string;
  port: string;
  apiEndpoint: string;
  description: string;
  isActive: boolean;
  createdAt: string;
};

export type TestParameter = {
  id: string;
  machineCode: string;
  testName: string;
  unit: string;
  referenceRange: string;
  category: string;
  isActive: boolean;
};

export type Patient = {
  id: string;
  barcode: string;
  patientName: string;
  age: number;
  gender: string;
  referralSource: string;
  orderedTestCodes: string[];
  createdAt: string;
};

export type MachineResult = {
  id: string;
  machineId: string;
  barcode: string;
  parameterCode: string;
  resultValue: string;
  unit: string;
  timestamp: string;
  status: "matched" | "unmatched" | "transferred" | "failed";
  notes: string;
  patientId: string;
  testParameterId: string;
  patientName: string;
  testName: string;
  machineName: string;
};

export type TransferLog = {
  id: string;
  resultId: string;
  machineId: string;
  ldmsId: string;
  ldmsName: string;
  barcode: string;
  parameterCode: string;
  patientId: string;
  patientName: string;
  testName: string;
  status: "success" | "failed";
  timestamp: string;
  notes: string;
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  machines: "lis_machines",
  ldms: "lis_ldms",
  parameters: "lis_parameters",
  patients: "lis_patients",
  results: "lis_results",
  transferLogs: "lis_transfer_logs",
  seeded: "lis_seeded",
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function seedInitialData() {
  if (localStorage.getItem(KEYS.seeded)) return;

  const m1: Machine = {
    id: "machine-001",
    name: "Hematology Analyzer HA-5000",
    ipAddress: "192.168.1.101",
    port: "3000",
    protocol: "HL7",
    description: "Sysmex HA-5000 automated hematology analyzer for CBC panels",
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const m2: Machine = {
    id: "machine-002",
    name: "Biochemistry Analyzer BA-200",
    ipAddress: "192.168.1.102",
    port: "3001",
    protocol: "ASTM",
    description: "Roche BA-200 biochemistry analyzer for metabolic panels",
    isActive: true,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const ldms1: LdmsSoftware = {
    id: "ldms-001",
    name: "MedLab Pro LIS",
    ipAddress: "192.168.1.50",
    port: "8080",
    apiEndpoint: "/api/v1/results",
    description: "Primary Laboratory Information System for the main facility",
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const params: TestParameter[] = [
    {
      id: "param-001",
      machineCode: "WBC",
      testName: "White Blood Cell Count",
      unit: "10³/µL",
      referenceRange: "4.5-11.0",
      category: "Hematology",
      isActive: true,
    },
    {
      id: "param-002",
      machineCode: "RBC",
      testName: "Red Blood Cell Count",
      unit: "10⁶/µL",
      referenceRange: "4.5-5.9",
      category: "Hematology",
      isActive: true,
    },
    {
      id: "param-003",
      machineCode: "HGB",
      testName: "Hemoglobin",
      unit: "g/dL",
      referenceRange: "13.5-17.5",
      category: "Hematology",
      isActive: true,
    },
    {
      id: "param-004",
      machineCode: "HCT",
      testName: "Hematocrit",
      unit: "%",
      referenceRange: "41-53",
      category: "Hematology",
      isActive: true,
    },
    {
      id: "param-005",
      machineCode: "PLT",
      testName: "Platelet Count",
      unit: "10³/µL",
      referenceRange: "150-400",
      category: "Hematology",
      isActive: true,
    },
    {
      id: "param-006",
      machineCode: "GLU",
      testName: "Blood Glucose",
      unit: "mg/dL",
      referenceRange: "70-100",
      category: "Biochemistry",
      isActive: true,
    },
    {
      id: "param-007",
      machineCode: "CREA",
      testName: "Creatinine",
      unit: "mg/dL",
      referenceRange: "0.7-1.3",
      category: "Biochemistry",
      isActive: true,
    },
    {
      id: "param-008",
      machineCode: "UREA",
      testName: "Blood Urea Nitrogen",
      unit: "mg/dL",
      referenceRange: "7-20",
      category: "Biochemistry",
      isActive: true,
    },
    {
      id: "param-009",
      machineCode: "SGPT",
      testName: "ALT SGPT",
      unit: "U/L",
      referenceRange: "7-56",
      category: "Liver Function",
      isActive: true,
    },
    {
      id: "param-010",
      machineCode: "SGOT",
      testName: "AST SGOT",
      unit: "U/L",
      referenceRange: "10-40",
      category: "Liver Function",
      isActive: true,
    },
  ];

  const patients: Patient[] = [
    {
      id: "pat-001",
      barcode: "BC-2024-001",
      patientName: "Rahul Sharma",
      age: 34,
      gender: "Male",
      referralSource: "Dr. Mehta Clinic",
      orderedTestCodes: ["WBC", "RBC", "HGB", "HCT", "PLT"],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "pat-002",
      barcode: "BC-2024-002",
      patientName: "Priya Patel",
      age: 28,
      gender: "Female",
      referralSource: "City Hospital",
      orderedTestCodes: ["GLU", "CREA", "UREA", "SGPT", "SGOT"],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "pat-003",
      barcode: "BC-2024-003",
      patientName: "Amit Kumar",
      age: 52,
      gender: "Male",
      referralSource: "Self Referral",
      orderedTestCodes: ["WBC", "HGB", "GLU", "CREA"],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const results: MachineResult[] = [
    {
      id: "res-001",
      machineId: "machine-001",
      barcode: "BC-2024-001",
      parameterCode: "WBC",
      resultValue: "7.8",
      unit: "10³/µL",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: "transferred",
      notes: "Normal range",
      patientId: "pat-001",
      testParameterId: "param-001",
      patientName: "Rahul Sharma",
      testName: "White Blood Cell Count",
      machineName: "Hematology Analyzer HA-5000",
    },
    {
      id: "res-002",
      machineId: "machine-001",
      barcode: "BC-2024-001",
      parameterCode: "HGB",
      resultValue: "14.2",
      unit: "g/dL",
      timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
      status: "matched",
      notes: "",
      patientId: "pat-001",
      testParameterId: "param-003",
      patientName: "Rahul Sharma",
      testName: "Hemoglobin",
      machineName: "Hematology Analyzer HA-5000",
    },
    {
      id: "res-003",
      machineId: "machine-002",
      barcode: "BC-2024-002",
      parameterCode: "GLU",
      resultValue: "98",
      unit: "mg/dL",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "matched",
      notes: "",
      patientId: "pat-002",
      testParameterId: "param-006",
      patientName: "Priya Patel",
      testName: "Blood Glucose",
      machineName: "Biochemistry Analyzer BA-200",
    },
    {
      id: "res-004",
      machineId: "machine-002",
      barcode: "BC-2024-999",
      parameterCode: "SGPT",
      resultValue: "45",
      unit: "U/L",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: "unmatched",
      notes: "Barcode BC-2024-999 not registered in patient registry",
      patientId: "",
      testParameterId: "param-009",
      patientName: "",
      testName: "ALT SGPT",
      machineName: "Biochemistry Analyzer BA-200",
    },
    {
      id: "res-005",
      machineId: "machine-001",
      barcode: "BC-2024-003",
      parameterCode: "WBC",
      resultValue: "11.4",
      unit: "10³/µL",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: "matched",
      notes: "Slightly elevated",
      patientId: "pat-003",
      testParameterId: "param-001",
      patientName: "Amit Kumar",
      testName: "White Blood Cell Count",
      machineName: "Hematology Analyzer HA-5000",
    },
  ];

  const transferLogs: TransferLog[] = [
    {
      id: "log-001",
      resultId: "res-001",
      machineId: "machine-001",
      ldmsId: "ldms-001",
      ldmsName: "MedLab Pro LIS",
      barcode: "BC-2024-001",
      parameterCode: "WBC",
      patientId: "pat-001",
      patientName: "Rahul Sharma",
      testName: "White Blood Cell Count",
      status: "success",
      timestamp: new Date(Date.now() - 3.8 * 60 * 60 * 1000).toISOString(),
      notes: "Auto-transferred after match",
    },
  ];

  localStorage.setItem(KEYS.machines, JSON.stringify([m1, m2]));
  localStorage.setItem(KEYS.ldms, JSON.stringify([ldms1]));
  localStorage.setItem(KEYS.parameters, JSON.stringify(params));
  localStorage.setItem(KEYS.patients, JSON.stringify(patients));
  localStorage.setItem(KEYS.results, JSON.stringify(results));
  localStorage.setItem(KEYS.transferLogs, JSON.stringify(transferLogs));
  localStorage.setItem(KEYS.seeded, "1");
}

// ─── Context ──────────────────────────────────────────────────────────────────

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

interface LisDataContextType {
  machines: Machine[];
  setMachines: (data: Machine[]) => void;
  ldmsList: LdmsSoftware[];
  setLdmsList: (data: LdmsSoftware[]) => void;
  parameters: TestParameter[];
  setParameters: (data: TestParameter[]) => void;
  patients: Patient[];
  setPatients: (data: Patient[]) => void;
  results: MachineResult[];
  setResults: (data: MachineResult[]) => void;
  transferLogs: TransferLog[];
  setTransferLogs: (data: TransferLog[]) => void;
  addMachine: (m: Omit<Machine, "id" | "createdAt">) => void;
  updateMachine: (id: string, m: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  addLdms: (l: Omit<LdmsSoftware, "id" | "createdAt">) => void;
  updateLdms: (id: string, l: Partial<LdmsSoftware>) => void;
  deleteLdms: (id: string) => void;
  addParameter: (p: Omit<TestParameter, "id">) => void;
  updateParameter: (id: string, p: Partial<TestParameter>) => void;
  deleteParameter: (id: string) => void;
  addPatient: (p: Omit<Patient, "id" | "createdAt">) => void;
  updatePatient: (id: string, p: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addResult: (r: Omit<MachineResult, "id">) => void;
  updateResult: (id: string, r: Partial<MachineResult>) => void;
  addTransferLog: (l: Omit<TransferLog, "id">) => void;
  ingestResult: (data: {
    machineId: string;
    barcode: string;
    parameterCode: string;
    resultValue: string;
    unit: string;
    timestamp?: string;
  }) => MachineResult;
  transferResult: (resultId: string, ldmsId: string) => TransferLog;
  transferAllMatched: (ldmsId: string) => TransferLog[];
}

const LisDataContext = createContext<LisDataContextType | null>(null);

export function LisDataProvider({ children }: { children: React.ReactNode }) {
  const [machines, setMachinesState] = useState<Machine[]>([]);
  const [ldmsList, setLdmsState] = useState<LdmsSoftware[]>([]);
  const [parameters, setParamsState] = useState<TestParameter[]>([]);
  const [patients, setPatientsState] = useState<Patient[]>([]);
  const [results, setResultsState] = useState<MachineResult[]>([]);
  const [transferLogs, setLogsState] = useState<TransferLog[]>([]);

  useEffect(() => {
    seedInitialData();
    setMachinesState(loadFromStorage<Machine>(KEYS.machines));
    setLdmsState(loadFromStorage<LdmsSoftware>(KEYS.ldms));
    setParamsState(loadFromStorage<TestParameter>(KEYS.parameters));
    setPatientsState(loadFromStorage<Patient>(KEYS.patients));
    setResultsState(loadFromStorage<MachineResult>(KEYS.results));
    setLogsState(loadFromStorage<TransferLog>(KEYS.transferLogs));
  }, []);

  const setMachines = useCallback((data: Machine[]) => {
    setMachinesState(data);
    saveToStorage(KEYS.machines, data);
  }, []);

  const setLdmsList = useCallback((data: LdmsSoftware[]) => {
    setLdmsState(data);
    saveToStorage(KEYS.ldms, data);
  }, []);

  const setParameters = useCallback((data: TestParameter[]) => {
    setParamsState(data);
    saveToStorage(KEYS.parameters, data);
  }, []);

  const setPatients = useCallback((data: Patient[]) => {
    setPatientsState(data);
    saveToStorage(KEYS.patients, data);
  }, []);

  const setResults = useCallback((data: MachineResult[]) => {
    setResultsState(data);
    saveToStorage(KEYS.results, data);
  }, []);

  const setTransferLogs = useCallback((data: TransferLog[]) => {
    setLogsState(data);
    saveToStorage(KEYS.transferLogs, data);
  }, []);

  // ─── CRUD helpers ──────────────────────────────────────────────────────────

  const addMachine = useCallback((m: Omit<Machine, "id" | "createdAt">) => {
    setMachinesState((prev) => {
      const next = [
        ...prev,
        { ...m, id: generateId(), createdAt: new Date().toISOString() },
      ];
      saveToStorage(KEYS.machines, next);
      return next;
    });
  }, []);

  const updateMachine = useCallback((id: string, m: Partial<Machine>) => {
    setMachinesState((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...m } : x));
      saveToStorage(KEYS.machines, next);
      return next;
    });
  }, []);

  const deleteMachine = useCallback((id: string) => {
    setMachinesState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      saveToStorage(KEYS.machines, next);
      return next;
    });
  }, []);

  const addLdms = useCallback((l: Omit<LdmsSoftware, "id" | "createdAt">) => {
    setLdmsState((prev) => {
      const next = [
        ...prev,
        { ...l, id: generateId(), createdAt: new Date().toISOString() },
      ];
      saveToStorage(KEYS.ldms, next);
      return next;
    });
  }, []);

  const updateLdms = useCallback((id: string, l: Partial<LdmsSoftware>) => {
    setLdmsState((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...l } : x));
      saveToStorage(KEYS.ldms, next);
      return next;
    });
  }, []);

  const deleteLdms = useCallback((id: string) => {
    setLdmsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      saveToStorage(KEYS.ldms, next);
      return next;
    });
  }, []);

  const addParameter = useCallback((p: Omit<TestParameter, "id">) => {
    setParamsState((prev) => {
      const next = [...prev, { ...p, id: generateId() }];
      saveToStorage(KEYS.parameters, next);
      return next;
    });
  }, []);

  const updateParameter = useCallback(
    (id: string, p: Partial<TestParameter>) => {
      setParamsState((prev) => {
        const next = prev.map((x) => (x.id === id ? { ...x, ...p } : x));
        saveToStorage(KEYS.parameters, next);
        return next;
      });
    },
    [],
  );

  const deleteParameter = useCallback((id: string) => {
    setParamsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      saveToStorage(KEYS.parameters, next);
      return next;
    });
  }, []);

  const addPatient = useCallback((p: Omit<Patient, "id" | "createdAt">) => {
    setPatientsState((prev) => {
      const next = [
        ...prev,
        { ...p, id: generateId(), createdAt: new Date().toISOString() },
      ];
      saveToStorage(KEYS.patients, next);
      return next;
    });
  }, []);

  const updatePatient = useCallback((id: string, p: Partial<Patient>) => {
    setPatientsState((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...p } : x));
      saveToStorage(KEYS.patients, next);
      return next;
    });
  }, []);

  const deletePatient = useCallback((id: string) => {
    setPatientsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      saveToStorage(KEYS.patients, next);
      return next;
    });
  }, []);

  const addResult = useCallback((r: Omit<MachineResult, "id">) => {
    setResultsState((prev) => {
      const next = [...prev, { ...r, id: generateId() }];
      saveToStorage(KEYS.results, next);
      return next;
    });
  }, []);

  const updateResult = useCallback((id: string, r: Partial<MachineResult>) => {
    setResultsState((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...r } : x));
      saveToStorage(KEYS.results, next);
      return next;
    });
  }, []);

  const addTransferLog = useCallback((l: Omit<TransferLog, "id">) => {
    setLogsState((prev) => {
      const next = [...prev, { ...l, id: generateId() }];
      saveToStorage(KEYS.transferLogs, next);
      return next;
    });
  }, []);

  // ─── Smart ingest ──────────────────────────────────────────────────────────

  const ingestResult = useCallback(
    (data: {
      machineId: string;
      barcode: string;
      parameterCode: string;
      resultValue: string;
      unit: string;
      timestamp?: string;
    }): MachineResult => {
      const machinesSnapshot = loadFromStorage<Machine>(KEYS.machines);
      const patientsSnapshot = loadFromStorage<Patient>(KEYS.patients);
      const paramsSnapshot = loadFromStorage<TestParameter>(KEYS.parameters);

      const machine = machinesSnapshot.find((m) => m.id === data.machineId);
      const patient = patientsSnapshot.find((p) => p.barcode === data.barcode);
      const param = paramsSnapshot.find(
        (p) =>
          p.machineCode.toUpperCase() === data.parameterCode.toUpperCase() &&
          p.isActive,
      );

      let status: MachineResult["status"] = "unmatched";
      let notes = "";

      if (!patient && !param) {
        notes = `Barcode '${data.barcode}' not found. Parameter '${data.parameterCode}' not found.`;
      } else if (!patient) {
        notes = `Barcode '${data.barcode}' not registered in patient registry.`;
      } else if (!param) {
        notes = `Parameter code '${data.parameterCode}' not mapped to any test.`;
      } else {
        status = "matched";
        notes = "";
      }

      const result: MachineResult = {
        id: generateId(),
        machineId: data.machineId,
        barcode: data.barcode,
        parameterCode: data.parameterCode.toUpperCase(),
        resultValue: data.resultValue,
        unit: data.unit || param?.unit || "",
        timestamp: data.timestamp || new Date().toISOString(),
        status,
        notes,
        patientId: patient?.id || "",
        testParameterId: param?.id || "",
        patientName: patient?.patientName || "",
        testName: param?.testName || data.parameterCode,
        machineName: machine?.name || "Unknown Machine",
      };

      setResultsState((prev) => {
        const next = [...prev, result];
        saveToStorage(KEYS.results, next);
        return next;
      });

      return result;
    },
    [],
  );

  // ─── Transfer ─────────────────────────────────────────────────────────────

  const transferResult = useCallback(
    (resultId: string, ldmsId: string): TransferLog => {
      const resultsSnapshot = loadFromStorage<MachineResult>(KEYS.results);
      const ldmsSnapshot = loadFromStorage<LdmsSoftware>(KEYS.ldms);

      const result = resultsSnapshot.find((r) => r.id === resultId);
      const ldms = ldmsSnapshot.find((l) => l.id === ldmsId);

      const log: TransferLog = {
        id: generateId(),
        resultId,
        machineId: result?.machineId || "",
        ldmsId,
        ldmsName: ldms?.name || "Unknown LDMS",
        barcode: result?.barcode || "",
        parameterCode: result?.parameterCode || "",
        patientId: result?.patientId || "",
        patientName: result?.patientName || "",
        testName: result?.testName || "",
        status: "success",
        timestamp: new Date().toISOString(),
        notes: `Transferred to ${ldms?.name || "LDMS"} at ${ldms?.ipAddress}:${ldms?.port}${ldms?.apiEndpoint}`,
      };

      // Update result status
      setResultsState((prev) => {
        const next = prev.map((r) =>
          r.id === resultId ? { ...r, status: "transferred" as const } : r,
        );
        saveToStorage(KEYS.results, next);
        return next;
      });

      setLogsState((prev) => {
        const next = [...prev, log];
        saveToStorage(KEYS.transferLogs, next);
        return next;
      });

      return log;
    },
    [],
  );

  const transferAllMatched = useCallback((ldmsId: string): TransferLog[] => {
    const resultsSnapshot = loadFromStorage<MachineResult>(KEYS.results);
    const ldmsSnapshot = loadFromStorage<LdmsSoftware>(KEYS.ldms);
    const ldms = ldmsSnapshot.find((l) => l.id === ldmsId);
    const matched = resultsSnapshot.filter((r) => r.status === "matched");

    const newLogs: TransferLog[] = matched.map((result) => ({
      id: generateId(),
      resultId: result.id,
      machineId: result.machineId,
      ldmsId,
      ldmsName: ldms?.name || "Unknown LDMS",
      barcode: result.barcode,
      parameterCode: result.parameterCode,
      patientId: result.patientId,
      patientName: result.patientName,
      testName: result.testName,
      status: "success" as const,
      timestamp: new Date().toISOString(),
      notes: `Batch transferred to ${ldms?.name || "LDMS"}`,
    }));

    setResultsState((prev) => {
      const matchedIds = new Set(matched.map((r) => r.id));
      const next = prev.map((r) =>
        matchedIds.has(r.id) ? { ...r, status: "transferred" as const } : r,
      );
      saveToStorage(KEYS.results, next);
      return next;
    });

    setLogsState((prev) => {
      const next = [...prev, ...newLogs];
      saveToStorage(KEYS.transferLogs, next);
      return next;
    });

    return newLogs;
  }, []);

  return (
    <LisDataContext.Provider
      value={{
        machines,
        setMachines,
        ldmsList,
        setLdmsList,
        parameters,
        setParameters,
        patients,
        setPatients,
        results,
        setResults,
        transferLogs,
        setTransferLogs,
        addMachine,
        updateMachine,
        deleteMachine,
        addLdms,
        updateLdms,
        deleteLdms,
        addParameter,
        updateParameter,
        deleteParameter,
        addPatient,
        updatePatient,
        deletePatient,
        addResult,
        updateResult,
        addTransferLog,
        ingestResult,
        transferResult,
        transferAllMatched,
      }}
    >
      {children}
    </LisDataContext.Provider>
  );
}

export function useLisData() {
  const ctx = useContext(LisDataContext);
  if (!ctx) throw new Error("useLisData must be used within LisDataProvider");
  return ctx;
}
