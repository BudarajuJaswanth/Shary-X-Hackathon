import type { ICivicRepository } from './ICivicRepository';
import type { CivicComplaint, TicketStatus, ConversationMessage } from '../../types/civic';
import { getSupabaseClient } from './supabaseClient';

export class SupabaseCivicRepository implements ICivicRepository {
  public name = 'Supabase PostgreSQL Cloud Repository';
  public isPersistent = true;

  private get client() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not configured. Check VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.');
    }
    return supabase;
  }

  private mapRowToComplaint(row: any): CivicComplaint {
    return {
      id: row.id,
      ticketId: row.request_id || row.ticket_id,
      category: row.category,
      title: row.title || `${row.category} Report`,
      description: row.description,
      location: row.location,
      landmark: row.landmark,
      priority: row.priority || 'HIGH',
      status: row.status || 'REGISTERED',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      estimatedResolutionHours: row.estimated_resolution_hours || 48,
      assignedDepartment: row.assigned_department || 'Municipal Administration',
      citizenPhone: row.citizen_phone,
      photoUrl: row.photo_url,
      language: row.language || 'en'
    };
  }

  public async createComplaint(
    data: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<CivicComplaint> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestId = `CIV-${new Date().getFullYear()}-${randomSuffix}`;

    try {
      // 1. Create entry in parent civic_requests table
      const { data: requestRow, error: reqErr } = await this.client
        .from('civic_requests')
        .insert({
          request_id: requestId,
          request_type: 'COMPLAINT',
          status: 'REGISTERED'
        })
        .select()
        .single();

      if (reqErr) {
        console.warn('[Supabase Repository] civic_requests insert warning:', reqErr.message);
      }

      // 2. Create entry in complaints table
      const { data: complaintRow, error: compErr } = await this.client
        .from('complaints')
        .insert({
          civic_request_id: requestRow?.id || null,
          request_id: requestId,
          category: data.category,
          title: data.title || `${data.category.replace('_', ' ')} Hazard Report`,
          description: data.description,
          location: data.location,
          landmark: data.landmark || null,
          status: 'REGISTERED',
          priority: data.priority || 'HIGH',
          assigned_department: data.assignedDepartment || 'General Municipal Administration',
          estimated_resolution_hours: data.estimatedResolutionHours || 48,
          photo_url: data.photoUrl || null,
          citizen_phone: data.citizenPhone || null,
          language: data.language || 'en'
        })
        .select()
        .single();

      if (compErr) {
        throw new Error(`Supabase create complaint failed: ${compErr.message}`);
      }

      return this.mapRowToComplaint(complaintRow);
    } catch (err: any) {
      console.error('[Supabase Repository Error] createComplaint:', err);
      throw err;
    }
  }

  public async getComplaintByTicketId(ticketId: string): Promise<CivicComplaint | null> {
    const cleanSearch = ticketId.trim().toUpperCase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId.trim());

    try {
      let query = this.client.from('complaints').select('*');
      
      if (isUuid) {
        query = query.eq('id', ticketId.trim());
      } else {
        query = query.ilike('request_id', cleanSearch);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('[Supabase Repository Error] getComplaintByTicketId:', error);
        return null;
      }

      return data ? this.mapRowToComplaint(data) : null;
    } catch (err) {
      console.error('[Supabase Repository Exception] getComplaintByTicketId:', err);
      return null;
    }
  }

  public async listComplaints(filterStatus?: string): Promise<CivicComplaint[]> {
    try {
      let query = this.client.from('complaints').select('*').order('created_at', { ascending: false });

      if (filterStatus && filterStatus !== 'ALL') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Supabase Repository Error] listComplaints:', error);
        return [];
      }

      return (data || []).map((row) => this.mapRowToComplaint(row));
    } catch (err) {
      console.error('[Supabase Repository Exception] listComplaints:', err);
      return [];
    }
  }

  public async updateComplaintStatus(
    ticketId: string,
    status: TicketStatus,
    note?: string
  ): Promise<CivicComplaint | null> {
    try {
      const existing = await this.getComplaintByTicketId(ticketId);
      if (!existing) return null;

      const newDesc = note ? `${existing.description}\n[Status Note]: ${note}` : existing.description;

      const { data, error } = await this.client
        .from('complaints')
        .update({
          status,
          description: newDesc,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('[Supabase Repository Error] updateComplaintStatus:', error);
        return null;
      }

      // Also update parent civic_requests status
      await this.client
        .from('civic_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('request_id', existing.ticketId);

      return data ? this.mapRowToComplaint(data) : null;
    } catch (err) {
      console.error('[Supabase Repository Exception] updateComplaintStatus:', err);
      return null;
    }
  }

  public async getComplaintHistory(citizenPhone?: string): Promise<CivicComplaint[]> {
    try {
      let query = this.client.from('complaints').select('*').order('created_at', { ascending: false });
      if (citizenPhone) {
        query = query.eq('citizen_phone', citizenPhone);
      }
      const { data, error } = await query;
      if (error) return [];
      return (data || []).map((r) => this.mapRowToComplaint(r));
    } catch {
      return [];
    }
  }

  public async saveMessage(message: ConversationMessage): Promise<void> {
    try {
      await this.client.from('conversation_messages').insert({
        sender: message.sender,
        text: message.text,
        intent: message.intentResult?.intent || null,
        raw_metadata: {
          language: message.language,
          ticketId: message.ticketData?.ticketId
        }
      });
    } catch (err) {
      console.warn('[Supabase Repository] saveMessage failed silently:', err);
    }
  }
}
