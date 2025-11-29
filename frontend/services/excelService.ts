import { Student, Log, LogType } from '../types';

declare const XLSX: any;

export const importStudentsFromExcel = (file: File): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          return reject(new Error("파일을 읽을 수 없습니다."));
        }
        
        const uint8array = new Uint8Array(data as ArrayBuffer);
        const workbook = XLSX.read(uint8array, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const students: Student[] = json.map(row => ({
          studentId: String(row['학번'] || ''),
          name: String(row['이름'] || ''),
          barcode: String(row['고유코드(바코드)'] || ''),
        })).filter(s => s.studentId && s.name && s.barcode);

        resolve(students);
      } catch (error) {
        console.error("Excel import error:", error);
        reject(new Error("엑셀 파일을 처리하는 중 오류가 발생했습니다. 파일의 첫 줄에 '학번', '이름', '고유코드(바코드)' 헤더가 있는지 확인해주세요."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const exportLogsToExcel = (logs: Log[]) => {
  const individualLogs = logs.filter(log => log.type === LogType.INDIVIDUAL).map(log => {
      if (log.type === LogType.INDIVIDUAL) {
          return {
              '입력일시': log.timestamp,
              '학번': log.studentId,
              '이름': log.name,
              '입실/퇴실': log.action,
              '예약 시간(H)': log.duration ?? '',
          };
      }
      return {};
  });

  const groupLogs = logs.filter(log => log.type === LogType.GROUP).map(log => {
      if (log.type === LogType.GROUP) {
          return {
              '입력일시': log.timestamp,
              '학번': log.studentId,
              '이름': log.name,
              '예약 날짜': log.reservationDate,
              '예약 시간': log.reservationTime,
              '이용 인원': log.attendees,
          };
      }
      return {};
  });

  const wb = XLSX.utils.book_new();
  const wsIndividual = XLSX.utils.json_to_sheet(individualLogs);
  const wsGroup = XLSX.utils.json_to_sheet(groupLogs);

  XLSX.utils.book_append_sheet(wb, wsIndividual, '개인 로그');
  XLSX.utils.book_append_sheet(wb, wsGroup, '공동 로그');

  XLSX.writeFile(wb, `자율학습실_로그_${new Date().toISOString().split('T')[0]}.xlsx`);
};
