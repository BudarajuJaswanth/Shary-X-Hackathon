import type { CivicComplaint, TicketStatus, ConversationMessage } from '../../types/civic';

export interface ICivicRepository {
  name: string;
  isPersistent: boolean;

  createComplaint(
    complaintData: Omit<CivicComplaint, 'id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<CivicComplaint>;

  getComplaintByTicketId(ticketId: string): Promise<CivicComplaint | null>;

  listComplaints(filterStatus?: string): Promise<CivicComplaint[]>;

  updateComplaintStatus(
    ticketId: string,
    status: TicketStatus,
    note?: string
  ): Promise<CivicComplaint | null>;

  getComplaintHistory(citizenPhone?: string): Promise<CivicComplaint[]>;

  saveMessage?(message: ConversationMessage): Promise<void>;
}
