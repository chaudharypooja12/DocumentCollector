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
  {
    id: "demo-4",
    name: "Example researcher",
    country: "Germany",
    documents: 5,
    status: "Submitted",
    updatedAt: "Sep 04, 16:35",
  },
  {
    id: "demo-5",
    name: "Sample professional",
    country: "Australia",
    documents: 4,
    status: "In progress",
    updatedAt: "Sep 03, 11:15",
  },
  {
    id: "demo-6",
    name: "Demo learner",
    country: "Ireland",
    documents: 6,
    status: "Pending",
    updatedAt: "Sep 02, 09:45",
  },
  {
    id: "demo-7",
    name: "Example applicant",
    country: "New Zealand",
    documents: 3,
    status: "Submitted",
    updatedAt: "Sep 01, 14:20",
  },
  {
    id: "demo-8",
    name: "Sample candidate",
    country: "Singapore",
    documents: 5,
    status: "In progress",
    updatedAt: "Aug 30, 10:05",
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
  {
    id: "sub-demo-4",
    reference: "DC-DEMO-1031",
    documents: 3,
    status: "Ready",
    createdAt: "Sep 04, 11:45",
  },
  {
    id: "sub-demo-5",
    reference: "DC-DEMO-1028",
    documents: 6,
    status: "Review",
    createdAt: "Sep 03, 15:20",
  },
  {
    id: "sub-demo-6",
    reference: "DC-DEMO-1024",
    documents: 4,
    status: "Processing",
    createdAt: "Sep 02, 10:15",
  },
  {
    id: "sub-demo-7",
    reference: "DC-DEMO-1019",
    documents: 8,
    status: "Ready",
    createdAt: "Sep 01, 13:30",
  },
  {
    id: "sub-demo-8",
    reference: "DC-DEMO-1014",
    documents: 5,
    status: "Review",
    createdAt: "Aug 30, 16:50",
  },
];
