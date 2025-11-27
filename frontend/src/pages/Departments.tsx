import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Departments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
        <p className="text-muted-foreground">Manage department information</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Department management features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Departments;
