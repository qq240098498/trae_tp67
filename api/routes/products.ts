import { Router, Request, Response } from 'express';
import store from '../data/store';
import type { Product, ProductStatus, ProductSource } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { source, status, keyword } = req.query as { source?: ProductSource; status?: ProductStatus; keyword?: string };
  let list = [...store.products];
  if (source) list = list.filter(p => p.source === source);
  if (status) list = list.filter(p => p.status === status);
  if (keyword) list = list.filter(p => p.name.includes(keyword) || p.spec.includes(keyword));
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ code: 0, data: list });
});

router.get('/:id', (req: Request, res: Response) => {
  const p = store.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ code: 1, message: '团品不存在' });
  res.json({ code: 0, data: p });
});

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Product>;
  if (!body.name || !body.spec || !body.price || !body.deadline || !body.arriveDate) {
    return res.status(400).json({ code: 1, message: '请填写必填项' });
  }
  const np: Product = {
    id: store.genId('p'),
    name: body.name,
    spec: body.spec,
    category: body.category || '其他',
    price: Number(body.price),
    originPrice: body.originPrice ? Number(body.originPrice) : undefined,
    image: body.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    deadline: body.deadline,
    arriveDate: body.arriveDate,
    source: body.source || 'custom',
    status: 'ongoing',
    stock: body.stock || 100,
    sold: 0,
    createdAt: new Date().toISOString(),
  };
  store.products.unshift(np);
  res.json({ code: 0, data: np, message: '发布成功' });
});

router.put('/:id', (req: Request, res: Response) => {
  const idx = store.products.findIndex(x => x.id === req.params.id);
  if (idx < 0) return res.status(404).json({ code: 1, message: '团品不存在' });
  store.products[idx] = { ...store.products[idx], ...req.body };
  res.json({ code: 0, data: store.products[idx], message: '更新成功' });
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const idx = store.products.findIndex(x => x.id === req.params.id);
  if (idx < 0) return res.status(404).json({ code: 1, message: '团品不存在' });
  const { status } = req.body as { status: ProductStatus };
  if (status) store.products[idx].status = status;
  res.json({ code: 0, data: store.products[idx] });
});

router.get('/supply/list', (req: Request, res: Response) => {
  const { keyword } = req.query as { keyword?: string };
  const IMGS = [
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551024709-8f23bef4c123?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1610832745704-9cf5dda70963?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=400&h=400&fit=crop',
  ];
  const list = [
    { id: 'sp1', name: '新疆阿克苏冰糖心苹果', spec: '8斤装 85mm', price: 49.9, originPrice: 79, image: IMGS[0], category: '水果' },
    { id: 'sp2', name: '智利车厘子 JJ级', spec: '2斤礼盒装', price: 128, originPrice: 188, image: IMGS[1], category: '水果' },
    { id: 'sp3', name: '厄瓜多尔白虾', spec: '40/50 2kg/盒', price: 118, originPrice: 158, image: IMGS[2], category: '海鲜' },
    { id: 'sp4', name: '澳洲安格斯牛排', spec: '原切西冷 150g×6片', price: 168, originPrice: 258, image: IMGS[3], category: '肉类' },
    { id: 'sp5', name: '云南小粒咖啡豆', spec: '中深烘焙 250g×2袋', price: 88, originPrice: 128, image: IMGS[4], category: '饮品' },
    { id: 'sp6', name: '东北椴树雪蜜', spec: '500g/瓶 结晶蜜', price: 69, originPrice: 99, image: IMGS[5], category: '滋补' },
    { id: 'sp7', name: '陕西富平柿饼', spec: '2斤礼盒装 吊饼', price: 58, originPrice: 88, image: IMGS[6], category: '零食' },
    { id: 'sp8', name: '福建平和红心柚子', spec: '4个装 约10斤', price: 45.9, originPrice: 69, image: IMGS[7], category: '水果' },
  ];
  let result = list;
  if (keyword) result = list.filter(x => x.name.includes(keyword) || x.category.includes(keyword));
  res.json({ code: 0, data: result });
});

export default router;
