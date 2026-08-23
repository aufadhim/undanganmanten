import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { resolveImageUrl } from '../config/env.js';

export const getImageUrl = (path) => {
    return resolveImageUrl(path);
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'EEEE, d MMMM yyyy', { locale: id });
};
