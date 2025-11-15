import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getEventsByDate, getTodos } from '../utils/storage';
import { getHolidayInfo, isHoliday, isMemorialDay } from '../utils/koreanHolidays';
import './Calendar.css';

// 캘린더 컴포넌트 - 월별/주별/일별 뷰 지원
const Calendar = ({ viewMode = 'month', onEventClick, onDateClick, showAddButton = true }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // 일정 및 Todo 데이터 로드
  useEffect(() => {
    loadEvents();
    loadTodos();
  }, []);

  // 일정 데이터 로드 함수
  const loadEvents = () => {
    const allEvents = getEvents();
    setEvents(allEvents);
  };

  // Todo 데이터 로드 함수
  const loadTodos = () => {
    const allTodos = getTodos();
    setTodos(allTodos);
  };

  // 이벤트 리스너로 데이터 새로고침
  useEffect(() => {
    const handleStorageChange = () => {
      loadEvents();
      loadTodos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('eventUpdated', handleStorageChange);
    window.addEventListener('todoUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('eventUpdated', handleStorageChange);
      window.removeEventListener('todoUpdated', handleStorageChange);
    };
  }, []);

  // 현재 월의 첫 번째 날짜
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // 현재 월의 마지막 날짜
  const getLastDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // 월별 캘린더 그리드 생성
  const getMonthDays = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDay = getLastDayOfMonth(currentDate);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // 주의 첫 번째 날로 조정

    const days = [];
    const current = new Date(startDate);

    // 6주 * 7일 = 42일
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // 주별 캘린더 그리드 생성
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // 특정 날짜의 일정 가져오기
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toDateString();
      const targetDate = date.toDateString();
      return eventDate === targetDate;
    });
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    // 같은 날짜를 다시 클릭하면 선택 해제
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
    if (onDateClick) {
      onDateClick(date);
    }
  };

  // 새 일정 추가 핸들러
  const handleAddEvent = (date) => {
    navigate('/eventForm', { state: { selectedDate: date } });
    setSelectedDate(null); // 버튼 클릭 후 선택 해제
  };

  // 이전 월/주로 이동
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // 다음 월/주로 이동
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 날짜가 오늘인지 확인
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 날짜가 현재 월인지 확인 (월별 뷰용)
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // 날짜 렌더링
  const renderDateCell = (date, isCurrentMonthDate = true) => {
    const dateEvents = getEventsForDate(date);
    const isTodayDate = isToday(date);
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const holidayInfo = getHolidayInfo(date);
    const isHolidayDate = isHoliday(date);
    const isMemorialDate = isMemorialDay(date);

    return (
      <div
        key={date.toISOString()}
        className={`calendar-date-cell ${!isCurrentMonthDate ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isHolidayDate ? 'holiday' : ''} ${isMemorialDate ? 'memorial' : ''}`}
        onClick={() => handleDateClick(date)}
      >
        <div className="date-number-wrapper">
          <div className={`date-number ${isHolidayDate ? 'holiday-text' : ''}`}>
            {date.getDate()}
          </div>
          {holidayInfo && (
            <div className={`holiday-label ${isHolidayDate ? 'holiday' : 'memorial'}`}>
              {holidayInfo.name}
            </div>
          )}
        </div>
        <div className="date-events">
          {showAddButton && isSelected && (
            <button
              className="add-event-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddEvent(date);
              }}
              title="새 일정 추가"
            >
              + 새 일정
            </button>
          )}
          {dateEvents.slice(0, 3).map(event => (
            <div
              key={event.id}
              className={`event-dot ${event.isCompleted ? 'completed-event' : ''}`}
              style={{ backgroundColor: event.color || '#007bff' }}
              title={event.title + (event.isCompleted ? ' (완료)' : '')}
              onClick={(e) => {
                e.stopPropagation();
                if (onEventClick) onEventClick(event);
              }}
            >
              {event.isCompleted && <span className="todo-status">✓</span>}
              {event.title}
            </div>
          ))}
          {dateEvents.length > 3 && (
            <div className="more-events">+{dateEvents.length - 3}개 더</div>
          )}
        </div>
      </div>
    );
  };

  // 월별 뷰 렌더링
  const renderMonthView = () => {
    const days = getMonthDays();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
      <div className="calendar-month-view">
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map(date => renderDateCell(date, isCurrentMonth(date)))}
        </div>
      </div>
    );
  };

  // 주별 뷰 렌더링
  const renderWeekView = () => {
    const days = getWeekDays();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
      <div className="calendar-week-view">
        <div className="calendar-weekdays">
          {weekDays.map((day, index) => (
            <div key={day} className="weekday-header">
              <div>{day}</div>
              <div className="week-date">{days[index].getDate()}</div>
            </div>
          ))}
        </div>
        <div className="calendar-week-grid">
          {days.map(date => (
            <div key={date.toISOString()} className="week-day-column">
              {renderDateCell(date, true)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 일별 뷰 렌더링
  const renderDayView = () => {
    const dateEvents = getEventsForDate(currentDate);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
      <div className="calendar-day-view">
        <div className="day-header">
          <h3>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
            ({weekDays[currentDate.getDay()]})
          </h3>
        </div>
        <div className="day-events">
          {dateEvents.length === 0 ? (
            <div className="no-events">등록된 일정이 없습니다.</div>
          ) : (
            dateEvents.map(event => (
              <div
                key={event.id}
                className="day-event-item"
                style={{ borderLeftColor: event.color || '#007bff' }}
                onClick={() => onEventClick && onEventClick(event)}
              >
                <div className="event-time">
                  {event.startTime || '00:00'} - {event.endTime || '00:00'}
                </div>
                <div className="event-title">
                  {event.isCompleted && <span className="todo-status-icon">✓</span>}
                  {event.title}
                </div>
                {event.isCompleted && <span className="completed-badge">완료</span>}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="btn btn-outline-primary" onClick={goToPrevious}>
          &lt; 이전
        </button>
        <h2 className="calendar-title">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={goToToday}>
            오늘
          </button>
          <button className="btn btn-outline-primary" onClick={goToNext}>
            다음 &gt;
          </button>
        </div>
      </div>

      <div className="calendar-body">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default Calendar;

