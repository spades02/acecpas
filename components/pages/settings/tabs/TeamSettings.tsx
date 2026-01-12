import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

const TEAM_MEMBERS = [
  { name: 'Sarah Chen', email: 'sarah.chen@kpmg.com', role: 'Admin', dept: 'Deal Advisory', status: 'active', lastActive: '2 hours ago' },
  { name: 'David Kim', email: 'david.kim@kpmg.com', role: 'Analyst', dept: 'M&A', status: 'invited', lastActive: 'Never' },
  // ... others
];

export function TeamSettings() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">Manage users and their permissions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Invite User
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                {['User', 'Role', 'Department', 'Status', 'Last Active', 'Actions'].map(h => (
                   <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {TEAM_MEMBERS.map((user, idx) => (
                <tr key={idx} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="outline">{user.role}</Badge></td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.dept}</td>
                  <td className="px-6 py-4">
                    <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}