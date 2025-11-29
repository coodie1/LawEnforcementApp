import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AggregationResultsProps {
  results: any[];
  pipeline: any[];
  collectionName: string;
}

export function AggregationResults({ results, pipeline, collectionName }: AggregationResultsProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Aggregation Results
          </CardTitle>
          <CardDescription>No results to display. Run an aggregation query to see results.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get headers from first result
  const getHeaders = () => {
    if (results.length === 0) return [];
    const firstResult = results[0];
    return Object.keys(firstResult);
  };

  const headers = getHeaders();

  // Format cell value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.length > 0 ? JSON.stringify(value) : "[]";
      }
      return JSON.stringify(value);
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (results.length === 0) return;

    const csvHeaders = headers.join(",");
    const csvRows = results.map((result) =>
      headers.map((header) => {
        const value = result[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",")
    );

    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${collectionName}_aggregation_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Aggregation Results
            </CardTitle>
            <CardDescription>
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="font-semibold">
                    {header === "_id" ? "Group" : header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  {headers.map((header) => {
                    const value = result[header];
                    const isId = header === "_id";
                    const isCount = header === "count";
                    const isNumber = typeof value === "number";

                    return (
                      <TableCell
                        key={header}
                        className={cn(
                          isId && "font-medium",
                          isCount && "text-primary font-semibold",
                          isNumber && !isCount && "text-muted-foreground"
                        )}
                      >
                        {isId && typeof value === "object" ? (
                          <div className="space-y-1">
                            {Object.entries(value).map(([key, val]) => (
                              <div key={key} className="text-xs">
                                <Badge variant="outline" className="mr-1">
                                  {key}: {formatValue(val)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          formatValue(value)
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

