/**
 * 시작 시간(HH:mm)을 받아 무조건 '2시간 뒤'의 최종 귀가 시간을 계산합니다.
 * @param {string} startTime - "HH:mm" 형식의 시작 시간
 * @returns {string} "HH:mm" 형식의 2시간 뒤 종료 시간
 */
export const calculateEndTime = (startTime) => {
  if (!startTime) return '';
  
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const endHours = (hours + 2) % 24;
  
  const formattedHours = String(endHours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0'); // 분은 그대로
  
  return `${formattedHours}:${formattedMinutes}`;
};
