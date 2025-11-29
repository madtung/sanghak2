import { Seat } from './types';

const GRID_UNIT = 50; // A base unit of 50px for converting the old grid layout

const gridLayout: (Omit<Seat, 'x' | 'y' | 'width' | 'height'> & { row: number, col: number, rowSpan?: number, colSpan?: number })[] = [
  // Row 1
  { id: 49, row: 1, col: 1, type: 'seat' },
  { id: 50, row: 1, col: 2, type: 'seat' },
  { id: 51, row: 1, col: 3, type: 'seat' },
  { id: 52, row: 1, col: 4, type: 'seat' },
  { id: 53, row: 1, col: 5, type: 'seat' },
  { id: 1, row: 1, col: 10, type: 'seat' },
  { id: 2, row: 1, col: 11, type: 'seat' },
  { id: 3, row: 1, col: 12, type: 'seat' },
  { id: 4, row: 1, col: 13, type: 'seat' },
  { id: 5, row: 1, col: 14, type: 'seat' },
  { id: 6, row: 1, col: 15, type: 'seat' },
  { id: '7A', row: 1, col: 16, type: 'seat' },
  // Row 2
  { id: '7B', row: 2, col: 16, type: 'seat' },
  // Row 4
  { id: 48, row: 4, col: 1, type: 'seat' },
  { id: 44, row: 4, col: 2, type: 'seat' },
  { id: 40, row: 4, col: 3, type: 'seat' },
  { id: 36, row: 4, col: 4, type: 'seat' },
  { id: 32, row: 4, col: 5, type: 'seat' },
  { id: 28, row: 4, col: 8, type: 'seat' },
  { id: 24, row: 4, col: 9, type: 'seat' },
  { id: 20, row: 4, col: 10, type: 'seat' },
  { id: 16, row: 4, col: 11, type: 'seat' },
  { id: 8, row: 4, col: 15, type: 'seat' },
  // Row 5
  { id: 47, row: 5, col: 1, type: 'seat' },
  { id: 43, row: 5, col: 2, type: 'seat' },
  { id: 39, row: 5, col: 3, type: 'seat' },
  { id: 35, row: 5, col: 4, type: 'seat' },
  { id: 31, row: 5, col: 5, type: 'seat' },
  { id: 27, row: 5, col: 8, type: 'seat' },
  { id: 23, row: 5, col: 9, type: 'seat' },
  { id: 19, row: 5, col: 10, type: 'seat' },
  { id: 15, row: 5, col: 11, type: 'seat' },
  { id: 9, row: 5, col: 15, type: 'seat' },
  // Row 6
  { id: 46, row: 6, col: 1, type: 'seat' },
  { id: 42, row: 6, col: 2, type: 'seat' },
  { id: 38, row: 6, col: 3, type: 'seat' },
  { id: 34, row: 6, col: 4, type: 'seat' },
  { id: 30, row: 6, col: 5, type: 'seat' },
  { id: 26, row: 6, col: 8, type: 'seat' },
  { id: 22, row: 6, col: 9, type: 'seat' },
  { id: 18, row: 6, col: 10, type: 'seat' },
  { id: 14, row: 6, col: 11, type: 'seat' },
  { id: 10, row: 6, col: 15, type: 'seat' },
  // Row 7
  { id: 45, row: 7, col: 1, type: 'seat' },
  { id: 41, row: 7, col: 2, type: 'seat' },
  { id: 37, row: 7, col: 3, type: 'seat' },
  { id: 33, row: 7, col: 4, type: 'seat' },
  { id: 29, row: 7, col: 5, type: 'seat' },
  { id: 25, row: 7, col: 8, type: 'seat' },
  { id: 21, row: 7, col: 9, type: 'seat' },
  { id: 17, row: 7, col: 10, type: 'seat' },
  { id: 13, row: 7, col: 11, type: 'seat' },
  { id: 11, row: 7, col: 15, type: 'seat' },
  // Row 8
  { id: 12, row: 8, col: 15, type: 'seat' },
  // Labels
  { id: 'LABEL_SR1', row: 4, col: 6, rowSpan: 2, colSpan: 2, type: 'label', text: '공동 학습 1실' }, // Doubled width
  { id: 'LABEL_SR2', row: 6, col: 6, rowSpan: 2, colSpan: 2, type: 'label', text: '공동 학습 2실' }, // Doubled width
  { id: 'LABEL_T', row: 10, col: 6, rowSpan: 1, colSpan: 2, type: 'label', text: '교사 책상' },
];

export const INITIAL_SEAT_LAYOUT: Seat[] = gridLayout.map(item => ({
    id: item.id,
    type: item.type,
    text: item.text,
    x: (item.col - 1) * GRID_UNIT,
    y: (item.row - 1) * GRID_UNIT,
    width: (item.colSpan || 1) * GRID_UNIT,
    height: (item.rowSpan || 1) * GRID_UNIT,
}));


export const TOTAL_SEATS = 53;

export const INITIAL_ADMIN_PASSWORD = '1111';

export const STUDY_ROOM_COUNT = 2;

export const generateTimeSlots = (startHour: number, endHour: number, interval: number) => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour && minute > 0) break;
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

// 9:00 AM to 10:00 PM (22:00)
export const TIME_SLOTS = generateTimeSlots(9, 22, 30);
