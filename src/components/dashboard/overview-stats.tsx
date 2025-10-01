// import type { StudentTask, StudentCourseView } from '@/lib/types';
// import {
//   Card,
//   CardContent,
// } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';

// import { ClipboardCheck, BookOpen, Clock, AlertTriangle, Circle } from 'lucide-react';

// interface OverviewStatsProps {
//   tasks: StudentTask[];
//   courses: StudentCourseView[];
// }

// export function OverviewStats({ tasks, courses }: OverviewStatsProps) {
//   const completedTasks = tasks.filter((task) => task.completed).length;
//   const pendingTasks = tasks.filter((task) => !task.completed).length;
//   const urgentTasks = tasks.filter(
//     (task) =>
//       !task.completed &&
//       new Date(task.dueDate) > new Date() &&
//       new Date(task.dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000
//   ).length;
//   const totalTasks = tasks.length;
//   const completionPercentage =
//     totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
//   const upcomingTasks = tasks.filter(
//     (task) =>
//       !task.completed && new Date(task.dueDate) > new Date()
//   ).length;


//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
//         {/* Completed */}
//         <Card className="bg-green-50 border-green-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-green-700">Completed</p>
//                 <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
//               </div>
//               <ClipboardCheck className="w-8 h-8 text-green-600" />
//             </div>
//             <div className="mt-2 text-xs text-green-600">
//               Tasks finished this semester
//             </div>
//           </CardContent>
//         </Card>

//         {/* Pending */}
//         <Card className="bg-blue-50 border-blue-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-blue-700">Pending</p>
//                 <p className="text-2xl font-bold text-blue-600">{pendingTasks}</p>
//               </div>
//               <Circle className="w-8 h-8 text-blue-600" />
//             </div>
//             <div className="mt-2 text-xs text-blue-600">
//               Still to be completed
//             </div>
//           </CardContent>
//         </Card>

//         {/* Due Soon */}
//         <Card className="bg-red-50 border-red-200">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-red-700">Due Soon</p>
//                 <p className="text-2xl font-bold text-red-600">{urgentTasks}</p>
//               </div>
//               <AlertTriangle className="w-8 h-8 text-red-600" />
//             </div>
//             <div className="mt-2 text-xs text-red-600">
//               Next 24 hours
//             </div>
           
//           </CardContent>
          
//         </Card>



//       </div>
//        <div>
//           <div className="flex justify-between items-center mb-1">
//             <p className="text-sm font-medium">Overall Progress</p>
//             <p className="text-sm font-medium text-primary">{`${completionPercentage.toFixed(
//               0
//             )}%`}</p>
//           </div>
//           <Progress value={completionPercentage} aria-label="Overall course completion progress" />
//         </div>
//     </div>
//   );
// }
import type { StudentTask, StudentCourseView } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, BookOpen, Clock, AlertTriangle, Circle } from 'lucide-react';


interface OverviewStatsProps {
  tasks: StudentTask[];
  courses: StudentCourseView[];
}

export function OverviewStats({ tasks, courses }: OverviewStatsProps) {
  // Overall counts
  const completedTasks = tasks.filter((task) => task.completed);
  const pendingTasks = tasks.filter((task) => !task.completed);
  const urgentTasks = tasks.filter(
    (task) =>
      !task.completed &&
      new Date(task.dueDate) > new Date() &&
      new Date(task.dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000
  );
  const totalTasks = tasks.length;
  const completionPercentage =
    totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  // --- CHANGED: count labs and assignments separately ---
  const completedLabs = completedTasks.filter((t) => t.sourceType === 'Lab').length;
  const completedAssignments = completedTasks.filter((t) => t.sourceType === 'Assignment').length;
  const pendingLabs = pendingTasks.filter((t) => t.sourceType === 'Lab').length;
  const pendingAssignments = pendingTasks.filter((t) => t.sourceType === 'Assignment').length;
  // --------------------------------------------------------

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        {/* Completed */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-green-600" />
            </div>
            {/* --- CHANGED: labs and assignments subtext --- */}
            <div className="mt-2 flex gap-2 text-xs text-green-600">
              <span>Labs: {completedLabs}</span>
              <span>Assignments: {completedAssignments}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingTasks.length}</p>
              </div>
              <Circle className="w-8 h-8 text-blue-600" />
            </div>
            {/* --- CHANGED: labs and assignments subtext --- */}
            <div className="mt-2 flex gap-2 text-xs text-blue-600">
              <span>Labs: {pendingLabs}</span>
              <span>Assignments: {pendingAssignments}</span>
            </div>
          </CardContent>
        </Card>

        {/* Due Soon */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Due Soon</p>
                <p className="text-2xl font-bold text-red-600">{urgentTasks.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="mt-2 text-xs text-red-600">
              Next 24 hours
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Overall Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium">Overall Progress</p>
          <p className="text-sm font-medium text-primary">{`${completionPercentage.toFixed(
            0
          )}%`}</p>
        </div>
        <Progress value={completionPercentage} aria-label="Overall course completion progress" />
      </div>
    </div>
    </div>
  );
}
