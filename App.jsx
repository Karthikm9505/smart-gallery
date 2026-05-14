import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  ImageIcon,
  X,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  CloudUpload,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";

// ─── Toast System ────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => remove(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );
  return { toasts, add, remove };
}

// ─── Step Checklist ──────────────────────────────────────────────────────────
const STEPS = [
  { id: "auth", label: "Requesting security token", icon: ShieldCheck },
  { id: "upload", label: "Uploading to Amazon S3", icon: CloudUpload },
  { id: "done", label: "Transfer complete", icon: CheckCircle2 },
];

function StepChecklist({ currentStep, error }) {
  const order = ["auth", "upload", "done"];
  const currentIdx = order.indexOf(currentStep);

  return (
    <div className="checklist">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isComplete = currentIdx > idx;
        const isActive = currentIdx === idx;
        const isError = isActive && error;

        let stateClass = "step-idle";
        if (isError) stateClass = "step-error";
        else if (isComplete) stateClass = "step-done";
        else if (isActive) stateClass = "step-active";

        return (
          <div key={step.id} className={`step ${stateClass}`}>
            <div className="step-indicator">
              {isError ? (
                <AlertCircle size={16} />
              ) : isActive && !isComplete ? (
                <Loader2 size={16} className="spin" />
              ) : isComplete ? (
                <CheckCircle2 size={16} />
              ) : (
                <Circle size={16} />
              )}
            </div>
            <div className="step-content">
              <span className="step-num">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="step-label">{step.label}</span>
            </div>
            <Icon size={14} className="step-icon-right" />
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const PHASE = {
  IDLE: "idle",
  SELECTED: "selected",
  WORKING: "working",
  DONE: "done",
};

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [dragging, setDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, []);

  const selectFile = useCallback((f) => {
    if (!f || !f.type.startsWith("image/")) {
      addToast("Please select an image file.", "error");
      return;
    }
    setFile(f);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setPhase(PHASE.SELECTED);
    setError(false);
  }, [addToast]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      selectFile(e.dataTransfer.files[0]);
    },
    [selectFile]
  );

  const cancel = () => {
    setFile(null);
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setPhase(PHASE.IDLE);
    setCurrentStep(null);
    setError(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setPhase(PHASE.WORKING);
    setError(false);

    try {
      setCurrentStep("auth");
      const res = await fetch(
        `http://localhost:5000/api/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`
      );
      const data = await res.json();
      if (!data.uploadUrl) throw new Error("No upload URL received.");

      setCurrentStep("upload");
      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("S3 upload failed — check CORS settings.");

      setCurrentStep("done");
      setPhase(PHASE.DONE);
      addToast("File uploaded successfully!", "success");
    } catch (err) {
      console.error(err);
      setError(true);
      addToast(err.message || "Upload failed.", "error");
    }
  };

  const isWorking = phase === PHASE.WORKING;
  const isDone = phase === PHASE.DONE;
  const showChecklist = isWorking || isDone || error;

  return (
    <>
      <style>{styles}</style>
      <Toast toasts={toasts} remove={removeToast} />

      <div className="page">
        <div className="card" data-phase={phase}>
          {/* Header */}
          <header className="card-header">
            <div className="logo">
              <CloudUpload size={20} />
              <span>SmartGallery</span>
            </div>
            <span className="badge">S3 Direct Upload</span>
          </header>

          {/* Drop Zone / Preview */}
          <div
            className={`drop-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="file-input"
              onChange={(e) => selectFile(e.target.files[0])}
            />

            {preview ? (
              <div className="preview-wrap">
                <img src={preview} alt="preview" className="preview-img" />
                <div className="preview-overlay">
                  <div className="file-meta">
                    <ImageIcon size={14} />
                    <span>{file?.name}</span>
                    <span className="file-size">
                      {(file?.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="drop-prompt">
                <div className="drop-icon-wrap">
                  <Upload size={28} />
                </div>
                <p className="drop-primary">Drop your image here</p>
                <p className="drop-secondary">
                  or{" "}
                  <button
                    className="browse-btn"
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  >
                    <FolderOpen size={13} /> browse files
                  </button>
                </p>
                <p className="drop-hint">PNG · JPG · GIF · WebP — Max 50 MB</p>
              </div>
            )}
          </div>

          {/* Step checklist */}
          <div className={`checklist-wrap ${showChecklist ? "visible" : ""}`}>
            <StepChecklist currentStep={currentStep} error={error} />
          </div>

          {/* Actions */}
          <div className="actions">
            {(phase === PHASE.SELECTED || isWorking || isDone || error) && (
              <button className="btn btn-ghost" onClick={cancel} disabled={isWorking}>
                <X size={15} /> Cancel
              </button>
            )}
            {(phase === PHASE.SELECTED || error) && (
              <button className="btn btn-primary" onClick={handleUpload} disabled={isWorking}>
                <Upload size={15} />
                {error ? "Retry Upload" : "Upload to S3"}
              </button>
            )}
            {isDone && !error && (
              <button className="btn btn-success" onClick={cancel}>
                <CheckCircle2 size={15} /> Upload another
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d0f12;
    --surface: #14171c;
    --surface2: #1c2028;
    --border: #2a2e38;
    --amber: #f59e0b;
    --amber-dim: #f59e0b18;
    --amber-mid: #f59e0b55;
    --green: #22c55e;
    --red: #ef4444;
    --text: #e8eaf0;
    --text-dim: #6b7280;
    --text-mid: #9ca3af;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    --radius: 12px;
    --radius-sm: 8px;
  }

  body { font-family: var(--sans); background: var(--bg); color: var(--text); min-height: 100vh; }

  .page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px 16px;
    background:
      radial-gradient(ellipse 60% 40% at 50% 0%, #f59e0b0d 0%, transparent 70%),
      var(--bg);
  }

  .card {
    width: 100%;
    max-width: 480px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 0 0 1px #ffffff06, 0 32px 64px #00000080;
    transition: border-color 0.3s;
  }
  .card[data-phase="working"] { border-color: var(--amber-mid); }
  .card[data-phase="done"] { border-color: #22c55e55; }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  .logo {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 14px; font-weight: 500; color: var(--amber);
  }
  .badge {
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-dim);
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 20px; padding: 3px 10px;
  }

  .file-input { display: none; }

  .drop-zone {
    margin: 20px;
    border: 1.5px dashed var(--border);
    border-radius: var(--radius);
    background: var(--surface2);
    min-height: 220px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    position: relative; overflow: hidden;
  }
  .drop-zone:hover:not(.has-file) {
    border-color: var(--amber); background: var(--amber-dim);
    box-shadow: inset 0 0 40px #f59e0b08;
  }
  .drop-zone.dragging {
    border-color: var(--amber); border-style: solid;
    background: var(--amber-dim);
    box-shadow: 0 0 0 4px var(--amber-dim), inset 0 0 60px #f59e0b0a;
  }
  .drop-zone.has-file { cursor: default; }

  .drop-prompt { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px 24px; text-align: center; }
  .drop-icon-wrap {
    width: 56px; height: 56px; border-radius: 14px;
    border: 1px solid var(--border); background: var(--surface);
    display: grid; place-items: center; color: var(--amber);
    box-shadow: 0 4px 16px #00000040;
  }
  .drop-primary { font-size: 15px; font-weight: 600; color: var(--text); margin-top: 4px; }
  .drop-secondary { font-size: 13px; color: var(--text-mid); display: flex; align-items: center; gap: 6px; }
  .browse-btn {
    background: none; border: none; color: var(--amber);
    font-size: 13px; font-family: var(--sans); cursor: pointer;
    display: inline-flex; align-items: center; gap: 4px;
    padding: 0; font-weight: 500;
    text-decoration: underline; text-underline-offset: 2px;
  }
  .drop-hint { font-family: var(--mono); font-size: 11px; color: var(--text-dim); margin-top: 2px; }

  .preview-wrap { width: 100%; height: 220px; position: relative; }
  .preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .preview-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 8px 12px;
    background: linear-gradient(transparent, #00000088);
  }
  .file-meta {
    display: flex; align-items: center; gap: 6px;
    font-family: var(--mono); font-size: 11px; color: #ffffffcc;
    white-space: nowrap; overflow: hidden;
  }
  .file-meta span:first-of-type { overflow: hidden; text-overflow: ellipsis; flex: 1; }
  .file-size {
    flex-shrink: 0; color: var(--amber);
    background: #00000055; border-radius: 4px; padding: 1px 6px;
  }

  .checklist-wrap {
    max-height: 0; overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0 20px;
  }
  .checklist-wrap.visible { max-height: 200px; }

  .checklist { display: flex; flex-direction: column; gap: 4px; padding-bottom: 4px; }

  .step {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--radius-sm);
    border: 1px solid transparent;
    transition: all 0.25s ease; background: transparent;
  }
  .step-idle { color: var(--text-dim); }
  .step-active { background: var(--amber-dim); border-color: var(--amber-mid); color: var(--text); }
  .step-done { color: var(--green); }
  .step-error { background: #ef444418; border-color: #ef444444; color: var(--red); }

  .step-indicator { flex-shrink: 0; display: flex; }
  .step-content { display: flex; align-items: center; gap: 8px; flex: 1; overflow: hidden; }
  .step-num { font-family: var(--mono); font-size: 10px; opacity: 0.5; flex-shrink: 0; }
  .step-label { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .step-icon-right { opacity: 0.3; flex-shrink: 0; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }

  .actions {
    display: flex; gap: 10px;
    padding: 16px 20px;
    justify-content: flex-end;
    border-top: 1px solid var(--border);
    margin-top: 8px;
  }

  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 600; font-family: var(--sans);
    cursor: pointer; border: 1px solid transparent;
    transition: all 0.15s ease; white-space: nowrap;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-ghost { background: transparent; border-color: var(--border); color: var(--text-mid); }
  .btn-ghost:hover:not(:disabled) { border-color: var(--text-mid); color: var(--text); }

  .btn-primary { background: var(--amber); color: #0d0f12; border-color: var(--amber); box-shadow: 0 4px 16px #f59e0b33; }
  .btn-primary:hover:not(:disabled) { background: #fbbf24; box-shadow: 0 6px 24px #f59e0b55; transform: translateY(-1px); }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }

  .btn-success { background: #22c55e18; color: var(--green); border-color: #22c55e44; }
  .btn-success:hover:not(:disabled) { background: #22c55e28; border-color: #22c55e88; }

  .toast-container { position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500;
    max-width: 300px; border: 1px solid;
    box-shadow: 0 8px 32px #00000066;
    animation: slideIn 0.25s ease;
  }
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  .toast-success { background: #22c55e14; border-color: #22c55e44; color: var(--green); }
  .toast-error { background: #ef444414; border-color: #ef444444; color: var(--red); }
  .toast-icon { flex-shrink: 0; display: flex; }
  .toast-msg { flex: 1; }
  .toast-close { flex-shrink: 0; background: none; border: none; cursor: pointer; color: inherit; opacity: 0.6; display: flex; padding: 0; transition: opacity 0.15s; }
  .toast-close:hover { opacity: 1; }

  @media (max-width: 520px) {
    .page { padding: 16px 12px; }
    .card { border-radius: 12px; }
    .drop-zone { margin: 14px; min-height: 180px; }
    .checklist-wrap { margin: 0 14px; }
    .actions { padding: 14px; flex-wrap: wrap; }
    .btn { flex: 1; justify-content: center; }
    .toast-container { left: 12px; right: 12px; }
    .toast { max-width: 100%; }
  }
`;
