'use client';
import { ReactNode, useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Filter, X, Download, Search, RefreshCw } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  accessor?: (row: T) => any;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select" | "number-range" | "date-range";
  filterOptions?: { value: string; label: string }[];
  width?: string;
  align?: "left" | "right" | "center";
  exportable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  loading?: boolean;
  empty?: ReactNode;
  toolbar?: ReactNode;
  exportFilename?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

function getValue<T>(row: T, col: Column<T>): any {
  if (col.accessor) return col.accessor(row);
  return (row as any)[col.key];
}

function csvEscape(v: any): string {
  if (v == null) return "";
  const s = String(v).replace(/<[^>]+>/g, "").replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

export function DataTable<T>({ columns, rows, rowKey, searchPlaceholder = "بحث...", searchKeys, loading, empty, toolbar, exportFilename = "export", pageSize = 25, onRowClick, rowClassName }: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = rows;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(row => {
        if (searchKeys) {
          return searchKeys.some(k => String((row as any)[k] ?? "").toLowerCase().includes(q));
        }
        return columns.some(c => String(getValue(row, c) ?? "").toLowerCase().includes(q));
      });
    }
    for (const [key, val] of Object.entries(filters)) {
      if (val == null || val === "" || (Array.isArray(val) && val.length === 0)) continue;
      const col = columns.find(c => c.key === key);
      if (!col) continue;
      r = r.filter(row => {
        const v = getValue(row, col);
        if (col.filterType === "select") {
          if (Array.isArray(val)) return val.length === 0 || val.includes(String(v));
          return String(v) === String(val);
        }
        if (col.filterType === "number-range") {
          const n = Number(v);
          if (val.min != null && val.min !== "" && n < Number(val.min)) return false;
          if (val.max != null && val.max !== "" && n > Number(val.max)) return false;
          return true;
        }
        if (col.filterType === "date-range") {
          const t = new Date(v).getTime();
          if (val.from && t < new Date(val.from).getTime()) return false;
          if (val.to && t > new Date(val.to).getTime() + 86400000) return false;
          return true;
        }
        return String(v ?? "").toLowerCase().includes(String(val).toLowerCase());
      });
    }
    if (sort) {
      const col = columns.find(c => c.key === sort.key);
      if (col) {
        r = [...r].sort((a, b) => {
          const va = getValue(a, col), vb = getValue(b, col);
          if (va == null && vb == null) return 0;
          if (va == null) return 1;
          if (vb == null) return -1;
          const na = Number(va), nb = Number(vb);
          if (!isNaN(na) && !isNaN(nb)) return sort.dir === "asc" ? na - nb : nb - na;
          return sort.dir === "asc" ? String(va).localeCompare(String(vb), "ar") : String(vb).localeCompare(String(va), "ar");
        });
      }
    }
    return r;
  }, [rows, search, filters, sort, columns, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, pageCount);
  const paged = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  const exportCsv = () => {
    const cols = columns.filter(c => c.exportable !== false);
    const header = cols.map(c => csvEscape(c.label)).join(",");
    const lines = filtered.map(row => cols.map(c => {
      const v = getValue(row, c);
      return csvEscape(v);
    }).join(","));
    const csv = "\uFEFF" + [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const activeFilterCount = Object.values(filters).filter(v => {
    if (v == null || v === "") return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.values(v).some(x => x != null && x !== "");
    return true;
  }).length;

  return (
    <div className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-sm border border-gray-100 dark:border-[#2a2d36]">
      <div className="p-3 border-b border-gray-100 dark:border-[#2a2d36] flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full pr-9 pl-3 py-2 text-sm border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
          />
        </div>
        {activeFilterCount > 0 && (
          <button onClick={() => setFilters({})} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[#34cc30]/10 text-[#34cc30] hover:bg-[#34cc30]/20">
            <X size={12} /> مسح الفلاتر ({activeFilterCount})
          </button>
        )}
        {toolbar}
        <div className="flex-1" />
        <button onClick={exportCsv} title="تصدير CSV" className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#2a2d36] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
          <Download size={12} /> CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#252830] text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-[#2a2d36]">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={`text-${col.align || "right"} p-3 font-semibold relative whitespace-nowrap`} style={{ width: col.width }}>
                  <div className="flex items-center gap-1.5">
                    {col.sortable !== false ? (
                      <button onClick={() => setSort(s => s?.key === col.key ? (s.dir === "asc" ? { key: col.key, dir: "desc" } : null) : { key: col.key, dir: "asc" })} className="flex items-center gap-1 hover:text-[#34cc30]">
                        {col.label}
                        {sort?.key === col.key && (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                      </button>
                    ) : <span>{col.label}</span>}
                    {col.filterable && (
                      <button onClick={() => setOpenFilter(o => o === col.key ? null : col.key)} className={`p-0.5 rounded ${filters[col.key] ? "text-[#34cc30]" : "text-gray-400 hover:text-gray-600"}`}>
                        <Filter size={12} />
                      </button>
                    )}
                  </div>
                  {openFilter === col.key && (
                    <div className="absolute top-full right-0 z-20 mt-1 w-56 bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-[#2a2d36] rounded-lg shadow-xl p-3 text-right" onClick={e => e.stopPropagation()}>
                      {(col.filterType || "text") === "text" && (
                        <input
                          autoFocus
                          value={filters[col.key] || ""}
                          onChange={e => { setFilters(f => ({ ...f, [col.key]: e.target.value })); setPage(1); }}
                          placeholder={`فلترة ${col.label}...`}
                          className="w-full text-sm border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#34cc30]/30"
                        />
                      )}
                      {col.filterType === "select" && (
                        <div className="space-y-1 max-h-56 overflow-y-auto">
                          {(col.filterOptions || []).map(opt => {
                            const arr: string[] = Array.isArray(filters[col.key]) ? filters[col.key] : [];
                            const checked = arr.includes(opt.value);
                            return (
                              <label key={opt.value} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 px-2 py-1 rounded">
                                <input type="checkbox" checked={checked} onChange={() => {
                                  setFilters(f => {
                                    const cur: string[] = Array.isArray(f[col.key]) ? [...f[col.key]] : [];
                                    const i = cur.indexOf(opt.value);
                                    if (i >= 0) cur.splice(i, 1); else cur.push(opt.value);
                                    return { ...f, [col.key]: cur };
                                  });
                                  setPage(1);
                                }} />
                                {opt.label}
                              </label>
                            );
                          })}
                        </div>
                      )}
                      {col.filterType === "number-range" && (
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" placeholder="من" value={filters[col.key]?.min || ""} onChange={e => { setFilters(f => ({ ...f, [col.key]: { ...(f[col.key] || {}), min: e.target.value } })); setPage(1); }} className="text-xs border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded px-2 py-1.5" />
                          <input type="number" placeholder="إلى" value={filters[col.key]?.max || ""} onChange={e => { setFilters(f => ({ ...f, [col.key]: { ...(f[col.key] || {}), max: e.target.value } })); setPage(1); }} className="text-xs border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded px-2 py-1.5" />
                        </div>
                      )}
                      {col.filterType === "date-range" && (
                        <div className="space-y-2">
                          <input type="date" value={filters[col.key]?.from || ""} onChange={e => { setFilters(f => ({ ...f, [col.key]: { ...(f[col.key] || {}), from: e.target.value } })); setPage(1); }} className="w-full text-xs border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded px-2 py-1.5" />
                          <input type="date" value={filters[col.key]?.to || ""} onChange={e => { setFilters(f => ({ ...f, [col.key]: { ...(f[col.key] || {}), to: e.target.value } })); setPage(1); }} className="w-full text-xs border border-gray-200 dark:border-[#2a2d36] bg-white dark:bg-[#252830] rounded px-2 py-1.5" />
                        </div>
                      )}
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 dark:border-[#2a2d36]">
                        <button onClick={() => { setFilters(f => { const n = { ...f }; delete n[col.key]; return n; }); setOpenFilter(null); }} className="text-xs text-gray-500 hover:text-red-500">مسح</button>
                        <button onClick={() => setOpenFilter(null)} className="text-xs text-[#34cc30] font-medium">تطبيق</button>
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-[#2a2d36]">
            {loading ? (
              <tr><td colSpan={columns.length} className="p-12 text-center text-gray-400"><RefreshCw size={28} className="mx-auto mb-3 animate-spin" />جاري التحميل...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="p-12 text-center text-gray-400">{empty || "لا توجد بيانات"}</td></tr>
            ) : paged.map(row => (
              <tr key={rowKey(row)} onClick={() => onRowClick?.(row)} className={`${onRowClick ? "cursor-pointer" : ""} hover:bg-gray-50 dark:hover:bg-white/5 ${rowClassName?.(row) || ""}`}>
                {columns.map(col => (
                  <td key={col.key} className={`p-3 text-${col.align || "right"} text-[#485869] dark:text-gray-200`}>
                    {col.render ? col.render(row) : String(getValue(row, col) ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-[#2a2d36] text-xs text-gray-600 dark:text-gray-300">
          <div>عرض {(curPage - 1) * pageSize + 1}–{Math.min(curPage * pageSize, filtered.length)} من {filtered.length}</div>
          <div className="flex items-center gap-1">
            <button disabled={curPage === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 rounded border border-gray-200 dark:border-[#2a2d36] disabled:opacity-40">السابق</button>
            <span className="px-2">{curPage} / {pageCount}</span>
            <button disabled={curPage === pageCount} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded border border-gray-200 dark:border-[#2a2d36] disabled:opacity-40">التالي</button>
          </div>
        </div>
      )}
    </div>
  );
}

export interface ActionItem {
  label: string;
  icon?: any;
  onClick: () => void;
  variant?: "default" | "danger" | "success" | "warning";
  show?: boolean;
}

export function ActionMenu({ items }: { items: ActionItem[] }) {
  const visible = items.filter(i => i.show !== false);
  const variantCls: Record<string, string> = {
    default: "text-gray-600 hover:text-[#485869] hover:bg-gray-100 dark:hover:bg-white/10",
    danger: "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
    success: "text-[#34cc30] hover:bg-[#34cc30]/10",
    warning: "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
  };
  return (
    <div className="flex items-center gap-0.5 justify-end">
      {visible.map((it, i) => {
        const Icon = it.icon;
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); it.onClick(); }}
            title={it.label}
            className={`p-1.5 rounded-lg transition-colors ${variantCls[it.variant || "default"]}`}
          >
            {Icon ? <Icon size={15} /> : <span className="text-xs">{it.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
