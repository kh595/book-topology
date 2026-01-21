import './GraphSettings.css';

export interface GraphSettingsValues {
  linkWidth: number;
  linkOpacity: number;
  nodeSpread: number;
}

interface GraphSettingsProps {
  settings: GraphSettingsValues;
  onChange: (settings: GraphSettingsValues) => void;
}

export function GraphSettings({ settings, onChange }: GraphSettingsProps) {
  const handleChange = (key: keyof GraphSettingsValues, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="graph-settings">
      <h3>그래프 설정</h3>

      <div className="setting-item">
        <label>
          <span className="setting-label">링크 굵기</span>
          <span className="setting-value">{settings.linkWidth.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={settings.linkWidth}
          onChange={(e) => handleChange('linkWidth', parseFloat(e.target.value))}
        />
      </div>

      <div className="setting-item">
        <label>
          <span className="setting-label">링크 투명도</span>
          <span className="setting-value">{Math.round(settings.linkOpacity * 100)}%</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={settings.linkOpacity}
          onChange={(e) => handleChange('linkOpacity', parseFloat(e.target.value))}
        />
      </div>

      <div className="setting-item">
        <label>
          <span className="setting-label">노드 간격</span>
          <span className="setting-value">{settings.nodeSpread}</span>
        </label>
        <input
          type="range"
          min="50"
          max="400"
          step="25"
          value={settings.nodeSpread}
          onChange={(e) => handleChange('nodeSpread', parseInt(e.target.value))}
        />
      </div>
    </div>
  );
}
