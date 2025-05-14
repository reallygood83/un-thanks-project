import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import './ResultsChart.css';

// 색상 팔레트
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

type ChartDataItem = {
  name: string;
  value: number;
};

interface BarChartProps {
  data: ChartDataItem[];
  title: string;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({ data, title }) => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#0078FF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PieChartProps {
  data: ChartDataItem[];
  title: string;
}

export const SimplePieChart: React.FC<PieChartProps> = ({ data, title }) => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
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
  // 데이터 변환 - Bar차트 형식으로
  const formattedData = data.map(item => ({
    name: `${item.value}점`,
    value: item.count
  }));
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="average-display">
        <span>평균 점수: </span>
        <span className="average-value">{average.toFixed(1)}</span>
        <span> / 10</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#0078FF" />
        </BarChart>
      </ResponsiveContainer>
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