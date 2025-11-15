import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Member.css';

// 회원 가입 폼 컴포넌트
function SignUpForm() {
    const [formData, setFormData] = useState({
        id: "",
        pwd: "",
        pwdConfirm: "",
        name: "",
        email: "",
        phone: "",
        address: ""
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
    };

    // 폼 유효성 검사
    const validate = () => {
        const newErrors = {};

        // 아이디 검사
        if (!formData.id.trim()) {
            newErrors.id = "아이디를 입력해주세요.";
        } else if (formData.id.length < 4) {
            newErrors.id = "아이디는 4자 이상이어야 합니다.";
        }

        // 비밀번호 검사
        if (!formData.pwd) {
            newErrors.pwd = "비밀번호를 입력해주세요.";
        } else if (formData.pwd.length < 6) {
            newErrors.pwd = "비밀번호는 6자 이상이어야 합니다.";
        }

        // 비밀번호 확인 검사
        if (!formData.pwdConfirm) {
            newErrors.pwdConfirm = "비밀번호 확인을 입력해주세요.";
        } else if (formData.pwd !== formData.pwdConfirm) {
            newErrors.pwdConfirm = "비밀번호가 일치하지 않습니다.";
        }

        // 이름 검사
        if (!formData.name.trim()) {
            newErrors.name = "이름을 입력해주세요.";
        }

        // 이메일 검사
        if (!formData.email.trim()) {
            newErrors.email = "이메일을 입력해주세요.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "올바른 이메일 형식이 아닙니다.";
        }

        // 전화번호 검사 (선택사항이지만 입력된 경우 형식 검사)
        if (formData.phone && !/^[0-9-]+$/.test(formData.phone)) {
            newErrors.phone = "올바른 전화번호 형식이 아닙니다.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 회원 가입 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/member/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: formData.id,
                    pwd: formData.pwd,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    address: formData.address || null
                })
            });

            if (!response.ok) {
                throw new Error("회원가입 실패");
            }

            const data = await response.json();
            if (data.rt === "OK") {
                // 로그인 정보 저장
                sessionStorage.setItem("memId", data.memId || formData.id);
                sessionStorage.setItem("memName", data.memName || formData.name);
                alert("회원가입이 완료되었습니다.");
                navigate(`/member/${data.memId || formData.id}`);
            } else {
                setErrorMessage(data.msg || "회원가입에 실패했습니다.");
            }
        } catch (error) {
            // 백엔드 연결 실패 시 로컬 스토리지에 저장 (테스트용)
            const members = JSON.parse(localStorage.getItem('planit_members') || '[]');
            const existingMember = members.find(m => m.id === formData.id);
            
            if (existingMember) {
                setErrorMessage("이미 존재하는 아이디입니다.");
                return;
            }

            const newMember = {
                id: formData.id,
                pwd: formData.pwd,
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                address: formData.address || '',
                createdAt: new Date().toISOString()
            };
            
            members.push(newMember);
            localStorage.setItem('planit_members', JSON.stringify(members));
            
            // 로그인 정보 저장 (자동 로그인)
            sessionStorage.setItem("memId", formData.id);
            sessionStorage.setItem("memName", formData.name);
            
            alert("회원가입이 완료되었습니다. (로컬 저장)");
            navigate(`/member/${formData.id}`);
        }
    };

    // 취소 핸들러
    const handleCancel = () => {
        if (window.confirm('회원가입을 취소하시겠습니까?')) {
            navigate("/loginform");
        }
    };

    return (
        <div className="member-form-container">
            <div className="member-form-header">
                <h1>회원 가입</h1>
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
                        placeholder="4자 이상 입력하세요"
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
                        placeholder="6자 이상 입력하세요"
                    />
                    {errors.pwd && <div className="invalid-feedback">{errors.pwd}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="pwdConfirm">비밀번호 확인 <span className="required">*</span></label>
                    <input
                        type="password"
                        id="pwdConfirm"
                        name="pwdConfirm"
                        className={`form-control ${errors.pwdConfirm ? 'is-invalid' : ''}`}
                        value={formData.pwdConfirm}
                        onChange={handleChange}
                        placeholder="비밀번호를 다시 입력하세요"
                    />
                    {errors.pwdConfirm && <div className="invalid-feedback">{errors.pwdConfirm}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="name">이름 <span className="required">*</span></label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="이름을 입력하세요"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">이메일 <span className="required">*</span></label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">전화번호</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="010-1234-5678 (선택사항)"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="address">주소</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="주소를 입력하세요 (선택사항, 구글 캘린더 연동 시 사용)"
                    />
                </div>

                {/* 에러 메시지 */}
                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}

                {/* 버튼 */}
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                        취소
                    </button>
                    <button type="submit" className="btn btn-primary">
                        회원가입
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SignUpForm;

