import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { toast } from '@/components/ui/use-toast';

// Demo data for charts (these would also come from real data in a full implementation)
const examStatusData = [
  { name: 'Completed', value: 8 },
  { name: 'In Progress', value: 2 },
  { name: 'Pending', value: 4 },
];

const gradeDistribution = [
  { grade: 'A', students: 45 },
  { grade: 'B', students: 67 },
  { grade: 'C', students: 32 },
  { grade: 'D', students: 15 },
  { grade: 'F', students: 8 },
];

const COLORS = ['#457B9D', '#A8DADC', '#E63946'];

interface ClassData {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  teacher_id: string;
  exams?: {count: number}[];
  students?: {count: number}[];
  average?: number | null;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const [recentClasses, setRecentClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalExams: 0,
    totalStudents: 0,
  });

  
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);

      // Fetch classes for the current user
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select(
            `
              *,
              exams(count),
              students(count)
            `
          )
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

      if (classesError) throw classesError;

      
      const totalStudents = classesData.reduce((acc, curr) => acc + curr.students[0].count, 0)
      const totalExams = classesData.reduce((acc, curr) => acc + curr.exams[0].count, 0)

      setRecentClasses(classesData);

      setStats({
        totalClasses: classesData?.length || 0,
        totalExams,
        totalStudents,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
      console.error("Error loading dashboard data:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-rubric-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-rubric-navy">Dashboard</h1>
        <Button 
          onClick={() => navigate('/classes/new')}
          className="bg-rubric-navy hover:bg-rubric-navy-light"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> New Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Classes</CardTitle>
            <CardDescription>Your active classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-rubric-navy">{stats.totalClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Exams</CardTitle>
            <CardDescription>Across all classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-rubric-navy">{stats.totalExams}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Students</CardTitle>
            <CardDescription>In all your classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-rubric-navy">{stats.totalStudents}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Exam Status</CardTitle>
            <CardDescription>Overview of exam grading progress</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={examStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {examStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Grade Distribution</CardTitle>
            <CardDescription>Overall performance across classes</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" name="Students" fill="#457B9D" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Classes</CardTitle>
          <CardDescription>Your most recently created classes</CardDescription>
        </CardHeader>
        <CardContent>
          {recentClasses.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-3 p-4 font-medium border-b">
                <div>Class Name</div>
                <div className="text-center">Students</div>
                <div className="text-center">Exams</div>
              </div>
              {recentClasses.map((cls) => (
                <div 
                  key={cls.id} 
                  className="grid grid-cols-3 p-4 border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/classes/${cls.id}`)}
                >
                  <div className="font-medium">{cls.name}</div>
                  <div className="text-center">{cls.students?.[0]?.count || 0}</div>
                  <div className="text-center">{cls.exams?.[0]?.count || 0}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No classes found. Create a new class to get started.</p>
              <Button 
                onClick={() => navigate('/classes/new')}
                className="mt-4 bg-rubric-navy hover:bg-rubric-navy-light"
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Class
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
