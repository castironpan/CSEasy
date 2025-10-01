// courses.ts

interface Assessment {
  id: string;
  title: string;
  type: "Lab" | "Assignment";
  weight: number;
  dueDate: string;
  status: "Released" | "Upcoming" | "Not Released" | "Submitted";
  spec: string;
}

interface Course {
  code: string;
  name: string;
  websiteUrl: string;
  assessments: {
    labs: Assessment[];
    assignments: Assessment[];
  };
}

export const courses: Record<string, Course> = {
  COMP1521: {
    code: "COMP1521",
    name: "Computer Systems Fundamentals",
    websiteUrl: "https://webcms3.cse.unsw.edu.au/COMP1521/25T3/",
    assessments: {
      labs: [
        {
          id: "COMP1521-Lab01",
          title: "Lab 01 — C Programming Basics",
          type: "Lab",
          weight: 1,
          dueDate: "2025-09-26T17:00:00+10:00",
          status: "Released",
          spec: `Practice basic C programming concepts. Write small programs to manipulate text, process input/output, and handle command-line arguments.`,
        },
        {
          id: "COMP1521-Lab02",
          title: "Lab 02 — Pointers and Memory",
          type: "Lab",
          weight: 1,
          dueDate: "2025-10-03T17:00:00+10:00",
          status: "Released",
          spec: `Explore pointers, arrays, and dynamic memory allocation. Learn to use malloc, free, and pointer arithmetic.`,
        },
        {
          id: "COMP1521-Lab03",
          title: "Lab 03 — File I/O and Recursion",
          type: "Lab",
          weight: 1,
          dueDate: "2025-10-10T17:00:00+10:00",
          status: "Upcoming",
          spec: `Work with files using fopen, fread, and fwrite. Implement recursive algorithms for simple problems like Fibonacci and factorial.`,
        },
      ],
      assignments: [
        {
          id: "COMP1521-A1",
          title: "Assignment 1 — Flood: The Game",
          type: "Assignment",
          weight: 15,
          dueDate: "2025-10-15T23:59:00+10:00",
          status: "Released",
          spec: `Translate a provided C program of the game 'Flood' into MIPS assembly. The program simulates a flood-fill game with user commands and a grid display.`,
        },
        {
          id: "COMP1521-A2",
          title: "Assignment 2 — System Calls and Memory Management",
          type: "Assignment",
          weight: 15,
          dueDate: "2025-11-05T23:59:00+10:00",
          status: "Not Released",
          spec: `Implement a simple command-line shell using system calls and memory management techniques. Practice fork(), exec(), and process control.`,
        },
      ],
    },
  },

  COMP2521: {
    code: "COMP2521",
    name: "Data Structures and Algorithms",
    websiteUrl: "https://webcms3.cse.unsw.edu.au/COMP2521/25T3/",
    assessments: {
      labs: [
        {
          id: "COMP2521-Lab01",
          title: "Lab 01 — Linked Lists",
          type: "Lab",
          weight: 1,
          dueDate: "2025-09-28T17:00:00+10:00",
          status: "Released",
          spec: `Implement basic linked list operations such as creation, insertion, and traversal. Focus on pointers, memory allocation, and dynamic node management.`,
        },
        {
          id: "COMP2521-Lab02",
          title: "Lab 02 — Stacks and Queues",
          type: "Lab",
          weight: 1,
          dueDate: "2025-10-05T17:00:00+10:00",
          status: "Released",
          spec: `Use linked lists to implement stack and queue ADTs. Practice abstract data type design and modular programming.`,
        },
        {
          id: "COMP2521-Lab03",
          title: "Lab 03 — Binary Trees",
          type: "Lab",
          weight: 1,
          dueDate: "2025-10-12T17:00:00+10:00",
          status: "Upcoming",
          spec: `Implement insertion, search, and traversal operations in a binary search tree. Focus on recursion and understanding tree structure.`,
        },
      ],
      assignments: [
        {
          id: "COMP2521-A1",
          title: "Assignment 1 — Huffman Encoder",
          type: "Assignment",
          weight: 15,
          dueDate: "2025-10-11T23:59:00+10:00",
          status: "Released",
          spec: `Develop a Huffman Tree encoder and decoder for text compression. Tasks include implementing a Counter ADT, creating the Huffman tree, encoding text, and decoding encoded files.`,
        },
        {
          id: "COMP2521-A2",
          title: "Assignment 2 — Balanced Trees",
          type: "Assignment",
          weight: 15,
          dueDate: "2025-11-01T23:59:00+10:00",
          status: "Not Released",
          spec: `Implement advanced tree structures such as AVL or Red-Black Trees. Focus on rotations, balancing, and maintaining efficiency.`,
        },
      ],
    },
  },

  COMP2511: {
    code: "COMP2511",
    name: "Object-Oriented Design and Programming",
    websiteUrl: "https://webcms3.cse.unsw.edu.au/COMP2511/25T3/",
    assessments: {
      labs: [
        {
          id: "COMP2511-Lab01",
          title: "Lab 01 — Java Basics",
          type: "Lab",
          weight: 1,
          dueDate: "2025-09-29T17:00:00+10:00",
          status: "Released",
          spec: `Practice Java syntax, control structures, and object creation. Implement small programs using classes and methods.`,
        },
      ],
      assignments: [
        {
          id: "COMP2511-A1",
          title: "Assignment 1 — Dungeon Mania",
          type: "Assignment",
          weight: 15,
          dueDate: "2025-10-20T23:59:00+10:00",
          status: "Released",
          spec: `Design and implement an object-oriented dungeon adventure game using Java. Focus on encapsulation, polymorphism, and design patterns.`,
        },
      ],
    },
  },

  COMP3311: {
    code: "COMP3311",
    name: "Database Systems",
    websiteUrl: "https://webcms3.cse.unsw.edu.au/COMP3311/25T3/",
    assessments: {
      labs: [
        {
          id: "COMP3311-Lab01",
          title: "Lab 01 — SQL Basics",
          type: "Lab",
          weight: 1,
          dueDate: "2025-09-30T17:00:00+10:00",
          status: "Released",
          spec: `Learn basic SQL operations: SELECT, WHERE, and ORDER BY. Use the provided university schema for practice.`,
        },
      ],
      assignments: [
        {
          id: "COMP3311-A1",
          title: "Assignment 1 — Database Design",
          type: "Assignment",
          weight: 20,
          dueDate: "2025-10-25T23:59:00+10:00",
          status: "Released",
          spec: `Design a relational database schema for a real-world domain. Submit an ER diagram and SQL DDL scripts.`,
        },
      ],
    },
  },

  COMP3121: {
    code: "COMP3121",
    name: "Algorithms and Programming Techniques",
    websiteUrl: "https://webcms3.cse.unsw.edu.au/COMP3121/25T3/",
    assessments: {
      labs: [
        {
          id: "COMP3121-Lab01",
          title: "Lab 01 — Sorting and Complexity",
          type: "Lab",
          weight: 1,
          dueDate: "2025-09-29T17:00:00+10:00",
          status: "Released",
          spec: `Analyze the time complexity of sorting algorithms. Implement and compare bubble sort, merge sort, and quicksort.`,
        },
      ],
      assignments: [
        {
          id: "COMP3121-A1",
          title: "Assignment 1 — Graph Algorithms",
          type: "Assignment",
          weight: 15,
          dueDate: "2025-10-25T23:59:00+10:00",
          status: "Released",
          spec: `Implement Dijkstra’s algorithm and Minimum Spanning Tree algorithms. Optimize for efficiency and clarity.`,
        },
      ],
    },
  },

  COMP3231: {
    code: "COMP3231",
    name: "Operating Systems",
    websiteUrl: "https://webcms3.cse.unsw.edu.au/COMP3231/25T3/",
    assessments: {
      labs: [
        {
          id: "COMP3231-Lab01",
          title: "Lab 01 — OS/161 Setup and Syscalls",
          type: "Lab",
          weight: 1,
          dueDate: "2025-09-27T17:00:00+10:00",
          status: "Released",
          spec: `Set up OS/161 and implement simple system calls. Learn about kernel compilation and basic OS structure.`,
        },
      ],
      assignments: [
        {
          id: "COMP3231-A1",
          title: "Assignment 1 — Virtual Memory and Paging",
          type: "Assignment",
          weight: 20,
          dueDate: "2025-10-30T23:59:00+10:00",
          status: "Upcoming",
          spec: `Implement a virtual memory management system including paging and swapping. Focus on address translation and page replacement algorithms.`,
        },
      ],
    },
  },
};
