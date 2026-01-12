import { Building2, FileText, Calendar, Check } from 'lucide-react';

// --- Types ---
export interface DealFormData {
  dealName: string;
  clientName: string;
  dealType: string;
  industry: string;
  dealSize: string;
  targetClose: string;
  description: string;
  assignedTo: string;
  estimatedHours?: string;
  budgetAmount?: string;
}

export interface StepProps {
  formData: DealFormData;
  onChange: (field: keyof DealFormData, value: string) => void;
}

// --- Configuration ---
export const STEPS_CONFIG = [
  { number: 1, title: 'Basic Information', icon: Building2 },
  { number: 2, title: 'Deal Details', icon: FileText },
  { number: 3, title: 'Timeline & Budget', icon: Calendar },
  { number: 4, title: 'Review & Create', icon: Check },
];

export const INITIAL_DATA: DealFormData = {
  dealName: '',
  clientName: '',
  dealType: 'M&A',
  industry: '',
  dealSize: '',
  targetClose: '',
  description: '',
  assignedTo: 'Sarah Chen',
};