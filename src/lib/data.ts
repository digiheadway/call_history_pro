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

const rawCallData: (string | number | Date)[][] = [
    ['9996649708', 'incoming', 257, '2025-09-05T16:26:00', undefined],
    ['8062060330', 'incoming', 102, '2025-09-05T16:40:00', undefined],
    ['7015315218', 'incoming', 677, '2025-09-05T17:04:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250905/9138331357_7015315218_20250905_170405.mp3'],
    ['8689089383', 'incoming', 219, '2025-09-05T17:16:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250905/9138331357_8689089383_20250905_171658.mp3'],
    ['7206303805', 'incoming', 181, '2025-09-05T17:46:00', undefined],
    ['9466000325', 'incoming', 208, '2025-09-05T18:06:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250905/9138331357_9466000325_20250905_180623.mp3'],
    ['9813100015', 'incoming', 82, '2025-09-05T18:29:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250905/9138331357_9813100015_20250905_182951.mp3'],
    ['9896902673', 'incoming', 101, '2025-09-05T18:44:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250905/9138331357_9896902673_20250905_184452.mp3'],
    ['9876221000', 'incoming', 2, '2025-09-06T11:31:00', 'https://media1.callyzer.co/public/UPT11250322/91383_31357/20250906/9138331357_9876221000_20250906_113132.mp3'],
    ['9876221000', 'incoming', 197, '2025-09-06T11:31:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250906/9138331357_9876221000_20250906_113145.mp3'],
    ['9138580753', 'incoming', 9, '2025-09-06T12:27:00', undefined],
    ['9138580753', 'incoming', 191, '2025-09-06T12:28:00', undefined],
    ['8685950622', 'incoming', 817, '2025-09-06T12:41:00', undefined],
    ['9910067854', 'incoming', 190, '2025-09-06T13:34:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250906/9138331357_9910067854_20250906_133452.mp3'],
    ['9896902673', 'incoming', 28, '2025-09-06T17:13:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250906/9138331357_9896902673_20250906_171316.mp3'],
    ['9896902673', 'incoming', 647, '2025-09-06T17:15:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250906/9138331357_9896902673_20250906_171549.mp3'],
    ['9817151218', 'incoming', 186, '2025-09-06T17:59:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250906/9138331357_9817151218_20250906_175954.mp3'],
    ['9896902673', 'incoming', 441, '2025-09-06T19:32:00', 'https://media1.callyzer.co/public/UPT1125_322/9138331357/20250906/9138331357_9896902673_20250906_193207.mp3'],
    ['9034555556', 'incoming', 3475, '2025-09-06T20:11:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250906/9138331357_9034555556_20250906_201151.mp3'],
    ['9034555556', 'incoming', 66, '2025-09-06T21:10:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250906/9138331357_9034555556_20250906_211006.mp3'],
    ['9034555556', 'incoming', 377, '2025-09-07T10:43:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_9034555556_20250907_104336.mp3'],
    ['8685950622', 'incoming', 213, '2025-09-07T11:34:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_8685950622_20250907_113413.mp3'],
    ['9466465146', 'incoming', 231, '2025-09-07T11:54:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_9466465146_20250907_115400.mp3'],
    ['9896902673', 'incoming', 262, '2025-09-07T12:03:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_9896902673_20250907_120317.mp3'],
    ['8685950622', 'incoming', 367, '2025-09-07T12:15:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_8685950622_20250907_121533.mp3'],
    ['9896902673', 'incoming', 6, '2025-09-07T13:10:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_9896902673_20250907_131045.mp3'],
    ['9896902673', 'incoming', 652, '2025-09-07T13:12:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_9896902673_20250907_131210.mp3'],
    ['9468082224', 'incoming', 29, '2025-09-07T15:58:00', undefined],
    ['8818034121', 'incoming', 759, '2025-09-07T16:32:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_8818034121_20250907_163250.mp3'],
    ['8685950622', 'incoming', 347, '2025-09-07T16:51:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_8685950622_20250907_165119.mp3'],
    ['9690328261', 'incoming', 288, '2025-09-07T18:34:00', undefined],
    ['7830964576', 'incoming', 377, '2025-09-07T18:39:00', undefined],
    ['9996405655', 'incoming', 68, '2025-09-07T19:07:00', undefined],
    ['9416177787', 'incoming', 238, '2025-09-07T20:20:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250907/9138331357_9416177787_20250907_202040.mp3'],
    ['9813826009', 'incoming', 340, '2025-09-08T11:13:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9813826009_20250908_111357.mp3'],
    ['7015741984', 'incoming', 115, '2025-09-08T11:57:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_7015741984_20250908_115745.mp3'],
    ['9992025009', 'incoming', 584, '2025-09-08T12:05:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9992025009_20250908_120545.mp3'],
    ['7027158427', 'incoming', 54, '2025-09-08T12:18:00', undefined],
    ['9138580753', 'incoming', 33, '2025-09-08T12:34:00', undefined],
    ['9050014804', 'incoming', 227, '2025-09-08T12:44:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9050014804_20250908_124427.mp3'],
    ['9560531528', 'incoming', 96, '2025-09-08T13:13:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9560531528_20250908_131335.mp3'],
    ['6397826226', 'incoming', 89, '2025-09-08T13:16:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_6397826226_20250908_131657.mp3'],
    ['9416200786', 'incoming', 39, '2025-09-08T13:32:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9416200786_20250908_133221.mp3'],
    ['8295780404', 'incoming', 69, '2025-09-08T13:49:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_8295780404_20250908_134918.mp3'],
    ['8929999443', 'incoming', 23, '2025-09-08T13:58:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_8929999443_20250908_135845.mp3'],
    ['7988759185', 'incoming', 57, '2025-09-08T14:00:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_7988759185_20250908_140046.mp3'],
    ['9812550155', 'incoming', 150, '2025-09-08T14:42:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9812550155_20250908_144229.mp3'],
    ['9416872792', 'incoming', 75, '2025-09-08T14:53:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9416872792_20250908_145352.mp3'],
    ['9416345214', 'incoming', 18, '2025-09-08T15:01:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9416345214_20250908_150149.mp3'],
    ['9416200786', 'incoming', 37, '2025-09-08T15:12:00', 'https://media1.callyzer.co_public/UPT11250322/9138331357/20250908/9138331357_9416200786_20250908_151257.mp3'],
    ['9416200786', 'incoming', 8, '2025-09-08T15:36:00', undefined],
    ['8221968942', 'incoming', 34, '2025-09-08T16:06:00', undefined],
    ['9068260002', 'incoming', 56, '2025-09-08T16:23:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9068260002_20250908_162314.mp3'],
    ['9416345214', 'incoming', 622, '2025-09-08T16:55:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9416345214_20250908_165554.mp3'],
    ['8826957260', 'incoming', 196, '2025-09-08T17:17:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_8826957260_20250908_171730.mp3'],
    ['9996988748', 'incoming', 164, '2025-09-08T17:26:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9996988748_20250908_172645.mp3'],
    ['8607206208', 'incoming', 44, '2025-09-08T17:30:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_8607206208_20250908_173038.mp3'],
    ['7206667058', 'incoming', 10, '2025-09-08T17:38:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_7206667058_20250908_173855.mp3'],
    ['9690328261', 'incoming', 50, '2025-09-08T17:48:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9690328261_20250908_174830.mp3'],
    ['9034555556', 'incoming', 249, '2025-09-08T18:24:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9034555556_20250908_182446.mp3'],
    ['8929999443', 'incoming', 70, '2025-09-08T18:33:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_8929999443_20250908_183335.mp3'],
    ['8053155260', 'incoming', 96, '2025-09-08T19:23:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_8053155260_20250908_192347.mp3'],
    ['8930168068', 'incoming', 101, '2025-09-08T19:31:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_8930168068_20250908_193152.mp3'],
    ['9034555556', 'incoming', 12, '2025-09-08T19:46:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9034555556_20250908_194632.mp3'],
    ['9034555556', 'incoming', 744, '2025-09-08T21:34:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250908/9138331357_9034555556_20250908_213407.mp3'],
    ['9034555556', 'incoming', 30, '2025-09-09T10:17:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250909/9138331357_9034555556_20250909_101712.mp3'],
    ['7988759185', 'incoming', 34, '2025-09-09T10:23:00', 'https://media1.callyzer.co/public/UPT11250322/9138331357/20250909/9138331357_7988759185_20250909_102331.mp3'],
];

const calls: Call[] = rawCallData.map((row, index) => ({
    id: `call-${index + 1}`,
    phoneNumber: row[0] as string,
    type: row[1] as 'incoming' | 'outgoing' | 'missed' | 'rejected',
    duration: row[2] as number,
    timestamp: new Date(row[3] as string),
    recordingUrl: row[4] as string | undefined,
}));

const uniquePhoneNumbers = [...new Set(calls.map(call => call.phoneNumber))];

const contacts: Contact[] = uniquePhoneNumbers.map((phoneNumber, index) => ({
  phoneNumber,
  name: `Contact ${phoneNumber.slice(-4)}`,
  avatar: PlaceHolderImages[index % PlaceHolderImages.length] || null,
  notes: '',
}));


export const getInitialContacts = (): Contact[] => contacts;
export const getInitialCalls = (): Call[] => calls.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
