'use client';

import Link from 'next/link';
import {
  Home,
  Calendar,
  BookOpen,
  GraduationCap,
  PlusCircle,
  Link as LinkIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import type { Course } from '@/lib/types';
import { AddCourseDialog } from '../dashboard/add-course-dialog';
import { useState } from 'react';

interface AppSidebarProps {
  courses: Course[];
}

export function AppSidebar({ courses }: AppSidebarProps) {
  const [isAddCourseOpen, setAddCourseOpen] = useState(false);
  return (
    <>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-sidebar-border"
      >
        <SidebarHeader className="h-16 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-primary"
          >
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-headline group-data-[collapsible=icon]:hidden">
              CSEasy
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" tooltip="Dashboard" isActive>
                <Home />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Calendar">
                <Calendar />
                <span>Calendar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <div className="flex items-center justify-between">
                <span>Courses</span>
              </div>
            </SidebarGroupLabel>
            <SidebarMenu>
              {courses.map((course) => (
                <SidebarMenuItem key={course.id}>
                  <SidebarMenuButton
                    href="#"
                    size="sm"
                    tooltip={course.name}
                  >
                    <BookOpen />
                    <span>{course.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="sm"
                  onClick={() => setAddCourseOpen(true)}
                >
                  <PlusCircle />
                  <span>Add Course</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="#"
                tooltip="Course Websites"
                className="justify-center"
              >
                <LinkIcon />
                <span className="group-data-[collapsible=icon]:hidden">
                  Course Websites
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <AddCourseDialog open={isAddCourseOpen} onOpenChange={setAddCourseOpen} />
    </>
  );
}
