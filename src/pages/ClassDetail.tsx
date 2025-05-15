
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ArrowLeft, BarChart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for the class
const classData = {
  id: '1',
  name: 'Math 101',
  description: 'Introduction to Algebra',
  students: 30,
  exams: [
    { id: '1', name: 'Midterm Exam', status: 'completed', average: 78, highest: 98, lowest: 45 },
    { id: '2', name: 'Final Exam', status: 'in-progress', average: null, highest: null, lowest: null },
    { id: '3', name: 'Quiz 1', status: 'completed', average: 82, highest: 100, lowest: 65 },
    { id: '4', name: 'Quiz 2', status: 'completed', average: 75, highest: 95, lowest: 52 },
  ]
};

const scoreDistribution = [
  { score: '0-10', count: 0 },
  { score: '11-20', count: 0 },
  { score: '21-30', count: 0 },
  { score: '31-40', count: 2 },
  { score: '41-50', count: 3 },
  { score: '51-60', count: 4 },
  { score: '61-70', count: 6 },
  { score: '71-80', count: 8 },
  { score: '81-90', count: 5 },
  { score: '91-100', count: 2 },
];

// Status badges
const statusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
    case 'in-progress':
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>;
    default:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pending</span>;
  }
};

const ClassDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('exams');
  const [newExamName, setNewExamName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // In a real app, we would fetch the class data based on the ID
  const cls = classData;

  const handleCreateExam = () => {
    if (newExamName.trim()) {
      toast({
        title: "Exam Created",
        description: `${newExamName} has been created successfully.`,
      });
      setNewExamName('');
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid exam name.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/classes')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-rubric-navy">{cls.name}</h1>
      </div>
      
      <p className="text-muted-foreground">{cls.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rubric-navy">{cls.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rubric-navy">{cls.exams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rubric-navy">
              {
                cls.exams.filter(e => e.average !== null).length > 0
                  ? Math.round(
                      cls.exams
                        .filter(e => e.average !== null)
                        .reduce((sum, exam) => sum + (exam.average || 0), 0) / 
                      cls.exams.filter(e => e.average !== null).length
                    ) + '%'
                  : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rubric-navy hover:bg-rubric-navy-light">
                <Plus className="mr-2 h-4 w-4" /> New Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>
                  Add a new exam to {cls.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="exam-name">Exam Name</Label>
                  <Input
                    id="exam-name"
                    placeholder="e.g., Midterm Exam"
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-rubric-navy hover:bg-rubric-navy-light" onClick={handleCreateExam}>
                  Create Exam
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <TabsContent value="exams" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-4 font-medium border-b">
                  <div className="col-span-2">Exam Name</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">Average</div>
                  <div className="text-center">Actions</div>
                </div>
                {cls.exams.length > 0 ? (
                  cls.exams.map((exam) => (
                    <div key={exam.id} className="grid grid-cols-5 p-4 border-b">
                      <div className="col-span-2 font-medium">{exam.name}</div>
                      <div className="text-center">{statusBadge(exam.status)}</div>
                      <div className="text-center">
                        {exam.average !== null ? `${exam.average}%` : 'N/A'}
                      </div>
                      <div className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/classes/${id}/exams/${exam.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No exams found. Create a new exam to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Students" fill="#457B9D" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex gap-2">
                    <div className="h-10 w-1 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium">Strong Performance</p>
                      <p className="text-sm text-muted-foreground">
                        Most students performed well on algebraic equations.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-10 w-1 bg-red-500 rounded-full" />
                    <div>
                      <p className="font-medium">Needs Improvement</p>
                      <p className="text-sm text-muted-foreground">
                        Students struggled with calculus concepts.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-10 w-1 bg-blue-500 rounded-full" />
                    <div>
                      <p className="font-medium">Overall Trend</p>
                      <p className="text-sm text-muted-foreground">
                        Performance is improving compared to previous assessments.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exam Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cls.exams
                    .filter(exam => exam.status === 'completed')
                    .map(exam => (
                      <div key={exam.id} className="border-b pb-4">
                        <h3 className="font-medium">{exam.name}</h3>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Average</p>
                            <p className="font-medium">{exam.average}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Highest</p>
                            <p className="font-medium">{exam.highest}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Lowest</p>
                            <p className="font-medium">{exam.lowest}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetail;
