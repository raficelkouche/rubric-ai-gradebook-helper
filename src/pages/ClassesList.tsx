
import React, { useEffect, useState } from 'react';
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
import { PlusIcon, MoreHorizontal, FileText, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface ClassItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const ClassesList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useRequireAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id);

      if (error) throw error;
      
      setClasses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
      console.error("Error loading classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClasses(classes.filter(c => c.id !== id));
      toast({
        title: "Class deleted",
        description: "The class has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
      console.error("Error deleting class:", error);
    }
  };

  const filteredClasses = search
    ? classes.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
      )
    : classes;

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

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-rubric-navy" />
        </div>
      ) : filteredClasses.length > 0 ? (
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
                      <DropdownMenuItem onClick={() => navigate(`/classes/${cls.id}`)}>
                        <FileText className="mr-2 h-4 w-4" /> View Details
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
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(cls.created_at).toLocaleDateString()}
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
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No classes found. Create a new class to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ClassesList;
