
import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, useRef } from 'react';
import { Student, SeatReservation, StudyRoomReservation, Log, LogType, Tab, IndividualLog, GroupLog, Seat } from './types';
import { INITIAL_SEAT_LAYOUT, TIME_SLOTS, STUDY_ROOM_COUNT, INITIAL_ADMIN_PASSWORD } from './constants';
import { importStudentsFromExcel, exportLogsToExcel } from './services/excelService';

const DEFAULT_LOGO_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAUoSURBVHgB7Zz/axtVFMd/585rC+1tC22lFChUHGql8QOEYKviIKg4iA4qToJdKSLqShFFR3+AYpsoCC4iToILgksdHRU7qIdKxQElKdpS2/b2trfXvXfuybk3Od1rC73Xu/eS5Ey+k3u/e8+553LvnXPvEIhEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJ5A8Lw0H/QYdYBq8k2K9C2v/fY+A0WJ+0/7/EwNdi9g/M/wAx8KvY/xPzPwI8LwD8U+z/L+L/LPAwAPC/2P8n4o8kfpL4kYg/k/gpzIuI/xPzL4k/J4o6j/gnxP9M/B8R/xLxD4n/I/k84nMRHyO+kPgzid+KeBHinRLvKxW9o6h/QvwK4pcSv49Y5cTHIm4i8d4S71u8yYj/I/k84pMRD4pY5VdE/CXiDxHfSnwR8cOIj0S8MGLxPxFvi/h+xEcRj4l4XcS/Tfwt4nURjyM+GPGi4H4t8ZWItyLeF/HBiI9HvCzi+xE/jPgCxCsiXor4l8RzIh6O+M+IFyB+iHhBxMciHol4SeIFiJciXon4fMQLcC+BeAXueRAvRLwA9wLEKxDvRLwA9wLccyBeiHsF4gW4lyFehHgB7s0RL8Q9BeLFiBfgXoJ4BeLFiBfgXol4EeKFiBfgXo54AeLFiBfgXoh4IeKFiBdi/gHxQtwLEK9AvAD3IsQLcC+BeBXihbiXIF4Ae1XEC3AvRbwA9yLEyxEviHhB4oWIl+Jehngh4hWIFyBehngB4hWIFyJehngB4oWIl+FehngB4vWIL8A9C/BCxCsQL0G8AvEKxCvAVyBeQLwC8QrEKxAvQLwC8QrE8xAvQLwA8QrE8xAvQLwC8QLEyxAvQLwA8QLEyxAvAK9AvA7xCvAKxOsQr0C8AvEKxOsQrwBcgXgV4lWIFyBehXgV4gXIF4BXIF6FeAXiFYhXIF6FeAXiFYhXIF6FeAXiFYhXIF6FeAViBYgXIF6BYgXIFyBWgHgF4hUgVoB4BeIVIFYAeAXiFYhXAF4BeIViFYgXAF4hXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BeIViFcgXoV4BEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJ5J8B/wKz/1p+W2G2+QAAAABJRU5ErkJggg==';

// --- LocalStorage Hook ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  };
  return [storedValue, setValue];
};


// --- App Context for State Management ---
interface AppContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  seatReservations: SeatReservation[];
  setSeatReservations: React.Dispatch<React.SetStateAction<SeatReservation[]>>;
  studyRoomReservations: StudyRoomReservation[];
  setStudyRoomReservations: React.Dispatch<React.SetStateAction<StudyRoomReservation[]>>;
  logs: Log[];
  addLog: (log: Log) => void;
  adminPassword: string;
  setAdminPassword: React.Dispatch<React.SetStateAction<string>>;
  findStudentByBarcode: (barcode: string) => Student | undefined;
  findStudentByStudentId: (studentId: string) => Student | undefined;
  seatLayout: Seat[];
  setSeatLayout: React.Dispatch<React.SetStateAction<Seat[]>>;
  logoUrl: string;
  setLogoUrl: React.Dispatch<React.SetStateAction<string>>;
  announcements: string;
  setAnnouncements: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | null>(null);
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};

// --- Helper Components defined at top level ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const DigitalClock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short',
        });
    };
    
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }

    return (
        <div className="text-left text-xs text-gray-500 mt-1">
            <span>{formatDate(time)}</span>
            <span className="ml-2 font-mono text-base font-semibold">{formatTime(time)}</span>
        </div>
    );
};

const SeatLayoutGrid: React.FC<{
    layout: Seat[];
    onSeatClick?: (seatId: string | number) => void;
    activeReservations?: Map<string | number, { studentId: string; remainingTime?: string }>;
    isClickable?: boolean;
    isEditMode?: boolean;
    onDrop?: (seatId: string | number, newX: number, newY: number) => void;
}> = ({ layout, onSeatClick, activeReservations, isClickable = false, isEditMode = false, onDrop }) => {
    
    const draggedItemInfo = useRef<{ id: string | number | null; offsetX: number; offsetY: number }>({ id: null, offsetX: 0, offsetY: 0 });

    const getSeatStyle = (seatId: string | number) => {
        const reservationInfo = activeReservations?.get(seatId);
        if (reservationInfo) {
            return {
                base: 'bg-green-500 text-white',
                content: (
                    <>
                        <span className="text-xs mt-1 truncate">{reservationInfo.studentId}</span>
                        {reservationInfo.remainingTime && <span className="text-[10px] mt-0.5 truncate">{reservationInfo.remainingTime}</span>}
                    </>
                )
            };
        }
        return {
            base: isClickable ? 'bg-white text-gray-400 border border-gray-300 hover:bg-gray-100' : 'bg-gray-200 text-gray-500',
            content: null
        };
    };

    const handleDragStart = (e: React.DragEvent<HTMLElement>, item: Seat) => {
        draggedItemInfo.current = {
            id: item.id,
            offsetX: e.clientX - e.currentTarget.getBoundingClientRect().left,
            offsetY: e.clientY - e.currentTarget.getBoundingClientRect().top,
        };
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedItemInfo.current.id !== null) {
            const containerRect = e.currentTarget.getBoundingClientRect();
            let newX = e.clientX - containerRect.left - draggedItemInfo.current.offsetX;
            let newY = e.clientY - containerRect.top - draggedItemInfo.current.offsetY;

            const SNAP_GRID = 10;
            newX = Math.round(newX / SNAP_GRID) * SNAP_GRID;
            newY = Math.round(newY / SNAP_GRID) * SNAP_GRID;
            
            onDrop?.(draggedItemInfo.current.id, newX, newY);
            draggedItemInfo.current = { id: null, offsetX: 0, offsetY: 0 };
        }
    };
    
    const layoutWidth = Math.max(...layout.map(item => item.x + item.width));
    const layoutHeight = Math.max(...layout.map(item => item.y + item.height));

    return (
        <div 
            className="relative" 
            style={{ width: layoutWidth, height: layoutHeight }}
            onDragOver={isEditMode ? handleDragOver : undefined}
            onDrop={isEditMode ? handleDrop : undefined}
        >
            {layout.map((item) => {
                const style: React.CSSProperties = {
                    position: 'absolute',
                    left: item.x,
                    top: item.y,
                    width: item.width,
                    height: item.height,
                };
                
                const commonProps = {
                    key: item.id,
                    style: style,
                    draggable: isEditMode,
                    onDragStart: isEditMode ? (e: React.DragEvent<HTMLElement>) => handleDragStart(e, item) : undefined,
                };

                if (item.type === 'label') {
                    return (
                        <div {...commonProps} className={`rounded-md bg-gray-300 flex items-center justify-center text-sm font-bold p-2 z-10 select-none ${isEditMode ? 'cursor-move' : ''}`}>
                            {item.text}
                        </div>
                    );
                }

                const { base, content } = getSeatStyle(item.id);
                return (
                    <button
                        {...commonProps}
                        onClick={() => isClickable && onSeatClick?.(item.id)}
                        disabled={!isClickable && !isEditMode}
                        className={`min-h-[3.5rem] rounded-md flex flex-col items-center justify-center font-bold text-sm transition z-10 ${base} ${isClickable ? 'cursor-pointer' : ''} ${isEditMode ? 'cursor-move' : ''}`}
                    >
                        <span>{item.id}</span>
                        {content}
                    </button>
                );
            })}
        </div>
    );
};

// --- Page Components ---

const SeatReservationPage: React.FC<{ resetView: () => void }> = ({ resetView }) => {
    const { seatLayout, seatReservations, setSeatReservations, addLog, findStudentByBarcode, findStudentByStudentId, adminPassword, announcements } = useAppContext();
    const [screen, setScreen] = useState<'barcode' | 'seat_select'>('barcode');
    const [barcode, setBarcode] = useState('');
    const [currentUser, setCurrentUser] = useState<Student | null>(null);
    const [loginMethod, setLoginMethod] = useState<'barcode' | 'studentId' | null>(null);
    const [selectedSeat, setSelectedSeat] = useState<number | string | null>(null);
    
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isGeneralCheckoutModalOpen, setIsGeneralCheckoutModalOpen] = useState(false);

    const [selectedStartTime, setSelectedStartTime] = useState(TIME_SLOTS[0]);
    const [duration, setDuration] = useState(1); // in 30-min blocks
    
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [checkoutInput, setCheckoutInput] = useState('');

    const resetAll = useCallback(() => {
        setScreen('barcode');
        setBarcode('');
        setCurrentUser(null);
        setLoginMethod(null);
        setSelectedSeat(null);
        setError('');
        setSuccessMessage('');
        setCheckoutInput('');
        setIsTimeModalOpen(false);
        setIsCheckoutModalOpen(false);
        setIsGeneralCheckoutModalOpen(false);
        setDuration(1);
        setSelectedStartTime(TIME_SLOTS[0]);
        resetView();
    }, [resetView]);

    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const studentByBarcode = findStudentByBarcode(barcode);
        const studentByStudentId = findStudentByStudentId(barcode);
        
        let student: Student | null = null;
        let method: 'barcode' | 'studentId' | null = null;
        
        if(studentByBarcode) {
            student = studentByBarcode;
            method = 'barcode';
        } else if (studentByStudentId) {
            student = studentByStudentId;
            method = 'studentId';
        }

        if (student) {
            const existingReservation = seatReservations.find(r => r.studentBarcode === student!.barcode);
            if(existingReservation) {
                setError('이미 예약된 좌석이 있습니다. 퇴실 후 다시 시도해주세요.');
                return;
            }
            setCurrentUser(student);
            setLoginMethod(method);
            setScreen('seat_select');
            setError('');
        } else {
            setError('등록되지 않은 학번 또는 학생증 바코드입니다.');
        }
    };
    
    const activeReservations = useMemo(() => {
        const active = new Map<string | number, { studentId: string }>();
        seatReservations.forEach(res => {
            const student = findStudentByBarcode(res.studentBarcode);
            if (student) {
                active.set(res.seatNumber, { studentId: student.studentId });
            }
        });
        return active;
    }, [seatReservations, findStudentByBarcode]);
    
    const handleSeatClick = (seatNumber: number | string) => {
        setSelectedSeat(seatNumber);
        if (activeReservations.has(seatNumber)) {
             setIsCheckoutModalOpen(true);
        } else {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            let nextHour = currentHour;
            let nextMinute = 30;

            if (currentMinute >= 30) {
                nextHour += 1;
                nextMinute = 0;
            }
            
            if (nextHour > 22) {
                nextHour = 22;
                nextMinute = 0;
            }

            const defaultStartTime = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
            
            const validSlot = TIME_SLOTS.find(slot => slot >= defaultStartTime) || TIME_SLOTS[TIME_SLOTS.length - 2];
            setSelectedStartTime(validSlot || TIME_SLOTS[0]);
            
            setIsTimeModalOpen(true);
        }
    };

    const handleReservationConfirm = () => {
        if (!currentUser || selectedSeat === null || duration <= 0) return;

        const startTime = selectedStartTime;
        const lastTimeSlotIndex = TIME_SLOTS.indexOf(startTime) + duration;
        const endTime = TIME_SLOTS[lastTimeSlotIndex] || '22:00';

        const newReservation: SeatReservation = {
            seatNumber: selectedSeat,
            studentBarcode: currentUser.barcode,
            startTime,
            endTime,
        };

        setSeatReservations(prev => [...prev, newReservation]);
        
        const logDuration = (duration * 30) / 60;
        const log: IndividualLog = {
            type: LogType.INDIVIDUAL,
            timestamp: new Date().toLocaleString('ko-KR'),
            studentId: currentUser.studentId,
            name: currentUser.name,
            action: '입실',
            duration: logDuration
        };
        addLog(log);

        setSuccessMessage(`${currentUser.name} 학생, ${selectedSeat}번 좌석 예약이 완료되었습니다.`);
        setTimeout(() => {
            resetAll();
        }, 3000);
    };

    const handleCheckout = () => {
        const reservation = seatReservations.find(r => r.seatNumber === selectedSeat);
        if (!reservation) return;
        
        const student = findStudentByBarcode(reservation.studentBarcode);
        if(checkoutInput === reservation.studentBarcode || checkoutInput === adminPassword) {
            setSeatReservations(prev => prev.filter(r => r.seatNumber !== selectedSeat));
            const log: IndividualLog = {
                type: LogType.INDIVIDUAL,
                timestamp: new Date().toLocaleString('ko-KR'),
                studentId: student?.studentId ?? 'N/A',
                name: student?.name ?? 'N/A',
                action: '퇴실'
            };
            addLog(log);
            setSuccessMessage(`${selectedSeat}번 좌석 퇴실 처리가 완료되었습니다.`);
            setTimeout(() => {
                resetAll();
            }, 3000);
        } else {
            setError('학생증 바코드 또는 관리자 비밀번호가 일치하지 않습니다.');
        }
    };
    
    const handleGeneralCheckout = () => {
      const reservation = seatReservations.find(r => r.studentBarcode === checkoutInput);
      if (reservation) {
        const student = findStudentByBarcode(reservation.studentBarcode);
        setSeatReservations(prev => prev.filter(r => r.studentBarcode !== checkoutInput));
        const log: IndividualLog = {
          type: LogType.INDIVIDUAL,
          timestamp: new Date().toLocaleString('ko-KR'),
          studentId: student?.studentId ?? 'N/A',
          name: student?.name ?? 'N/A',
          action: '퇴실'
        };
        addLog(log);
        setSuccessMessage(`${student?.name} 학생, 퇴실 처리되었습니다.`);
        setTimeout(resetAll, 3000);
      } else {
        setError('해당 바코드의 예약 정보를 찾을 수 없습니다.');
      }
    }


    if (successMessage) {
        return <div className="text-center p-8">
            <h2 className="text-3xl font-bold text-green-600">{successMessage}</h2>
            <p className="mt-4 text-gray-600">3초 후 초기 화면으로 돌아갑니다.</p>
        </div>;
    }

    return (
        <div className="h-full">
            {screen === 'barcode' && (
                <div className="h-full flex items-center justify-center">
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full" style={{ transform: 'translateY(-150px)' }}>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-800">📢 공지사항</h2>
                            <div className="prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: announcements }} />
                        </div>
                        <div className="flex items-center justify-center">
                             <div className="max-w-md w-full text-center">
                                <h1 className="text-3xl font-bold mb-6">자율학습실 좌석 예약</h1>
                                <form onSubmit={handleBarcodeSubmit}>
                                    <input
                                        type="text"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        className="w-full px-4 py-3 border-2 bg-white border-gray-300 rounded-lg text-lg focus:outline-none focus:border-green-500"
                                        placeholder="학번 또는 학생증 바코드를 입력하세요"
                                        autoFocus
                                    />
                                     <div className="flex gap-4 mt-4">
                                        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition">
                                            입장
                                        </button>
                                        <button type="button" onClick={() => { setError(''); setCheckoutInput(''); setIsGeneralCheckoutModalOpen(true); }} className="w-full bg-red-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition">
                                            퇴실
                                        </button>
                                    </div>
                                </form>
                                {error && <p className="mt-4 text-red-500 font-semibold">{error}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {screen === 'seat_select' && (
                <div className="relative">
                    <h2 className="text-2xl font-bold mb-4 text-center">{currentUser?.name}님, 좌석을 선택해주세요.</h2>
                    <div className="absolute top-0 right-0 flex flex-col items-end text-xs space-y-1 bg-black bg-opacity-10 p-2 rounded z-20">
                        <div className="flex items-center">
                            <span className="mr-2 text-gray-700">사용 중</span>
                            <div className="w-5 h-5 bg-green-500 rounded"></div>
                        </div>
                         <div className="flex items-center">
                            <span className="mr-2 text-gray-700">미사용</span>
                            <div className="w-5 h-5 bg-white border border-gray-300 rounded"></div>
                        </div>
                    </div>
                    <SeatLayoutGrid layout={seatLayout} onSeatClick={handleSeatClick} activeReservations={activeReservations} isClickable={true} />
                </div>
            )}

            <Modal isOpen={isTimeModalOpen} onClose={resetAll} title={`${selectedSeat}번 좌석 예약`}>
                <div>
                    {loginMethod === 'studentId' && (
                        <p className="mb-4 text-sm text-center text-blue-600 bg-blue-100 p-2 rounded-md">
                            학번으로 로그인 시 최대 1시간까지만 예약 가능합니다.
                        </p>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1 font-semibold text-gray-700">시작 시간</label>
                            <select value={selectedStartTime} onChange={e => setSelectedStartTime(e.target.value)} className="w-full p-2 border bg-white rounded-md">
                                {TIME_SLOTS.slice(0, -1).map(time => <option key={time} value={time}>{time}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold text-gray-700">이용 시간</label>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setDuration(d => Math.max(1, d - 1))} className="w-10 h-10 bg-gray-200 rounded-full text-lg font-bold">-</button>
                                <span className="text-lg font-semibold w-24 text-center">{duration * 0.5} 시간</span>
                                <button 
                                    onClick={() => setDuration(d => d + 1)} 
                                    disabled={loginMethod === 'studentId' && duration >= 2}
                                    className="w-10 h-10 bg-gray-200 rounded-full text-lg font-bold disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={resetAll} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">취소</button>
                        <button onClick={handleReservationConfirm} disabled={duration === 0} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300">예약 확정</button>
                    </div>
                </div>
            </Modal>
            
            <Modal isOpen={isCheckoutModalOpen} onClose={resetAll} title={`${selectedSeat}번 좌석 퇴실`}>
                 <p className="mb-4 text-gray-600">퇴실하려면 학생증 바코드 또는 관리자 비밀번호를 입력해주세요.</p>
                 {error && <p className="mb-4 text-red-500 font-semibold">{error}</p>}
                 <input 
                    type="password"
                    value={checkoutInput}
                    onChange={e => { setError(''); setCheckoutInput(e.target.value); }}
                    className="w-full px-4 py-3 border-2 bg-white border-gray-300 rounded-lg text-lg focus:outline-none focus:border-red-500"
                    placeholder="바코드 또는 비밀번호"
                    autoFocus
                 />
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={resetAll} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">취소</button>
                    <button onClick={handleCheckout} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">퇴실</button>
                </div>
            </Modal>

            <Modal isOpen={isGeneralCheckoutModalOpen} onClose={resetAll} title="퇴실 처리">
                 <p className="mb-4 text-gray-600">퇴실할 학생의 바코드를 입력해주세요.</p>
                 {error && <p className="mb-4 text-red-500 font-semibold">{error}</p>}
                 <input 
                    type="text"
                    value={checkoutInput}
                    onChange={e => { setError(''); setCheckoutInput(e.target.value); }}
                    className="w-full px-4 py-3 border-2 bg-white border-gray-300 rounded-lg text-lg focus:outline-none focus:border-red-500"
                    placeholder="학생증 바코드"
                    autoFocus
                 />
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={resetAll} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">취소</button>
                    <button onClick={handleGeneralCheckout} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">퇴실 확인</button>
                </div>
            </Modal>
        </div>
    );
};


const StudyRoomReservationPage: React.FC<{ resetView: () => void }> = ({ resetView }) => {
    const { findStudentByBarcode, studyRoomReservations, setStudyRoomReservations, addLog } = useAppContext();
    
    const [selectedRoom, setSelectedRoom] = useState(1);
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStartTime, setSelectedStartTime] = useState(TIME_SLOTS[0]);
    const [duration, setDuration] = useState(1); // in 30-min blocks
    
    const [barcode, setBarcode] = useState('');
    const [attendees, setAttendees] = useState(2);
    const [error, setError] = useState('');

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 6);

    const isSlotReserved = (room: number, startTime: string, reservationDuration: number) => {
      const startIndex = TIME_SLOTS.indexOf(startTime);
      const endIndex = startIndex + reservationDuration;
      const timeSlotsToBook = TIME_SLOTS.slice(startIndex, endIndex);

      return studyRoomReservations.some(r => {
        if (r.roomNumber !== room || r.date !== selectedDate) {
          return false;
        }
        const reservationStartIndex = TIME_SLOTS.indexOf(r.startTime);
        const reservationEndIndex = TIME_SLOTS.indexOf(r.endTime);
        const reservedSlots = TIME_SLOTS.slice(reservationStartIndex, reservationEndIndex);
        
        return timeSlotsToBook.some(slot => reservedSlots.includes(slot));
      });
    };

    const handleOpenModal = () => {
        setError('');
        if (isSlotReserved(selectedRoom, selectedStartTime, duration)) {
            setError('선택한 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.');
        } else {
            setIsModalOpen(true);
        }
    };

    const handleReservation = () => {
        const student = findStudentByBarcode(barcode);
        if (!student) {
            setError('등록되지 않은 학생증 바코드입니다.');
            return;
        }
        
        if (isSlotReserved(selectedRoom, selectedStartTime, duration)) {
            setError('예약 처리 중 충돌이 발생했습니다. 다시 시도해주세요.');
            return;
        }

        const endTimeSlotIndex = TIME_SLOTS.indexOf(selectedStartTime) + duration;
        const endTime = TIME_SLOTS[endTimeSlotIndex] || '22:00';
        
        const newReservation: StudyRoomReservation = {
            id: Date.now().toString(),
            roomNumber: selectedRoom,
            studentBarcode: barcode,
            date: selectedDate,
            startTime: selectedStartTime,
            endTime: endTime,
            attendees: attendees,
        };

        setStudyRoomReservations(prev => [...prev, newReservation]);
        
        const log: GroupLog = {
            type: LogType.GROUP,
            timestamp: new Date().toLocaleString('ko-KR'),
            studentId: student.studentId,
            name: student.name,
            reservationDate: selectedDate,
            reservationTime: `${selectedStartTime} - ${endTime}`,
            attendees: attendees,
        };
        addLog(log);
        
        setIsModalOpen(false);
        setBarcode('');
        setAttendees(2);
        setError('');
        setDuration(1);
    };

    const TimeTable: React.FC<{roomNum: number}> = ({roomNum}) => {
        const bookedSlots = useMemo(() => {
            return studyRoomReservations
                .filter(r => r.roomNumber === roomNum && r.date === selectedDate)
                .flatMap(r => {
                    const start = TIME_SLOTS.indexOf(r.startTime);
                    const end = TIME_SLOTS.indexOf(r.endTime);
                    return TIME_SLOTS.slice(start, end);
                });
        }, [studyRoomReservations, roomNum, selectedDate]);

        return (
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-center border-b pb-2">공동학습실 {roomNum}</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {TIME_SLOTS.map(time => (
                        <div key={time} className={`p-2 rounded text-center text-sm ${bookedSlots.includes(time) ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {time}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-2 text-center">공동학습실 예약</h1>
            <p className="text-sm text-gray-500 text-center mb-6">공동학습실은 학생증으로만 예약이 가능합니다.</p>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                     <div className="flex justify-center gap-4">
                        {Array.from({length: STUDY_ROOM_COUNT}, (_, i) => i + 1).map(roomNum => (
                            <button key={roomNum} onClick={() => setSelectedRoom(roomNum)} className={`px-6 py-2 rounded-lg text-lg font-semibold transition ${selectedRoom === roomNum ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                공동학습실 {roomNum}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-gray-700">날짜 선택</label>
                        <input type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={today.toISOString().split('T')[0]}
                            max={sevenDaysFromNow.toISOString().split('T')[0]}
                            className="w-full p-2 border bg-white rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-gray-700">시작 시간</label>
                        <select value={selectedStartTime} onChange={e => setSelectedStartTime(e.target.value)} className="w-full p-2 border bg-white rounded-md">
                            {TIME_SLOTS.slice(0,-1).map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-gray-700">이용 시간</label>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={() => setDuration(d => Math.max(1, d - 1))} className="w-10 h-10 bg-gray-200 rounded-full text-lg font-bold">-</button>
                            <span className="text-lg font-semibold w-24 text-center">{duration * 0.5} 시간</span>
                            <button onClick={() => setDuration(d => d + 1)} className="w-10 h-10 bg-gray-200 rounded-full text-lg font-bold">+</button>
                        </div>
                    </div>
                    <button onClick={handleOpenModal} className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition">
                        예약하기
                    </button>
                    {error && !isModalOpen && <p className="mt-2 text-center text-red-500">{error}</p>}
                </div>
                
                {/* Right Column: Status */}
                <div>
                    <h3 className="text-xl font-bold text-center mb-4">{new Date(selectedDate).toLocaleDateString('ko-KR')} 예약 현황</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {Array.from({length: STUDY_ROOM_COUNT}, (_, i) => i + 1).map(roomNum => (
                            <TimeTable key={roomNum} roomNum={roomNum} />
                        ))}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`공동학습실 ${selectedRoom} 예약`}>
                <p className="mb-4 text-lg font-semibold">{new Date(selectedDate).toLocaleDateString('ko-KR')} / {selectedStartTime} 부터 {duration * 0.5}시간</p>
                {error && <p className="mb-2 text-red-500">{error}</p>}
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-semibold text-gray-700">학생증 바코드</label>
                        <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full p-2 border bg-white rounded-md" autoFocus/>
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-gray-700">이용 인원 (2-8명)</label>
                        <select value={attendees} onChange={e => setAttendees(Number(e.target.value))} className="w-full p-2 border bg-white rounded-md">
                            {Array.from({length: 7}, (_, i) => i + 2).map(num => <option key={num} value={num}>{num}명</option>)}
                        </select>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">취소</button>
                    <button onClick={handleReservation} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">예약</button>
                </div>
            </Modal>
        </div>
    );
};


const StatusPage: React.FC = () => {
    const { students, seatReservations, studyRoomReservations, seatLayout } = useAppContext();
    const getStudentInfo = useCallback((barcode: string) => students.find(s => s.barcode === barcode), [students]);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysStudyRoomReservations = studyRoomReservations.filter(r => r.date === todayStr).sort((a,b) => a.startTime.localeCompare(b.startTime));
    
    const activeReservations = useMemo(() => {
        const active = new Map<string | number, { studentId: string; remainingTime: string }>();

        seatReservations.forEach(res => {
            const student = getStudentInfo(res.studentBarcode);
            if (student) {
                const [endHour, endMinute] = res.endTime.split(':').map(Number);
                const endDate = new Date(currentTime);
                endDate.setHours(endHour, endMinute, 0, 0);

                let remainingTime = '종료';
                if (endDate > currentTime) {
                    const diffMinutes = Math.round((endDate.getTime() - currentTime.getTime()) / (1000 * 60));
                    if (diffMinutes > 0) {
                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        const paddedMinutes = String(minutes).padStart(2, '0');
                        remainingTime = `${hours}:${paddedMinutes} 남음`;
                    }
                }
                
                active.set(res.seatNumber, { studentId: student.studentId, remainingTime });
            }
        });
        return active;
    }, [seatReservations, getStudentInfo, currentTime]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({});
    const layoutWidth = useMemo(() => Math.max(...seatLayout.map(item => item.x + item.width)), [seatLayout]);
    const layoutHeight = useMemo(() => Math.max(...seatLayout.map(item => item.y + item.height)), [seatLayout]);

    useEffect(() => {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width } = entry.contentRect;
          if (layoutWidth > 0 && width > 0) {
            const scale = Math.min((width - 16) / layoutWidth, 1); // Subtract padding
            setTransformStyle({
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              height: layoutHeight * scale,
              width: layoutWidth,
            });
          }
        }
      });

      const currentRef = containerRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }
      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [layoutWidth, layoutHeight]);


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-center">자율학습실 현황</h1>
            
            <div className="flex justify-center">
                <div ref={containerRef} className="bg-white p-4 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-center">개인 좌석 현황</h2>
                    <div style={transformStyle}>
                        <SeatLayoutGrid layout={seatLayout} activeReservations={activeReservations} />
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4 text-center">오늘의 공동학습실 예약 현황</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {Array.from({length: STUDY_ROOM_COUNT}, (_, i) => i + 1).map(roomNum => (
                        <div key={roomNum} className="bg-white p-4 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-center border-b pb-2">공동학습실 {roomNum}</h3>
                            <ul className="space-y-2">
                                {todaysStudyRoomReservations.filter(r => r.roomNumber === roomNum).length > 0 ? (
                                    todaysStudyRoomReservations.filter(r => r.roomNumber === roomNum).map(res => {
                                        const student = getStudentInfo(res.studentBarcode);
                                        return (
                                            <li key={res.id} className="bg-green-50 p-3 rounded-md text-sm">
                                                <span className="font-bold text-green-800">{res.startTime} - {res.endTime}</span>
                                                <span className="ml-4">{student?.name} ({student?.studentId})</span>
                                                <span className="ml-2 text-gray-600">({res.attendees}명)</span>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-gray-500 py-4">예약이 없습니다.</p>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const AdminPage: React.FC = () => {
    const { 
        students, setStudents, 
        logs, 
        adminPassword, setAdminPassword, 
        seatLayout, setSeatLayout,
        announcements, setAnnouncements,
        logoUrl, setLogoUrl
    } = useAppContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');
    
    const [logTab, setLogTab] = useState<LogType>(LogType.INDIVIDUAL);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [newStudent, setNewStudent] = useState({ studentId: '', name: '', barcode: '' });
    const [addStudentError, setAddStudentError] = useState('');
    
    const [isLayoutEditMode, setIsLayoutEditMode] = useState(false);
    const [currentAnnouncements, setCurrentAnnouncements] = useState(announcements);


    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === adminPassword) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('비밀번호가 일치하지 않습니다.');
        }
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const newStudents = await importStudentsFromExcel(e.target.files[0]);
                setStudents(currentStudents => {
                    const studentMap = new Map(currentStudents.map(s => [s.barcode, s]));
                    newStudents.forEach(s => studentMap.set(s.barcode, s));
                    return Array.from(studentMap.values());
                });
                alert(`${newStudents.length}명의 학생 정보가 추가/업데이트 되었습니다.`);
            } catch (err) {
                alert(err instanceof Error ? err.message : '파일 처리 중 오류 발생');
            }
        }
    };
    
    const handlePasswordChange = () => {
        if(newPassword.length < 4) {
            setPasswordMessage('비밀번호는 4자 이상이어야 합니다.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        setAdminPassword(newPassword);
        setPasswordMessage('비밀번호가 성공적으로 변경되었습니다.');
        setNewPassword('');
        setConfirmPassword('');
    };
    
    const handleDeleteStudent = (barcode: string) => {
        if(window.confirm("정말로 이 학생을 삭제하시겠습니까?")) {
            setStudents(prev => prev.filter(s => s.barcode !== barcode));
        }
    }
    
    const handleEditStudent = () => {
        if (!studentToEdit) return;
        setStudents(prev => prev.map(s => s.barcode === studentToEdit.barcode ? studentToEdit : s));
        setStudentToEdit(null);
    }
    
    const handleAddStudent = (e: React.FormEvent) => {
      e.preventDefault();
      setAddStudentError('');
      if (!newStudent.studentId || !newStudent.name || !newStudent.barcode) {
        setAddStudentError('모든 필드를 입력해주세요.');
        return;
      }
      if (students.some(s => s.barcode === newStudent.barcode)) {
        setAddStudentError('이미 등록된 바코드입니다.');
        return;
      }
      setStudents(prev => [...prev, newStudent].sort((a,b) => a.studentId.localeCompare(b.studentId)));
      setNewStudent({ studentId: '', name: '', barcode: '' });
    };

    const handleSeatDrop = (seatId: string | number, newX: number, newY: number) => {
        setSeatLayout(prevLayout => {
            return prevLayout.map(seat => 
                seat.id === seatId ? { ...seat, x: newX, y: newY } : seat
            );
        });
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h1 className="text-3xl font-bold mb-6">관리자 로그인</h1>
                <form onSubmit={handleLogin} className="w-full max-w-sm">
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-4 py-3 border-2 bg-white border-gray-300 rounded-lg text-lg focus:outline-none focus:border-green-500"
                        placeholder="비밀번호를 입력하세요"
                        autoFocus
                    />
                    <button type="submit" className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition">
                        로그인
                    </button>
                    {error && <p className="mt-4 text-red-500 font-semibold text-center">{error}</p>}
                </form>
            </div>
        );
    }

    const filteredLogs = logs.filter(log => log.type === logTab);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-center">관리자 페이지</h1>

            {/* Layout Management */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">좌석 배치 관리</h2>
                    <button onClick={() => setIsLayoutEditMode(prev => !prev)} className={`px-4 py-2 rounded-lg text-white font-semibold ${isLayoutEditMode ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
                        {isLayoutEditMode ? '편집 완료' : '레이아웃 편집'}
                    </button>
                </div>
                {isLayoutEditMode && <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded-md mb-4">편집 모드에서는 좌석을 드래그하여 위치를 변경할 수 있습니다. 변경사항은 자동으로 저장됩니다. (10px 단위로 이동)</p>}
                <SeatLayoutGrid layout={seatLayout} isEditMode={isLayoutEditMode} onDrop={handleSeatDrop} />
            </div>

            {/* Student Management */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4">학생 관리</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">개별 학생 추가</h3>
                        <form onSubmit={handleAddStudent} className="space-y-3">
                            <input value={newStudent.studentId} onChange={e => setNewStudent({...newStudent, studentId: e.target.value})} placeholder="학번" className="w-full p-2 border bg-white rounded-md" />
                            <input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="이름" className="w-full p-2 border bg-white rounded-md" />
                            <input value={newStudent.barcode} onChange={e => setNewStudent({...newStudent, barcode: e.target.value})} placeholder="고유코드(바코드)" className="w-full p-2 border bg-white rounded-md" />
                            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">추가하기</button>
                            {addStudentError && <p className="text-sm text-red-600">{addStudentError}</p>}
                        </form>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">일괄 업로드 (엑셀)</h3>
                        <p className="text-xs text-gray-500 mb-2">'학번', '이름', '고유코드(바코드)' 컬럼이 포함된 엑셀 파일을 업로드해주세요.</p>
                        <input onChange={handleFileChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" type="file" accept=".xlsx, .xls" />
                    </div>
                </div>
                 <div className="mt-6 max-h-96 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">학번</th><th scope="col" className="px-6 py-3">이름</th><th scope="col" className="px-6 py-3">바코드</th><th scope="col" className="px-6 py-3">작업</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.barcode} className="bg-white border-b">
                                    <td className="px-6 py-4">{student.studentId}</td><td className="px-6 py-4">{student.name}</td><td className="px-6 py-4">{student.barcode}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => setStudentToEdit(student)} className="font-medium text-green-600 hover:underline">수정</button>
                                        <button onClick={() => handleDeleteStudent(student.barcode)} className="font-medium text-red-600 hover:underline">삭제</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Management */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">이용 로그</h2>
                    <button onClick={() => exportLogsToExcel(logs)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">엑셀로 내보내기</button>
                </div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setLogTab(LogType.INDIVIDUAL)} className={`${logTab === LogType.INDIVIDUAL ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>개인 좌석 로그</button>
                         <button onClick={() => setLogTab(LogType.GROUP)} className={`${logTab === LogType.GROUP ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>공동학습실 로그</button>
                    </nav>
                </div>
                <div className="max-h-96 overflow-y-auto mt-4">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                            {logTab === LogType.INDIVIDUAL ? (
                                <tr>
                                    <th className="px-6 py-3">일시</th><th className="px-6 py-3">학번</th><th className="px-6 py-3">이름</th><th className="px-6 py-3">구분</th><th className="px-6 py-3">예약시간</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-6 py-3">일시</th><th className="px-6 py-3">학번</th><th className="px-6 py-3">이름</th><th className="px-6 py-3">예약일시</th><th className="px-6 py-3">인원</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <tr key={index} className="bg-white border-b">
                                    {log.type === LogType.INDIVIDUAL && (<>
                                        <td className="px-6 py-4">{log.timestamp}</td><td className="px-6 py-4">{log.studentId}</td><td className="px-6 py-4">{log.name}</td>
                                        <td className="px-6 py-4">{log.action}</td><td className="px-6 py-4">{log.duration ? `${log.duration}시간` : '-'}</td>
                                    </>)}
                                    {log.type === LogType.GROUP && (<>
                                        <td className="px-6 py-4">{log.timestamp}</td><td className="px-6 py-4">{log.studentId}</td><td className="px-6 py-4">{log.name}</td>
                                        <td className="px-6 py-4">{log.reservationDate} {log.reservationTime}</td><td className="px-6 py-4">{log.attendees}명</td>
                                    </>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Password Change */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4">비밀번호 변경</h2>
                <div className="max-w-sm space-y-3">
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="새 비밀번호" className="w-full p-2 border bg-white rounded-md" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="새 비밀번호 확인" className="w-full p-2 border bg-white rounded-md" />
                    <button onClick={handlePasswordChange} className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">변경하기</button>
                    {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
                </div>
            </div>
            
            {/* Announcements Management */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4">공지사항 관리</h2>
                <textarea 
                    className="w-full h-48 p-2 border bg-white rounded-md font-mono text-sm"
                    value={currentAnnouncements}
                    onChange={(e) => setCurrentAnnouncements(e.target.value)}
                    placeholder="HTML을 사용하여 공지사항을 작성하세요."
                />
                <button 
                    onClick={() => setAnnouncements(currentAnnouncements)} 
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    공지사항 저장
                </button>
                <div className="mt-4 border p-4 rounded-md bg-gray-50">
                     <h3 className="text-lg font-semibold mb-2">미리보기</h3>
                     <div className="prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: currentAnnouncements }} />
                </div>
            </div>

            {/* Logo Management */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4">로고 변경</h2>
                <div className="flex items-center gap-4">
                    <img src={logoUrl} alt="Current Logo" className="h-16 w-16 border p-1 rounded-md object-contain" />
                    <div>
                        <p className="text-sm text-gray-600 mb-2">새 로고 파일을 업로드하세요.</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoUpload}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                        />
                    </div>
                </div>
            </div>
            
            <Modal isOpen={!!studentToEdit} onClose={() => setStudentToEdit(null)} title="학생 정보 수정">
              {studentToEdit && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-semibold">학번</label>
                    <input value={studentToEdit.studentId} onChange={e => setStudentToEdit({...studentToEdit, studentId: e.target.value})} className="w-full p-2 border bg-white rounded-md" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">이름</label>
                    <input value={studentToEdit.name} onChange={e => setStudentToEdit({...studentToEdit, name: e.target.value})} className="w-full p-2 border bg-white rounded-md" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold">바코드</label>
                    <input value={studentToEdit.barcode} disabled className="w-full p-2 border rounded-md bg-gray-100" />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setStudentToEdit(null)} className="px-6 py-2 bg-gray-300 rounded-lg">취소</button>
                    <button onClick={handleEditStudent} className="px-6 py-2 bg-green-600 text-white rounded-lg">저장</button>
                  </div>
                </div>
              )}
            </Modal>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SEAT_RESERVATION);
  
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [seatReservations, setSeatReservations] = useLocalStorage<SeatReservation[]>('seat_reservations', []);
  const [studyRoomReservations, setStudyRoomReservations] = useLocalStorage<StudyRoomReservation[]>('studyroom_reservations', []);
  const [logs, setLogs] = useLocalStorage<Log[]>('logs', []);
  const [adminPassword, setAdminPassword] = useLocalStorage<string>('admin_password', INITIAL_ADMIN_PASSWORD);
  const [seatLayout, setSeatLayout] = useLocalStorage<Seat[]>('seat_layout', INITIAL_SEAT_LAYOUT);
  const [logoUrl, setLogoUrl] = useLocalStorage<string>('logo_url', DEFAULT_LOGO_URL);
  const [announcements, setAnnouncements] = useLocalStorage<string>('announcements', '<h2>📢 상학재 공지사항</h2><p>첫 방문을 환영합니다. 규칙을 잘 지켜주세요.</p><ul><li>정숙 유지</li><li>음식물 반입 금지</li><li>퇴실 시 자리 정리</li></ul>');

  const addLog = useCallback((log: Log) => {
    setLogs(prev => [log, ...prev]);
  }, [setLogs]);
  
  const findStudentByBarcode = useCallback((barcode: string) => {
    return students.find(s => s.barcode === barcode);
  }, [students]);

  const findStudentByStudentId = useCallback((studentId: string) => {
    return students.find(s => s.studentId === studentId);
  }, [students]);

  const contextValue: AppContextType = {
    students, setStudents,
    seatReservations, setSeatReservations,
    studyRoomReservations, setStudyRoomReservations,
    logs, addLog,
    adminPassword, setAdminPassword,
    findStudentByBarcode,
    findStudentByStudentId,
    seatLayout, setSeatLayout,
    logoUrl, setLogoUrl,
    announcements, setAnnouncements
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.SEAT_RESERVATION:
        return <SeatReservationPage resetView={() => setActiveTab(Tab.SEAT_RESERVATION)} />;
      case Tab.STUDY_ROOM_RESERVATION:
        return <StudyRoomReservationPage resetView={() => setActiveTab(Tab.SEAT_RESERVATION)} />;
      case Tab.STATUS:
        return <StatusPage />;
      case Tab.ADMIN:
        return <AdminPage />;
      default:
        return <SeatReservationPage resetView={() => setActiveTab(Tab.SEAT_RESERVATION)} />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex flex-col h-screen bg-gray-100 font-sans text-gray-800">
        <header className="bg-white shadow-md flex-shrink-0 flex items-center justify-between p-2">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(Tab.SEAT_RESERVATION)}>
                <img src={logoUrl} alt="Logo" className="h-12 w-12 object-contain"/>
                <div>
                    <h1 className="text-xl font-bold text-green-700">상학재 출입 시스템</h1>
                    <DigitalClock />
                </div>
            </div>
            <button 
              onClick={() => setActiveTab(Tab.SEAT_RESERVATION)} 
              className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-2"
              aria-label="Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <nav className="w-48 bg-white shadow flex-shrink-0 flex flex-col pt-4">
              {Object.values(Tab).map(tab => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full py-3 px-4 text-left font-semibold transition-colors duration-200 flex items-center ${
                          activeTab === tab 
                          ? 'border-l-4 border-green-600 text-green-600 bg-green-50' 
                          : 'border-l-4 border-transparent text-gray-500 hover:bg-gray-100 hover:text-green-600'
                      }`}
                  >
                      {tab}
                  </button>
              ))}
          </nav>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}