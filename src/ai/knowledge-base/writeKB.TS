import { writeFileSync } from "fs";
import { knowledgeBase } from "./data";

function generateMarkdownFromData() {
  let md = "# Knowledge Base\n\n";

  for (const student of knowledgeBase) {
    md += `## Student: ${student.name} (${student.studentId})\n\n`;

    for (const course of student.enrolledCourses) {
      md += `### Course: ${course.code} - ${course.name}\n`;
      md += `Website: ${course.websiteUrl}\n\n`;

      // Labs
      if (course.assessments.labs.length > 0) {
        md += `#### Labs\n\n`;
        for (const lab of course.assessments.labs) {
          const progress = course.studentProgress.find(
            (p: any) => p.taskId === lab.id
          )?.status || "Not Attempted";

          md += `Lab ID: ${lab.id}\n`;
          md += `Title: ${lab.title}\n`;
          md += `Type: ${lab.type}\n`;
          md += `Weight: ${lab.weight}\n`;
          md += `Due Date: ${lab.dueDate}\n`;
          md += `Status: ${lab.status}\n`;
          md += `Student Progress: ${progress}\n`;
          md += `Spec:\n${lab.spec}\n\n`;
        }
      }

      // Assignments
      if (course.assessments.assignments.length > 0) {
        md += `#### Assignments\n\n`;
        for (const a of course.assessments.assignments) {
          const progress = course.studentProgress.find(
            (p: any) => p.taskId === a.id
          )?.status || "Not Attempted";

          md += `Assignment ID: ${a.id}\n`;
          md += `Title: ${a.title}\n`;
          md += `Type: ${a.type}\n`;
          md += `Weight: ${a.weight}\n`;
          md += `Due Date: ${a.dueDate}\n`;
          md += `Status: ${a.status}\n`;
          md += `Student Progress: ${progress}\n`;
          md += `Spec:\n${a.spec}\n\n`;
        }
      }

      md += `---\n\n`;
    }
  }

  writeFileSync("knowledgeBase.md", md);
  console.log("Markdown file generated: knowledgeBase.md");
}

generateMarkdownFromData();
