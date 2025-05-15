
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { PlusIcon, MoreHorizontal, FileText, Edit, Trash2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

// Demo data
const classesData = [
  { 
    id: '1', 
    name: 'Math 101', 
    description: 'Introduction to Algebra', 
    students: 30, 
    exams: 4,
    lastUpdated: '2023-05-10'
  },
  { 
    id: '2', 
    name: 'Physics 202', 
    description: 'Classical Mechanics', 
    students: 24, 
    exams: 3,
    lastUpdated: '2023-05-05'
  },
  { 
    id: '3', 
    name: 'Chemistry 303', 
    description: 'Organic Chemistry', 
    students: 28, 
    exams: 2,
    lastUpdated: '2023-05-01'
  },
  { 
    id: '4', 
    name: 'Biology 404', 
    description: 'Human Anatomy', 
    students: 22, 
    exams: 5,
    lastUpdated: '2023-04-28'
  },
];

const ClassesList: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState(classesData);
  const [search, setSearch] = useState('');

  const filteredClasses = search
    ? classes.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    : classes;

  const handleDelete = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    toast({
      title: "Class deleted",
      description: "The class has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-rubric-navy">Classes</h1>
        <div className="flex gap-4">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            onClick={() => navigate('/classes/new')}
            className="bg-rubric-navy hover:bg-rubric-navy-light shrink-0"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Class
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <Card key={cls.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-xl">{cls.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/classes/${cls.id}/exams`)}>
                      <FileText className="mr-2 h-4 w-4" /> View Exams
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/classes/${cls.id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Class
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDelete(cls.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{cls.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pt-2">
                <div className="grid grid-cols-2 text-sm mb-4">
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Students:</span>
                    <span className="ml-2 font-medium">{cls.students}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground">Exams:</span>
                    <span className="ml-2 font-medium">{cls.exams}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {cls.lastUpdated}
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/classes/${cls.id}`)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No classes found. Create a new class to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ClassesList;
