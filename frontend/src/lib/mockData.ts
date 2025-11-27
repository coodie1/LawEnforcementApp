import type { Case, Arrest, Officer, Department, Person, Incident, Location } from "@/types";

export const mockCases: Case[] = [
  {
    caseID: "CASE-001",
    incidentID: "INC-001",
    leadOfficerID: "OFF-001",
    status: "open",
    openingDate: "2024-01-15",
  },
  {
    caseID: "CASE-002",
    incidentID: "INC-002",
    leadOfficerID: "OFF-002",
    status: "under_investigation",
    openingDate: "2024-02-20",
  },
  {
    caseID: "CASE-003",
    incidentID: "INC-003",
    leadOfficerID: "OFF-001",
    status: "closed",
    openingDate: "2024-01-05",
  },
  {
    caseID: "CASE-004",
    incidentID: "INC-004",
    leadOfficerID: "OFF-003",
    status: "pending",
    openingDate: "2024-03-10",
  },
];

export const mockArrests: Arrest[] = [
  {
    arrestID: "ARR-001",
    personID: "PER-001",
    caseID: "CASE-001",
    date: "2024-01-15",
    locationID: "LOC-001",
  },
  {
    arrestID: "ARR-002",
    personID: "PER-002",
    caseID: "CASE-002",
    date: "2024-02-20",
    locationID: "LOC-002",
  },
  {
    arrestID: "ARR-003",
    personID: "PER-003",
    caseID: "CASE-003",
    date: "2024-01-05",
    locationID: "LOC-001",
  },
];

export const mockOfficers: Officer[] = [
  {
    officerID: "OFF-001",
    badgeNumber: "B-1001",
    firstName: "John",
    lastName: "Martinez",
    departmentID: "DEPT-001",
  },
  {
    officerID: "OFF-002",
    badgeNumber: "B-1002",
    firstName: "Sarah",
    lastName: "Johnson",
    departmentID: "DEPT-001",
  },
  {
    officerID: "OFF-003",
    badgeNumber: "B-1003",
    firstName: "Michael",
    lastName: "Chen",
    departmentID: "DEPT-002",
  },
];

export const mockDepartments: Department[] = [
  {
    departmentID: "DEPT-001",
    name: "Central District Police",
    locationID: "LOC-001",
    headOfficerID: "OFF-001",
  },
  {
    departmentID: "DEPT-002",
    name: "North District Police",
    locationID: "LOC-002",
    headOfficerID: "OFF-003",
  },
];

export const mockPeople: Person[] = [
  {
    personID: "PER-001",
    firstName: "James",
    lastName: "Anderson",
    dateOfBirth: "1985-06-15",
    roles: ["suspect"],
  },
  {
    personID: "PER-002",
    firstName: "Maria",
    lastName: "Garcia",
    dateOfBirth: "1990-03-22",
    roles: ["suspect"],
  },
  {
    personID: "PER-003",
    firstName: "Robert",
    lastName: "Williams",
    dateOfBirth: "1978-11-08",
    roles: ["suspect", "witness"],
  },
];

export const mockIncidents: Incident[] = [
  {
    incidentID: "INC-001",
    title: "Theft at Downtown Mall",
    crimeType: "Theft",
    date: "2024-01-15",
    locationID: "LOC-001",
  },
  {
    incidentID: "INC-002",
    title: "Assault on 5th Avenue",
    crimeType: "Assault",
    date: "2024-02-20",
    locationID: "LOC-002",
  },
  {
    incidentID: "INC-003",
    title: "Burglary on Oak Street",
    crimeType: "Burglary",
    date: "2024-01-05",
    locationID: "LOC-001",
  },
  {
    incidentID: "INC-004",
    title: "Fraud Investigation",
    crimeType: "Fraud",
    date: "2024-03-10",
    locationID: "LOC-003",
  },
];

export const mockLocations: Location[] = [
  {
    locationID: "LOC-001",
    address: "123 Main Street",
    city: "Metro City",
    state: "CA",
    coordinates: { lat: 34.0522, lng: -118.2437 },
  },
  {
    locationID: "LOC-002",
    address: "456 5th Avenue",
    city: "Metro City",
    state: "CA",
    coordinates: { lat: 34.0622, lng: -118.2537 },
  },
  {
    locationID: "LOC-003",
    address: "789 Oak Street",
    city: "Metro City",
    state: "CA",
    coordinates: { lat: 34.0422, lng: -118.2337 },
  },
];
