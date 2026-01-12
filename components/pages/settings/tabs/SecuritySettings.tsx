import { Check } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Switch } from '../../../ui/switch';

const ACCESS_LOGS = [
  { user: 'Sarah Chen', action: 'Logged in', ip: '192.168.1.100', time: '2 hours ago' },
  { user: 'John Davis', action: 'Modified deal settings', ip: '192.168.1.101', time: '5 hours ago' },
  { user: 'Mike Johnson', action: 'Exported report', ip: '192.168.1.102', time: '1 day ago' },
];

export function SecuritySettings() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        
        {/* Authentication Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Authentication</h3>
          <div className="space-y-4">
            <SecurityToggle 
              title="Two-Factor Authentication" 
              desc="Add an extra layer of security to your account" 
              checked 
            />
            <SecurityToggle 
              title="Single Sign-On (SSO)" 
              desc="Enable enterprise SSO with SAML 2.0" 
              checked 
            />
            <SecurityToggle 
              title="Session Timeout" 
              desc="Automatically log out after 30 minutes of inactivity" 
              checked 
            />
          </div>
        </div>

        {/* Compliance Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Data Encryption</div>
                <div className="text-sm text-muted-foreground">AES-256 encryption for all stored data</div>
              </div>
              <ComplianceBadge label="Enabled" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">SOC 2 Type II Compliance</div>
                <div className="text-sm text-muted-foreground">Annual security audit certification</div>
              </div>
              <ComplianceBadge label="Certified" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Data Retention Policy</div>
                <div className="text-sm text-muted-foreground">Keep deal data for 7 years per compliance requirements</div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Access Logs</h3>
          <div className="space-y-2">
            {ACCESS_LOGS.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg text-sm">
                <div className="flex items-center gap-6">
                  <div className="font-medium w-32">{log.user}</div>
                  <div className="text-muted-foreground w-48">{log.action}</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{log.ip}</code>
                </div>
                <div className="text-muted-foreground">{log.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// --- Local Helpers for Cleaner JSX ---

function SecurityToggle({ title, desc, checked }: { title: string, desc: string, checked: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={checked} />
    </div>
  );
}

function ComplianceBadge({ label }: { label: string }) {
  return (
    <Badge className="bg-green-100 text-green-800 border-green-200">
      <Check className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}