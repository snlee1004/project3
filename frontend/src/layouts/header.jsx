import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './header.css';

// 헤더 네비게이션 컴포넌트
const NavbarComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 로그인 상태 확인
    const memId = sessionStorage.getItem('memId');
    const memName = sessionStorage.getItem('memName');

    // 로그아웃 처리
    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            sessionStorage.clear();
            navigate('/loginform');
        }
    };

    // 현재 경로가 활성화된 메뉴인지 확인
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/dashboard">
                        📅 플랜잇 (PlanIt)
                    </Link>
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarSupportedContent" 
                        aria-controls="navbarSupportedContent" 
                        aria-expanded="false" 
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        {memId ? (
                            // 로그인된 경우 메뉴
                            <>
                                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                    <li className="nav-item">
                                        <Link 
                                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                            to="/dashboard"
                                        >
                                            대시보드
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link 
                                            className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}
                                            to="/calendar"
                                        >
                                            캘린더
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link 
                                            className={`nav-link ${isActive('/todoList') ? 'active' : ''}`}
                                            to="/todoList"
                                        >
                                            Todo List
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link 
                                            className="nav-link"
                                            to="/eventForm"
                                        >
                                            + 새 일정
                                        </Link>
                                    </li>
                                </ul>
                                <ul className="navbar-nav ms-auto">
                                    <li className="nav-item">
                                        <Link 
                                            className="nav-link" 
                                            to={`/member/${memId}`}
                                            style={{ color: 'white', cursor: 'pointer' }}
                                        >
                                            👤 <strong>{memName || memId}</strong>님
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <button 
                                            className="btn btn-outline-light btn-sm ms-2 logout-btn" 
                                            onClick={handleLogout}
                                        >
                                            로그아웃
                                        </button>
                                    </li>
                                </ul>
                            </>
                        ) : (
                            // 로그인되지 않은 경우
                            <ul className="navbar-nav ms-auto">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/loginform">
                                        로그인
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavbarComponent;
