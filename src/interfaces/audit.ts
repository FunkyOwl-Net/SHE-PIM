export interface IAuditLog {
    id: string;
    record_id: string;
    table_name: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    old_data: any;
    new_data: any;
    changed_by: string; // UUID
    changed_at: string; // ISO Date
    // Helper property if we fetch user details
    changer_name?: string; 
}
