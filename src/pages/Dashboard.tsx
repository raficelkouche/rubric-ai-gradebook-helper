
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';

// Demo data
const classData = [
  { name: 'Math 101', exams: 4, students: 30, average: 82 },
  { name: 'Physics 202', exams: 3, students: 24, average: 78 },
  { name: 'Chemistry 303', exams: 2, students: 28, average: 85 },
  { name: 'Biology 404', exams: 5, students: 22, average: 76 },
];

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentClasses] = useState(classData);

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
            <div className="text-4xl font-bold text-rubric-navy">{classData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Exams</CardTitle>
            <CardDescription>Across all classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-rubric-navy">
              {classData.reduce((sum, cls) => sum + cls.exams, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Students</CardTitle>
            <CardDescription>In all your classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-rubric-navy">
              {classData.reduce((sum, cls) => sum + cls.students, 0)}
            </div>
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
          <CardDescription>Your most active classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-4 font-medium border-b">
              <div>Class Name</div>
              <div className="text-center">Students</div>
              <div className="text-center">Exams</div>
              <div className="text-center">Average Score</div>
            </div>
            {recentClasses.map((cls) => (
              <div 
                key={cls.name} 
                className="grid grid-cols-4 p-4 border-b hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/classes/${cls.name.replace(/\s+/g, '-').toLowerCase()}`)}
              >
                <div className="font-medium">{cls.name}</div>
                <div className="text-center">{cls.students}</div>
                <div className="text-center">{cls.exams}</div>
                <div className="text-center">{cls.average}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
