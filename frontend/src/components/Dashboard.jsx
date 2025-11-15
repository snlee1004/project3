import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getCompletedEvents, getPendingEvents } from '../utils/storage';
import Calendar from './Calendar';
import TodoList from './TodoList';
import './Dashboard.css';

// 대시보드 컴포넌트 - 통계 및 캘린더/Todo 통합 뷰
const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 일정 데이터 로드
  useEffect(() => {
    loadEvents();
  }, []);

  // 이벤트 리스너로 데이터 새로고침 (다른 페이지에서 일정 추가/수정/삭제 시)
  useEffect(() => {
    const handleStorageChange = () => {
      loadEvents();
    };

    window.addEventListener('storage', handleStorageChange);
    // 같은 탭에서의 변경도 감지하기 위해 커스텀 이벤트 사용
    window.addEventListener('eventUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('eventUpdated', handleStorageChange);
    };
  }, []);

  // 일정 데이터 로드 함수
  const loadEvents = () => {
    const allEvents = getEvents();
    setEvents(allEvents);
  };

  // 통계 계산
  const stats = {
    total: events.length,
    completed: getCompletedEvents().length,
    pending: getPendingEvents().length,
    today: getTodayEvents().length,
    thisWeek: getThisWeekEvents().length,
    thisMonth: getThisMonthEvents().length
  };

  // 오늘의 일정
  function getTodayEvents() {
    const today = new Date().toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toDateString();
      return eventDate === today;
    });
  }

  // 이번 주 일정
  function getThisWeekEvents() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  }

  // 이번 달 일정
  function getThisMonthEvents() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  }

  // 완료율 계산
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // 일정 클릭 핸들러
  const handleEventClick = (event) => {
    navigate(`/eventDetail/${event.id}`);
  };

  // 새 일정 추가 핸들러
  const handleAddEvent = () => {
    navigate('/eventForm');
  };

  return (
    <div className="dashboard-container">
      {/* 통계 섹션 */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">전체 일정</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">완료</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">진행중</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">완료율</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📆</div>
          <div className="stat-content">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">오늘</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.thisWeek}</div>
            <div className="stat-label">이번 주</div>
          </div>
        </div>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="view-mode-selector">
        <button
          className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setViewMode('month')}
        >
          월별
        </button>
        <button
          className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setViewMode('week')}
        >
          주별
        </button>
        <button
          className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setViewMode('day')}
        >
          일별
        </button>
      </div>

      {/* 캘린더 및 Todo 통합 뷰 */}
      <div className="dashboard-content">
        <div className="calendar-section">
          <Calendar
            viewMode={viewMode}
            onEventClick={handleEventClick}
            showAddButton={false}
          />
        </div>

        <div className="todo-section">
          <TodoList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

