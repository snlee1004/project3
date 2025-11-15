import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addEvent, updateEvent, getEventById } from '../utils/storage';
import './EventForm.css';

// 일정 등록/수정 폼 컴포넌트
const EventForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId || null; // 수정 모드인 경우 eventId 전달
  const selectedDate = location.state?.selectedDate || null; // 캘린더에서 날짜 선택 시

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    color: '#007bff',
    category: '',
    isCompleted: false,
    reminder: false,
    reminderTime: ''
  });

  const [errors, setErrors] = useState({});

  // 수정 모드인 경우 기존 데이터 로드
  useEffect(() => {
    if (eventId) {
      const event = getEventById(eventId);
      if (event) {
        setFormData({
          title: event.title || '',
          description: event.description || '',
          startDate: event.startDate ? event.startDate.split('T')[0] : '',
          endDate: event.endDate ? event.endDate.split('T')[0] : '',
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          color: event.color || '#007bff',
          category: event.category || '',
          isCompleted: event.isCompleted || false,
          reminder: event.reminder || false,
          reminderTime: event.reminderTime || ''
        });
      }
    } else if (selectedDate) {
      // 새 일정 추가 시 선택된 날짜로 초기화
      const dateStr = new Date(selectedDate).toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr
      }));
    } else {
      // 오늘 날짜로 초기화
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        startDate: today,
        endDate: today
      }));
    }
  }, [eventId, selectedDate]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 폼 유효성 검사
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '일정 제목을 입력해주세요.';
    }

    if (!formData.startDate) {
      newErrors.startDate = '시작 날짜를 선택해주세요.';
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료 날짜를 선택해주세요.';
    }

    // 종료 날짜가 시작 날짜보다 이전이면 안됨
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = '종료 날짜는 시작 날짜보다 이후여야 합니다.';
      }
    }

    // 시간 유효성 검사
    if (formData.startTime && formData.endTime) {
      if (formData.startDate === formData.endDate) {
        // 같은 날짜인 경우 시간 비교
        if (formData.startTime >= formData.endTime) {
          newErrors.endTime = '종료 시간은 시작 시간보다 이후여야 합니다.';
        }
      }
    }

    // 알림 설정 시 알림 시점 선택 필수
    if (formData.reminder && !formData.reminderTime) {
      newErrors.reminderTime = '알림 시점을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 알림 시간 계산 함수 (종료일시 기준)
  const calculateReminderDateTime = () => {
    if (!formData.reminder || !formData.reminderTime || !formData.endDate) {
      return null;
    }

    // 종료 날짜와 시간 결합
    let endDateTime;
    if (formData.endTime) {
      endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    } else {
      endDateTime = new Date(`${formData.endDate}T23:59:59`);
    }

    // 알림 옵션에 따라 시간 계산
    let reminderDateTime;
    switch (formData.reminderTime) {
      case '1day':
        reminderDateTime = new Date(endDateTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1hour':
        reminderDateTime = new Date(endDateTime.getTime() - 60 * 60 * 1000);
        break;
      case '30min':
        reminderDateTime = new Date(endDateTime.getTime() - 30 * 60 * 1000);
        break;
      case '10min':
        reminderDateTime = new Date(endDateTime.getTime() - 10 * 60 * 1000);
        break;
      default:
        return null;
    }

    return reminderDateTime.toISOString();
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // 알림 시간 계산
    const calculatedReminderTime = calculateReminderDateTime();

    // 날짜와 시간 결합
    const eventData = {
      ...formData,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      reminderDateTime: calculatedReminderTime // 실제 알림 시간 저장
    };

    try {
      if (eventId) {
        // 수정 모드
        const updated = updateEvent(eventId, eventData);
        if (updated) {
          alert('일정이 수정되었습니다.');
          navigate(-1); // 이전 페이지로 이동
        } else {
          alert('일정 수정에 실패했습니다.');
        }
      } else {
        // 등록 모드
        const newEvent = addEvent(eventData);
        if (newEvent) {
          alert('일정이 등록되었습니다.');
          navigate(-1); // 이전 페이지로 이동
        } else {
          alert('일정 등록에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('일정 저장 오류:', error);
      alert('일정 저장 중 오류가 발생했습니다.');
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까?')) {
      navigate(-1);
    }
  };

  // 색상 옵션
  const colorOptions = [
    { value: '#007bff', label: '파란색' },
    { value: '#28a745', label: '초록색' },
    { value: '#ffc107', label: '노란색' },
    { value: '#dc3545', label: '빨간색' },
    { value: '#6f42c1', label: '보라색' },
    { value: '#fd7e14', label: '주황색' },
    { value: '#20c997', label: '청록색' },
    { value: '#6c757d', label: '회색' }
  ];

  return (
    <div className="event-form-container">
      <div className="event-form-header">
        <h2>{eventId ? '일정 수정' : '새 일정 등록'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        {/* 제목 */}
        <div className="form-group">
          <label htmlFor="title">제목 <span className="required">*</span></label>
          <input
            type="text"
            id="title"
            name="title"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            value={formData.title}
            onChange={handleChange}
            placeholder="일정 제목을 입력하세요"
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        {/* 설명 */}
        <div className="form-group">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="일정에 대한 상세 설명을 입력하세요"
          />
        </div>

        {/* 날짜 및 시간 */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">시작 날짜 <span className="required">*</span></label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
              value={formData.startDate}
              onChange={handleChange}
            />
            {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">종료 날짜 <span className="required">*</span></label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
              value={formData.endDate}
              onChange={handleChange}
            />
            {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">시작 시간</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              className="form-control"
              value={formData.startTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">종료 시간</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
              value={formData.endTime}
              onChange={handleChange}
            />
            {errors.endTime && <div className="invalid-feedback">{errors.endTime}</div>}
          </div>
        </div>

        {/* 색상 및 카테고리 */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">색상</label>
            <div className="color-picker">
              {colorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`color-option ${formData.color === option.value ? 'selected' : ''}`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
                  title={option.label}
                >
                  {formData.color === option.value && <span className="color-check">✓</span>}
                </button>
              ))}
            </div>
            <input
              type="hidden"
              id="color"
              name="color"
              value={formData.color}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">카테고리</label>
            <input
              type="text"
              id="category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              placeholder="예: 업무, 개인, 회의 등"
            />
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="form-group">
          <div className="form-check">
            <input
              type="checkbox"
              id="reminder"
              name="reminder"
              className="form-check-input"
              checked={formData.reminder}
              onChange={handleChange}
            />
            <label htmlFor="reminder" className="form-check-label">
              알림 설정 (종료일시 기준)
            </label>
          </div>
        </div>

        {formData.reminder && (
          <div className="form-group">
            <label htmlFor="reminderTime">알림 시점 <span className="required">*</span></label>
            <select
              id="reminderTime"
              name="reminderTime"
              className={`form-control ${errors.reminderTime ? 'is-invalid' : ''}`}
              value={formData.reminderTime}
              onChange={handleChange}
            >
              <option value="">선택하세요</option>
              <option value="1day">1일 전</option>
              <option value="1hour">1시간 전</option>
              <option value="30min">30분 전</option>
              <option value="10min">10분 전</option>
            </select>
            {errors.reminderTime && <div className="invalid-feedback">{errors.reminderTime}</div>}
            <small className="form-text text-muted">
              종료 날짜 및 시간 기준으로 알림이 설정됩니다.
            </small>
          </div>
        )}

        {/* 완료 상태 (수정 모드에서만) */}
        {eventId && (
          <div className="form-group">
            <div className="form-check">
              <input
                type="checkbox"
                id="isCompleted"
                name="isCompleted"
                className="form-check-input"
                checked={formData.isCompleted}
                onChange={handleChange}
              />
              <label htmlFor="isCompleted" className="form-check-label">
                완료 처리
              </label>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            {eventId ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;

