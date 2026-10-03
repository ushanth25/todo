import { useEffect, useMemo, useRef, useState } from "react";
import { makeDefaults, uid } from "./data.js";

const KEY = "programs-tracker-v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* storage unavailable or corrupted: fall back to defaults */
  }
  return makeDefaults();
}

function move(arr, from, to) {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

export default function App() {
  const [levels, setLevels] = useState(load);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(levels));
    } catch {
      /* ignore */
    }
  }, [levels]);

  const total = useMemo(() => levels.reduce((n, l) => n + l.items.length, 0), [levels]);
  const done = useMemo(
    () => levels.reduce((n, l) => n + l.items.filter((i) => i.done).length, 0),
    [levels]
  );

  const patchLevel = (lid, fn) =>
    setLevels((ls) => ls.map((l) => (l.id === lid ? fn(l) : l)));
  const patchItem = (lid, iid, changes) =>
    patchLevel(lid, (l) => ({
      ...l,
      items: l.items.map((i) => (i.id === iid ? { ...i, ...changes } : i)),
    }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(levels, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "programs-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data) || !data.every((l) => l.name && Array.isArray(l.items)))
          throw new Error("bad shape");
        setLevels(data);
      } catch {
        alert("That file is not a valid backup. Use a file exported from this app.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const reset = () => {
    if (confirm("Reset everything to the original 100 programs? Your edits and progress will be lost."))
      setLevels(makeDefaults());
  };

  const q = query.trim().toLowerCase();
  const filtering = filter !== "all" || q !== "";
  const pct = total ? Math.round((done / total) * 100) : 0;
  let counter = 0;

  return (
    <div className="page">
      <header className="top">
        <h1>100 programs</h1>
        <p className="count">
          {done} of {total} done
        </p>
        <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="bar-fill" style={{ width: pct + "%" }} />
        </div>

        <div className="controls">
          <input
            className="search"
            placeholder="Search programs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search programs"
          />
          <div className="seg" role="group" aria-label="Filter">
            {[
              ["all", "All"],
              ["todo", "To do"],
              ["done", "Done"],
            ].map(([v, label]) => (
              <button key={v} className={filter === v ? "on" : ""} onClick={() => setFilter(v)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main>
        {levels.map((lvl) => {
          const start = counter;
          counter += lvl.items.length;
          const visible = lvl.items
            .map((item, idx) => ({ item, idx }))
            .filter(({ item }) => {
              if (filter === "todo" && item.done) return false;
              if (filter === "done" && !item.done) return false;
              if (q && !item.title.toLowerCase().includes(q)) return false;
              return true;
            });
          if (filtering && visible.length === 0) return null;
          return (
            <Level
              key={lvl.id}
              lvl={lvl}
              start={start}
              visible={visible}
              onRename={(name) => patchLevel(lvl.id, (l) => ({ ...l, name }))}
              onDelete={() => {
                if (confirm(`Delete "${lvl.name}" and its ${lvl.items.length} programs?`))
                  setLevels((ls) => ls.filter((l) => l.id !== lvl.id));
              }}
              onAdd={(title) =>
                patchLevel(lvl.id, (l) => ({
                  ...l,
                  items: [...l.items, { id: uid(), title, done: false, notes: "", code: "" }],
                }))
              }
              onPatch={(iid, changes) => patchItem(lvl.id, iid, changes)}
              onMove={(idx, dir) =>
                patchLevel(lvl.id, (l) => ({ ...l, items: move(l.items, idx, idx + dir) }))
              }
              onRemove={(iid) =>
                patchLevel(lvl.id, (l) => ({ ...l, items: l.items.filter((i) => i.id !== iid) }))
              }
            />
          );
        })}

        {!filtering && (
          <form
            className="add-level"
            onSubmit={(e) => {
              e.preventDefault();
              const name = newLevel.trim();
              if (!name) return;
              setLevels((ls) => [...ls, { id: uid(), name, items: [] }]);
              setNewLevel("");
            }}
          >
            <input
              placeholder="New level name"
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              aria-label="New level name"
            />
            <button type="submit">Add level</button>
          </form>
        )}
      </main>

      <footer className="foot">
        <p>Your progress is saved in this browser only. Use backup to move it to another device.</p>
        <div>
          <button onClick={exportData}>Download backup</button>
          <button onClick={() => fileRef.current?.click()}>Restore backup</button>
          <button className="danger" onClick={reset}>
            Reset to defaults
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
        </div>
      </footer>
    </div>
  );
}

function Level({ lvl, start, visible, onRename, onDelete, onAdd, onPatch, onMove, onRemove }) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const doneCount = lvl.items.filter((i) => i.done).length;

  return (
    <section className="level">
      <div className="level-head">
        <button className="fold" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span className={"chev" + (open ? " open" : "")} aria-hidden="true">▸</span>
          {editing ? null : <h2>{lvl.name}</h2>}
        </button>
        {editing && (
          <input
            className="level-name"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (draft.trim()) onRename(draft.trim());
                setEditing(false);
              }
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label="Level name"
          />
        )}
        <span className="level-count">
          {doneCount}/{lvl.items.length}
        </span>
        {editing ? (
          <>
            <button
              className="link"
              onClick={() => {
                if (draft.trim()) onRename(draft.trim());
                setEditing(false);
              }}
            >
              Save
            </button>
            <button className="link danger" onClick={onDelete}>
              Delete level
            </button>
          </>
        ) : (
          <button
            className="link"
            onClick={() => {
              setDraft(lvl.name);
              setEditing(true);
            }}
          >
            Edit
          </button>
        )}
      </div>

      {open && (
        <>
          <ul className="list">
            {visible.map(({ item, idx }) => (
              <Item
                key={item.id}
                item={item}
                number={start + idx + 1}
                isFirst={idx === 0}
                isLast={idx === lvl.items.length - 1}
                onPatch={(c) => onPatch(item.id, c)}
                onMove={(dir) => onMove(idx, dir)}
                onRemove={() => onRemove(item.id)}
              />
            ))}
          </ul>
          <AddProgram onAdd={onAdd} />
        </>
      )}
    </section>
  );
}

function Item({ item, number, isFirst, isLast, onPatch, onMove, onRemove }) {
  const [open, setOpen] = useState(false);
  const hasWork = item.code.trim() || item.notes.trim();

  return (
    <li className={"item" + (item.done ? " done" : "")}>
      <div className="row">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => onPatch({ done: e.target.checked })}
          aria-label={`Mark "${item.title}" as done`}
        />
        <span className="num">{number}</span>
        <button className="title" onClick={() => setOpen(!open)} aria-expanded={open}>
          {item.title}
        </button>
        {hasWork && <span className="dot" title="Has code or notes" />}
      </div>

      {open && (
        <div className="panel">
          <label>
            Title
            <input value={item.title} onChange={(e) => onPatch({ title: e.target.value })} />
          </label>
          <label>
            Your code
            <textarea
              className="code"
              rows={Math.min(18, Math.max(6, item.code.split("\n").length + 1))}
              spellCheck={false}
              value={item.code}
              placeholder="Paste or write your solution here"
              onChange={(e) => onPatch({ code: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const t = e.target;
                  const s = t.selectionStart;
                  const v = t.value;
                  onPatch({ code: v.slice(0, s) + "    " + v.slice(t.selectionEnd) });
                  requestAnimationFrame(() => (t.selectionStart = t.selectionEnd = s + 4));
                }
              }}
            />
          </label>
          <label>
            Notes
            <textarea
              rows={3}
              value={item.notes}
              placeholder="Approach, time complexity, edge cases"
              onChange={(e) => onPatch({ notes: e.target.value })}
            />
          </label>
          <div className="actions">
            <button disabled={isFirst} onClick={() => onMove(-1)}>Move up</button>
            <button disabled={isLast} onClick={() => onMove(1)}>Move down</button>
            <button className="danger" onClick={onRemove}>Delete program</button>
          </div>
        </div>
      )}
    </li>
  );
}

function AddProgram({ onAdd }) {
  const [text, setText] = useState("");
  return (
    <form
      className="add"
      onSubmit={(e) => {
        e.preventDefault();
        const t = text.trim();
        if (!t) return;
        onAdd(t);
        setText("");
      }}
    >
      <input
        placeholder="Add a program to this level"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Add a program to this level"
      />
      <button type="submit">Add</button>
    </form>
  );
}
