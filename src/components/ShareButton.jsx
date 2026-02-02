import React from 'react';
import { useLocation } from 'react-router-dom';
import { Share2 } from 'lucide-react'; // Import the Share2 icon

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
    <button
      onClick={handleShare}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      aria-label="공유하기"
    >
      <Share2 size={24} />
    </button>
  );
};

export default ShareButton;
