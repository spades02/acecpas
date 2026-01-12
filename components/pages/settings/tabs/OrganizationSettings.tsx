import { Save } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { toast } from 'sonner';

export function OrganizationSettings() {
  const handleSave = () => {
    toast.success('Organization settings saved successfully');
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        
        {/* Profile Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Organization Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" defaultValue="KPMG LLP" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="org-type">Organization Type</Label>
              <Input id="org-type" defaultValue="Big 4 Accounting Firm" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Primary Industry</Label>
              <Input id="industry" defaultValue="Professional Services" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Input id="size" defaultValue="10,000+ employees" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Financial Plaza, New York, NY 10004" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="+1 (212) 555-0100" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" defaultValue="https://kpmg.com" />
            </div>
          </div>
        </div>

        {/* Branding Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Branding</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl font-bold shadow-sm">
                  K
                </div>
                <Button variant="outline" size="sm">Upload New Logo</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Brand Color</Label>
              <div className="flex items-center gap-2">
                <Input id="primary-color" defaultValue="#1E3A8A" className="flex-1 font-mono" />
                <div className="w-10 h-10 rounded border shadow-sm" style={{ backgroundColor: '#1E3A8A' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}