const createQueryBuilder = (result = { data: null, error: null }, singleResult) => {
    const resolved = result;
    const resolvedSingle = singleResult || result;

    const builder = {
        select: jest.fn(() => builder),
        insert: jest.fn(() => builder),
        update: jest.fn(() => builder),
        delete: jest.fn(() => builder),
        eq: jest.fn(() => builder),
        order: jest.fn(() => builder),
        limit: jest.fn(() => builder),
        neq: jest.fn(() => builder),
        single: jest.fn(() => Promise.resolve(resolvedSingle)),
        then: (resolve, reject) => Promise.resolve(resolved).then(resolve, reject)
    };

    return builder;
};

const supabase = {
    _builders: new Map(),
    _defaultResult: { data: null, error: null },
    from: jest.fn((table) => supabase._builders.get(table) || createQueryBuilder(supabase._defaultResult)),
    storage: {
        from: jest.fn(() => ({
            upload: jest.fn(() => Promise.resolve({ data: { path: 'mock/path' }, error: null })),
            getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.test/mock' } }))
        }))
    },
    __setBuilder: (table, builder) => {
        supabase._builders.set(table, builder);
    },
    __setResult: (table, result, singleResult) => {
        const builder = createQueryBuilder(result, singleResult);
        supabase._builders.set(table, builder);
        return builder;
    },
    __setDefaultResult: (result) => {
        supabase._defaultResult = result;
    },
    __reset: () => {
        supabase._builders.clear();
        supabase._defaultResult = { data: null, error: null };
        supabase.from.mockClear();
        supabase.storage.from.mockClear();
    }
};

module.exports = supabase;
