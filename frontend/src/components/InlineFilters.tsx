import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  field: string;
  value: string | Date | null;
  type: "select" | "date" | "text";
}

interface InlineFiltersProps {
  schemaFields: Array<{ name: string; type: string; required: boolean }>;
  filters: FilterOption[];
  onFiltersChange: (filters: FilterOption[]) => void;
  onApplyFilters: () => void;
  uniqueValues?: Record<string, string[]>; // Pre-fetched unique values for select filters
}

export function InlineFilters({
  schemaFields,
  filters,
  onFiltersChange,
  onApplyFilters,
  uniqueValues = {},
}: InlineFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>(filters);

  // Get filterable fields (String, Date, Boolean types)
  const filterableFields = schemaFields.filter(
    (f) => f.type === "String" || f.type === "Date" || f.type === "Boolean" || f.name.toLowerCase().includes("status") || f.name.toLowerCase().includes("type")
  );

  const addFilter = () => {
    const newFilter: FilterOption = {
      field: filterableFields[0]?.name || "",
      value: null,
      type: filterableFields[0]?.type === "Date" ? "date" : "select",
    };
    const updated = [...activeFilters, newFilter];
    setActiveFilters(updated);
    onFiltersChange(updated);
  };

  const removeFilter = (index: number) => {
    const updated = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(updated);
    onFiltersChange(updated);
  };

  const updateFilter = (index: number, updates: Partial<FilterOption>) => {
    const updated = activeFilters.map((f, i) => (i === index ? { ...f, ...updates } : f));
    setActiveFilters(updated);
    onFiltersChange(updated);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    onFiltersChange([]);
  };

  const getFieldType = (fieldName: string): "select" | "date" | "text" => {
    const field = schemaFields.find((f) => f.name === fieldName);
    if (field?.type === "Date" || fieldName.toLowerCase().includes("date")) {
      return "date";
    }
    return "select";
  };

  const hasActiveFilters = activeFilters.some((f) => f.field && f.value !== null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter, index) => {
        const field = schemaFields.find((f) => f.name === filter.field);
        const fieldType = getFieldType(filter.field);
        const options = uniqueValues[filter.field] || [];

        return (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={filter.field}
              onValueChange={(value) => {
                const newType = getFieldType(value);
                updateFilter(index, { field: value, type: newType, value: null });
              }}
            >
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                {filterableFields.map((f) => (
                  <SelectItem key={f.name} value={f.name}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {fieldType === "date" ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] h-9 justify-start text-left font-normal text-sm",
                      !filter.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.value ? format(filter.value as Date, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filter.value as Date | undefined}
                    onSelect={(date) => updateFilter(index, { value: date || null })}
                  />
                </PopoverContent>
              </Popover>
            ) : options.length > 0 ? (
              <Select
                value={filter.value as string || ""}
                onValueChange={(value) => updateFilter(index, { value })}
              >
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <SelectValue placeholder="Value" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                className="w-[150px] h-9 text-sm"
                placeholder="Enter value"
                value={filter.value as string || ""}
                onChange={(e) => updateFilter(index, { value: e.target.value })}
              />
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => removeFilter(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={addFilter}
        className="h-9 gap-2"
      >
        <Filter className="h-4 w-4" />
        Add Filter
      </Button>

      {hasActiveFilters && (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={onApplyFilters}
            className="h-9"
          >
            Apply Filters
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9"
          >
            Clear All
          </Button>
          <div className="flex items-center gap-1">
            {activeFilters
              .filter((f) => f.field && f.value !== null)
              .map((f, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {f.field}: {f.value instanceof Date ? format(f.value, "MMM d") : String(f.value)}
                </Badge>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

