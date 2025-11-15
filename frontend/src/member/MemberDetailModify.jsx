import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Member.css';

// 회원 정보 수정 컴포넌트
const MemberDetailModify = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        googleEmail: '',
        googleCalendarId: ''
    });
    const [errors, setErrors] = useState({});
    const currentUserId = sessionStorage.getItem('memId');

    useEffect(() => {
        if (id) {
            loadMember();
        } else {
            setLoading(false);
        }
    }, [id]);

    // 회원 정보 로드
    const loadMember = async () => {
        try {
            // 백엔드 API 호출
            const response = await fetch(`http://localhost:8080/member/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.rt === "OK") {
                    const memberData = data.member || {};
                    setMember(memberData);
                    setFormData({
                        name: memberData.name || '',
                        email: memberData.email || '',
                        phone: memberData.phone || '',
                        address: memberData.address || '',
                        googleEmail: memberData.googleEmail || '',
                        googleCalendarId: memberData.googleCalendarId || ''
                    });
                } else {
                    // 로컬 스토리지에서 조회 (테스트용)
                    loadMemberFromLocal();
                }
            } else {
                // 로컬 스토리지에서 조회 (테스트용)
                loadMemberFromLocal();
            }
        } catch (error) {
            // 로컬 스토리지에서 조회 (테스트용)
            loadMemberFromLocal();
        }
        setLoading(false);
    };

    // 로컬 스토리지에서 회원 정보 로드
    const loadMemberFromLocal = () => {
        const members = JSON.parse(localStorage.getItem('planit_members') || '[]');
        const foundMember = members.find(m => m.id === id);
        
        if (foundMember) {
            const { pwd, ...memberInfo } = foundMember;
            setMember(memberInfo);
            setFormData({
                name: memberInfo.name || '',
                email: memberInfo.email || '',
                phone: memberInfo.phone || '',
                address: memberInfo.address || '',
                googleEmail: memberInfo.googleEmail || '',
                googleCalendarId: memberInfo.googleCalendarId || ''
            });
        } else {
            alert('회원 정보를 찾을 수 없습니다.');
            navigate(-1);
        }
    };

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

        if (!formData.name.trim()) {
            newErrors.name = "이름을 입력해주세요.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "이메일을 입력해주세요.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "올바른 이메일 형식이 아닙니다.";
        }

        if (formData.phone && !/^[0-9-]+$/.test(formData.phone)) {
            newErrors.phone = "올바른 전화번호 형식이 아닙니다.";
        }

        if (formData.googleEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.googleEmail)) {
            newErrors.googleEmail = "올바른 이메일 형식이 아닙니다.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 정보 저장
    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        try {
            const updatedMember = {
                ...member,
                ...formData
            };

            // 백엔드 API 호출
            const response = await fetch(`http://localhost:8080/member/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedMember)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.rt === "OK") {
                    alert('정보가 저장되었습니다.');
                    navigate(`/member/${id}`);
                } else {
                    // 로컬 스토리지에 저장
                    saveToLocalStorage(updatedMember);
                }
            } else {
                // 로컬 스토리지에 저장
                saveToLocalStorage(updatedMember);
            }
        } catch (error) {
            // 로컬 스토리지에 저장
            const updatedMember = {
                ...member,
                ...formData
            };
            saveToLocalStorage(updatedMember);
        }
    };

    // 로컬 스토리지에 저장
    const saveToLocalStorage = (updatedMember) => {
        const members = JSON.parse(localStorage.getItem('planit_members') || '[]');
        const index = members.findIndex(m => m.id === id);
        if (index !== -1) {
            members[index] = { ...members[index], ...updatedMember };
            localStorage.setItem('planit_members', JSON.stringify(members));
            alert('정보가 저장되었습니다. (로컬 저장)');
            navigate(`/member/${id}`);
        }
    };

    // 취소 핸들러
    const handleCancel = () => {
        if (window.confirm('수정을 취소하시겠습니까?')) {
            navigate(`/member/${id}`);
        }
    };

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (!member) {
        return <div className="no-data">회원 정보를 찾을 수 없습니다.</div>;
    }

    // 현재 로그인한 사용자와 조회하는 회원이 같은지 확인
    const isOwnProfile = currentUserId === member.id;

    if (!isOwnProfile) {
        alert('본인의 정보만 수정할 수 있습니다.');
        navigate(`/member/${id}`);
        return null;
    }

    return (
        <div className="member-form-container">
            <div className="member-form-header">
                <h1>회원 정보 수정</h1>
            </div>

            <form className="member-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                {/* 기본 정보 */}
                <div className="form-section">
                    <h3>기본 정보</h3>
                    
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
                            placeholder="이메일을 입력하세요"
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
                            placeholder="010-1234-5678"
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
                            placeholder="주소를 입력하세요 (구글 캘린더 연동 시 사용)"
                        />
                        <small className="form-text text-muted">
                            구글 캘린더 이벤트 생성 시 위치 정보로 사용됩니다.
                        </small>
                    </div>
                </div>

                {/* 구글 캘린더 연동 */}
                <div className="form-section">
                    <h3>구글 캘린더 연동</h3>
                    
                    <div className="form-group">
                        <label htmlFor="googleEmail">구글 이메일</label>
                        <input
                            type="email"
                            id="googleEmail"
                            name="googleEmail"
                            className={`form-control ${errors.googleEmail ? 'is-invalid' : ''}`}
                            value={formData.googleEmail}
                            onChange={handleChange}
                            placeholder="구글 계정 이메일"
                        />
                        {errors.googleEmail && <div className="invalid-feedback">{errors.googleEmail}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="googleCalendarId">구글 캘린더 ID (선택사항)</label>
                        <input
                            type="text"
                            id="googleCalendarId"
                            name="googleCalendarId"
                            className="form-control"
                            value={formData.googleCalendarId}
                            onChange={handleChange}
                            placeholder="primary 또는 특정 캘린더 ID"
                        />
                        <small className="form-text text-muted">
                            기본 캘린더는 "primary"를 사용하거나 비워두세요.
                        </small>
                    </div>
                </div>

                {/* 버튼 */}
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                        취소
                    </button>
                    <button type="submit" className="btn btn-primary">
                        저장
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MemberDetailModify;

