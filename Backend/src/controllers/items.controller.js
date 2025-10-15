import * as ItemsService from '../services/items.service.js';

export const list = async (req, res) => {
    const items = await ItemsService.list();
    res.json(items);
};

export const getById = async (req, res) => {
    const item = await ItemsService.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
};

export const create = async (req, res) => {
    const created = await ItemsService.create(req.body);
    res.status(201).json(created);
};

export const update = async (req, res) => {
    const updated = await ItemsService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
};

export const remove = async (req, res) => {
    const removed = await ItemsService.remove(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
};
