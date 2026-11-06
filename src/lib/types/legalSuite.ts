export interface ClientRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  nidOrPassport?: string;
  address: string;
  cases: string[]; // caseIds
  retainerBalance: number;
  status: "ACTIVE" | "INACTIVE";
  notes?: string;
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  caseId?: string;
  caseTitle?: string;
  assignedTo: string; // user name or id
  assignedBy: string;
  dueDate: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  notes?: string;
  createdAt: string;
}

export interface TrustTransaction {
  id: string;
  date: string;
  type: "DEPOSIT" | "DISBURSEMENT";
  amount: number;
  purpose: string;
  voucherRef?: string;
}

export interface TrustAccountRecord {
  id: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  totalDeposited: number;
  totalDisbursed: number;
  balance: number;
  transactions: TrustTransaction[];
  createdAt: string;
}

export interface PrecedentRecord {
  id: string;
  citation: string;
  court: string;
  parties: string;
  subject: string;
  ratioDecidendiBn: string;
  year: number;
}
