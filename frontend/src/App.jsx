import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import NavbarComponent from "./layouts/header";
import FooterComponent from "./layouts/footer";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginForm from "./member/LoginForm";
import SignUpForm from "./member/SignUpForm";
import MemberDetail from "./member/MemberDetail";
import MemberDetailModify from "./member/MemberDetailModify";
import Dashboard from "./components/Dashboard";
import Calendar from "./components/Calendar";
import TodoList from "./components/TodoList";
import EventForm from "./components/EventForm";
import EventDetail from "./components/EventDetail";

// 보호된 라우트 컴포넌트 (로그인 필요)
const ProtectedRoute = ({ children }) => {
    const memId = sessionStorage.getItem('memId');
    return memId ? children : <Navigate to="/loginform" replace />;
};

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <NavbarComponent />
                
                <div className="main-content" style={{ minHeight: "calc(100vh - 200px)" }}>
                    <Routes>
                        {/* 기본 경로는 로그인 또는 대시보드로 리다이렉트 */}
                        <Route 
                            path="/" 
                            element={
                                sessionStorage.getItem('memId') 
                                    ? <Navigate to="/dashboard" replace />
                                    : <Navigate to="/loginform" replace />
                            } 
                        />
                        
                        {/* 로그인 페이지 */}
                        <Route path="/loginform" element={<LoginForm />} />
                        
                        {/* 회원 관련 페이지 */}
                        <Route path="/signup" element={<SignUpForm />} />
                        <Route 
                            path="/member/:id" 
                            element={
                                <ProtectedRoute>
                                    <MemberDetail />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/member/edit/:id" 
                            element={
                                <ProtectedRoute>
                                    <MemberDetailModify />
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* 보호된 라우트들 */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/calendar" 
                            element={
                                <ProtectedRoute>
                                    <Calendar viewMode="month" />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/todoList" 
                            element={
                                <ProtectedRoute>
                                    <TodoList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/eventForm" 
                            element={
                                <ProtectedRoute>
                                    <EventForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/eventDetail/:id" 
                            element={
                                <ProtectedRoute>
                                    <EventDetail />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </div>

                <FooterComponent />
            </BrowserRouter>
        </div>
    );
}

export default App;
