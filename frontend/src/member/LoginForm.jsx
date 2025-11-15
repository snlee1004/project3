import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Member.css';

function LoginForm() {
    const [formData, setFormData] = useState({
        id: "",
        pwd: ""
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // 에러 메시지 제거
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        setErrorMessage("");
    };

    // 폼 유효성 검사
    const validate = () => {
        const newErrors = {};

        if (!formData.id.trim()) {
            newErrors.id = "아이디를 입력해주세요.";
        }

        if (!formData.pwd) {
            newErrors.pwd = "비밀번호를 입력해주세요.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 로그인 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault(); // submit 무효화
        
        if (!validate()) {
            return;
        }
        
        // 테스트 계정 체크 (id: test, pass: 1111)
        if (formData.id === "test" && formData.pwd === "1111") {
            alert("로그인 성공입니다.");
            // 로그인 정보 저장
            sessionStorage.setItem("memId", "test");
            sessionStorage.setItem("memName", "테스트 사용자");
            navigate("/dashboard");
            return;
        }

        // 백엔드 서버에 로그인 요청
        try {
            const response = await fetch("http://localhost:8080/login", 
                                         {  method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({id: formData.id, pwd: formData.pwd})
                                         }
            );
            if(!response.ok) {  // response.ok : 응답 코드가 200을 의미함
                throw new Error("로그인 실패");
            }

            const data = await response.json();
            if(data.rt === "OK") {
                alert("로그인 성공입니다.");
                // 로그인 정보 저장
                sessionStorage.setItem("memId", data.memId);
                sessionStorage.setItem("memName", data.memName);
                navigate("/dashboard");                
            } else {
                setErrorMessage("아이디 또는 비밀번호가 잘못되었습니다.");
                setFormData({ id: "", pwd: "" });
            }
        } catch(error) {
            // 백엔드 연결 실패 시에도 테스트 계정이 아니면 에러 표시
            if (formData.id !== "test" || formData.pwd !== "1111") {
                setErrorMessage("로그인 중 오류가 발생했습니다. (백엔드 서버가 실행 중이지 않을 수 있습니다.)");
            }
        }
    };

    return (
        <div className="member-form-container">
            <div className="member-form-header">
                <h1>로그인</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="member-form">
                <div className="form-group">
                    <label htmlFor="id">아이디 <span className="required">*</span></label>
                    <input
                        type="text"
                        id="id"
                        name="id"
                        className={`form-control ${errors.id ? 'is-invalid' : ''}`}
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="아이디를 입력하세요"
                    />
                    {errors.id && <div className="invalid-feedback">{errors.id}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="pwd">비밀번호 <span className="required">*</span></label>
                    <input
                        type="password"
                        id="pwd"
                        name="pwd"
                        className={`form-control ${errors.pwd ? 'is-invalid' : ''}`}
                        value={formData.pwd}
                        onChange={handleChange}
                        placeholder="비밀번호를 입력하세요"
                    />
                    {errors.pwd && <div className="invalid-feedback">{errors.pwd}</div>}
                </div>

                {/* 에러 메시지 */}
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}

                {/* 버튼 */}
                <div className="form-actions" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => navigate('/signup')}
                    >
                        회원가입
                    </button>
                    <button type="submit" className="btn btn-primary">
                        로그인
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
