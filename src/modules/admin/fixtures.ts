export type DemoUser = {
  id: string;
  name: string;
  country: string;
  documents: number;
  status: "Pending" | "In progress" | "Submitted";
  updatedAt: string;
};

export type DemoSubmission = {
  id: string;
  reference: string;
  documents: number;
  status: "Ready" | "Review" | "Processing";
  createdAt: string;
};

export const demoUsers: DemoUser[] = [
  {
    id: "demo-1",
    name: "Sample applicant",
    country: "India",
    documents: 4,
    status: "In progress",
    updatedAt: "Today, 10:24",
  },
  {
    id: "demo-2",
    name: "Example student",
    country: "United Kingdom",
    documents: 6,
    status: "Submitted",
    updatedAt: "Yesterday, 17:40",
  },
  {
    id: "demo-3",
    name: "Demo candidate",
    country: "Canada",
    documents: 3,
    status: "Pending",
    updatedAt: "Sep 05, 12:10",
  },
];

export const demoSubmissions: DemoSubmission[] = [
  {
    id: "sub-demo-1",
    reference: "DC-DEMO-1042",
    documents: 5,
    status: "Ready",
    createdAt: "Today, 09:30",
  },
  {
    id: "sub-demo-2",
    reference: "DC-DEMO-1039",
    documents: 4,
    status: "Review",
    createdAt: "Yesterday, 16:12",
  },
  {
    id: "sub-demo-3",
    reference: "DC-DEMO-1036",
    documents: 7,
    status: "Processing",
    createdAt: "Sep 05, 14:05",
  },
];
