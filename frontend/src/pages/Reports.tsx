import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, CalendarIcon, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import API from "@/api.ts";
import { aggregationAPI } from "@/api.ts";
import { CollectionFormDialog } from "@/components/CollectionFormDialog";
import { toast } from "sonner";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Filter states
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all");
  const [caseIDFilter, setCaseIDFilter] = useState<string>("");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [dateFiled, setDateFiled] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [reportTypes, setReportTypes] = useState<string[]>([]);
  const [officers, setOfficers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchFilterOptions();
  }, [reportTypeFilter, caseIDFilter, authorFilter, dateFiled]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      
      // Fetch unique report types
      const reportsResponse = await API.post('/dynamic/reports/aggregate', {
        groupBy: ['reportType'],
        limit: 100,
      });
      setReportTypes(
        reportsResponse.data.results
          .map((r: any) => r._id)
          .filter((v: any) => v !== null && v !== undefined)
      );

      // Fetch officers for author filter
      const officersResponse = await API.get('/dynamic/officers');
      const officerOptions = officersResponse.data
        .map((officer: any) => ({
          id: officer.officerID,
          name: `${officer.firstName || ''} ${officer.lastName || ''}`.trim() || officer.officerID,
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setOfficers(officerOptions);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      
      const match: Record<string, any> = {};
      const lookup: any[] = [];

      if (reportTypeFilter !== "all") {
        match.reportType = reportTypeFilter;
      }

      if (caseIDFilter) {
        match.caseID = { $regex: caseIDFilter, $options: "i" };
      }

      // Author filter (via officer lookup)
      if (authorFilter !== "all") {
        lookup.push({
          from: "officers",
          localField: "authorID",
          foreignField: "officerID",
          as: "author"
        });
        match["author.officerID"] = authorFilter;
      }

      // Date filed filter
      if (dateFiled) {
        const dateStr = `${dateFiled.getFullYear()}-${String(dateFiled.getMonth() + 1).padStart(2, '0')}-${String(dateFiled.getDate()).padStart(2, '0')}`;
        match.dateFiled = dateStr;
      }

      let response;
      if (Object.keys(match).length > 0 || lookup.length > 0) {
        response = await aggregationAPI.aggregate("reports", {
          match,
          lookup,
          limit: 500,
        });
        setReports(response.results);
      } else {
        response = await API.get('/dynamic/reports');
        setReports(response.data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load reports');
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (report.reportID?.toLowerCase().includes(searchLower) || false) ||
      (report.caseID?.toLowerCase().includes(searchLower) || false) ||
      (report.authorID?.toLowerCase().includes(searchLower) || false) ||
      (report.reportType?.toLowerCase().includes(searchLower) || false) ||
      (report.author?.firstName?.toLowerCase().includes(searchLower) || false) ||
      (report.author?.lastName?.toLowerCase().includes(searchLower) || false)
    );
  });

  const clearFilters = () => {
    setReportTypeFilter("all");
    setCaseIDFilter("");
    setAuthorFilter("all");
    setDateFiled(undefined);
    // useEffect will automatically trigger refetch when state changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-sky-200/60">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Reports
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage all reports</p>
        </div>
        <ShimmerButton 
          background="linear-gradient(to right, #0284c7, #2563eb)"
          shimmerColor="#ffffff"
          shimmerDuration="3s"
          borderRadius="8px"
          className="shadow-md"
          onClick={() => {
            setSelectedReport(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </ShimmerButton>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Search and Filter Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by Report ID, Case ID, Author, or Report Type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 gap-2 transition-all duration-200 ${
                  showFilters 
                    ? "bg-primary/10 border-primary/50" 
                    : ""
                }`}
              >
                <Filter className={`h-4 w-4 transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`} />
                Filters
              </Button>
            </div>

            {/* Filters Panel */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showFilters
                  ? "max-h-[500px] opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2"
              }`}
            >
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Report Type Filter */}
                  <Select value={reportTypeFilter} onValueChange={setReportTypeFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[160px] h-9 text-sm">
                      <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {reportTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Case ID Search */}
                  <Input
                    placeholder="Case ID..."
                    value={caseIDFilter}
                    onChange={(e) => setCaseIDFilter(e.target.value)}
                    className="w-[140px] h-9 text-sm"
                  />

                  {/* Author Filter */}
                  <Select value={authorFilter} onValueChange={setAuthorFilter} disabled={isLoadingOptions}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Author" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      {officers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Date Filed */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] h-9 justify-start text-left font-normal text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFiled ? format(dateFiled, "MMM d, yyyy") : "Date Filed"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                      <Calendar mode="single" selected={dateFiled} onSelect={setDateFiled} />
                    </PopoverContent>
                  </Popover>

                  {/* Clear Filters Button */}
                  {(reportTypeFilter !== "all" || caseIDFilter || authorFilter !== "all" || dateFiled) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filters Badges */}
                {(reportTypeFilter !== "all" || caseIDFilter || authorFilter !== "all" || dateFiled) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    {reportTypeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {reportTypeFilter}
                      </Badge>
                    )}
                    {caseIDFilter && (
                      <Badge variant="secondary" className="text-xs">
                        Case: {caseIDFilter}
                      </Badge>
                    )}
                    {authorFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Author: {officers.find(o => o.id === authorFilter)?.name || authorFilter}
                      </Badge>
                    )}
                    {dateFiled && (
                      <Badge variant="secondary" className="text-xs">
                        Date Filed: {format(dateFiled, "MMM d, yyyy")}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border/50 overflow-hidden shadow-sm">
              {error && (
                <div className="p-3 text-destructive text-sm bg-destructive/10">{error}</div>
              )}
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground text-sm">Loading reports...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report Type</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Filed</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                          No reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow 
                          key={report._id || report.reportID}
                          className="h-11 border-b border-border/30 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-sm py-2.5">{report.reportID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{report.caseID || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {report.author ? `${report.author.firstName || ''} ${report.author.lastName || ''}`.trim() : report.authorID || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">{report.reportType || 'N/A'}</TableCell>
                          <TableCell className="text-sm py-2.5 text-muted-foreground">
                            {report.dateFiled ? new Date(report.dateFiled).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete report ${report.reportID || report._id}?`)) {
                                    try {
                                      await API.delete(`/dynamic/reports/${report._id}`);
                                      toast.success("Report deleted successfully!");
                                      fetchReports();
                                    } catch (err: any) {
                                      toast.error(err.response?.data || "Failed to delete report");
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CollectionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collectionName="reports"
        initialData={selectedReport}
        onSuccess={fetchReports}
        title="Reports"
      />
    </div>
  );
};

export default Reports;

