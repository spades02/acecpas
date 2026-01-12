import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { StepProps } from '@/types/create-deal';

export function StepBasicInfo({ formData, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
        <p className="text-sm text-muted-foreground mb-6">Enter the fundamental details about this engagement</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dealName">Deal Name *</Label>
          <Input 
            id="dealName" 
            placeholder="e.g., Acme Corp Acquisition" 
            value={formData.dealName}
            onChange={(e) => onChange('dealName', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientName">Client Name *</Label>
          <Input 
            id="clientName" 
            placeholder="e.g., Acme Industries Inc." 
            value={formData.clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dealType">Deal Type *</Label>
            <select 
              id="dealType" 
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={formData.dealType}
              onChange={(e) => onChange('dealType', e.target.value)}
            >
              <option value="M&A">M&A</option>
              <option value="Financing">Financing</option>
              <option value="Internal Review">Internal Review</option>
              <option value="Audit">Audit</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <select 
              id="industry" 
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={formData.industry}
              onChange={(e) => onChange('industry', e.target.value)}
            >
              <option value="">Select industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              {/* Add other options... */}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}