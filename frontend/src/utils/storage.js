// 로컬 스토리지 유틸리티 함수
// 일정 데이터를 로컬 스토리지에 저장/조회/삭제하는 함수들

// 일정 목록 가져오기
export const getEvents = () => {
  try {
    const events = localStorage.getItem('planit_events');
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('일정 데이터 조회 오류:', error);
    return [];
  }
};

// 일정 저장하기
export const saveEvents = (events) => {
  try {
    localStorage.setItem('planit_events', JSON.stringify(events));
    return true;
  } catch (error) {
    console.error('일정 데이터 저장 오류:', error);
    return false;
  }
};

// 일정 추가하기
export const addEvent = (event) => {
  const events = getEvents();
  const newEvent = {
    id: Date.now().toString(), // 고유 ID 생성
    ...event,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  events.push(newEvent);
  saveEvents(events);
  // 커스텀 이벤트 발생 (같은 탭에서 데이터 변경 감지)
  window.dispatchEvent(new Event('eventUpdated'));
  return newEvent;
};

// 일정 수정하기
export const updateEvent = (id, updatedEvent) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = {
      ...events[index],
      ...updatedEvent,
      updatedAt: new Date().toISOString()
    };
    saveEvents(events);
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event('eventUpdated'));
    return events[index];
  }
  return null;
};

// 일정 삭제하기
export const deleteEvent = (id) => {
  const events = getEvents();
  const filteredEvents = events.filter(e => e.id !== id);
  saveEvents(filteredEvents);
  // 커스텀 이벤트 발생
  window.dispatchEvent(new Event('eventUpdated'));
  return true;
};

// 일정 ID로 조회하기
export const getEventById = (id) => {
  const events = getEvents();
  return events.find(e => e.id === id) || null;
};

// 날짜별 일정 조회하기
export const getEventsByDate = (date) => {
  const events = getEvents();
  const targetDate = new Date(date).toDateString();
  return events.filter(event => {
    const eventDate = new Date(event.startDate).toDateString();
    return eventDate === targetDate;
  });
};

// 완료된 일정 조회하기
export const getCompletedEvents = () => {
  const events = getEvents();
  return events.filter(e => e.isCompleted === true);
};

// 미완료 일정 조회하기
export const getPendingEvents = () => {
  const events = getEvents();
  return events.filter(e => !e.isCompleted || e.isCompleted === false);
};

// ========== Todo (노트 메모장) 관련 함수 ==========

// Todo 목록 가져오기
export const getTodos = () => {
  try {
    const todos = localStorage.getItem('planit_todos');
    return todos ? JSON.parse(todos) : [];
  } catch (error) {
    console.error('Todo 데이터 조회 오류:', error);
    return [];
  }
};

// Todo 저장하기
export const saveTodos = (todos) => {
  try {
    localStorage.setItem('planit_todos', JSON.stringify(todos));
    return true;
  } catch (error) {
    console.error('Todo 데이터 저장 오류:', error);
    return false;
  }
};

// Todo 추가하기
export const addTodo = (todo) => {
  const todos = getTodos();
  const newTodo = {
    id: Date.now().toString(),
    title: todo.title || '',
    content: todo.content || '',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  todos.push(newTodo);
  saveTodos(todos);
  window.dispatchEvent(new Event('todoUpdated'));
  return newTodo;
};

// Todo 수정하기
export const updateTodo = (id, updatedTodo) => {
  const todos = getTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todos[index] = {
      ...todos[index],
      ...updatedTodo,
      updatedAt: new Date().toISOString()
    };
    saveTodos(todos);
    window.dispatchEvent(new Event('todoUpdated'));
    return todos[index];
  }
  return null;
};

// Todo 삭제하기
export const deleteTodo = (id) => {
  const todos = getTodos();
  const filteredTodos = todos.filter(t => t.id !== id);
  saveTodos(filteredTodos);
  window.dispatchEvent(new Event('todoUpdated'));
  return true;
};

// 여러 Todo 삭제하기
export const deleteTodos = (ids) => {
  const todos = getTodos();
  const filteredTodos = todos.filter(t => !ids.includes(t.id));
  saveTodos(filteredTodos);
  window.dispatchEvent(new Event('todoUpdated'));
  return true;
};

// Todo ID로 조회하기
export const getTodoById = (id) => {
  const todos = getTodos();
  return todos.find(t => t.id === id) || null;
};

// 완료된 Todo 조회하기
export const getCompletedTodos = () => {
  const todos = getTodos();
  return todos.filter(t => t.isCompleted === true);
};

// 미완료 Todo 조회하기
export const getPendingTodos = () => {
  const todos = getTodos();
  return todos.filter(t => !t.isCompleted || t.isCompleted === false);
};

