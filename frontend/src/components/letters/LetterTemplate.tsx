import React from 'react';
import { format } from 'date-fns';
import './LetterTemplate.css';

interface LetterTemplateProps {
  countryId: string;
  countryName: string;
  flagCode: string;
  letterContent: string;
  writerName: string;
  writerSchool?: string;
  writerGrade?: string;
  createdAt: Date;
}

const LetterTemplate: React.FC<LetterTemplateProps> = ({
  countryId,
  countryName,
  flagCode,
  letterContent,
  writerName,
  writerSchool,
  writerGrade,
  createdAt,
}) => {
  // 국기 URL 생성
  const flagUrl = `https://flagcdn.com/w160/${flagCode.toLowerCase()}.png`;
  const formattedDate = format(new Date(createdAt), 'yyyy년 MM월 dd일');
  
  return (
    <div className="letter-template">
      <div className="letter-template-paper">
        <div className="letter-template-content">
          <div className="letter-header">
            <img 
              src={flagUrl} 
              alt={`${countryName} flag`} 
              className="country-flag" 
            />
            <h2>{countryName}에 보내는 감사 편지</h2>
            <div className="letter-date">{formattedDate}</div>
          </div>
          
          <div className="letter-body">
            {letterContent}
          </div>
          
          <div className="letter-signature">
            <p className="writer-name">{writerName}</p>
            {(writerSchool || writerGrade) && (
              <p className="writer-school">
                {writerSchool}{writerSchool && writerGrade ? ', ' : ''}{writerGrade}
              </p>
            )}
          </div>
        </div>
        
        <div className="letter-stamp"></div>
        
        <div className="letter-footer">
          <span>6.25 UN 참전국 감사 편지 프로젝트</span>
        </div>
      </div>
    </div>
  );
};

export default LetterTemplate;