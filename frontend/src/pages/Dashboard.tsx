import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList } from "recharts";
import { Briefcase, UserX, Shield, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/api.ts";

// Diverse color palette for charts - more colorful and varied
const getThemeColors = () => {
  return [
    '#3B82F6', // Primary blue
    '#10B981', // Green
    '#F59E0B', // Amber/Orange
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#A855F7', // Violet
  ];
};

const THEME_COLORS = getThemeColors();
const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))'];

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsAPI.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Failed to load dashboard data. Please ensure the backend is running.</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Active Cases",
      value: stats.activeCases,
      icon: Briefcase,
      description: "Currently under investigation",
      color: "text-primary",
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-300",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Arrests",
      value: stats.totalArrests,
      icon: UserX,
      description: "Total recorded",
      color: "text-destructive",
      bgGradient: "from-red-50 to-red-100",
      borderColor: "border-red-300",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Convicted",
      value: stats.convictedCount,
      icon: Shield,
      description: "Cases closed",
      color: "text-success",
      bgGradient: "from-green-50 to-green-100",
      borderColor: "border-green-300",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total People",
      value: stats.totalPeople,
      icon: Users,
      description: "In the system",
      color: "text-accent",
      bgGradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-300",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b-2 border-blue-200">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground mt-1">Real-time statistics and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`border-l-4 ${stat.borderColor} bg-gradient-to-br ${stat.bgGradient} hover:shadow-lg transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Horizontal Bar Chart - Crimes by Type */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-center text-xl font-bold text-blue-900">Crimes by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.crimeTypeDistribution && stats.crimeTypeDistribution.length > 0 ? (
              <div className="relative w-full" style={{ height: '400px' }}>
                {/* Grid Background Pattern */}
                <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <pattern id="grid-pattern-bar" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern-bar)" />
                </svg>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={stats.crimeTypeDistribution}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--foreground))" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} 
                    />
                    <YAxis 
                      type="category" 
                      dataKey="type" 
                      stroke="hsl(var(--foreground))" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
                      width={180}
                      tickFormatter={(value) => {
                        if (value.length > 25) {
                          return value.substring(0, 22) + '...';
                        }
                        return value;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))"
                      radius={[0, 8, 8, 0]}
                    >
                      {stats.crimeTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No crime data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donut Chart - Crime Type Distribution */}
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-center text-xl font-bold text-purple-900">Crime Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.crimeTypeDistribution && stats.crimeTypeDistribution.length > 0 ? (
              <div className="relative w-full" style={{ height: '400px' }}>
                {/* Grid Background Pattern */}
                <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <pattern id="grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={stats.crimeTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={{ stroke: '#3B82F6', strokeWidth: 1 }}
                      label={({ type, percent }) => {
                        const percentage = (percent * 100).toFixed(2);
                        return `${type}: ${percentage}%`;
                      }}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#3B82F6"
                      dataKey="count"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      paddingAngle={2}
                    >
                      {stats.crimeTypeDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={THEME_COLORS[index % THEME_COLORS.length]}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => {
                        const total = stats.crimeTypeDistribution.reduce((sum: number, item: any) => sum + item.count, 0);
                        const percent = ((value / total) * 100).toFixed(2);
                        return [`${value} (${percent}%)`, 'Count'];
                      }}
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No crime data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
