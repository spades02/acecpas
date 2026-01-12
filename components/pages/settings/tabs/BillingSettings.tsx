import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

const BILLING_HISTORY = [
  { date: 'Jan 1, 2026', amount: '$999.00', status: 'Paid', invoice: 'INV-2026-001' },
  { date: 'Dec 1, 2025', amount: '$999.00', status: 'Paid', invoice: 'INV-2025-012' },
  { date: 'Nov 1, 2025', amount: '$999.00', status: 'Paid', invoice: 'INV-2025-011' },
];

export function BillingSettings() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        
        {/* Plan Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
          <div className="bg-linear-to-br from-primary to-blue-700 text-primary-foreground rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm opacity-90">Current Plan</div>
                <div className="text-3xl font-bold mt-1">Enterprise</div>
                <div className="text-sm opacity-90 mt-2">Unlimited deals • Advanced features • Priority support</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">$999</div>
                <div className="text-sm opacity-90">per month</div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" size="sm">Change Plan</Button>
              <Button variant="secondary" size="sm">Cancel Subscription</Button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-linear-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <div className="font-medium">•••• •••• •••• 4242</div>
                <div className="text-sm text-muted-foreground">Expires 12/2026</div>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </div>

        {/* History Table */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Billing History</h3>
          <div className="space-y-2">
            {BILLING_HISTORY.map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-8">
                  <div className="text-sm text-muted-foreground w-32">{payment.date}</div>
                  <div className="font-medium">{payment.amount}</div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">{payment.status}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <code className="text-xs text-muted-foreground">{payment.invoice}</code>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}