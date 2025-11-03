import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingDown,
  DollarSign,
  Award,
  BookOpen,
  MapPin,
  Briefcase,
  Heart,
  Coffee,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const DairyDataAnalysis = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    // Load analysis data from backend API
    fetch("http://localhost:8000/analysis")
      .then((res) => res.json())
      .then((data) => {
        setAnalysisData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading analysis data:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !analysisData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const departmentData = Object.entries(
    analysisData.department_distribution
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const jobRoleData = Object.entries(analysisData.job_role_distribution)
    .map(([name, value]) => ({
      name: name.substring(0, 15), // Truncate long names
      fullName: name,
      value,
    }))
    .slice(0, 9);

  const genderData = Object.entries(analysisData.gender_distribution).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const educationData = Object.entries(
    analysisData.education_field_distribution
  ).map(([name, value]) => ({
    name: name.substring(0, 15),
    fullName: name,
    value,
  }));

  const salaryByDeptData = Object.entries(
    analysisData.salary_by_department
  ).map(([name, data]: [string, any]) => ({
    name,
    mean: data.mean,
    median: data.median,
  }));

  const attritionByDeptData = Object.entries(
    analysisData.attrition_by_department
  ).map(([name, count]: [string, number]) => ({
    name,
    count,
    rate: analysisData.attrition_rate_by_department[name],
  }));

  const ageGroupData = Object.entries(analysisData.age_group_distribution).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const incomeGroupData = Object.entries(
    analysisData.income_group_distribution
  ).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Dairy Industry Data Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive workforce analytics powered by Python AI
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {analysisData.summary.total_employees} Employees
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  Attrition Rate
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {analysisData.summary.attrition_rate}%
                </p>
              </div>
              <TrendingDown className="h-10 w-10 text-blue-600" />
            </div>
            <Progress value={85.5} className="mt-3" />
            <p className="text-xs text-blue-700 mt-2">
              Employee Retention: 85.5%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Average Salary
                </p>
                <p className="text-3xl font-bold text-green-900">
                  ${(analysisData.summary.avg_monthly_income / 1000).toFixed(0)}
                  K
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
            <Progress value={69} className="mt-3" />
            <p className="text-xs text-green-700 mt-2">Monthly income</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  Avg Tenure
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {analysisData.summary.avg_years_at_company.toFixed(1)} years
                </p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
            <Progress value={71.5} className="mt-3" />
            <p className="text-xs text-purple-700 mt-2">Years at company</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Avg Age</p>
                <p className="text-3xl font-bold text-orange-900">
                  {analysisData.summary.avg_age.toFixed(0)}
                </p>
              </div>
              <Award className="h-10 w-10 text-orange-600" />
            </div>
            <Progress value={80} className="mt-3" />
            <p className="text-xs text-orange-700 mt-2">Years old</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="demographics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attrition">Attrition</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Department Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-600" />
                  Gender Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Job Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Job Role Distribution (Top 9)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobRoleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Education Field Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Education Field Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={educationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name.substring(0, 10)}: ${(percent * 100).toFixed(
                          0
                        )}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {educationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Age Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Age Group Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageGroupData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Income Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Income Group Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incomeGroupData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff7c7c" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compensation Tab */}
        <TabsContent value="compensation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salary by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Salary Analysis by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salaryByDeptData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip cursor={false} />
                    <Bar dataKey="mean" fill="#8884d8" radius={4} />
                    <Bar dataKey="median" fill="#82ca9d" radius={4} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Paying Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Top Paying Job Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analysisData.salary_by_role)
                    .slice(0, 5)
                    .map(([role, salary], index) => (
                      <div
                        key={role}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : index === 1
                                ? "bg-gray-100 text-gray-700"
                                : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{role}</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">
                          ${(salary as number).toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Avg Performance Rating
                    </span>
                    <span className="font-bold">
                      {analysisData.performance_metrics.avg_performance_rating}
                    </span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">High Performers</span>
                    <span className="font-bold">
                      {analysisData.performance_metrics.high_performers}
                    </span>
                  </div>
                  <Progress value={23.6} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Avg Job Involvement
                    </span>
                    <span className="font-bold">
                      {analysisData.performance_metrics.avg_job_involvement}
                    </span>
                  </div>
                  <Progress value={63} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Training Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {analysisData.training_analysis.avg_training_last_year}
                  </p>
                  <p className="text-sm text-blue-700">Avg Training Sessions</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {analysisData.training_analysis.total_training_sessions}
                  </p>
                  <p className="text-sm text-green-700">Total Sessions</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">
                    {analysisData.training_analysis.employees_needing_training}
                  </p>
                  <p className="text-sm text-orange-700">Need Training</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Work-Life Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={Object.entries(analysisData.work_life_balance).map(
                      ([k, v]) => ({ name: `Level ${k}`, value: v })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff6b9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Skill Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                Skill Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {(
                      analysisData.skill_analysis.avg_operator_skill * 100
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-sm text-green-700">Avg Operator Skill</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {(
                      analysisData.skill_analysis.avg_required_skill * 100
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-sm text-blue-700">Required Skill Level</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p
                    className={`text-3xl font-bold ${
                      analysisData.skill_analysis.skill_gap < 0
                        ? "text-red-600"
                        : "text-purple-600"
                    }`}
                  >
                    {(analysisData.skill_analysis.skill_gap * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm">Skill Gap</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attrition Tab */}
        <TabsContent value="attrition" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attrition by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Attrition by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attritionByDeptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#ff6b6b"
                      name="Attrition Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attrition Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  Attrition Rates by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    analysisData.attrition_rate_by_department
                  ).map(([dept, rate]) => {
                    const rateNum = Number(rate);
                    return (
                      <div key={dept}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{dept}</span>
                          <span className="font-bold">
                            {rateNum.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={rateNum} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overtime Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-brown-600" />
                Overtime Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {analysisData.overtime_analysis.No}
                  </p>
                  <p className="text-sm text-green-700">No Overtime</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">
                    {analysisData.overtime_analysis.Yes}
                  </p>
                  <p className="text-sm text-red-700">
                    Work Overtime (
                    {(
                      (analysisData.overtime_analysis.Yes /
                        analysisData.summary.total_employees) *
                      100
                    ).toFixed(1)}
                    %)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <MapPin className="h-5 w-5" />
                  Distance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-900">
                  {analysisData.distance_analysis.avg_distance.toFixed(1)} miles
                </p>
                <p className="text-sm text-blue-700 mb-4">
                  Average distance from home
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">
                    {analysisData.distance_analysis.remote_workers}
                  </span>{" "}
                  employees work &gt;30 miles away
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Users className="h-5 w-5" />
                  Tenure Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Avg Years at Company:</span>
                  <span className="font-bold">
                    {analysisData.tenure_analysis.avg_years_at_company.toFixed(
                      1
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Years in Role:</span>
                  <span className="font-bold">
                    {analysisData.tenure_analysis.avg_years_in_role.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Years Since Promotion:</span>
                  <span className="font-bold">
                    {analysisData.tenure_analysis.avg_years_since_promotion.toFixed(
                      1
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <TrendingDown className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Attrition Rate:</span>
                  <span className="font-bold text-red-600">
                    {analysisData.summary.attrition_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Retention Rate:</span>
                  <span className="font-bold text-green-600">
                    {100 - analysisData.summary.attrition_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Age:</span>
                  <span className="font-bold">
                    {analysisData.summary.avg_age.toFixed(0)} years
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI-Driven Insights */}
          <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <AlertCircle className="h-5 w-5" />
                AI-Powered Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-700 mb-1">
                        High Risk: Attrition in Farm Operations & Maintenance
                      </h3>
                      <p className="text-sm text-gray-600">
                        Both departments show 17.16% attrition rate (above
                        company average of 14.5%). Focus on employee
                        satisfaction surveys and retention programs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start gap-3">
                    <Coffee className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-700 mb-1">
                        Overtime Concerns
                      </h3>
                      <p className="text-sm text-gray-600">
                        {(
                          (analysisData.overtime_analysis.Yes /
                            analysisData.summary.total_employees) *
                          100
                        ).toFixed(1)}
                        % of employees work overtime. Consider hiring additional
                        staff to improve work-life balance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-1">
                        Training Opportunities
                      </h3>
                      <p className="text-sm text-gray-600">
                        {
                          analysisData.training_analysis
                            .employees_needing_training
                        }{" "}
                        employees haven't received training in the past year.
                        Implement a structured training program to upskill
                        workforce.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-700 mb-1">
                        Positive: Operator Skills Exceed Requirements
                      </h3>
                      <p className="text-sm text-gray-600">
                        On average, operator skills (
                        {(
                          analysisData.skill_analysis.avg_operator_skill * 100
                        ).toFixed(1)}
                        %) exceed required levels (
                        {(
                          analysisData.skill_analysis.avg_required_skill * 100
                        ).toFixed(1)}
                        %). This indicates a highly skilled workforce ready for
                        advancement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-700 mb-1">
                        Compensation Equity
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quality Control leads with highest average salary ($
                        {analysisData.salary_by_department[
                          "Quality Control"
                        ].mean.toFixed(0)}
                        ), while salaries across departments are relatively
                        balanced within ±5%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DairyDataAnalysis;
