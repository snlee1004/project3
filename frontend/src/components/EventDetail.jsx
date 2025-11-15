import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, deleteEvent } from '../utils/storage';
import './EventDetail.css';

// 일정 상세 보기 컴포넌트
const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEvent();
    } else {
      setLoading(false);
    }
  }, [id]);

  // 일정 데이터 로드
  const loadEvent = () => {
    const eventData = getEventById(id);
    if (eventData) {
      setEvent(eventData);
    } else {
      alert('일정을 찾을 수 없습니다.');
      navigate(-1);
    }
    setLoading(false);
  };

  // 일정 삭제
  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteEvent(id);
      alert('일정이 삭제되었습니다.');
      navigate(-1);
    }
  };

  // 일정 수정 페이지로 이동
  const handleEdit = () => {
    navigate('/eventForm', { state: { eventId: id } });
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!event) {
    return <div className="no-event">일정을 찾을 수 없습니다.</div>;
  }

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleEdit}>
            수정
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            삭제
          </button>
        </div>
      </div>

      <div className="event-detail-content">
        {/* 제목 */}
        <div className="event-title-section">
          <div
            className="event-color-bar"
            style={{ backgroundColor: event.color || '#007bff' }}
          />
          <h1 className="event-title">{event.title}</h1>
          {event.isCompleted && (
            <span className="completed-badge-large">완료</span>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="event-info-section">
          <div className="info-item">
            <span className="info-label">📅 시작 날짜:</span>
            <span className="info-value">{formatDate(event.startDate)}</span>
            {event.startTime && (
              <span className="info-time"> {event.startTime}</span>
            )}
          </div>

          {event.endDate && (
            <div className="info-item">
              <span className="info-label">📅 종료 날짜:</span>
              <span className="info-value">{formatDate(event.endDate)}</span>
              {event.endTime && (
                <span className="info-time"> {event.endTime}</span>
              )}
            </div>
          )}

          {event.category && (
            <div className="info-item">
              <span className="info-label">🏷️ 카테고리:</span>
              <span className="info-value">{event.category}</span>
            </div>
          )}

          {event.reminder && (event.reminderDateTime || event.reminderTime) && (
            <div className="info-item">
              <span className="info-label">🔔 알림:</span>
              <span className="info-value">
                {event.reminderDateTime ? (
                  <>
                    {new Date(event.reminderDateTime).toLocaleString('ko-KR')}
                    {(() => {
                      const reminderOption = event.reminderTime;
                      const optionLabels = {
                        '1day': ' (1일 전)',
                        '1hour': ' (1시간 전)',
                        '30min': ' (30분 전)',
                        '10min': ' (10분 전)'
                      };
                      return optionLabels[reminderOption] || '';
                    })()}
                  </>
                ) : (
                  (() => {
                    const optionLabels = {
                      '1day': '1일 전',
                      '1hour': '1시간 전',
                      '30min': '30분 전',
                      '10min': '10분 전'
                    };
                    return optionLabels[event.reminderTime] || '알림 설정됨';
                  })()
                )}
              </span>
            </div>
          )}

          <div className="info-item">
            <span className="info-label">📊 상태:</span>
            <span className={`info-value ${event.isCompleted ? 'completed' : 'pending'}`}>
              {event.isCompleted ? '완료' : '진행중'}
            </span>
          </div>
        </div>

        {/* 설명 */}
        {event.description && (
          <div className="event-description-section">
            <h3>설명</h3>
            <div className="description-content">
              {event.description.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* 메타 정보 */}
        <div className="event-meta-section">
          <div className="meta-item">
            <span className="meta-label">생성일:</span>
            <span className="meta-value">
              {event.createdAt
                ? new Date(event.createdAt).toLocaleString('ko-KR')
                : '-'}
            </span>
          </div>
          {event.updatedAt && event.updatedAt !== event.createdAt && (
            <div className="meta-item">
              <span className="meta-label">수정일:</span>
              <span className="meta-value">
                {new Date(event.updatedAt).toLocaleString('ko-KR')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

