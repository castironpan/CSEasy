'use client';

import Link from 'next/link';
import {
  Home,
  Calendar,
  BookOpen,
  GraduationCap,
  PlusCircle,
  Link as LinkIcon,
  Sparkles,
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
import { AIChatPanel } from '@/components/ai/ai-chat-panel';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  courses: Course[];
}

export function AppSidebar({ courses }: AppSidebarProps) {
  const [isAddCourseOpen, setAddCourseOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);
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
              <SidebarMenuButton asChild tooltip="Dashboard" isActive>
                <Link href="/" className="flex items-center gap-2">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Calendar">
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
                  <SidebarMenuButton size="sm" tooltip={course.name} asChild>
                    <Link href={`/courses/${course.id}`} className="flex items-center gap-2">
                      <BookOpen />
                      <span>{course.name}</span>
                    </Link>
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
              <SidebarMenuButton tooltip="Course Websites" className="justify-center">
                <LinkIcon />
                <span className="group-data-[collapsible=icon]:hidden">Course Websites</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="AI Assistant" className="justify-center" onClick={() => setShowAI(v => !v)}>
                <Sparkles />
                <span className="group-data-[collapsible=icon]:hidden">AI Assistant</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <AddCourseDialog open={isAddCourseOpen} onOpenChange={setAddCourseOpen} />
      {showAI && (
        <div className={cn('fixed left-[var(--sidebar-width)] top-0 h-svh w-80 bg-background border-l z-40 shadow-lg animate-in slide-in-from-left', 'group-data-[collapsible=icon]:left-[var(--sidebar-width-icon)]')}>
          <AIChatPanel onClose={() => setShowAI(false)} />
        </div>
      )}
    </>
  );
}
