import { useState, useEffect } from 'react';
import { FOOD_ITEMS_PACKAGING, PACKAGING_MATERIALS, STORAGE_CONDITIONS, TRANSPORT_MODES } from '../data/packagingData';
import {
  getRecommendations,
  analyzeExistingPackaging,
  whatIfSimulation,
  getMAPRecommendation,
  getFoodById,
} from '../utils/packagingEngine';
import {
  Package, Leaf, Zap, DollarSign, BarChart3, RefreshCw,
  Stethoscope, Layers, Wind, FileText, ChevronRight, ChevronLeft,
  CheckCircle, AlertTriangle, Info, ArrowRight, Search, X
} from 'lucide-react';
import './PackagingAdvisor.css';

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const SHELF_LIFE_OPTIONS = [
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '15 days', value: 15 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
  { label: '365 days', value: 365 },
];

const STEPS = [
  { id: 1, label: 'Food',      icon: '🥫' },
  { id: 2, label: 'Conditions',icon: '⚙️' },
  { id: 3, label: 'Analysis',  icon: '🤖' },
  { id: 4, label: 'Report',    icon: '📋' },
];

// ─────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function StepIndicator({ currentStep }) {
  return (
    <div className="pkg-step-indicator">
      {STEPS.map((s, idx) => (
        <div key={s.id} className="pkg-step-item">
          <div className={`pkg-step-circle ${currentStep >= s.id ? 'active' : ''} ${currentStep === s.id ? 'current' : ''}`}>
            {currentStep > s.id ? <CheckCircle size={16} /> : <span>{s.icon}</span>}
          </div>
          <span className={`pkg-step-label ${currentStep >= s.id ? 'active' : ''}`}>{s.label}</span>
          {idx < STEPS.length - 1 && (
            <div className={`pkg-step-connector ${currentStep > s.id ? 'active' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ score, color }) {
  return (
    <div className="pkg-score-bar-bg">
      <div
        className="pkg-score-bar-fill"
        style={{ width: `${score}%`, background: color || '#06B6D4' }}
      />
      <span className="pkg-score-bar-label">{score}%</span>
    </div>
  );
}

function LayerDiagram({ layers }) {
  return (
    <div className="pkg-layer-diagram">
      <div className="pkg-layer-label-top">↑ External Environment</div>
      {layers.map((layer, idx) => (
        <div
          key={idx}
          className="pkg-layer"
          style={{ background: layer.color + '33', borderLeft: `4px solid ${layer.color}` }}
        >
          <div className="pkg-layer-name">{layer.name}</div>
          <div className="pkg-layer-purpose">{layer.purpose}</div>
        </div>
      ))}
      <div className="pkg-layer-label-bottom">↓ Food Contact</div>
    </div>
  );
}

function RiskRadarBar({ label, value, color }) {
  return (
    <div className="pkg-risk-bar-row">
      <span className="pkg-risk-bar-label">{label}</span>
      <div className="pkg-risk-bar-track">
        <div className="pkg-risk-bar-fill" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <span className="pkg-risk-bar-pct">{Math.round(value * 100)}%</span>
    </div>
  );
}

function SpecCard({ label, value, icon, description }) {
  return (
    <div className="pkg-spec-card">
      <div className="pkg-spec-icon">{icon}</div>
      <div className="pkg-spec-label">{label}</div>
      <div className="pkg-spec-value">{value}</div>
      {description && <div className="pkg-spec-desc">{description}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  STEP 1 — FOOD SELECTION
// ─────────────────────────────────────────────────────────────
function FoodSelectionStep({ onSelect, selected }) {
  const [search, setSearch] = useState('');
  const filtered = FOOD_ITEMS_PACKAGING.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(FOOD_ITEMS_PACKAGING.map(f => f.category))];

  return (
    <div className="pkg-step-content">
      <h2 className="pkg-step-title">Select Food Commodity</h2>
      <p className="pkg-step-subtitle">Choose the food product you want to find packaging for</p>

      <div className="pkg-search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search food items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch('')}><X size={14} /></button>}
      </div>

      <div className="pkg-food-grid">
        {filtered.map(food => (
          <button
            key={food.id}
            className={`pkg-food-card ${selected?.id === food.id ? 'selected' : ''}`}
            onClick={() => onSelect(food)}
          >
            <span className="pkg-food-emoji">{food.emoji}</span>
            <span className="pkg-food-name">{food.name}</span>
            <span className="pkg-food-category">{food.category.replace(/-/g, ' ')}</span>
            {food.isLivingProduce && (
              <span className="pkg-fresh-badge">🌱 Fresh</span>
            )}
            {selected?.id === food.id && (
              <div className="pkg-food-selected-tick">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  STEP 2 — CONDITIONS
// ─────────────────────────────────────────────────────────────
function ConditionsStep({ food, conditions, onChange }) {
  return (
    <div className="pkg-step-content">
      <h2 className="pkg-step-title">Storage & Transport Conditions</h2>
      <p className="pkg-step-subtitle">
        Packaging for <strong>{food.emoji} {food.name}</strong> — tell us how it will be stored and shipped
      </p>

      {/* Food properties display */}
      <div className="pkg-food-props">
        <h3>📊 Food Properties (from database)</h3>
        <div className="pkg-props-grid">
          <div className="pkg-prop"><span>Moisture Content</span><strong>{food.moistureContent}%</strong></div>
          <div className="pkg-prop"><span>Water Activity</span><strong>{food.waterActivity}</strong></div>
          <div className="pkg-prop"><span>Oil/Fat Content</span><strong>{food.oilContent}%</strong></div>
          <div className="pkg-prop"><span>pH Level</span><strong>{food.pH}</strong></div>
          <div className="pkg-prop"><span>Respiration Rate</span>
            <strong className={`pkg-resp-${food.respirationRate}`}>
              {food.respirationRate === 'none' ? '—' : food.respirationRate.toUpperCase()}
            </strong>
          </div>
          <div className="pkg-prop"><span>Living Produce?</span>
            <strong>{food.isLivingProduce ? '🌱 Yes' : '❌ No'}</strong>
          </div>
        </div>
        <div className="pkg-prop-risks">
          <span>Main Risks: </span>
          {food.mainRisks.map(r => (
            <span key={r} className="pkg-risk-tag">{r}</span>
          ))}
        </div>
        <p className="pkg-food-desc">{food.description}</p>
      </div>

      {/* Storage */}
      <div className="pkg-condition-group">
        <h3>🌡️ Storage Condition</h3>
        <div className="pkg-option-row">
          {STORAGE_CONDITIONS.map(sc => (
            <button
              key={sc.id}
              className={`pkg-option-btn ${conditions.storage === sc.id ? 'selected' : ''}`}
              onClick={() => onChange({ ...conditions, storage: sc.id })}
            >
              <span className="pkg-opt-emoji">{sc.emoji}</span>
              <span className="pkg-opt-name">{sc.name}</span>
              <span className="pkg-opt-desc">{sc.tempRange}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shelf Life */}
      <div className="pkg-condition-group">
        <h3>📅 Target Shelf Life</h3>
        <div className="pkg-option-row pkg-shelf-row">
          {SHELF_LIFE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`pkg-shelf-btn ${conditions.shelfLife === opt.value ? 'selected' : ''}`}
              onClick={() => onChange({ ...conditions, shelfLife: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transport */}
      <div className="pkg-condition-group">
        <h3>🚚 Transport Mode</h3>
        <div className="pkg-option-row">
          {TRANSPORT_MODES.map(tm => (
            <button
              key={tm.id}
              className={`pkg-option-btn ${conditions.transport === tm.id ? 'selected' : ''}`}
              onClick={() => onChange({ ...conditions, transport: tm.id })}
            >
              <span className="pkg-opt-emoji">{tm.emoji}</span>
              <span className="pkg-opt-name">{tm.name}</span>
              <span className="pkg-opt-desc">{tm.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="pkg-condition-group">
        <h3>⚖️ Quantity (for cost estimate)</h3>
        <div className="pkg-quantity-row">
          <input
            type="number"
            value={conditions.quantity}
            min={1}
            max={100000}
            onChange={e => onChange({ ...conditions, quantity: Number(e.target.value) })}
          />
          <span>kg</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  STEP 3 — AI ANALYSIS LOADER
// ─────────────────────────────────────────────────────────────
function AnalysisStep({ food, conditions, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentMsg, setCurrentMsg] = useState('');

  const messages = [
    'Analysing food properties...',
    'Evaluating moisture requirements...',
    'Checking oxygen transmission needs...',
    'Assessing mechanical strength...',
    food.isLivingProduce ? 'Measuring respiration rate impact...' : 'Checking barrier specifications...',
    'Scoring packaging materials...',
    'Generating recommendations...',
    'Calculating costs & sustainability...',
  ];

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min(100, Math.round((step / messages.length) * 100)));
      setCurrentMsg(messages[Math.min(step - 1, messages.length - 1)]);
      if (step >= messages.length) {
        clearInterval(interval);
        setTimeout(onComplete, 600);
      }
    }, 350);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pkg-analysis-step">
      <div className="pkg-analysis-icon">🤖</div>
      <h2>AI Analysis in Progress</h2>
      <p>Analysing packaging requirements for <strong>{food.emoji} {food.name}</strong></p>
      <div className="pkg-progress-bar-bg">
        <div className="pkg-progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="pkg-analysis-msg">{currentMsg}</p>
      <p className="pkg-progress-pct">{progress}%</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  STEP 4 — FULL REPORT
// ─────────────────────────────────────────────────────────────
function ReportStep({ food, conditions, recommendations }) {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [whatIfConds, setWhatIfConds] = useState({ ...conditions });
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [doctorMaterial, setDoctorMaterial] = useState('');
  const [doctorResult, setDoctorResult] = useState(null);

  const riskProfile = recommendations[0]?.riskProfile || {};
  const mapRec = getMAPRecommendation(food);

  const TABS = [
    { id: 'recommendations', label: 'Recommendations', icon: <Package size={16} /> },
    { id: 'specs',           label: 'Specifications',  icon: <Zap size={16} /> },
    { id: 'layers',          label: 'Layer View',      icon: <Layers size={16} /> },
    { id: 'cost',            label: 'Cost',            icon: <DollarSign size={16} /> },
    { id: 'sustainability',  label: 'Sustainability',  icon: <Leaf size={16} /> },
    { id: 'whatif',          label: 'What-If',         icon: <RefreshCw size={16} /> },
    { id: 'doctor',          label: 'Pkg Doctor',      icon: <Stethoscope size={16} /> },
    ...(mapRec ? [{ id: 'map', label: 'MAP Gas', icon: <Wind size={16} /> }] : []),
  ];

  function runWhatIf() {
    const result = whatIfSimulation(conditions, whatIfConds);
    setWhatIfResult(result);
  }

  function runDoctor() {
    if (!doctorMaterial) return;
    const result = analyzeExistingPackaging(
      doctorMaterial,
      food,
      conditions.storage,
      conditions.shelfLife,
      conditions.transport
    );
    setDoctorResult(result);
  }

  const rankColors = ['#F59E0B', '#94A3B8', '#D97706'];

  return (
    <div className="pkg-report">
      {/* Header Summary */}
      <div className="pkg-report-header">
        <div className="pkg-report-food">
          <span className="pkg-report-emoji">{food.emoji}</span>
          <div>
            <h2>{food.name}</h2>
            <p>{conditions.storage} storage · {conditions.shelfLife} days · {conditions.transport} transport</p>
          </div>
        </div>
        <div className="pkg-top-rec-badge">
          🏆 {recommendations[0]?.material.name}
        </div>
      </div>

      {/* Risk Profile Summary */}
      <div className="pkg-risk-section">
        <h3>🎯 Food Risk Profile</h3>
        <div className="pkg-risk-bars">
          <RiskRadarBar label="Moisture Risk" value={riskProfile.moisture || 0} color="#3B82F6" />
          <RiskRadarBar label="Oxygen Risk" value={riskProfile.oxygen || 0} color="#EF4444" />
          <RiskRadarBar label="Breathability Need" value={riskProfile.breathability || 0} color="#22C55E" />
          <RiskRadarBar label="Mechanical Stress" value={riskProfile.mechanical || 0} color="#F59E0B" />
          <RiskRadarBar label="Light Sensitivity" value={riskProfile.light || 0} color="#8B5CF6" />
        </div>
      </div>

      {/* Tabs */}
      <div className="pkg-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`pkg-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="pkg-tab-content">
        {/* ── RECOMMENDATIONS TAB ── */}
        {activeTab === 'recommendations' && (
          <div className="pkg-recommendations">
            {recommendations.map((rec, idx) => (
              <div key={rec.material.id} className="pkg-rec-card">
                <div className="pkg-rec-header" style={{ borderColor: rankColors[idx] }}>
                  <div className="pkg-rec-rank" style={{ background: rankColors[idx] }}>
                    {rec.rankLabel}
                  </div>
                  <div className="pkg-rec-title">
                    <span className="pkg-rec-emoji">{rec.material.emoji}</span>
                    <h3>{rec.material.name}</h3>
                    <span className="pkg-rec-short">({rec.material.shortName})</span>
                  </div>
                  <div className="pkg-rec-score-wrap">
                    <span className="pkg-rec-score-label">Match Score</span>
                    <ScoreBar score={rec.score} color={rankColors[idx]} />
                  </div>
                </div>

                <div className="pkg-rec-body">
                  {/* Pros & Why */}
                  <div className="pkg-rec-section">
                    <h4>Why this packaging?</h4>
                    <ul className="pkg-reasons-list">
                      {rec.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>

                  {/* Shelf Life */}
                  <div className="pkg-rec-section">
                    <h4>📅 Shelf Life Prediction</h4>
                    <div className={`pkg-shelf-prediction ${rec.shelfLife.meetsTarget ? 'good' : 'warn'}`}>
                      <span>~{rec.shelfLife.predictedDays} days estimated</span>
                      <span className="pkg-shelf-note">{rec.shelfLife.note}</span>
                    </div>
                  </div>

                  {/* Key Stats row */}
                  <div className="pkg-rec-stats">
                    <div className="pkg-stat"><span>OTR</span><strong>{rec.material.specs.otr}</strong></div>
                    <div className="pkg-stat"><span>WVTR</span><strong>{rec.material.specs.wvtr}</strong></div>
                    <div className="pkg-stat"><span>Thickness</span><strong>{rec.material.specs.thickness}</strong></div>
                    <div className="pkg-stat"><span>Seal</span><strong>{rec.material.specs.sealability}</strong></div>
                    <div className="pkg-stat"><span>MAP</span><strong>{rec.material.specs.mapSuitability ? '✅ Yes' : '❌ No'}</strong></div>
                    <div className="pkg-stat">
                      <span>Cost/m²</span>
                      <strong>₹{rec.material.costPerSqm}</strong>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="pkg-pros-cons">
                    <div className="pkg-pros">
                      <h5>✅ Advantages</h5>
                      <ul>{rec.material.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    </div>
                    <div className="pkg-cons">
                      <h5>⚠️ Limitations</h5>
                      <ul>{rec.material.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SPECIFICATIONS TAB ── */}
        {activeTab === 'specs' && (
          <div className="pkg-specs-tab">
            <h3>🔬 Packaging Specification Requirements</h3>
            <p className="pkg-specs-intro">Based on your food properties, here are the technical specifications your packaging MUST meet:</p>

            <div className="pkg-spec-cards-grid">
              <SpecCard
                label="OTR Required"
                value={food.isLivingProduce
                  ? `${food.respirationRate === 'high' ? '3000–15000' : '500–3000'} cc/m²/day`
                  : riskProfile.oxygen > 0.6 ? '< 10 cc/m²/day' : '< 150 cc/m²/day'
                }
                icon="🌬️"
                description="Oxygen Transmission Rate — controls O₂ entry into the package"
              />
              <SpecCard
                label="WVTR Required"
                value={food.moistureContent > 80
                  ? '5–20 g/m²/day (moderate breathability)'
                  : food.waterActivity < 0.4 ? '< 0.5 g/m²/day (very tight)'
                  : '< 5 g/m²/day (high barrier)'}
                icon="💧"
                description="Water Vapour Transmission Rate — controls moisture movement"
              />
              <SpecCard
                label="Film Thickness"
                value={conditions.transport === 'regional' ? '80–120 µm (heavy duty)' : '25–80 µm (standard)'}
                icon="📏"
                description="Thicker = more strength; thinner = lighter and cheaper"
              />
              <SpecCard
                label="Sealability"
                value="Heat-seal capable, min 15 N/15mm peel strength"
                icon="🔒"
                description="Package must maintain hermetic seal throughout shelf life"
              />
              <SpecCard
                label="Mechanical Strength"
                value={conditions.transport === 'regional' ? 'High (> 30 MPa tensile)' : 'Medium (> 15 MPa tensile)'}
                icon="💪"
                description="Resistance to puncture, tear, and drop during transport"
              />
              <SpecCard
                label="MAP Suitability"
                value={food.isLivingProduce || ['protein', 'dairy-fresh'].includes(food.category) ? '✅ Required' : '⚪ Optional'}
                icon="🌬️"
                description="Compatibility with Modified Atmosphere Packaging equipment"
              />
              <SpecCard
                label="Light Barrier"
                value={food.oilContent > 15 || food.mainRisks.includes('light') ? '✅ Required (metallised/opaque)' : '⚪ Transparent OK'}
                icon="🌟"
                description="Protection from UV and visible light degradation"
              />
              <SpecCard
                label="Food Contact Safety"
                value="FDA / FSSAI compliant inner layer"
                icon="✅"
                description="Inner layer must be food-grade and migration-tested"
              />
            </div>

            {/* Comparison table across top 3 */}
            <h3 style={{ marginTop: '24px' }}>📊 Comparison: Top 3 Options</h3>
            <div className="pkg-comparison-table-wrap">
              <table className="pkg-comparison-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    {recommendations.map(r => <th key={r.material.id}>{r.material.shortName}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'OTR', key: 'otr' },
                    { label: 'WVTR', key: 'wvtr' },
                    { label: 'Thickness', key: 'thickness' },
                    { label: 'Sealability', key: 'sealability' },
                    { label: 'Mechanical Strength', key: 'mechanicalStrength' },
                    { label: 'MAP Compatible', key: 'mapSuitability', bool: true },
                    { label: 'Light Barrier', key: 'lightBarrier', bool: true },
                    { label: 'Moisture Barrier', key: 'moistureBarrier' },
                    { label: 'Oxygen Barrier', key: 'oxygenBarrier' },
                  ].map(row => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      {recommendations.map(r => (
                        <td key={r.material.id}>
                          {row.bool
                            ? (r.material.specs[row.key] ? '✅' : '❌')
                            : r.material.specs[row.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LAYER DIAGRAM TAB ── */}
        {activeTab === 'layers' && (
          <div className="pkg-layers-tab">
            <h3>🧱 Packaging Structure — Layer by Layer</h3>
            <p>Click on each recommendation to see its layer structure and purpose.</p>
            <div className="pkg-layers-grid">
              {recommendations.map((rec, idx) => (
                <div key={rec.material.id} className="pkg-layer-section">
                  <h4 style={{ color: rankColors[idx] }}>{rec.rankLabel}: {rec.material.name}</h4>
                  <LayerDiagram layers={rec.material.layers} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COST TAB ── */}
        {activeTab === 'cost' && (
          <div className="pkg-cost-tab">
            <h3>💰 Cost Analysis for {conditions.quantity} kg of {food.name}</h3>
            <div className="pkg-cost-cards">
              {recommendations.map((rec, idx) => {
                const sqmPerKg = 0.3;
                const totalSqm = conditions.quantity * sqmPerKg;
                const totalCost = Math.round(totalSqm * rec.material.costPerSqm);
                const perUnit = Math.round(rec.material.costPerSqm * sqmPerKg);

                return (
                  <div key={rec.material.id} className="pkg-cost-card" style={{ borderColor: rankColors[idx] }}>
                    <div className="pkg-cost-rank" style={{ background: rankColors[idx] }}>{rec.rankLabel}</div>
                    <h4>{rec.material.name}</h4>
                    <div className="pkg-cost-breakdown">
                      <div className="pkg-cost-row">
                        <span>Cost per m²</span>
                        <strong>₹{rec.material.costPerSqm}</strong>
                      </div>
                      <div className="pkg-cost-row">
                        <span>Approx. m² per kg</span>
                        <strong>{sqmPerKg} m²</strong>
                      </div>
                      <div className="pkg-cost-row">
                        <span>Packaging cost per kg</span>
                        <strong>₹{perUnit}</strong>
                      </div>
                      <div className="pkg-cost-row pkg-cost-total">
                        <span>Total for {conditions.quantity} kg</span>
                        <strong>₹{totalCost.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                    <div className="pkg-cost-note">
                      ℹ️ Estimate based on ~{sqmPerKg} m² packaging per kg of food
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Side by side comparison bar */}
            <h3 style={{ marginTop: '24px' }}>Cost Comparison</h3>
            <div className="pkg-cost-compare">
              {recommendations.map((rec, idx) => {
                const pct = ((rec.material.costPerSqm / 60) * 100);
                return (
                  <div key={rec.material.id} className="pkg-cost-compare-row">
                    <span className="pkg-ccr-name">{rec.material.shortName}</span>
                    <div className="pkg-ccr-bar-bg">
                      <div className="pkg-ccr-bar-fill" style={{ width: `${pct}%`, background: rankColors[idx] }} />
                    </div>
                    <span className="pkg-ccr-val">₹{rec.material.costPerSqm}/m²</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SUSTAINABILITY TAB ── */}
        {activeTab === 'sustainability' && (
          <div className="pkg-sustain-tab">
            <h3>♻️ Sustainability Analysis</h3>
            <p>Comparison across environmental impact, recyclability, and eco-credentials</p>
            <div className="pkg-sustain-cards">
              {recommendations.map((rec, idx) => {
                const s = rec.sustainability;
                return (
                  <div key={rec.material.id} className="pkg-sustain-card">
                    <div className="pkg-sustain-header" style={{ borderColor: rankColors[idx] }}>
                      <h4>{rec.material.name}</h4>
                      <div className="pkg-sustain-score-ring" style={{ borderColor: s.color }}>
                        <span className="pkg-sustain-score-num" style={{ color: s.color }}>{s.score}</span>
                        <span className="pkg-sustain-score-label">/100</span>
                      </div>
                    </div>
                    <div className="pkg-sustain-badge" style={{ background: s.color + '22', color: s.color }}>
                      {s.badge} {s.rating}
                    </div>
                    <ul className="pkg-sustain-notes">
                      {s.notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                    <div className="pkg-sustain-bar">
                      <ScoreBar score={s.score} color={s.color} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trade-off note */}
            <div className="pkg-tradeoff-note">
              <Info size={16} />
              <p>
                <strong>Trade-off insight:</strong> The most sustainable option may not always provide
                the best barrier protection. Consider shelf life requirements vs. eco-impact when choosing.
                For short shelf-life or local distribution, bio-based options are worth exploring.
              </p>
            </div>
          </div>
        )}

        {/* ── WHAT-IF TAB ── */}
        {activeTab === 'whatif' && (
          <div className="pkg-whatif-tab">
            <h3>🔄 What-If Simulator</h3>
            <p>Change storage conditions or shelf life target and see how recommendations update</p>

            <div className="pkg-whatif-form">
              <div className="pkg-whatif-row">
                <label>Storage Condition</label>
                <select
                  value={whatIfConds.storage}
                  onChange={e => setWhatIfConds(w => ({ ...w, storage: e.target.value }))}
                >
                  {STORAGE_CONDITIONS.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.emoji} {sc.name}</option>
                  ))}
                </select>
              </div>
              <div className="pkg-whatif-row">
                <label>Target Shelf Life (days)</label>
                <select
                  value={whatIfConds.shelfLife}
                  onChange={e => setWhatIfConds(w => ({ ...w, shelfLife: Number(e.target.value) }))}
                >
                  {SHELF_LIFE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="pkg-whatif-row">
                <label>Transport Mode</label>
                <select
                  value={whatIfConds.transport}
                  onChange={e => setWhatIfConds(w => ({ ...w, transport: e.target.value }))}
                >
                  {TRANSPORT_MODES.map(tm => (
                    <option key={tm.id} value={tm.id}>{tm.emoji} {tm.name}</option>
                  ))}
                </select>
              </div>
              <button className="pkg-btn-primary" onClick={runWhatIf}>
                <RefreshCw size={16} /> Run Simulation
              </button>
            </div>

            {whatIfResult && (
              <div className="pkg-whatif-result">
                {whatIfResult.changes.length > 0 && (
                  <div className="pkg-changes-list">
                    <h4>📢 Changes Detected</h4>
                    {whatIfResult.changes.map((c, i) => (
                      <div key={i} className={`pkg-change-item pkg-change-${c.type}`}>
                        <ArrowRight size={14} /> {c.message}
                      </div>
                    ))}
                  </div>
                )}
                <div className="pkg-whatif-compare">
                  <div className="pkg-whatif-col">
                    <h4>📌 Original</h4>
                    {whatIfResult.original.map((r, i) => (
                      <div key={i} className="pkg-whatif-item" style={{ borderLeft: `3px solid ${rankColors[i]}` }}>
                        <span className="pkg-wi-rank">#{i + 1}</span>
                        <span className="pkg-wi-name">{r.material.shortName}</span>
                        <span className="pkg-wi-score">{r.score}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="pkg-whatif-arrow">→</div>
                  <div className="pkg-whatif-col">
                    <h4>🔄 Updated</h4>
                    {whatIfResult.updated.map((r, i) => (
                      <div key={i} className="pkg-whatif-item" style={{ borderLeft: `3px solid ${rankColors[i]}` }}>
                        <span className="pkg-wi-rank">#{i + 1}</span>
                        <span className="pkg-wi-name">{r.material.shortName}</span>
                        <span className="pkg-wi-score">{r.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PACKAGING DOCTOR TAB ── */}
        {activeTab === 'doctor' && (
          <div className="pkg-doctor-tab">
            <h3>🩺 Packaging Doctor</h3>
            <p>Already using a packaging material? Let AI diagnose if it suits <strong>{food.name}</strong>.</p>

            <div className="pkg-doctor-form">
              <label>Select your current packaging material:</label>
              <select value={doctorMaterial} onChange={e => setDoctorMaterial(e.target.value)}>
                <option value="">— Choose existing material —</option>
                {PACKAGING_MATERIALS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <button
                className="pkg-btn-primary"
                onClick={runDoctor}
                disabled={!doctorMaterial}
              >
                <Stethoscope size={16} /> Diagnose
              </button>
            </div>

            {doctorResult && (
              <div className="pkg-doctor-result">
                <div className={`pkg-doctor-summary ${doctorResult.hasIssues ? 'warn' : 'good'}`}>
                  {doctorResult.summary}
                </div>

                {doctorResult.hasIssues && (
                  <div className="pkg-doctor-issues">
                    <h4>⚠️ Issues Found</h4>
                    {doctorResult.issues.map((issue, i) => (
                      <div key={i} className={`pkg-issue-card pkg-issue-${issue.type}`}>
                        <div className="pkg-issue-title">
                          {issue.type === 'critical' ? '🔴' : '🟡'} {issue.issue}
                        </div>
                        <p className="pkg-issue-detail">{issue.detail}</p>
                        <div className="pkg-issue-fix">
                          <strong>💡 Fix: </strong>{issue.fix}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pkg-doctor-alternatives">
                  <h4>🔄 Better Alternatives</h4>
                  {doctorResult.betterOptions.map((rec, i) => (
                    <div key={i} className="pkg-doctor-alt-card">
                      <span className="pkg-da-emoji">{rec.material.emoji}</span>
                      <div>
                        <strong>{rec.material.name}</strong>
                        <span> — Match score: {rec.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MAP TAB ── */}
        {activeTab === 'map' && mapRec && (
          <div className="pkg-map-tab">
            <h3>🌬️ Modified Atmosphere Packaging (MAP)</h3>
            <p>Recommended gas composition for <strong>{food.emoji} {food.name}</strong></p>

            <div className="pkg-map-card">
              <div className="pkg-map-gases">
                <div className="pkg-gas-block" style={{ background: '#DBEAFE' }}>
                  <span className="pkg-gas-symbol">O₂</span>
                  <span className="pkg-gas-value">{mapRec.o2}</span>
                  <span className="pkg-gas-name">Oxygen</span>
                </div>
                <div className="pkg-gas-block" style={{ background: '#FEE2E2' }}>
                  <span className="pkg-gas-symbol">CO₂</span>
                  <span className="pkg-gas-value">{mapRec.co2}</span>
                  <span className="pkg-gas-name">Carbon Dioxide</span>
                </div>
                <div className="pkg-gas-block" style={{ background: '#F0FDF4' }}>
                  <span className="pkg-gas-symbol">N₂</span>
                  <span className="pkg-gas-value">{mapRec.n2}</span>
                  <span className="pkg-gas-name">Nitrogen</span>
                </div>
              </div>
              <div className="pkg-map-desc">
                <Info size={16} />
                <p>{mapRec.description}</p>
              </div>
            </div>

            <div className="pkg-map-info">
              <h4>Why MAP for {food.name}?</h4>
              <ul>
                {food.isLivingProduce && <li>✅ Slows down cellular respiration, extending freshness</li>}
                {food.ethyleneProduction === 'high' || food.ethyleneProduction === 'very-high'
                  ? <li>✅ Helps manage ethylene production that accelerates ripening</li>
                  : null}
                {food.mainRisks.includes('microbial') && <li>✅ CO₂ inhibits microbial growth</li>}
                {food.mainRisks.includes('oxidation') && <li>✅ N₂ displaces O₂, preventing rancidity</li>}
              </ul>
              <div className="pkg-map-materials">
                <strong>Compatible MAP Materials:</strong>
                {recommendations
                  .filter(r => r.material.specs.mapSuitability)
                  .map(r => <span key={r.material.id} className="pkg-map-mat-tag">{r.material.shortName}</span>)
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function PackagingAdvisor() {
  const [step, setStep] = useState(1);
  const [selectedFood, setSelectedFood] = useState(null);
  const [conditions, setConditions] = useState({
    storage: 'ambient',
    shelfLife: 30,
    transport: 'local',
    quantity: 100
  });
  const [recommendations, setRecommendations] = useState([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  function handleFoodSelect(food) {
    setSelectedFood(food);
  }

  function goNext() {
    if (step === 1 && !selectedFood) return;
    if (step < 4) setStep(s => s + 1);
  }

  function goBack() {
    if (step > 1) {
      setStep(s => s - 1);
      if (step === 3) setAnalysisComplete(false);
      if (step === 4) setStep(3);
    }
  }

  function handleAnalysisComplete() {
    const recs = getRecommendations(
      selectedFood,
      conditions.storage,
      conditions.shelfLife,
      conditions.transport,
      conditions.quantity
    );
    setRecommendations(recs);
    setAnalysisComplete(true);
    setStep(4);
  }

  function resetAll() {
    setStep(1);
    setSelectedFood(null);
    setConditions({ storage: 'ambient', shelfLife: 30, transport: 'local', quantity: 100 });
    setRecommendations([]);
    setAnalysisComplete(false);
  }

  return (
    <div className="pkg-page">
      {/* Page Header */}
      <div className="pkg-header">
        <div className="pkg-header-left">
          <div className="pkg-header-icon">📦</div>
          <div>
            <h1>Packaging AI Advisor</h1>
            <p>AI-powered food packaging recommendation system — OTR, WVTR, MAP & more</p>
          </div>
        </div>
        {step > 1 && (
          <button className="pkg-btn-reset" onClick={resetAll}>
            <RefreshCw size={14} /> New Analysis
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Step Content */}
      <div className="pkg-content-area">
        {step === 1 && (
          <FoodSelectionStep
            onSelect={handleFoodSelect}
            selected={selectedFood}
          />
        )}
        {step === 2 && selectedFood && (
          <ConditionsStep
            food={selectedFood}
            conditions={conditions}
            onChange={setConditions}
          />
        )}
        {step === 3 && selectedFood && !analysisComplete && (
          <AnalysisStep
            food={selectedFood}
            conditions={conditions}
            onComplete={handleAnalysisComplete}
          />
        )}
        {step === 4 && recommendations.length > 0 && (
          <ReportStep
            food={selectedFood}
            conditions={conditions}
            recommendations={recommendations}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {step !== 3 && (
        <div className="pkg-nav-buttons">
          {step > 1 && (
            <button className="pkg-btn-back" onClick={goBack}>
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {step < 3 && (
            <button
              className="pkg-btn-next"
              onClick={goNext}
              disabled={step === 1 && !selectedFood}
            >
              {step === 1 ? (selectedFood ? `Analyse ${selectedFood.emoji} ${selectedFood.name}` : 'Select a food item') : 'Run AI Analysis'}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
