let items = [];
let idCounter = 1;

export const list = async () => items;
export const getById = async id => items.find(i => i.id === Number(id));
export const create = async data => {
    const item = { id: idCounter++, name: data.name || 'unnamed', createdAt: new Date() };
    items.push(item);
    return item;
};
export const update = async (id, data) => {
    const idx = items.findIndex(i => i.id === Number(id));
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data };
    return items[idx];
};
export const remove = async id => {
    const idx = items.findIndex(i => i.id === Number(id));
    if (idx === -1) return false;
    items.splice(idx, 1);
    return true;
};