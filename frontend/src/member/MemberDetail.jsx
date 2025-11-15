import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Member.css';

// 회원 상세 보기 컴포넌트
const MemberDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
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
            // 비밀번호는 제외하고 표시
            const { pwd, ...memberInfo } = foundMember;
            setMember(memberInfo);
        } else {
            alert('회원 정보를 찾을 수 없습니다.');
            navigate(-1);
        }
    };

    // 수정 페이지로 이동
    const handleEdit = () => {
        navigate(`/member/edit/${id}`);
    };

    // 회원 정보 삭제
    const handleDelete = () => {
        if (window.confirm('정말 회원 정보를 삭제하시겠습니까?')) {
            try {
                fetch(`http://localhost:8080/member/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }).then(() => {
                    // 로컬 스토리지에서도 삭제
                    const members = JSON.parse(localStorage.getItem('planit_members') || '[]');
                    const filteredMembers = members.filter(m => m.id !== id);
                    localStorage.setItem('planit_members', JSON.stringify(filteredMembers));
                    
                    alert('회원 정보가 삭제되었습니다.');
                    navigate('/dashboard');
                });
            } catch (error) {
                // 로컬 스토리지에서 삭제
                const members = JSON.parse(localStorage.getItem('planit_members') || '[]');
                const filteredMembers = members.filter(m => m.id !== id);
                localStorage.setItem('planit_members', JSON.stringify(filteredMembers));
                
                alert('회원 정보가 삭제되었습니다.');
                navigate('/dashboard');
            }
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

    return (
        <div className="member-detail-container">
            <div className="member-detail-header">
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    ← 뒤로가기
                </button>
                {isOwnProfile && (
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={handleEdit}>
                            수정
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}>
                            삭제
                        </button>
                    </div>
                )}
            </div>

            <div className="member-detail-content">
                {/* 프로필 섹션 */}
                <div className="member-profile-section">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            {member.name ? member.name.charAt(0) : member.id.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <h2 className="member-name">{member.name || member.id}</h2>
                </div>

                {/* 기본 정보 */}
                <div className="member-info-section">
                    <h3>기본 정보</h3>
                    <div className="info-item">
                        <span className="info-label">아이디:</span>
                        <span className="info-value">{member.id}</span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">이름:</span>
                        <span className="info-value">{member.name || '-'}</span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">이메일:</span>
                        <span className="info-value">{member.email || '-'}</span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">전화번호:</span>
                        <span className="info-value">{member.phone || '-'}</span>
                    </div>

                    {member.address && (
                        <div className="info-item">
                            <span className="info-label">주소:</span>
                            <span className="info-value">{member.address}</span>
                        </div>
                    )}
                </div>

                {/* 캘린더 연동 섹션 */}
                {isOwnProfile && (
                    <div className="calendar-integration-section">
                        <h3>캘린더 연동</h3>
                        
                        {/* 구글 캘린더 연동 */}
                        <div className="integration-item">
                            <div className="integration-header">
                                <div className="integration-title">
                                    <span className="integration-icon">📅</span>
                                    <span>구글 캘린더</span>
                                    {member.googleEmail && (
                                        <span className="connected-badge">연동됨</span>
                                    )}
                                </div>
                            </div>
                            <div className="integration-info">
                                {member.googleEmail ? (
                                    <>
                                        <div className="info-row">
                                            <span className="info-label">이메일:</span>
                                            <span className="info-value">{member.googleEmail}</span>
                                        </div>
                                        {member.googleCalendarId && (
                                            <div className="info-row">
                                                <span className="info-label">캘린더 ID:</span>
                                                <span className="info-value">{member.googleCalendarId}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="no-integration">구글 캘린더가 연동되지 않았습니다.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 메타 정보 */}
                <div className="member-meta-section">
                    {member.createdAt && (
                        <div className="meta-item">
                            <span className="meta-label">가입일:</span>
                            <span className="meta-value">
                                {new Date(member.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberDetail;

