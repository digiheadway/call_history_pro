import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

export interface Contact {
  phoneNumber: string;
  name: string;
  avatar: ImagePlaceholder | null;
  notes: string;
}

export interface Call {
  id: string;
  phoneNumber: string;
  type: 'incoming' | 'outgoing' | 'missed' | 'rejected';
  timestamp: Date;
  duration: number; // in seconds
  notes?: string;
  recordingUrl?: string;
}

const staticContacts: Omit<Contact, 'avatar' | 'notes'>[] = [
    { phoneNumber: '555-0101', name: 'Alice Johnson' },
    { phoneNumber: '555-0102', name: 'Bob Williams' },
    { phoneNumber: '555-0103', name: 'Charlie Brown' },
    { phoneNumber: '555-0104', name: 'Diana Miller' },
    { phoneNumber: '555-0105', name: 'Work Office' },
    { phoneNumber: '555-0106', name: 'Ethan Davis' },
    { phoneNumber: '555-0107', name: 'Fiona Garcia' },
    { phoneNumber: '555-0108', name: 'Grace Lee' },
    { phoneNumber: '555-0109', name: 'Henry Wilson' },
    { phoneNumber: '555-0110', name: 'Ivy Adams' },
    { phoneNumber: '555-0199', name: 'Unknown' },
    { phoneNumber: '555-0198', name: 'Unknown' },
    { phoneNumber: '555-0197', name: 'Unknown' },
];

const contacts: Contact[] = staticContacts.map((contact, index) => ({
    ...contact,
    avatar: PlaceHolderImages[index % PlaceHolderImages.length] || null,
    notes: contact.phoneNumber === '555-0105' ? 'Project Update' : (contact.phoneNumber === '555-0108' ? 'Follow up on invoice' : ''),
}));

const calls: Call[] = [
    { id: 'call-1', phoneNumber: '555-0101', type: 'incoming', duration: 300, timestamp: new Date('2024-07-29T10:30:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-2', phoneNumber: '555-0102', type: 'outgoing', duration: 120, timestamp: new Date('2024-07-29T11:00:00'), notes: undefined, recordingUrl: 'https://storage.googleapis.com/genkit-assets/call-recording.mp3' },
    { id: 'call-3', phoneNumber: '555-0103', type: 'missed', duration: 0, timestamp: new Date('2024-07-29T12:15:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-4', phoneNumber: '555-0104', type: 'rejected', duration: 0, timestamp: new Date('2024-07-29T13:00:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-5', phoneNumber: '555-0105', type: 'incoming', duration: 600, timestamp: new Date('2024-07-28T09:00:00'), notes: 'Project Update', recordingUrl: 'https://storage.googleapis.com/genkit-assets/call-recording.mp3' },
    { id: 'call-6', phoneNumber: '555-0106', type: 'outgoing', duration: 180, timestamp: new Date('2024-07-28T14:30:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-7', phoneNumber: '555-0107', type: 'missed', duration: 0, timestamp: new Date('2024-07-28T16:45:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-8', phoneNumber: '555-0108', type: 'incoming', duration: 450, timestamp: new Date('2024-07-27T10:00:00'), notes: 'Follow up on invoice', recordingUrl: 'https://storage.googleapis.com/genkit-assets/call-recording.mp3' },
    { id: 'call-9', phoneNumber: '555-0109', type: 'outgoing', duration: 240, timestamp: new Date('2024-07-27T11:30:00'), notes: undefined, recordingUrl: 'https://storage.googleapis.com/genkit-assets/call-recording.mp3' },
    { id: 'call-10', phoneNumber: '555-0110', type: 'missed', duration: 0, timestamp: new Date('2024-07-27T13:00:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-11', phoneNumber: '555-0101', type: 'incoming', duration: 150, timestamp: new Date('2024-07-26T15:00:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-12', phoneNumber: '555-0102', type: 'rejected', duration: 0, timestamp: new Date('2024-07-26T16:00:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-13', phoneNumber: '555-0199', type: 'missed', duration: 0, timestamp: new Date('2024-07-25T09:30:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-14', phoneNumber: '555-0198', type: 'incoming', duration: 124, timestamp: new Date('2024-07-25T11:00:00'), notes: undefined, recordingUrl: 'https://storage.googleapis.com/genkit-assets/call-recording.mp3' },
    { id: 'call-15', phoneNumber: '555-0197', type: 'rejected', duration: 0, timestamp: new Date('2024-07-25T14:00:00'), notes: undefined, recordingUrl: undefined },
    { id: 'call-16', phoneNumber: '555-0105', type: 'outgoing', duration: 300, timestamp: new Date('2024-07-24T17:00:00'), notes: 'Follow up call', recordingUrl: undefined },
    // A few more calls to make it look realistic
    { id: 'call-17', phoneNumber: '555-0101', type: 'missed', duration: 0, timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000), notes: undefined, recordingUrl: undefined },
    { id: 'call-18', phoneNumber: '555-0103', type: 'missed', duration: 0, timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000), notes: undefined, recordingUrl: undefined },
    { id: 'call-19', phoneNumber: '555-0103', type: 'missed', duration: 0, timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000), notes: undefined, recordingUrl: undefined },
    { id: 'call-20', phoneNumber: '555-0103', type: 'missed', duration: 0, timestamp: new Date(), notes: undefined, recordingUrl: undefined },
];


export const getInitialContacts = (): Contact[] => contacts;
export const getInitialCalls = (): Call[] => calls.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
