import { useState } from 'react';
import { createBook, createAuthor, createRelationship, importData } from '../../services/api';
import type { RelationType } from '../../types';
import { RELATION_LABELS } from '../../types';
import './BookForm.css';

interface BookFormProps {
  onDataChange: () => void;
}

type FormType = 'book' | 'author' | 'relationship' | 'import';

export function BookForm({ onDataChange }: BookFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState<FormType>('book');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Book form state
  const [bookTitle, setBookTitle] = useState('');
  const [bookYear, setBookYear] = useState('');
  const [bookGenre, setBookGenre] = useState('');
  const [bookDesc, setBookDesc] = useState('');

  // Author form state
  const [authorName, setAuthorName] = useState('');
  const [authorBirth, setAuthorBirth] = useState('');
  const [authorDeath, setAuthorDeath] = useState('');
  const [authorNationality, setAuthorNationality] = useState('');

  // Relationship form state
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('WRITTEN_BY');

  const resetForms = () => {
    setBookTitle('');
    setBookYear('');
    setBookGenre('');
    setBookDesc('');
    setAuthorName('');
    setAuthorBirth('');
    setAuthorDeath('');
    setAuthorNationality('');
    setSourceId('');
    setTargetId('');
    setMessage(null);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBook({
        title: bookTitle,
        publication_year: bookYear ? parseInt(bookYear) : undefined,
        genre: bookGenre || undefined,
        description: bookDesc || undefined,
      });
      setMessage({ type: 'success', text: '책이 추가되었습니다' });
      resetForms();
      onDataChange();
    } catch {
      setMessage({ type: 'error', text: '책 추가에 실패했습니다' });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAuthor({
        name: authorName,
        birth_year: authorBirth ? parseInt(authorBirth) : undefined,
        death_year: authorDeath ? parseInt(authorDeath) : undefined,
        nationality: authorNationality || undefined,
      });
      setMessage({ type: 'success', text: '저자가 추가되었습니다' });
      resetForms();
      onDataChange();
    } catch {
      setMessage({ type: 'error', text: '저자 추가에 실패했습니다' });
    } finally {
      setLoading(false);
    }
  };

  const handleRelationshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRelationship(sourceId, targetId, relationType);
      setMessage({ type: 'success', text: '관계가 추가되었습니다' });
      resetForms();
      onDataChange();
    } catch {
      setMessage({ type: 'error', text: '관계 추가에 실패했습니다' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await importData(file);
      setMessage({
        type: 'success',
        text: `가져오기 완료: 책 ${result.imported.books}개, 저자 ${result.imported.authors}개, 관계 ${result.imported.relationships}개`,
      });
      onDataChange();
    } catch {
      setMessage({ type: 'error', text: '가져오기에 실패했습니다' });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <button className="add-btn" onClick={() => setIsOpen(true)}>
        + 추가
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              &times;
            </button>

            <div className="form-tabs">
              <button
                className={formType === 'book' ? 'active' : ''}
                onClick={() => setFormType('book')}
              >
                책
              </button>
              <button
                className={formType === 'author' ? 'active' : ''}
                onClick={() => setFormType('author')}
              >
                저자
              </button>
              <button
                className={formType === 'relationship' ? 'active' : ''}
                onClick={() => setFormType('relationship')}
              >
                관계
              </button>
              <button
                className={formType === 'import' ? 'active' : ''}
                onClick={() => setFormType('import')}
              >
                가져오기
              </button>
            </div>

            {message && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {formType === 'book' && (
              <form onSubmit={handleBookSubmit}>
                <div className="form-group">
                  <label>제목 *</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>출판년도</label>
                  <input
                    type="number"
                    value={bookYear}
                    onChange={(e) => setBookYear(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>장르</label>
                  <input
                    type="text"
                    value={bookGenre}
                    onChange={(e) => setBookGenre(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>설명</label>
                  <textarea
                    value={bookDesc}
                    onChange={(e) => setBookDesc(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? '추가 중...' : '책 추가'}
                </button>
              </form>
            )}

            {formType === 'author' && (
              <form onSubmit={handleAuthorSubmit}>
                <div className="form-group">
                  <label>이름 *</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>출생년도</label>
                    <input
                      type="number"
                      value={authorBirth}
                      onChange={(e) => setAuthorBirth(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>사망년도</label>
                    <input
                      type="number"
                      value={authorDeath}
                      onChange={(e) => setAuthorDeath(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>국적</label>
                  <input
                    type="text"
                    value={authorNationality}
                    onChange={(e) => setAuthorNationality(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? '추가 중...' : '저자 추가'}
                </button>
              </form>
            )}

            {formType === 'relationship' && (
              <form onSubmit={handleRelationshipSubmit}>
                <div className="form-group">
                  <label>출발 노드 ID *</label>
                  <input
                    type="text"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    placeholder="노드 클릭 시 ID 확인 가능"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>도착 노드 ID *</label>
                  <input
                    type="text"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="노드 클릭 시 ID 확인 가능"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>관계 유형</label>
                  <select
                    value={relationType}
                    onChange={(e) => setRelationType(e.target.value as RelationType)}
                  >
                    {Object.entries(RELATION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? '추가 중...' : '관계 추가'}
                </button>
              </form>
            )}

            {formType === 'import' && (
              <div className="import-section">
                <p>JSON 파일을 업로드하여 데이터를 가져올 수 있습니다.</p>
                <p className="import-hint">
                  형식: {`{ "books": [...], "authors": [...], "relationships": [...] }`}
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
