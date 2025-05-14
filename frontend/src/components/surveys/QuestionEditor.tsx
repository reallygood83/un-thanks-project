import React, { useState } from 'react';
import { Question, QuestionType } from '../../types/survey';
import './QuestionEditor.css';

// 유니크 ID 생성 함수
const generateId = (): string => {
  return 'q_' + Math.random().toString(36).substr(2, 9);
};

interface QuestionEditorProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
  index: number;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  onDelete,
  index
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onUpdate({
      ...question,
      text: e.target.value
    });
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as QuestionType;
    
    // 질문 유형이 변경될 때 기본값 설정
    const updatedQuestion: Question = {
      ...question,
      type: newType,
    };
    
    // 객관식으로 변경되는 경우 기본 옵션 추가
    if (newType === 'multipleChoice' && (!question.options || question.options.length === 0)) {
      updatedQuestion.options = ['옵션 1', '옵션 2'];
    }
    
    onUpdate(updatedQuestion);
  };
  
  const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      required: e.target.checked
    });
  };
  
  const handleOptionChange = (index: number, value: string) => {
    if (!question.options) return;
    
    const updatedOptions = [...question.options];
    updatedOptions[index] = value;
    
    onUpdate({
      ...question,
      options: updatedOptions
    });
  };
  
  const addOption = () => {
    if (!question.options) return;
    
    onUpdate({
      ...question,
      options: [...question.options, `옵션 ${question.options.length + 1}`]
    });
  };
  
  const removeOption = (index: number) => {
    if (!question.options || question.options.length <= 2) return;
    
    const updatedOptions = question.options.filter((_, i) => i !== index);
    
    onUpdate({
      ...question,
      options: updatedOptions
    });
  };
  
  const moveOption = (index: number, direction: 'up' | 'down') => {
    if (!question.options) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // 이동이 가능한지 확인
    if (newIndex < 0 || newIndex >= question.options.length) return;
    
    const updatedOptions = [...question.options];
    const temp = updatedOptions[index];
    updatedOptions[index] = updatedOptions[newIndex];
    updatedOptions[newIndex] = temp;
    
    onUpdate({
      ...question,
      options: updatedOptions
    });
  };

  return (
    <div className="question-editor">
      <div className="question-editor-header">
        <div className="question-number">질문 {index + 1}</div>
        <div className="question-actions">
          <button
            type="button"
            className="toggle-expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '접기' : '펼치기'}
          </button>
          <button
            type="button"
            className="delete-question-button"
            onClick={onDelete}
          >
            삭제
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="question-editor-content">
          <div className="form-group">
            <label htmlFor={`question-${question.id}-text`}>질문</label>
            <textarea
              id={`question-${question.id}-text`}
              value={question.text}
              onChange={handleTextChange}
              placeholder="질문을 입력하세요"
              rows={2}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`question-${question.id}-type`}>질문 유형</label>
              <select
                id={`question-${question.id}-type`}
                value={question.type}
                onChange={handleTypeChange}
              >
                <option value="text">주관식 (서술형)</option>
                <option value="multipleChoice">객관식</option>
                <option value="scale">척도형 (1-10)</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={handleRequiredChange}
                />
                필수 응답
              </label>
            </div>
          </div>
          
          {question.type === 'multipleChoice' && question.options && (
            <div className="options-editor">
              <label>응답 옵션</label>
              
              <div className="options-list">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-item">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                      placeholder={`옵션 ${optionIndex + 1}`}
                    />
                    <div className="option-actions">
                      {question.options && question.options.length > 2 && (
                        <button
                          type="button"
                          className="remove-option-button"
                          onClick={() => removeOption(optionIndex)}
                        >
                          ✕
                        </button>
                      )}
                      
                      <button
                        type="button"
                        className="move-option-button"
                        onClick={() => moveOption(optionIndex, 'up')}
                        disabled={optionIndex === 0}
                      >
                        ↑
                      </button>
                      
                      <button
                        type="button"
                        className="move-option-button"
                        onClick={() => moveOption(optionIndex, 'down')}
                        disabled={optionIndex === (question.options?.length || 0) - 1}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                className="add-option-button"
                onClick={addOption}
              >
                + 옵션 추가
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface QuestionListEditorProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

const QuestionListEditor: React.FC<QuestionListEditorProps> = ({
  questions,
  onChange
}) => {
  const addQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      text: '',
      type: 'text',
      required: true
    };
    
    onChange([...questions, newQuestion]);
  };
  
  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    onChange(updatedQuestions);
  };
  
  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onChange(updatedQuestions);
  };

  return (
    <div className="question-list-editor">
      {questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
          onDelete={() => deleteQuestion(index)}
          index={index}
        />
      ))}
      
      <button
        type="button"
        className="add-question-button"
        onClick={addQuestion}
      >
        + 새 질문 추가
      </button>
    </div>
  );
};

export default QuestionListEditor;