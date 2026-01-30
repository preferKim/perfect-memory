import React from 'react';
import { useLocation } from 'react-router-dom';

const ShareButton = () => {
  const location = useLocation();

  const handleShare = async () => {
    const currentUrl = window.location.origin + location.pathname;
    const pageTitle = document.title || 'Perfect Memory';

    if (navigator.share) {
      // Web Share API 지원 시 (모바일 환경 등)
      try {
        await navigator.share({
          title: pageTitle,
          text: `이 내용을 확인해보세요: ${pageTitle}`,
          url: currentUrl,
        });
        console.log('성공적으로 공유되었습니다.');
      } catch (error) {
        console.error('공유에 실패했습니다:', error);
      }
    } else {
      // Web Share API 미지원 시 (PC 환경 등) -> 클립보드에 복사
      try {
        await navigator.clipboard.writeText(currentUrl);
        alert('링크가 클립보드에 복사되었습니다!');
      } catch (error) {
        console.error('클립보드 복사에 실패했습니다:', error);
        alert('링크를 복사하는 데 실패했습니다.');
      }
    }
  };

  return (
    <button onClick={handleShare} style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '10px 15px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px'
    }}>
      공유하기
    </button>
  );
};

export default ShareButton;
