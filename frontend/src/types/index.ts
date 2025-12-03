export interface User {
    id: string | number;
    username?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    badgeNumber?: string;
    role: 'admin' | 'officer' | 'analyst';
    temporaryPassword?: boolean;
    dateOfBirth?: Date | string;
    bloodGroup?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface StatsData {
    totalArrests: number;
    activeCases: number;
    totalPeople: number;
    convictedCount: number;
    arrestsByLocation: Array<{ location: string; count: number }>;
    crimeTypeDistribution: Array<{ type: string; count: number }>;
    caseStatusDistribution: Array<{ status: string; count: number }>;
}

export interface Case {
    caseID: string;
    status: 'open' | 'closed';
    openingDate: string;
    closingDate?: string;
    description?: string;
}

export interface Arrest {
    arrestID: number;
    personID: number;
    officerID: number;
    arrestDate: string;
    location: string;
    reason?: string;
}

export interface Officer {
    officerID: number;
    firstName: string;
    lastName: string;
    badgeNumber: string;
    departmentID?: number;
    rankTitle?: string;
}

export interface Department {
    departmentID: number;
    departmentName: string;
    location?: string;
}

export interface ActivityLog {
    _id: string;
    userId: string;
    userEmail: string;
    userName: string;
    action: 'create' | 'update' | 'delete';
    entityType: string;
    entityId: string;
    entityName?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    updatedAt: string;
}
