"use client"
import { useState } from 'react';
import { Building2, Users, FileText, Plug, CreditCard, Shield } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OrganizationSettings } from '@/components/pages/settings/tabs/OrganizationSettings';
import { TeamSettings } from '@/components/pages/settings/tabs/TeamSettings';
import { CoaSettings } from '@/components/pages/settings/tabs/CoaSettings';
import { IntegrationsSettings } from '@/components/pages/settings/tabs/IntegrationsSettings';
import { BillingSettings } from '@/components/pages/settings/tabs/BillingSettings';
import { SecuritySettings } from '@/components/pages/settings/tabs/SecuritySettings';

// Configuration approach makes adding new tabs easier in the future
const TABS = [
  { id: 'organization', label: 'Organization', icon: Building2, component: OrganizationSettings },
  { id: 'team', label: 'Team', icon: Users, component: TeamSettings },
  { id: 'coa', label: 'Master COA', icon: FileText, component: CoaSettings },
  { id: 'integrations', label: 'Integrations', icon: Plug, component: IntegrationsSettings },
  { id: 'billing', label: 'Billing', icon: CreditCard, component: BillingSettings },
  { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
];

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('organization');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your organization and platform preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`flex w-full max-w-4xl grid-cols-${TABS.length}`}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ id, component: Component }) => (
          <TabsContent key={id} value={id} className="space-y-6 mt-6  ">
            <Component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}