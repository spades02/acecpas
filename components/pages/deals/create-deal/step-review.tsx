import { DealFormData } from '@/types/create-deal';
import { Check } from 'lucide-react';

// Helper for display items
const ReviewItem = ({ label, value }: { label: string, value: string }) => (
  <div className="p-4 bg-muted rounded-lg">
    <div className="text-sm text-muted-foreground mb-1">{label}</div>
    <div className="font-medium">{value || '—'}</div>
  </div>
);

export function StepReview({ formData }: { formData: DealFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Review & Create</h3>
        <p className="text-sm text-muted-foreground mb-6">Please review the details before creating the deal</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ReviewItem label="Deal Name" value={formData.dealName} />
          <ReviewItem label="Client Name" value={formData.clientName} />
          <ReviewItem label="Deal Type" value={formData.dealType} />
          <ReviewItem label="Industry" value={formData.industry} />
          <ReviewItem label="Deal Size" value={formData.dealSize} />
          <ReviewItem label="Assigned To" value={formData.assignedTo} />
          <ReviewItem label="Target Close" value={formData.targetClose} />
        </div>

        {formData.description && (
          <ReviewItem label="Description" value={formData.description} />
        )}

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <div className="font-medium text-green-900">Ready to Create</div>
            <div className="text-sm text-green-700 mt-1">
              Once created, you'll be able to upload files and start the mapping process.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}