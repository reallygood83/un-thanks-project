import React from 'react';
import './ResultsChart.css';

type ChartDataItem = {
  name: string;
  value: number;
};

interface BarChartProps {
  data: ChartDataItem[];
  title: string;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({ data, title }) => {
  // 최대값 찾기 (막대 너비 계산용)
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="simple-bar-chart">
        {data.map((item, index) => (
          <div className="chart-row" key={index}>
            <div className="chart-label">{item.name}</div>
            <div className="chart-value-container">
              <div 
                className="chart-value-bar" 
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
              <span className="chart-value-label">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PieChartProps {
  data: ChartDataItem[];
  title: string;
}

export const SimplePieChart: React.FC<PieChartProps> = ({ data, title }) => {
  // 총합 계산
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="simple-pie-chart">
        <div className="pie-chart-legend">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div className="legend-item" key={index}>
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: getColorByIndex(index) }}
                />
                <div className="legend-text">
                  {item.name}: {percentage.toFixed(1)}% ({item.value}명)
                </div>
              </div>
            );
          })}
        </div>
        <div className="pie-chart-visualization">
          {/* 원형 차트 대신 간단한 텍스트 표현 */}
          <div className="pie-chart-simple">
            <div className="total-value">{total}</div>
            <div className="total-label">총 응답</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScaleChartProps {
  data: {
    value: number;
    count: number;
  }[];
  average: number;
  title: string;
}

export const ScaleDistributionChart: React.FC<ScaleChartProps> = ({ data, average, title }) => {
  // 최대값 찾기 (막대 너비 계산용)
  const maxCount = Math.max(...data.map(item => item.count), 1);
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="average-display">
        <span>평균 점수: </span>
        <span className="average-value">{average.toFixed(1)}</span>
        <span> / 10</span>
      </div>
      <div className="simple-bar-chart scale-chart">
        {data.map((item, index) => (
          <div className="chart-row" key={index}>
            <div className="chart-label">{item.value}점</div>
            <div className="chart-value-container">
              <div 
                className="chart-value-bar" 
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
              <span className="chart-value-label">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TextResponsesProps {
  responses: string[];
  title: string;
}

export const TextResponses: React.FC<TextResponsesProps> = ({ responses, title }) => {
  // 응답이 없는 경우
  if (!responses || responses.length === 0) {
    return (
      <div className="text-responses-container">
        <h3 className="chart-title">{title}</h3>
        <p className="no-responses">응답이 없습니다.</p>
      </div>
    );
  }
  
  return (
    <div className="text-responses-container">
      <h3 className="chart-title">{title}</h3>
      <div className="responses-list">
        {responses.map((response, index) => (
          <div key={index} className="response-item">
            <div className="response-number">#{index + 1}</div>
            <div className="response-text">{response}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// AI 분석 결과를 표시하는 컴포넌트
interface AiAnalysisProps {
  analysis: string;
}

export const AiAnalysisView: React.FC<AiAnalysisProps> = ({ analysis }) => {
  return (
    <div className="ai-analysis-container">
      <h3 className="analysis-title">
        <span className="ai-icon">🤖</span> AI 분석 결과
      </h3>
      <div className="analysis-content">
        {analysis}
      </div>
    </div>
  );
};

// 색상 생성 함수
function getColorByIndex(index: number): string {
  const colors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', 
    '#a4de6c', '#d0ed57'
  ];
  
  return colors[index % colors.length];
}