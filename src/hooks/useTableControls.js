import { useMemo, useState } from 'react';

/**
 * Client-side search, sort, and pagination over an in-memory array.
 *
 * The source repeated this logic in every list screen; centralising it means
 * search, sorting, and paging behave identically across employees, payroll,
 * documents, and the rest.
 *
 * @param {T[]} items
 * @param {object} [options]
 * @param {string[]} [options.searchKeys]  Fields matched by the search box.
 * @param {number}   [options.pageSize=10] Set to 0 to disable pagination.
 * @param {string}   [options.initialSort] Field to sort by initially.
 */
export function useTableControls(items = [], options = {}) {
  const {
    searchKeys = [],
    pageSize = 10,
    initialSort = null,
    initialDirection = 'asc',
  } = options;

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortDirection, setSortDirection] = useState(initialDirection);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = items;

    const term = search.trim().toLowerCase();
    if (term && searchKeys.length) {
      result = result.filter((item) =>
        searchKeys.some((key) =>
          String(readPath(item, key) ?? '')
            .toLowerCase()
            .includes(term),
        ),
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value === '' || value === 'all' || value === undefined || value === null) {
        return;
      }
      result = result.filter((item) => String(readPath(item, key)) === String(value));
    });

    return result;
  }, [items, search, searchKeys, filters]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;

    return [...filtered].sort((a, b) => {
      const order = compare(readPath(a, sortBy), readPath(b, sortBy));
      return sortDirection === 'asc' ? order : -order;
    });
  }, [filtered, sortBy, sortDirection]);

  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  // Clamp rather than store — a filter change can shrink the list below `page`.
  const currentPage = Math.min(page, pageCount);

  const paged = useMemo(() => {
    if (pageSize <= 0) return sorted;
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  /** Toggles direction when re-sorting by the same field. */
  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(key);
    setSortDirection('asc');
  };

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const reset = () => {
    setSearch('');
    setFilters({});
    setPage(1);
  };

  return {
    rows: paged,
    allRows: sorted,
    total: sorted.length,
    search,
    setSearch: handleSearch,
    filters,
    setFilter,
    sortBy,
    sortDirection,
    toggleSort,
    page: currentPage,
    setPage,
    pageCount,
    reset,
    isFiltered:
      Boolean(search.trim()) ||
      Object.values(filters).some((value) => value && value !== 'all'),
  };
}

/** Reads `'branch.name'` from a nested object. */
const readPath = (object, path) =>
  path.split('.').reduce((value, key) => value?.[key], object);

const compare = (left, right) => {
  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;

  if (typeof left === 'number' && typeof right === 'number') return left - right;

  const leftDate = Date.parse(left);
  const rightDate = Date.parse(right);
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) return leftDate - rightDate;

  return String(left).localeCompare(String(right), undefined, { numeric: true });
};
