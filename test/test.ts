import safeGet from './safeGet';
import _ from 'lodash';
import { get, set } from 'lodash';

const obj = { a: 1 };

safeGet('a', obj, 0);
// obj?.a ?? 0

safeGet('a', { a: 1 }, 0);
safeGet('a.b.c.', { a: 1 }, 0);
_.get(obj, 'o', 0);
