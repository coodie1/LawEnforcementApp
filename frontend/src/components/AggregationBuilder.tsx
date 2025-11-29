import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Filter, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { aggregationAPI } from "@/api.ts";
import { toast } from "sonner";

interface AggregationBuilderProps {
  collectionName: string;
  schemaFields: Array<{ name: string; type: string; required: boolean }>;
  onResultsChange: (results: any[], pipeline: any[]) => void;
}

interface FilterCondition {
  field: string;
  operator: string;
  value: string | string[];
  id: string;
}

interface GroupByField {
  field: string;
  id: string;
}

export function AggregationBuilder({
  collectionName,
  schemaFields,
  onResultsChange,
}: AggregationBuilderProps) {
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [groupByFields, setGroupByFields] = useState<GroupByField[]>([]);
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<1 | -1>(-1);
  const [limit, setLimit] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ field: string; start: Date | undefined; end: Date | undefined }>({
    field: "",
    start: undefined,
    end: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);

  // Get available fields by type
  const dateFields = schemaFields.filter((f) => f.type === "Date" || f.name.toLowerCase().includes("date"));
  const stringFields = schemaFields.filter((f) => f.type === "String");
  const numberFields = schemaFields.filter((f) => f.type === "Number");
  const booleanFields = schemaFields.filter((f) => f.type === "Boolean");
  const allFields = schemaFields.map((f) => f.name);

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        id: Date.now().toString(),
        field: "",
        operator: "equals",
        value: "",
      },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const addGroupBy = () => {
    setGroupByFields([
      ...groupByFields,
      {
        id: Date.now().toString(),
        field: "",
      },
    ]);
  };

  const removeGroupBy = (id: string) => {
    setGroupByFields(groupByFields.filter((g) => g.id !== id));
  };

  const updateGroupBy = (id: string, field: string) => {
    setGroupByFields(groupByFields.map((g) => (g.id === id ? { ...g, field } : g)));
  };

  const buildAggregationConfig = () => {
    const config: any = {
      match: {},
      groupBy: [],
      sort: {},
    };

    // Build match conditions from filters
    filters.forEach((filter) => {
      if (!filter.field || !filter.value) return;

      const fieldType = schemaFields.find((f) => f.name === filter.field)?.type;

      if (filter.operator === "equals") {
        if (fieldType === "Number") {
          config.match[filter.field] = parseFloat(filter.value as string);
        } else if (fieldType === "Boolean") {
          config.match[filter.field] = filter.value === "true";
        } else {
          config.match[filter.field] = filter.value;
        }
      } else if (filter.operator === "contains") {
        config.match[filter.field] = { $regex: filter.value, $options: "i" };
      } else if (filter.operator === "in") {
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];
        config.match[filter.field] = { $in: values };
      } else if (filter.operator === "greaterThan") {
        config.match[filter.field] = { $gt: parseFloat(filter.value as string) };
      } else if (filter.operator === "lessThan") {
        config.match[filter.field] = { $lt: parseFloat(filter.value as string) };
      }
    });

    // Add date range filter
    if (dateRange.field && (dateRange.start || dateRange.end)) {
      config.match.dateRange = {
        field: dateRange.field,
        start: dateRange.start?.toISOString(),
        end: dateRange.end?.toISOString(),
      };
    }

    // Build groupBy array
    if (groupByFields.length > 0) {
      config.groupBy = groupByFields.map((g) => g.field).filter((f) => f);
    }

    // Build sort
    if (sortField) {
      config.sort = { field: sortField, order: sortOrder };
    }

    // Add limit
    if (limit) {
      config.limit = parseInt(limit);
    }

    return config;
  };

  const executeAggregation = async () => {
    try {
      setIsLoading(true);
      const config = buildAggregationConfig();
      const response = await aggregationAPI.aggregate(collectionName, config);
      setResults(response.results);
      setPipeline(response.pipeline);
      onResultsChange(response.results, response.pipeline);
      toast.success(`Aggregation completed: ${response.results.length} results`);
    } catch (error: any) {
      console.error("Aggregation error:", error);
      toast.error(error.response?.data?.error || "Failed to execute aggregation");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setFilters([]);
    setGroupByFields([]);
    setSortField("");
    setSortOrder(-1);
    setLimit("");
    setDateRange({ field: "", start: undefined, end: undefined });
    setResults([]);
    setPipeline([]);
    onResultsChange([], []);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dynamic Aggregation Builder
          </CardTitle>
          <CardDescription>
            Build custom MongoDB aggregation pipelines using filters, grouping, and sorting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range Filter</Label>
            <div className="flex gap-2 items-end">
              <Select value={dateRange.field} onValueChange={(value) => setDateRange({ ...dateRange, field: value })}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select date field" />
                </SelectTrigger>
                <SelectContent>
                  {dateFields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dateRange.field && (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.start ? format(dateRange.start, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateRange.start} onSelect={(date) => setDateRange({ ...dateRange, start: date })} />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.end ? format(dateRange.end, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateRange.end} onSelect={(date) => setDateRange({ ...dateRange, end: date })} />
                    </PopoverContent>
                  </Popover>
                </>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Filters</Label>
              <Button variant="outline" size="sm" onClick={addFilter} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Filter
              </Button>
            </div>
            {filters.map((filter) => (
              <div key={filter.id} className="flex gap-2 items-end p-3 border rounded-lg">
                <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, { field: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {allFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filter.operator} onValueChange={(value) => updateFilter(filter.id, { operator: value })}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="in">In (multiple)</SelectItem>
                    <SelectItem value="greaterThan">Greater Than</SelectItem>
                    <SelectItem value="lessThan">Less Than</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1"
                  placeholder="Value"
                  value={Array.isArray(filter.value) ? filter.value.join(", ") : filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                />
                <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Group By */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Group By</Label>
              <Button variant="outline" size="sm" onClick={addGroupBy} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </div>
            {groupByFields.map((groupBy) => (
              <div key={groupBy.id} className="flex gap-2 items-center">
                <Select value={groupBy.field} onValueChange={(value) => updateGroupBy(groupBy.id, value)}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select field to group by" />
                  </SelectTrigger>
                  <SelectContent>
                    {allFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => removeGroupBy(groupBy.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Sort & Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-2">
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count (default)</SelectItem>
                    {allFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortOrder.toString()} onValueChange={(value) => setSortOrder(value === "1" ? 1 : -1)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Descending</SelectItem>
                    <SelectItem value="1">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Limit Results</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min="1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={executeAggregation} disabled={isLoading} className="gap-2">
              <Filter className="h-4 w-4" />
              {isLoading ? "Executing..." : "Execute Aggregation"}
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          {/* Pipeline Preview */}
          {pipeline.length > 0 && (
            <div className="space-y-2">
              <Label>Generated Pipeline</Label>
              <pre className="p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                {JSON.stringify(pipeline, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

