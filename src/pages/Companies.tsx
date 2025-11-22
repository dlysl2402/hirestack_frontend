import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Companies() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Manage companies in your organization
          </p>
        </div>
        <Button onClick={() => navigate('/companies/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Company
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Company list will be displayed here once the GET endpoint is available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
