export type Gender = "Male" | "Female";

export type ProfileStatus = "Pending" | "In progress" | "Submitted";

export type DemoDocumentFile = {
  name: string;
  type: "Combined" | "Individual";
  pages: number;
};

export type DemoProfile = {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  country: string;
  permanentAddress: string;
  residenceAddress: string;
  sameAsPermanentAddress: boolean;
  documentsRequired: number;
  status: ProfileStatus;
  updatedAt: string;
  reference: string;
  files: DemoDocumentFile[];
};

export const demoProfiles: DemoProfile[] = [
  {
    id: "demo-1",
    fullName: "Priya Sharma",
    age: 24,
    gender: "Female",
    phone: "+91 98765 43210",
    country: "India",
    permanentAddress: "12 MG Road, Pune, Maharashtra",
    residenceAddress: "12 MG Road, Pune, Maharashtra",
    sameAsPermanentAddress: true,
    documentsRequired: 4,
    status: "In progress",
    updatedAt: "Today, 10:24",
    reference: "DC-DEMO-1042",
    files: [],
  },
  {
    id: "demo-2",
    fullName: "Arjun Mehta",
    age: 29,
    gender: "Male",
    phone: "+44 7700 900123",
    country: "United Kingdom",
    permanentAddress: "45 Baker Street, London",
    residenceAddress: "12 Camden High Street, London",
    sameAsPermanentAddress: false,
    documentsRequired: 6,
    status: "Submitted",
    updatedAt: "Yesterday, 17:40",
    reference: "DC-DEMO-1039",
    files: [
      { name: "Complete_Documents.pdf", type: "Combined", pages: 6 },
      { name: "Passport.pdf", type: "Individual", pages: 1 },
      { name: "Photograph.pdf", type: "Individual", pages: 1 },
    ],
  },
  {
    id: "demo-3",
    fullName: "Kavya Nair",
    age: 22,
    gender: "Female",
    phone: "+1 416 555 0123",
    country: "Canada",
    permanentAddress: "88 Queen Street, Toronto, ON",
    residenceAddress: "88 Queen Street, Toronto, ON",
    sameAsPermanentAddress: true,
    documentsRequired: 3,
    status: "Pending",
    updatedAt: "Sep 05, 12:10",
    reference: "DC-DEMO-1036",
    files: [],
  },
  {
    id: "demo-4",
    fullName: "Rohan Verma",
    age: 31,
    gender: "Male",
    phone: "+49 151 23456789",
    country: "Germany",
    permanentAddress: "Hauptstrasse 22, Berlin",
    residenceAddress: "Hauptstrasse 22, Berlin",
    sameAsPermanentAddress: true,
    documentsRequired: 5,
    status: "Submitted",
    updatedAt: "Sep 04, 16:35",
    reference: "DC-DEMO-1031",
    files: [
      { name: "Complete_Documents.pdf", type: "Combined", pages: 5 },
      { name: "Residence_proof.pdf", type: "Individual", pages: 1 },
    ],
  },
  {
    id: "demo-5",
    fullName: "Ananya Iyer",
    age: 27,
    gender: "Female",
    phone: "+61 4 1234 5678",
    country: "Australia",
    permanentAddress: "9 Harbour View, Sydney, NSW",
    residenceAddress: "21 Collins Street, Melbourne, VIC",
    sameAsPermanentAddress: false,
    documentsRequired: 4,
    status: "In progress",
    updatedAt: "Sep 03, 11:15",
    reference: "DC-DEMO-1028",
    files: [],
  },
  {
    id: "demo-6",
    fullName: "Vikram Singh",
    age: 34,
    gender: "Male",
    phone: "+353 85 123 4567",
    country: "Ireland",
    permanentAddress: "14 O'Connell Street, Dublin",
    residenceAddress: "14 O'Connell Street, Dublin",
    sameAsPermanentAddress: true,
    documentsRequired: 6,
    status: "Pending",
    updatedAt: "Sep 02, 09:45",
    reference: "DC-DEMO-1024",
    files: [],
  },
  {
    id: "demo-7",
    fullName: "Meera Joshi",
    age: 26,
    gender: "Female",
    phone: "+64 21 123 4567",
    country: "New Zealand",
    permanentAddress: "3 Queen Street, Auckland",
    residenceAddress: "3 Queen Street, Auckland",
    sameAsPermanentAddress: true,
    documentsRequired: 3,
    status: "Submitted",
    updatedAt: "Sep 01, 14:20",
    reference: "DC-DEMO-1019",
    files: [{ name: "Complete_Documents.pdf", type: "Combined", pages: 3 }],
  },
  {
    id: "demo-8",
    fullName: "Karan Malhotra",
    age: 30,
    gender: "Male",
    phone: "+65 8123 4567",
    country: "Singapore",
    permanentAddress: "77 Orchard Road, Singapore",
    residenceAddress: "10 Marina Bay, Singapore",
    sameAsPermanentAddress: false,
    documentsRequired: 5,
    status: "In progress",
    updatedAt: "Aug 30, 10:05",
    reference: "DC-DEMO-1014",
    files: [],
  },
];

export type DemoLogEntry = {
  id: string;
  event: string;
  actor: string;
  details: string;
  timestamp: string;
};

export const demoLogs: DemoLogEntry[] = [
  {
    id: "log-1",
    event: "Profile link created",
    actor: "Admin · MBWays",
    details: "Generated a temporary profile link with a 6-hour expiry.",
    timestamp: "Today, 10:20",
  },
  {
    id: "log-2",
    event: "Basic details captured",
    actor: "User device",
    details:
      "Full name and contact details were entered locally and never uploaded.",
    timestamp: "Today, 10:24",
  },
  {
    id: "log-3",
    event: "Document captured",
    actor: "User device",
    details: "Passport (front) captured and processed on-device.",
    timestamp: "Today, 10:26",
  },
  {
    id: "log-4",
    event: "PDF generated",
    actor: "User device",
    details: "Combined A4 PDF generated locally; the link is now locked.",
    timestamp: "Yesterday, 17:41",
  },
  {
    id: "log-5",
    event: "Theme changed",
    actor: "Admin · MBWays",
    details: "Switched the workspace to the Dark theme for this session.",
    timestamp: "Yesterday, 09:12",
  },
  {
    id: "log-6",
    event: "Profile link created",
    actor: "Admin · MBWays",
    details: "Generated a temporary profile link with a 3-hour expiry.",
    timestamp: "Sep 05, 12:05",
  },
  {
    id: "log-7",
    event: "Link expired",
    actor: "System",
    details: "A temporary link expired in-browser before any data was received.",
    timestamp: "Sep 05, 18:05",
  },
  {
    id: "log-8",
    event: "Profile viewed",
    actor: "Admin · MBWays",
    details: "Opened the demonstration submission preview for a profile.",
    timestamp: "Sep 04, 16:50",
  },
  {
    id: "log-9",
    event: "Reactivation previewed",
    actor: "Admin · MBWays",
    details: "Previewed the same-link reactivation control for this session.",
    timestamp: "Sep 03, 11:30",
  },
  {
    id: "log-10",
    event: "Settings preview updated",
    actor: "Admin · MBWays",
    details: "Updated display name and reply email for this tab only.",
    timestamp: "Sep 02, 09:50",
  },
];
