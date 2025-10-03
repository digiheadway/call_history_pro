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
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
  duration: number; // in seconds
}

const staticContacts: Omit<Contact, 'avatar' | 'notes'>[] = [
    { phoneNumber: '555-0101', name: 'Alice Johnson' },
    { phoneNumber: '555-0102', name: 'Bob Williams' },
    { phoneNumber: '555-0103', name: 'Charlie Brown' },
    { phoneNumber: '555-0104', name: 'Diana Miller' },
    { phoneNumber: '555-0105', name: 'Work Office' },
    { phoneNumber: '555-0106', name: 'Ethan Davis' },
    { phoneNumber: '555-0107', name: 'Fiona Garcia' },
];

const contacts: Contact[] = staticContacts.map((contact, index) => ({
    ...contact,
    avatar: PlaceHolderImages[index % PlaceHolderImages.length] || null,
    notes: index === 0 ? 'Important client, follow up on the project proposal.' : '',
}));

const callTypes: Call['type'][] = ['incoming', 'outgoing', 'missed'];

const calls: Call[] = Array.from({ length: 30 }, (_, i) => {
    const contactIndex = i % staticContacts.length;
    const contact = contacts[contactIndex];
    const callType = callTypes[i % callTypes.length];
    return {
        id: `call-${i}`,
        phoneNumber: contact.phoneNumber,
        type: callType,
        timestamp: new Date(Date.now() - (i + 1) * 6 * 3600 * 1000 - Math.random() * 6 * 3600 * 1000), // spread out over the last few days
        duration: callType === 'missed' ? 0 : Math.floor(Math.random() * 600) + (i % 2 === 0 ? 5 : 0),
    };
});

// Adding some calls from numbers not in contacts
calls.push({
    id: 'call-30',
    phoneNumber: '555-0199',
    type: 'missed',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000),
    duration: 0
});
calls.push({
    id: 'call-31',
    phoneNumber: '555-0198',
    type: 'incoming',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000),
    duration: 124
});

export const getInitialContacts = (): Contact[] => contacts;
export const getInitialCalls = (): Call[] => calls;
