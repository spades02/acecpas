import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Calendar } from 'lucide-react';
import { StepProps } from '@/types/create-deal';

export function StepTimeline({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Timeline & Budget</h3>
        <p className="text-sm text-muted-foreground mb-6">Set target dates and budget parameters</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="targetClose">Target Close Date *</Label>
          <Input 
            id="targetClose" 
            type="date"
            value={formData.targetClose}
            onChange={(e) => onChange('targetClose', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input 
              id="estimatedHours" type="number" placeholder="120"
              value={formData.estimatedHours || ''}
              onChange={(e) => onChange('estimatedHours', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetAmount">Budget Amount</Label>
            <Input 
              id="budgetAmount" type="text" placeholder="$50,000"
              value={formData.budgetAmount || ''}
              onChange={(e) => onChange('budgetAmount', e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900">Timeline Recommendation</div>
            <div className="text-sm text-blue-700 mt-1">
              Based on similar {formData.dealType} engagements, we recommend allocating 6-8 weeks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}