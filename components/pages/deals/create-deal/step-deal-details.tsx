import { StepProps } from '@/types/create-deal';
import { Label } from '../../../ui/label';

export function StepDealDetails({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Deal Details</h3>
        <p className="text-sm text-muted-foreground mb-6">Additional information about the engagement scope</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dealSize">Deal Size</Label>
          <select 
            id="dealSize" 
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            value={formData.dealSize}
            onChange={(e) => onChange('dealSize', e.target.value)}
          >
            <option value="">Select deal size</option>
            <option value="$0-$5M">$0 - $5M</option>
            <option value="$5M-$10M">$5M - $10M</option>
            <option value="$50M+">$50M+</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <select 
            id="assignedTo" 
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            value={formData.assignedTo}
            onChange={(e) => onChange('assignedTo', e.target.value)}
          >
            <option value="Sarah Chen">Sarah Chen</option>
            <option value="John Davis">John Davis</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deal Description</Label>
          <textarea 
            id="description" 
            className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-32"
            placeholder="Brief description..."
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}