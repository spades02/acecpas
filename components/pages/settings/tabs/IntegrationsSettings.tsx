import { Check } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

const INTEGRATIONS = [
  { name: 'QuickBooks Online', icon: '📊', status: 'connected', description: 'Sync financial data automatically', lastSync: '2 hours ago' },
  { name: 'Xero', icon: '💼', status: 'available', description: 'Cloud accounting platform', lastSync: null },
  // ... others
];

export function IntegrationsSettings() {
  return (
    <>
      <div>
        <h3 className="text-lg font-semibold mb-4">Connected Integrations</h3>
        <p className="text-sm text-muted-foreground mb-6">Connect your accounting software and cloud storage</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {INTEGRATIONS.map((integration, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
                  {integration.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{integration.name}</h4>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              {integration.status === 'connected' ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Check className="w-3 h-3 mr-1" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline">Available</Badge>
              )}
            </div>
            
            {integration.lastSync && (
              <div className="text-xs text-muted-foreground mb-4">Last synced: {integration.lastSync}</div>
            )}

            <div className="flex gap-2">
              {integration.status === 'connected' ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1">Configure</Button>
                  <Button variant="outline" size="sm" className="flex-1">Disconnect</Button>
                </>
              ) : (
                <Button size="sm" className="flex-1">Connect</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}