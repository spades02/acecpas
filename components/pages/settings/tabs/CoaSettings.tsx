import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";

const MASTER_ACCOUNTS = [
  { code: '1000', name: 'Cash and Cash Equivalents', category: 'Assets', subcategory: 'Current Assets', type: 'Balance Sheet' },
  { code: '1100', name: 'Accounts Receivable', category: 'Assets', subcategory: 'Current Assets', type: 'Balance Sheet' },
  { code: '1200', name: 'Inventory', category: 'Assets', subcategory: 'Current Assets', type: 'Balance Sheet' },
  { code: '1500', name: 'Property, Plant & Equipment', category: 'Assets', subcategory: 'Fixed Assets', type: 'Balance Sheet' },
  { code: '2000', name: 'Accounts Payable', category: 'Liabilities', subcategory: 'Current Liabilities', type: 'Balance Sheet' },
  { code: '3000', name: "Owner's Equity", category: 'Equity', subcategory: 'Equity', type: 'Balance Sheet' },
  { code: '4000', name: 'Revenue', category: 'Revenue', subcategory: 'Operating Revenue', type: 'Income Statement' },
  { code: '5000', name: 'Cost of Goods Sold', category: 'COGS', subcategory: 'Direct Costs', type: 'Income Statement' },
  { code: '6000', name: 'Operating Expenses', category: 'Expenses', subcategory: 'Operating Expenses', type: 'Income Statement' },
];

export function CoaSettings() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Master Chart of Accounts</h3>
          <p className="text-sm text-muted-foreground">Define your standard account mappings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Account Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MASTER_ACCOUNTS.map((account, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">
                  <code className="px-2 py-1 bg-muted rounded text-sm font-mono">{account.code}</code>
                </TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{account.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {account.subcategory}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {account.type}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}