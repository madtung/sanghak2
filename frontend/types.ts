export interface Student {
  studentId: string;
  name: string;
  barcode: string;
}

export interface SeatReservation {
  seatNumber: number | string;
  studentBarcode: string;
  startTime: string; 
  endTime: string; 
}

export interface StudyRoomReservation {
  id: string;
  roomNumber: number;
  studentBarcode: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  attendees: number;
}

export enum LogType {
  INDIVIDUAL = '개인',
  GROUP = '공동',
}

export interface IndividualLog {
  type: LogType.INDIVIDUAL;
  timestamp: string;
  studentId: string;
  name: string;
  action: '입실' | '퇴실';
  duration?: number; // in hours
}

export interface GroupLog {
  type: LogType.GROUP;
  timestamp: string;
  studentId: string;
  name: string;
  reservationDate: string;
  reservationTime: string;
  attendees: number;
}

export type Log = IndividualLog | GroupLog;

export enum Tab {
  SEAT_RESERVATION = '좌석 예약',
  STUDY_ROOM_RESERVATION = '공동학습실 예약',
  STATUS = '현황',
  ADMIN = '관리자페이지',
}

export interface Seat {
  id: string | number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'seat' | 'label';
  text?: string;
}
