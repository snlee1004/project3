import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getTodos, 
  addTodo, 
  updateTodo, 
  deleteTodo, 
  deleteTodos,
  getTodos as getTodosList
} from '../utils/storage';
import { addEvent } from '../utils/storage';
import './TodoList.css';

// Todo List (노트 메모장) 컴포넌트
const TodoList = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // 새 메모 입력 상태
  const [newTodo, setNewTodo] = useState({
    title: '',
    content: ''
  });

  // Todo 데이터 로드
  useEffect(() => {
    loadTodos();
  }, []);

  // 이벤트 리스너로 데이터 새로고침
  useEffect(() => {
    const handleStorageChange = () => {
      loadTodos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('todoUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('todoUpdated', handleStorageChange);
    };
  }, []);

  // Todo 데이터 로드 함수
  const loadTodos = () => {
    const allTodos = getTodos();
    setTodos(allTodos);
  };

  // 새 메모 추가
  const handleAddTodo = () => {
    if (!newTodo.content.trim()) {
      alert('할일을 입력해주세요.');
      return;
    }

    addTodo({
      title: '',
      content: newTodo.content
    });

    setNewTodo({ title: '', content: '' });
  };

  // 완료 상태 토글
  const toggleComplete = (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      updateTodo(id, { isCompleted: !todo.isCompleted });
    }
  };

  // Todo 수정
  const handleUpdateTodo = (id, field, value) => {
    updateTodo(id, { [field]: value });
  };

  // Todo 삭제
  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteTodo(id);
    }
  };

  // 선택 모드 토글
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds([]);
  };

  // 개별 선택/해제
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    const filtered = getFilteredTodos();
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(t => t.id));
    }
  };

  // 선택된 항목 삭제
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (window.confirm(`선택한 ${selectedIds.length}개의 항목을 삭제하시겠습니까?`)) {
      deleteTodos(selectedIds);
      setSelectedIds([]);
      setIsSelectMode(false);
    }
  };

  // 일정으로 변환
  const handleConvertToEvent = (todo) => {
    if (window.confirm('이 메모를 일정으로 변환하시겠습니까?')) {
      const today = new Date().toISOString().split('T')[0];
      const newEvent = addEvent({
        title: todo.title || '제목 없음',
        description: todo.content || '',
        startDate: today,
        endDate: today,
        color: '#007bff',
        category: '메모에서 변환',
        isCompleted: todo.isCompleted || false
      });

      if (newEvent) {
        alert('일정으로 변환되었습니다.');
        navigate('/calendar');
      }
    }
  };

  // 필터링된 Todo 목록
  const getFilteredTodos = () => {
    let filtered = todos;

    // 완료 상태 필터
    if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.isCompleted === true);
    } else if (filter === 'pending') {
      filtered = filtered.filter(todo => !todo.isCompleted || todo.isCompleted === false);
    }

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        (todo.title && todo.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (todo.content && todo.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 날짜순 정렬 (최신순)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  };

  const filteredTodos = getFilteredTodos();

  return (
    <div className="todo-list-container">
      <div className="todo-header">
        <h2>Todo List</h2>
      </div>

      {/* 새 Todo 입력 */}
      <div className="new-todo-input-section">
        <input
          type="text"
          className="form-control todo-input"
          placeholder="할일을 입력하세요"
          value={newTodo.content}
          onChange={(e) => setNewTodo({ ...newTodo, content: e.target.value })}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTodo();
            }
          }}
        />
        <button className="btn btn-primary" onClick={handleAddTodo}>
          Todo 추가
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            if (!newTodo.content.trim()) {
              alert('할일을 입력해주세요.');
              return;
            }
            handleAddTodo();
            // 바로 일정으로 변환
            setTimeout(() => {
              const todosList = getTodosList();
              const lastTodo = todosList[todosList.length - 1];
              if (lastTodo) {
                handleConvertToEvent(lastTodo);
              }
            }, 100);
          }}
        >
          일정에 추가
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="todo-controls">
        <div className="search-box">
          <input
            type="text"
            className="form-control"
            placeholder="메모 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('pending')}
          >
            미완료
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('completed')}
          >
            완료
          </button>
        </div>
      </div>

      {/* Todo 목록 */}
      <div className="todo-list-display">
        {filteredTodos.length === 0 ? (
          <div className="no-todos">
            등록된 메모가 없습니다.
          </div>
        ) : (
          <ul className="todo-list-items">
            {filteredTodos.map(todo => (
              <li
                key={todo.id}
                className={`todo-list-item ${todo.isCompleted ? 'completed' : ''}`}
              >
                <div className="todo-item-content">
                  <input
                    type="checkbox"
                    className="todo-checkbox-input"
                    checked={todo.isCompleted || false}
                    onChange={() => toggleComplete(todo.id)}
                  />
                  <span className={`todo-text ${todo.isCompleted ? 'completed-text' : ''}`}>
                    {todo.content || todo.title || '내용 없음'}
                  </span>
                  <span className="todo-date">
                    {(() => {
                      const date = new Date(todo.createdAt || Date.now());
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const hour = String(date.getHours()).padStart(2, '0');
                      const minute = String(date.getMinutes()).padStart(2, '0');
                      return `${year}.${month}.${day}.${hour}-${minute}분`;
                    })()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 통계 정보 */}
      <div className="todo-stats">
        <div className="stat-item">
          <span className="stat-label">전체:</span>
          <span className="stat-value">{todos.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">미완료:</span>
          <span className="stat-value">{todos.filter(t => !t.isCompleted).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">완료:</span>
          <span className="stat-value">{todos.filter(t => t.isCompleted).length}</span>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
