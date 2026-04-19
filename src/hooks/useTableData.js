import { useState, useMemo } from 'react';

export function useTableData(initialData, config = {}) {
    const [sortConfig, setSortConfig] = useState({ key: config.initialSortKey || null, direction: config.initialSortDir || 'desc' });
    const [searchQuery, setSearchQuery] = useState('');

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredData = useMemo(() => {
        let processableData = [...initialData];

        // Filtering
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            processableData = processableData.filter(item => {
                // If custom searchFn is provided, use it
                if (config.searchFn) return config.searchFn(item, query);

                // Otherwise deep string search on object values
                return Object.values(item).some(val =>
                    String(val).toLowerCase().includes(query)
                );
            });
        }

        // Sorting
        if (sortConfig.key) {
            processableData.sort((a, b) => {
                // Determine values
                let valA = config.sortFn ? config.sortFn(a, sortConfig.key) : a[sortConfig.key];
                let valB = config.sortFn ? config.sortFn(b, sortConfig.key) : b[sortConfig.key];

                if (valA === undefined || valA === null) valA = '';
                if (valB === undefined || valB === null) valB = '';

                // If strings, compare locale, else basic logic
                if (typeof valA === 'string' && typeof valB === 'string') {
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                } else {
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }
            });
        }

        return processableData;
    }, [initialData, sortConfig, searchQuery, config]);

    return {
        data: sortedAndFilteredData,
        requestSort,
        sortConfig,
        searchQuery,
        setSearchQuery
    };
}
